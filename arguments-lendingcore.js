const host = "0x22ff293e14F1EC3A09B137e9e06084AFd63adDF9"; // goerli
// const host = "0xEB796bdb90fFA0f28255275e16936D25d3418603"; // mumbai
const owner = "0xcF4B5f6CCD39a2b5555dDd9e23F3d0b11843086e";           
const interestManager = "0xcCC25F477249Aab44b4b16567539AbD37C40A4b8"; // goerli 
// const interestManager = "0xf5Ef6A17B7C39442024d69c320A906C9cC84Dc78"; // mumbai
const apr = "10";                               // 1% APR
const cr = "1500";                              // 150% Collateralization ratio
const lp = "100";                               // 10% Liquidation Penalty
const dt = "0x8aE68021f6170E5a766bE613cEA0d75236ECCa9a"; // fUSDCx goerli
// const dt = "0x42bb40bF79730451B11f6De1CbA222F17b87Afd7"; //mumbai
const ct = "0x5AF1c2B6275ECE07351Ab808dc54864f0f2747A1"; // WETH as collateral token goerli
// const ct = "0xdFEC82F5E4aaDFC0F68c9D38ab520DF08AfFaDC1"; //mumbai

module.exports = [
    host,
    owner,
    interestManager,
    apr,
    cr,
    lp,
    dt,
    ct
]

// npx hardhat verify --network goerli --constructor-args arguments-lendingcore.js [contractaddress]