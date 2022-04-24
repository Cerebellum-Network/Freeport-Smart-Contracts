const Sale = artifacts.require("Sale");
const {upgradeProxy} = require('@openzeppelin/truffle-upgrades');
const log = console.log;

module.exports = async function (deployer, network, accounts) {
    const sale = await Sale.deployed();
    log("Operating on Sale contract", sale.address);

    try {
        const saleProxy = await upgradeProxy(sale.address, Sale, {deployer, kind: "uups"});
        log("Upgraded", saleProxy.address);
    } catch (e) {
        log("Error", e);
        throw e;
    }

    log();
};
