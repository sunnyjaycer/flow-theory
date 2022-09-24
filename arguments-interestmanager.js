const name = "Fake Wrapped Ether";
const symbol = "fWETH";
const decimals = 18;

const host = "0x22ff293e14F1EC3A09B137e9e06084AFd63adDF9"; 
const owner = "0xcF4B5f6CCD39a2b5555dDd9e23F3d0b11843086e";           
const rk = "";

module.exports = [
    host,
    owner,
    rk
]

// npx hardhat verify --network goerli --constructor-args arguments-interestmanager.js [contractaddress]