const Freeport = artifacts.require("Freeport");
const CollectionFactory = artifacts.require("CollectionFactory");
const {deployProxy} = require('@openzeppelin/truffle-upgrades');
const log = console.log;

module.exports = async function (deployer, network, accounts) {
    const freeport = await Freeport.deployed();
    log("Operating CollectionFactory with Freeport contract", freeport.address);
    const cf = await deployProxy(CollectionFactory, [], {deployer, kind: "uups"});
    cf.contract.methods['setFreeport(address)'](freeport.address);
    log("Deployed CollectionFactory proxy", cf.address);
};
