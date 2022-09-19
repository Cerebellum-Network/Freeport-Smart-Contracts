const {getBiconomyForwarder} = require("./infrasctucture");
const Freeport = artifacts.require("Freeport");
const SimpleAuction = artifacts.require("SimpleAuction");
const Auction = artifacts.require("Auction");
const Marketplace = artifacts.require("Marketplace");
const log = console.log;

module.exports = async function (deployer, network, accounts) {
    // Pick the forwarder contract from https://docs.biconomy.io/misc/contract-addresses
    const biconomyForwarder = getBiconomyForwarder(network)
    if (!biconomyForwarder) {
        log("Skipping Biconomy setup on network", network);
        return;
    }
    log("Using Biconomy Forwarder", biconomyForwarder, "for network", network);

    const admin = accounts[0];
    log("From admin account", admin);

    const freeport = await Freeport.deployed();
    log("Operating on Freeport contract", freeport.address);
    const simpleAuction = await SimpleAuction.deployed();
    log("Operating on SimpleAuction contract", simpleAuction.address);
    const auction = await Auction.deployed();
    log("Operating on Auction contract", auction.address);
    const marketplace = await Marketplace.deployed();
    log("Operating on Marketplace contract", marketplace.address);

    const META_TX_FORWARDER = await freeport.META_TX_FORWARDER.call();

    log("Give the permission to forward meta-transactions on Freeport to the Biconomy Forwarder");
    await freeport.grantRole(META_TX_FORWARDER, biconomyForwarder);

    log("Give the permission to forward meta-transactions on SimpleAuction to the Biconomy Forwarder");
    await simpleAuction.grantRole(META_TX_FORWARDER, biconomyForwarder);

    log("Give the permission to forward meta-transactions on Auction to the Biconomy Forwarder");
    await auction.grantRole(META_TX_FORWARDER, biconomyForwarder);

    log("Give the permission to forward meta-transactions on Marketplace to the Biconomy Forwarder");
    await marketplace.grantRole(META_TX_FORWARDER, biconomyForwarder);

    log();
};
