const Auction = artifacts.require("Auction");
const {upgradeProxy} = require('@openzeppelin/truffle-upgrades');
const log = console.log;
const error = console.error;

module.exports = async function (deployer, network, accounts) {
    const auction = await Auction.deployed();
    log("Operating on Auction contract", auction.address);

    try {
        const auctionProxy = await upgradeProxy(auction.address, Auction, {deployer, kind: "uups"});
        log("Upgraded", auctionProxy.address);
    } catch (e) {
        error(e);
        throw e;
    }

    log();
};
