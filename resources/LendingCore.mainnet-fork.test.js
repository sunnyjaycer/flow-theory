const { ethers, web3 } = require("hardhat");
const { createSFRegistrationKey } = require("./helpers")
const { Framework } = require("@superfluid-finance/sdk-core");

let choiceAccount = ethers.provider.getSigner(process.env.CHOICE_ADDRESS);

describe("Lending Core", function () {

  before(async function () {

    // Impersonate an account (sunnyjaycer.eth)
    console.log("Choice Address:",choiceAccount._address);
    await ethers.getImpersonatedSigner(choiceAccount._address);

    console.log("Choice Address MATIC Balance", (await choiceAccount.getBalance()).toString());

    console.log(ethers.provider)


    // Set up Superfluid impersonation so we can create a registration key

    const sf = await Framework.create({
      chainId: 31337,
      provider: ethers,
      resolverAddress: "0xE0cc76334405EE8b39213E620587d815967af39C",
      protocolReleaseVersion: "v1"
    })

    await createSFRegistrationKey(sf, choiceAccount._address)

  });

  it("test", async () => {

    console.log("hey we here");

  });

});
