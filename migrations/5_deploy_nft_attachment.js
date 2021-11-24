const Freeport = artifacts.require("Freeport");
const NFTAttachment = artifacts.require("NFTAttachment");
const log = console.log;

module.exports = async function (deployer, network, accounts) {
    const freeport = await Freeport.deployed();
    log("Operating on Freeport contract", freeport.address);

    await deployer.deploy(NFTAttachment, freeport.address);

    log();
};
