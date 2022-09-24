const { assert, expect } = require("chai");

const { Framework } = require("@superfluid-finance/sdk-core");
const TestTokenABI =  require("@superfluid-finance/ethereum-contracts/build/contracts/TestToken.json");

const { ethers, web3 } = require("hardhat");

const deployFramework = require("@superfluid-finance/ethereum-contracts/scripts/deploy-framework");
const deployTestToken = require("@superfluid-finance/ethereum-contracts/scripts/deploy-test-token");
const deploySuperToken = require("@superfluid-finance/ethereum-contracts/scripts/deploy-super-token");

// Instances
let sf;                          // Superfluid framework API object
let lendingCore;                 // lending core contract object
let interestManager;             // interest manager contract object
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

    //// DEPLOYING INTEREST MANAGER CONTRACT

    const interestManagerFactory = await ethers.getContractFactory(
        "InterestManager",
        admin
    );

    interestManager = await interestManagerFactory.deploy(
        sf.settings.config.hostAddress,
        admin.address,
        ""
    );

    console.log("Interest Manager Contract Address:", interestManager.address);
    
    //// DEPLOYING LENDINGCORE CONTRACT

    const lendingCoreFactory = await ethers.getContractFactory(
        "LendingCore",
        admin
    );

    lendingCore = await lendingCoreFactory.deploy(
        sf.settings.config.hostAddress, 
        admin.address,                     // owner
        interestManager.address,           // interest manager
        "10",                                // 1% APR
        "1500",                              // Collateralization ratio
        "100",                               // Liquidation Penalty
        daix.address,                      // Setting DAIx as borrow token
        weth.address                       // WETH as collateral token
    );

    console.log("LendingCore Contract Address:", lendingCore.address);

    //// SET LENDING CORE CONTRACT IN INTEREST MANAGER

    tx = await interestManager.connect(admin).setLendingCore(lendingCore.address);
    await tx.wait();

    console.log("Lending Core Set In Interest Manager")

    //// SUBSCRIBING TO LENDING CORE CONTRACT'S IDA INDEX

    // subscribe to distribution (doesn't matter if this happens before or after distribution execution)
    const approveSubscriptionOperation = await sf.idaV1.approveSubscription({
      indexId: "0",
      superToken: daix.address,
      publisher: interestManager.address
    })
    await approveSubscriptionOperation.exec(alice);
    await approveSubscriptionOperation.exec(bob);

    console.log("Subscriptions Approved")

});

describe("LendingCore Test Sequence", async () => {

    it("happy test", async () => {

        // Bob approves lending core
        tx = daix.approve({
            receiver: lendingCore.address,
            amount: ethers.utils.parseEther("1000")
        })
        tx = await tx.exec(bob);
        await tx.wait();

        // Bob lends out 1000 DAI
        tx = await lendingCore.connect(bob).depositLiquidity(ethers.utils.parseEther("1000"));
        await tx.wait();
        
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
        console.log("Calling Borrow");
        tx = await lendingCore.connect(alice).borrow(ethers.utils.parseEther("700"))
        await tx.wait();

        // Expect 7 DAI/year in interest charge
        expect(
            ( await sf.cfaV1.getFlow({
                superToken: daix.address,
                sender: alice.address,
                receiver: interestManager.address,
                providerOrSigner: alice
            }) ).flowRate
        ).is.closeTo(
            ethers.BigNumber.from( ONE_PER_YEAR * 7 ),
            EXPECATION_DIFF_LIMIT
        );

        await network.provider.send("evm_increaseTime", [31536000]);
        await network.provider.send("evm_mine");

        // Expect balance of Interest Manager to be 7 DAI after a year
        expect(
            await daix.balanceOf({account: interestManager.address, providerOrSigner: admin})
        ).is.closeTo(
            ethers.BigNumber.from( ONE_PER_YEAR * 7 ).mul( ethers.BigNumber.from( 31536000 ) ),
            10**13
        );

        // Trigger distribution
        tx = await interestManager.connect(admin).distributeInterest();
        await tx.wait();

        let bobSub = await sf.idaV1.getSubscription({
            superToken: daix.address,
            publisher: interestManager.address,
            indexId: "0", // recall this was `INDEX_ID` in TokenSpreader.sol
            subscriber: bob.address,
            providerOrSigner: bob
        });
        console.log("Bob units:", bobSub.units);

        // Get outstanding units of tokenSpreader's IDA index
        const indexDataTokenSpreader = await sf.idaV1.getIndex({
            superToken: daix.address,
            publisher: interestManager.address,
            indexId: "0",
            providerOrSigner: bob
        });

        console.log(
            "TokenSpreader Units Approved:",
            indexDataTokenSpreader.totalUnitsApproved
        );
        console.log(
            "TokenSpreader Units Pending:",
            indexDataTokenSpreader.totalUnitsPending,
            "\n"
        );

        await network.provider.send("evm_increaseTime", [31536000]);
        await network.provider.send("evm_mine");

        // Expect balance of interest manager to be zeroed out
        // expect(
        //     await daix.balanceOf({account: interestManager.address, providerOrSigner: bob})
        // ).is.closeTo(
        //     ethers.BigNumber.from( 0 ),
        //     10**13
        // )
    })

});