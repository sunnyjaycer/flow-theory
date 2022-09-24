const name = "Fake Wrapped Ether";
const symbol = "fWETH";
const decimals = 18;

module.exports = [
    name,
    symbol,
    decimals
]

// npx hardhat verify --network goerli --constructor-args arguments-testtoken.js [contractaddress]