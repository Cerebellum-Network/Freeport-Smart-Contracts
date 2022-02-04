const Freeport = artifacts.require("Freeport");
const {upgradeProxy} = require('@openzeppelin/truffle-upgrades');
const log = console.log;

module.exports = async function (deployer, network, accounts) {
    const freeport = await Freeport.deployed();
    log("Operating on Freeport contract", freeport.address);

    await upgradeProxy(freeport.address, Freeport, {deployer, kind: "uups"});

    log();
};
