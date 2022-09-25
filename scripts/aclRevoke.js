// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { ethers } = require('hardhat');
const hre = require('hardhat');
const { Framework } = require('@superfluid-finance/sdk-core');
// const TestTokenABI =  require("@superfluid-finance/ethereum-contracts/build/contracts/TestToken.json");

async function main() {
  let alice;
  let bob;
  let admin;

  [alice, bob, admin] = await ethers.getSigners();

  const provider = new hre.ethers.providers.JsonRpcProvider(
    config.networks.goerli.url
  );
  const network = await provider.getNetwork();

  const sf = await Framework.create({
    chainId: network.chainId,
    provider: provider,
  });

  const usdcx = await sf.loadSuperToken('fUSDCx');

  // let tx = sf.cfaV1.updateFlowOperatorPermissions({
  //   superToken: usdcx.address,
  //   flowOperator: '0x5990980b36BaE3EF45C6D302917916150D3b5B16',
  //   permission: 0,
  //   flowRateAllowance: '0',
  //   userData: '0x',
  // });
  let tx = sf.cfaV1.revokeFlowOperatorWithFullControl({
    superToken: usdcx.address,
    flowOperator: '0x5990980b36BaE3EF45C6D302917916150D3b5B16',
  });

  tx = await tx.exec(alice);
  await tx.wait();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
