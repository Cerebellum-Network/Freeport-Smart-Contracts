const Freeport = artifacts.require("Freeport");
const SimpleAuction = artifacts.require("SimpleAuction");
const log = console.log;

module.exports = async function (deployer, network, accounts) {
    // Pick the forwarder contract from https://docs.biconomy.io/misc/contract-addresses
    let biconomyForwarder;
    if (network === "polygon_mainnet") biconomyForwarder = "0x86C80a8aa58e0A4fa09A69624c31Ab2a6CAD56b8";
    if (network === "polygon_testnet") biconomyForwarder = "0x9399BB24DBB5C4b782C70c2969F58716Ebbd6a3b";

    if (!biconomyForwarder) {
        log("Skipping Biconomy setup on network", network);
        return;
    }
    log("Using Biconomy Forwarder", biconomyForwarder, "for network", network);

    const admin = accounts[0];
    log("From admin account", admin);

    const freeport = await Freeport.deployed();
    log("Operating on Freeport contract", freeport.address);
    const auction = await SimpleAuction.deployed();
    log("Operating on SimpleAuction contract", auction.address);

    const META_TX_FORWARDER = await freeport.META_TX_FORWARDER.call();

    log("Give the permission to forward meta-transactions on Freeport to the Biconomy Forwarder");
    await freeport.grantRole(META_TX_FORWARDER, biconomyForwarder);

    log("Give the permission to forward meta-transactions on SimpleAuction to the Biconomy Forwarder");
    await auction.grantRole(META_TX_FORWARDER, biconomyForwarder);

    log();
};
