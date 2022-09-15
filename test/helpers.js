async function createSFRegistrationKey(sf, deployer) {
    const registrationKey = `testKey-${Date.now()}`;
    const appKey = web3.utils.sha3(
      web3.eth.abi.encodeParameters(
        ['string', 'address', 'string'],
        [
          'org.superfluid-finance.superfluid.appWhiteListing.registrationKey',
          deployer,
          registrationKey,
        ],
      ),
    );
  
    const governance = await sf.host.getGovernance.call();
    console.log(`SF Governance: ${governance}`);
  
    const sfGovernanceRO = await ethers
      .getContractAt(SuperfluidGovernanceBase.abi, governance);
  
    const govOwner = await sfGovernanceRO.owner();
    await impersonateAndSetBalance(govOwner);
  
    const sfGovernance = await ethers
      .getContractAt(SuperfluidGovernanceBase.abi, governance, await ethers.getSigner(govOwner));
  
    await sfGovernance.whiteListNewApp(sf.host.address, appKey);
  
    return registrationKey;
}

module.exports = { createSFRegistrationKey };