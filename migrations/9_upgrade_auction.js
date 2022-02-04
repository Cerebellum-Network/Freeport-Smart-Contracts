const SimpleAuction = artifacts.require("SimpleAuction");
const {upgradeProxy} = require('@openzeppelin/truffle-upgrades');
const log = console.log;

module.exports = async function (deployer, network, accounts) {
    const auction = await SimpleAuction.deployed();
    log("Operating on SimpleAuction contract", auction.address);

    await upgradeProxy(auction.address, SimpleAuction, {deployer, kind: "uups"});

    log();
};
