const CollectionFoundation = artifacts.require("CollectionFoundation");
const {upgradeProxy} = require('@openzeppelin/truffle-upgrades');
const log = console.log;

module.exports = async function (deployer, network, accounts) {
    const collectionFoundation = await CollectionFoundation.deployed();

    log("Operating on CollectionFoundation contract", collectionFoundation.address);

    try {
        const collectionFoundation2 = await upgradeProxy(collectionFoundation.address, CollectionFoundation, {deployer, kind: "uups"});
        log("Upgraded", collectionFoundation2.address);
    } catch (e) {
        log("Error", e);
        throw e;
    }

    log();
};
