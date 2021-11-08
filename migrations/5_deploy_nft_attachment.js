const Davinci = artifacts.require("Davinci");
const NFTAttachment = artifacts.require("NFTAttachment");
const log = console.log;

module.exports = async function (deployer, network, accounts) {
    const davinci = await Davinci.deployed();
    log("Operating on Davinci contract", davinci.address);

    await deployer.deploy(NFTAttachment, davinci.address);

    log();
};
