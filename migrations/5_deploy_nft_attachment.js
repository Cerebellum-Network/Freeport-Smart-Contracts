const Freeport = artifacts.require("Freeport");
const NFTAttachment = artifacts.require("NFTAttachment");
const {deployProxy} = require('@openzeppelin/truffle-upgrades');
const log = console.log;

module.exports = async function (deployer, network, accounts) {
    const freeport = await Freeport.deployed();
    log("Operating on Freeport contract", freeport.address);

    const attachment = await deployProxy(NFTAttachment, [freeport.address], {deployer, kind: "uups"});
    log("Deployed NFTAttachment proxy", attachment.address);

    log();
};
