// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { ethers } = require("hardhat");
const hre = require("hardhat");
const { Framework } = require("@superfluid-finance/sdk-core");
// const TestTokenABI =  require("@superfluid-finance/ethereum-contracts/build/contracts/TestToken.json");

async function main() {

  let alice;
  let bob;
  let admin;

  [alice, bob, admin] = await ethers.getSigners();

  console.log("Alice: ", alice.address);
  console.log("Bob  : ", bob.address);
  console.log("Admin: ", admin.address);

  const url = `${process.env.GOERLI_URL}`;
  const customHttpProvider = new ethers.providers.JsonRpcProvider(url);
  const network = await customHttpProvider.getNetwork();

  const sf = await Framework.create({
    chainId: network.chainId,
    provider: customHttpProvider
  });

  const usdcx = await sf.loadSuperToken("fUSDCx")

  const interestManagerFactory = await ethers.getContractFactory(
    "InterestManager",
    admin
  );

  const interestManager = await interestManagerFactory.deploy(
    sf.settings.config.hostAddress,
    admin.address,
    ""
  );
  await interestManager.deployed();

  console.log("Interest Manager Address:", interestManager.address)
  
  const weth = await ethers.getContractAt(
    "TestToken",
    "0x5AF1c2B6275ECE07351Ab808dc54864f0f2747A1"
  );

  const lendingCoreFactory = await ethers.getContractFactory(
    "LendingCore",
    admin
  );

  const lendingCore = await lendingCoreFactory.deploy(
      sf.settings.config.hostAddress, 
      admin.address,                     // owner
      interestManager.address,           // interest manager
      "10",                              // 1% APR
      "1500",                            // Collateralization ratio
      "100",                             // Liquidation Penalty
      usdcx.address,                     // Setting DAIx as borrow token
      weth.address                       // WETH as collateral token
  );
  await lendingCore.deployed();

  console.log("Lending Core Address:", lendingCore.address)

  let slcTx = await interestManager.connect(admin).setLendingCore(lendingCore.address);
  await slcTx.wait();

  console.log("Lending Core set in Interest Manager");

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
