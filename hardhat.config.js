require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
  networks: {
    hardhat: {
      forking: {
        url: process.env.POLYGON_URL || "",
        enabled: true,
        blockNumber: 22877930     // Essential for mainnet forking !!
      },
      // blockGasLimit: 20000000,
      // gasPrice: 30000000000,
      // accounts: [{
      //   privateKey: `${process.env.POLYGON_PRIVATE_KEY}`,
      //   balance: ethers.utils.parseUnits("10000", 18).toString()
      // }],
      // saveDeployments: false
    }
  }
};
