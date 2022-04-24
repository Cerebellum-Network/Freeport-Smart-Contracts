const Auction = artifacts.require("Auction");
const {upgradeProxy} = require('@openzeppelin/truffle-upgrades');
const log = console.log;

module.exports = async function (deployer, network, accounts) {
    const auction = await Auction.deployed();
    log("Operating on Auction contract", auction.address);

    try {
        const auctionProxy = await upgradeProxy(auction.address, Auction, {deployer, kind: "uups"});
        log("Upgraded", auctionProxy.address);
    } catch (e) {
        log(`Error: ${e.message}\n${e}`);
        throw e;
    }

    log();
};
