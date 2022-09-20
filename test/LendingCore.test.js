const { assert, expect } = require("chai");

const { Framework } = require("@superfluid-finance/sdk-core");
const TestTokenABI =  require("@superfluid-finance/ethereum-contracts/build/contracts/TestToken.json");

const { ethers, web3 } = require("hardhat");

const deployFramework = require("@superfluid-finance/ethereum-contracts/scripts/deploy-framework");
const deployTestToken = require("@superfluid-finance/ethereum-contracts/scripts/deploy-test-token");
const deploySuperToken = require("@superfluid-finance/ethereum-contracts/scripts/deploy-super-token");

// Instances
let sf;                          // Superfluid framework API object
let lendingCore;                 // spreader contract object
let dai;                         // underlying token of daix
let daix;                        // will act as borrow token - is a super token wrapper of dai
let weth;                        // collateral token

// Test Accounts
let admin;      
let alice;      
let bob;

// Temp transaction holder
let tx;

// Constants
const EXPECATION_DIFF_LIMIT = 10;    // Accounting for potential discrepency with 10 wei margin
const ONE_PER_YEAR = 31709791983;    // This amount of wei/sec is one ether per year

const errorHandler = (err) => {
  if (err) throw err;
}

before(async function () {

    // get hardhat accounts
    [admin, alice, bob] = await ethers.getSigners();
    console.log("Admin: ", admin.address);
    console.log("Alice: ", alice.address);
    console.log("Bob  : ", bob.address);

    //// GETTING SUPERFLUID FRAMEWORK SET UP

    // deploy the framework locally
    await deployFramework(errorHandler, {
        web3: web3,
        from: admin.address,
        // newTestResolver:true
    });

    // initialize framework
    sf = await Framework.create({
        chainId: 31337,
        provider: web3,
        resolverAddress: process.env.RESOLVER_ADDRESS, // (empty)
        protocolReleaseVersion: "test",
    });


    //// DEPLOYING DAI and DAI wrapper super token (which will be our debt token)

    // deploy a fake erc20 token
    await deployTestToken(errorHandler, [":", "fDAI"], {
        web3,
        from: admin.address,
    });

    // deploy a fake erc20 wrapper super token around the DAI token
    await deploySuperToken(errorHandler, [":", "fDAI"], {
        web3,
        from: admin.address,
    });

    // deploy a fake erc20 wrapper super token around the DAI token
    daix = await sf.loadSuperToken("fDAIx");

    dai = new ethers.Contract(
        daix.underlyingToken.address,
        TestTokenABI.abi,
        admin
    );


    //// SETTING UP NON-ADMIN ACCOUNTS WITH DAIx

    // minting test DAI
    await dai.connect(admin).mint(admin.address, ethers.utils.parseEther("100000000000"));
    await dai.connect(alice).mint(alice.address, ethers.utils.parseEther("100000000000"));
    await dai.connect(bob  ).mint(  bob.address, ethers.utils.parseEther("100000000000"));

    // approving DAIx to spend DAI (Super Token object is not an ethers contract object and has different operation syntax)
    await dai.connect(admin).approve(daix.address, ethers.constants.MaxInt256);
    await dai.connect(alice).approve(daix.address, ethers.constants.MaxInt256);
    await dai.connect(bob  ).approve(daix.address, ethers.constants.MaxInt256);

    // Upgrading all DAI to DAIx
    const daiXUpgradeOperation = daix.upgrade({
      amount: ethers.utils.parseEther("100000000000").toString(),
    })
    await daiXUpgradeOperation.exec(admin);
    await daiXUpgradeOperation.exec(alice);
    await daiXUpgradeOperation.exec(bob);


    // DEPLOYING WETH AS COLLATERAL TOKEN

    const wethContractFactory = await ethers.getContractFactory(
        TestTokenABI.abi,
        TestTokenABI.bytecode
    );

    weth = await wethContractFactory.deploy(
        "Wrapped Ether",
        "WETH",
        18
    );
    
    await weth.connect(alice).mint(alice.address, ethers.utils.parseEther("10000"));
    
    //// INITIALIZING LENDINGCORE CONTRACT

    const lendingCoreFactory = await ethers.getContractFactory(
        "LendingCore",
        admin
    );

    lendingCore = await lendingCoreFactory.deploy(
        sf.settings.config.hostAddress, 
        "",                                // registration key
        admin.address,                     // owner
        "10",                                // 1% APR
        "1500",                              // Collateralization ratio
        "100",                               // Liquidation Penalty
        daix.address,                      // Setting DAIx as borrow token
        weth.address                       // WETH as collateral token
    );

    // Fund lendingCore with 100,000 DAI
    tx = daix.transfer({
        receiver: lendingCore.address,
        amount: ethers.utils.parseEther("100000")
    });
    tx = await tx.exec(alice);
    await tx.wait();

    

    //// SUBSCRIBING TO SPREADER CONTRACT'S IDA INDEX

    // // subscribe to distribution (doesn't matter if this happens before or after distribution execution)
    // const approveSubscriptionOperation = await sf.idaV1.approveSubscription({
    //   indexId: "0",
    //   superToken: daix.address,
    //   publisher: spreader.address
    // })
    // await approveSubscriptionOperation.exec(alice);
    // await approveSubscriptionOperation.exec(bob);

    console.log("Set Up Complete! - TokenSpreader Contract Address:", lendingCore.address);

});

describe("TokenSpreader Test Sequence", async () => {

    it("happy test", async () => {
        
        // Admin set WETH price to 1500
        tx = await lendingCore.connect(admin).setCollateralTokenPrice("1500000");
        await tx.wait();

        // Admin set DAI price to 1
        tx = await lendingCore.connect(admin).setDebtTokenPrice("1000");
        await tx.wait();

        // Approve lendingCore to spend WETH
        tx = await weth.connect(alice).approve(lendingCore.address, ethers.BigNumber.from("99999999999999999999999999999999999999999999999999"));

        // Alice deposits 1 WETH
        tx = await lendingCore.connect(alice).depositCollateral(ethers.utils.parseEther("1"));
        await tx.wait();

        // Alice gives ACL permissions to lendingCore
        tx = sf.cfaV1.authorizeFlowOperatorWithFullControl({
            superToken: daix.address,
            flowOperator: lendingCore.address,
            userData: "0x"
        })
        tx = await tx.exec(alice);
        await tx.wait();

        // Borrow 700 DAI
        tx = await lendingCore.connect(alice).borrow(ethers.utils.parseEther("700"))
        await tx.wait();

        // Expect 7 DAI/year in interest charge
        expect(
            ( await sf.cfaV1.getFlow({
                superToken: daix.address,
                sender: alice.address,
                receiver: lendingCore.address,
                providerOrSigner: alice
            }) ).flowRate
        ).is.closeTo(
            ethers.BigNumber.from( ONE_PER_YEAR * 7 ),
            EXPECATION_DIFF_LIMIT
        );

    })

});