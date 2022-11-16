// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const TestToken =  require("../artifacts/contracts/mocks/TestToken.sol/TestToken.json");


async function main() {

    let alice;
    let bob;
    let admin;

    [alice, bob, admin] = await ethers.getSigners();

    const wethFactory = await ethers.getContractFactory(
        TestToken.abi,
        TestToken.bytecode,
        admin
    )

    const weth = await wethFactory.deploy(
        "Fake Wrapped Ether",
        "fWETH",
        18
    );

    console.log("fWETH deployed to:", weth.address);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});