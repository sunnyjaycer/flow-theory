const host = "0x22ff293e14F1EC3A09B137e9e06084AFd63adDF9"; 
const owner = "0xcF4B5f6CCD39a2b5555dDd9e23F3d0b11843086e";           
const interestManager = "0x86734DAD0Dc33Fe712ec1179E60B09469E7Fb83b"; 
const apr = "10";                               // 1% APR
const cr = "1500";                              // 150% Collateralization ratio
const lp = "100";                               // 10% Liquidation Penalty
const dt = "0x8aE68021f6170E5a766bE613cEA0d75236ECCa9a"; // fUSDCx
const ct = "0x5AF1c2B6275ECE07351Ab808dc54864f0f2747A1"; // WETH as collateral token

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