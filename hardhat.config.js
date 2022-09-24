require("dotenv").config();

require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-truffle5");
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("solidity-coverage");



/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.13",
  networks: {
    hardhat: {
      // forking: {
      //   url: process.env.POLYGON_URL || "",
      //   enabled: true,
      //   blockNumber: 33007798,     // Essential for mainnet forking !!
      //   // network_id: 137
      // },
      // blockGasLimit: 20000000,
      // gasPrice: 30000000000,
      // accounts: [{
      //   privateKey: `${process.env.POLYGON_PRIVATE_KEY}`,
      //   balance: ethers.utils.parseUnits("10000", 18).toString()
      // }],
      // saveDeployments: false
    },
    goerli: {
      url: process.env.GOERLI_URL,
      accounts: {
        mnemonic: process.env.BURNER_MNEMONIC,
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 10
      }
    }
  },
  mocha: {
    timeout : 1000000000000000000
  },
  etherscan: {
    apiKey: {
      goerli: process.env.ETHERSCAN_KEY
    }
  }
};
