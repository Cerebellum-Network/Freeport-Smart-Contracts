const Freeport = artifacts.require("Freeport");
const {upgradeProxy} = require('@openzeppelin/truffle-upgrades');
const ctx = require("./deployment_context.json");
const log = console.log;

module.exports = async function (deployer, network, accounts) {
    const freeport = await Freeport.deployed();
    log("Operating on Freeport contract", freeport.address);

    try {
        const freeport2 = await upgradeProxy(freeport.address, Freeport, {deployer, kind: "uups"});
        log("Upgraded", freeport2.address);
    } catch (e) {
        log("Error", e);
        throw e;
    }

    log();
};
