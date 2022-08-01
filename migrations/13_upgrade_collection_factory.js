const CollectionFactory = artifacts.require("CollectionFactory");
const {upgradeProxy} = require('@openzeppelin/truffle-upgrades');
const ctx = require("./deployment_context.json");
const log = console.log;

module.exports = async function (deployer, network, accounts) {
    const collectionFactory = await CollectionFactory.deployed();

    log("Operating on CollectionFactory contract", collectionFactory.address);

    try {
        const collectionFactory2 = await upgradeProxy(collectionFactory.address, CollectionFactory, {deployer, kind: "uups"});
        log("Upgraded", collectionFactory2.address);
    } catch (e) {
        log("Error", e);
        throw e;
    }

    log();
};
