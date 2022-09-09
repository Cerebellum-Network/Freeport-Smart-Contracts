const NFTAttachment = artifacts.require("NFTAttachment");
const {upgradeProxy} = require('@openzeppelin/truffle-upgrades');
const log = console.log;

module.exports = async function (deployer, network, accounts) {
    const nftattachment = await NFTAttachment.deployed();
    log("Operating on NFTAttachment contract", nftattachment.address);

    try {
        const nftattachment2 = await upgradeProxy(nftattachment.address, NFTAttachment, {deployer, kind: "uups"});
        log("Upgraded", nftattachment2.address);
    } catch (e) {
        log("Error", e);
        throw e;
    }

    log();
};
