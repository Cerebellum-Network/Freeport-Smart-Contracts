const CollectionFactory = artifacts.require("CollectionFactory");
const Freeport = artifacts.require("Freeport");
const NFTAttachment = artifacts.require("NFTAttachment");
const Marketplace = artifacts.require("Marketplace");
const Auction = artifacts.require("Auction");
const {upgradeProxy} = require('@openzeppelin/truffle-upgrades');
const ctx = require("./deployment_context.json");
const {getBiconomyForwarder} = require("./infrasctucture");
const log = console.log;

module.exports = async function (deployer, network, accounts) {
    const biconomyForwarder = getBiconomyForwarder(network)
    if (!biconomyForwarder) {
        log("Skipping cause of missing Biconomy forwarder", network);
        return;
    }

    const collectionFactory = await CollectionFactory.deployed();
    log("Operating on CollectionFactory contract", collectionFactory.address);

    const freeport = await Freeport.deployed();
    const nftAttachment = await NFTAttachment.deployed();
    const marketplace = await Marketplace.deployed();
    const auction = await Auction.deployed();
    log("Operating CollectionFactory with Freeport contract", freeport.address);
    log("Operating CollectionFactory with NFTAttachment contract", nftAttachment.address);
    log("Operating CollectionFactory with Marketplace contract", marketplace.address);
    log("Operating CollectionFactory with Auction contract", auction.address);
    log("Operating CollectionFactory with Biconomy Forwarder", biconomyForwarder, "for network", network);

    try {
        const collectionFactory2 = await upgradeProxy(collectionFactory.address, CollectionFactory, {deployer, kind: "uups",
            call: {
                fn: 'initialize_update',
                args: [freeport.address, nftAttachment.address, marketplace.address, auction.address, biconomyForwarder]
            }
        });
        log("Upgraded", collectionFactory2.address);
    } catch (e) {
        log("Error", e);
        throw e;
    }

    log();
};
