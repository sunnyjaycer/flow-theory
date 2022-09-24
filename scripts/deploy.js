// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the

const { ethers } = require('hardhat');

// global scope, and execute the script.
const hre = require('hardhat');
// import { ethers } from '@nomiclabs/hardhat-ethers';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('deployer', deployer.address);

  console.log('Deploying contracts with the account:', deployer);
  console.log('Account balance:', (await deployer.getBalance()).toString());

  const LendingCore = await ethers.getContractFactory('LendingCore');
  const host = '0x22ff293e14F1EC3A09B137e9e06084AFd63adDF9'; // Superfluid host Goerli
  const usdc = '0x8aE68021f6170E5a766bE613cEA0d75236ECCa9a'; // USDCx on Goerly
  const weth = '0x771729814E0278d96C4C78A8768475bF40d71A91'; // Manually deployed weth contract on goerly
  const lendingCore = await LendingCore.deploy(
    host,
    '',
    deployer.address,
    10,
    10,
    10,
    usdc,
    weth
  );

  // These will be done by oracle in the future
  await lendingCore.setCollateralTokenPrice(1300 * 1000);
  await lendingCore.setDebtTokenPrice(1 * 1000);

  await lendingCore.deployed();
  console.log('Deploy successful. Address:', lendingCore.address);

  provider = new hre.ethers.providers.JsonRpcProvider(
    config.networks.goerli.url
  );
  const { Framework } = require('@superfluid-finance/sdk-core');
  const sf = await Framework.create({
    chainId: (await provider.getNetwork()).chainId,
    provider,
  });
  const usdcx = await sf.loadSuperToken('fUSDCx');
  const aclApproval = sf.cfaV1.updateFlowOperatorPermissions({
    flowOperator: lendingCore.address,
    superToken: usdcx.address,
    flowRateAllowance: '3858024691358024',
    permissions: 7,
  });
  tx = await aclApproval.exec(deployer);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
