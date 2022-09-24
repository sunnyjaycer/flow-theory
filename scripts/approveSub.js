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

    const approveSubscriptionOperation = await sf.idaV1.approveSubscription({
        indexId: "0",
        superToken: usdcx.address,
        publisher: "0x86734DAD0Dc33Fe712ec1179E60B09469E7Fb83b"
    })
    // await approveSubscriptionOperation.exec(alice);
    await approveSubscriptionOperation.exec(bob);

}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });