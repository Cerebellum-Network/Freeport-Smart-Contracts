const Freeport = artifacts.require("Freeport");
const CollectionFoundation = artifacts.require("CollectionFoundation");
const {deployProxy} = require('@openzeppelin/truffle-upgrades');
const log = console.log;

module.exports = async function (deployer, network, accounts) {
    const freeport = await Freeport.deployed();
    const cf = await deployProxy(CollectionFoundation, [], {deployer, kind: "uups"});
    cf.contract.methods['setFreeport(address)'](freeport.address);
    log("Deployed CollectionFoundation proxy", cf.address);
};
