const Sale = artifacts.require("SaleERC20");
const {upgradeProxy} = require('@openzeppelin/truffle-upgrades');
const log = console.log;

module.exports = async function (deployer, network, accounts) {
    const sale = await Sale.deployed();
    log("Operating on SaleERC20 contract", sale.address);

    try {
        const sale = await upgradeProxy(sale.address, Sale, {deployer, kind: "uups"});
        log("Upgraded", sale.address);
    } catch (e) {
        log("Error", e);
        throw e;
    }

    log();
};
