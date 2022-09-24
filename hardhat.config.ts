import { config as dotEnvConfig } from 'dotenv';
dotEnvConfig();

import '@nomiclabs/hardhat-etherscan';
import '@nomiclabs/hardhat-truffle5';
import '@nomiclabs/hardhat-ethers';
import '@nomicfoundation/hardhat-toolbox';
import 'hardhat-gas-reporter';
import 'solidity-coverage';
import { HardhatUserConfig } from 'hardhat/types';

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const GOERLI_PRIVATE_KEY =
  process.env.GOERLI_PRIVATE_KEY ?? 'No private key provided';

const config: HardhatUserConfig = {
  solidity: '0.8.13',
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
      url: `https://eth-goerli.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
      accounts: [GOERLI_PRIVATE_KEY],
    },
  },
  mocha: {
    timeout: 1000000000000000000,
  },
};

export default config;
