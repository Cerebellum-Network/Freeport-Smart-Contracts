const Freeport = artifacts.require("Freeport");
const NFTAttachment = artifacts.require("NFTAttachment");
const Marketplace = artifacts.require("Marketplace");
const Auction = artifacts.require("Auction");
const CollectionFactory = artifacts.require("CollectionFactory");
const {deployProxy} = require('@openzeppelin/truffle-upgrades');
const ctx = require("./deployment_context.json")
const {getBiconomyForwarder} = require("./infrasctucture");
const log = console.log;

module.exports = async function (deployer, network, accounts) {
    const freeport = await Freeport.deployed();
    const nftAttachment = await NFTAttachment.deployed();
    const marketplace = await Marketplace.deployed();
    const auction = await Auction.deployed();
    const biconomyForwarder = getBiconomyForwarder(network)
    if (!biconomyForwarder) {
        log("Skipping cause of missing Biconomy forwarder", network);
        return;
    }

    log("Operating CollectionFactory with Freeport contract", freeport.address);
    log("Operating CollectionFactory with NFTAttachment contract", nftAttachment.address);
    log("Operating CollectionFactory with Marketplace contract", marketplace.address);
    log("Operating CollectionFactory with Auction contract", auction.address);
    log("Operating CollectionFactory with Biconomy Forwarder", biconomyForwarder, "for network", network);

    const cf = await deployProxy(CollectionFactory, [freeport.address, nftAttachment.address, marketplace.address, auction.address, biconomyForwarder], {deployer, kind: "uups"});
    log("Deployed CollectionFactory proxy", cf.address);
};
