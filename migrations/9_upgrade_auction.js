const SimpleAuction = artifacts.require("SimpleAuction");
const {upgradeProxy} = require('@openzeppelin/truffle-upgrades');
const log = console.log;

module.exports = async function (deployer, network, accounts) {
    const auction = await SimpleAuction.deployed();
    log("Operating on SimpleAuction contract", auction.address);

    try {
        const auction2 = await upgradeProxy(auction.address, SimpleAuction, {deployer, kind: "uups"});
        log("Upgraded", auction2.address);
    } catch (e) {
        log("Error", e);
        throw e;
    }

    log();
};
