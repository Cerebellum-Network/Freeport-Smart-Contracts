const Sale = artifacts.require("Sale");
const Freeport = artifacts.require("Freeport");
const {upgradeProxy} = require('@openzeppelin/truffle-upgrades');
const log = console.log;

module.exports = async function (deployer, network, accounts) {
    const sale = await Sale.deployed();
    const freeport = await Freeport.deployed();
    log("Operating on Sale contract", sale.address);

    try {
        const sale = await upgradeProxy(sale.address, Sale, {deployer, kind: "uups"});
        log("Upgraded", sale.address);

        await sale.initialize(freeport.address);
        log("Done initialize");
    } catch (e) {
        log("Error", e);
        throw e;
    }

    log();
};
