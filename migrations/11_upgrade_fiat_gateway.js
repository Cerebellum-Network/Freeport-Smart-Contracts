const Freeport = artifacts.require("Freeport");
const Marketplace = artifacts.require("Marketplace");
const FiatGateway = artifacts.require("FiatGateway");
const {upgradeProxy} = require('@openzeppelin/truffle-upgrades');
const ctx = require("./deployment_context.json");
const log = console.log;

module.exports = async function (deployer, network, accounts) {
    const gateway = await FiatGateway.deployed();
    log("Operating on FiatGateway contract", gateway.address);

    const freeport = await Freeport.deployed();
    log("Operating on Freeport contract", freeport.address);
    const marketplace = await Marketplace.deployed();
    log("Operating on Marketplace contract", marketplace.address);

    try {
        const gateway2 = await upgradeProxy(gateway.address, FiatGateway, {deployer, kind: "uups"});
        log("Upgraded", gateway2.address);

        await gateway2.initialize_update(freeport.address, marketplace.address);
        log("Done initialize_update");
    } catch (e) {
        log("Error", e);
        throw e;
    }

    log();
};
