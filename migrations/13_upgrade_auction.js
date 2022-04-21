const Freeport = artifacts.require("Freeport");
const Auction = artifacts.require("Auction");
const {upgradeProxy} = require('@openzeppelin/truffle-upgrades');
const log = console.log;

module.exports = async function (deployer, network, accounts) {
    const auction = await Auction.deployed();
    const freeport = await Freeport.deployed();
    log("Operating on Auction contract", auction.address);

    try {
        const auction = await upgradeProxy(auction.address, Auction, {deployer, kind: "uups"});
        log("Upgraded", auction.address);

        await auction.initialize(freeport.address);
        log("Done initialize");
    } catch (e) {
        log(`Error: ${e.message}\n${e}`);
        throw e;
    }

    log();
};
