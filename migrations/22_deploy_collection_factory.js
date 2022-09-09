const Freeport = artifacts.require("Freeport");
const Marketplace = artifacts.require("Marketplace");
const Auction = artifacts.require("Auction");
const CollectionFactory = artifacts.require("CollectionFactory");
const {deployProxy} = require('@openzeppelin/truffle-upgrades');
const ctx = require("./deployment_context.json")
const log = console.log;

module.exports = async function (deployer, network, accounts) {
    const freeport = await Freeport.deployed();
    const marketplace = await Marketplace.deployed();
    const auction = await Auction.deployed();
    log("Operating CollectionFactory with Freeport contract", freeport.address);
    log("Operating CollectionFactory with Marketplace contract", marketplace.address);
    log("Operating CollectionFactory with Auction contract", auction.address);

    const cf = await deployProxy(CollectionFactory, [freeport.address, marketplace.address, auction.address], {deployer, kind: "uups"});
    log("Deployed CollectionFactory proxy", cf.address);
};
