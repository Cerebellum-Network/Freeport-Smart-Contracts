const Marketplace = artifacts.require("Marketplace");
const {upgradeProxy} = require('@openzeppelin/truffle-upgrades');
const ctx = require("./deployment_context.json");
const log = console.log;

module.exports = async function (deployer, network, accounts) {
    const marketplace = await Marketplace.deployed();
    log("Operating on Marketplace contract", marketplace.address);

    try {
        const marketplace2 = await upgradeProxy(marketplace.address, Marketplace, {deployer, kind: "uups"});
        log("Upgraded", marketplace2.address);
    } catch (e) {
        log("Error", e);
        throw e;
    }

    log();
};
