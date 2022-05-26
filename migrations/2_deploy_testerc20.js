const Freeport = artifacts.require("Freeport");
const Forwarder = artifacts.require("MinimalForwarder");
const Bypasser = artifacts.require("BypassForwarder");
const log = console.log;

module.exports = async function (deployer) {
    log("Not deploying unnecessary MinimalForwarder and BypassForwarder");
    return;

    await deployer.deploy(Forwarder);
    await deployer.deploy(Bypasser);

    const freeport = await Freeport.deployed();
    const forwarder = await Forwarder.deployed();
    const bypasser = await Bypasser.deployed();
    log("Operating on Freeport contract", freeport.address);
    log("Operating on Forwarder contract", forwarder.address);
    log("Operating on Bypass-Forwarder contract", bypasser.address);

    const META_TX_FORWARDER = await freeport.META_TX_FORWARDER.call();
    const BYPASS_SENDER = await freeport.BYPASS_SENDER.call();

    log("Give the permission to forward meta-transactions to Forwarder");
    await freeport.grantRole(META_TX_FORWARDER, forwarder.address);

    log("Give the permission to forward meta-transactions to Bypass-Forwarder");
    await freeport.grantRole(META_TX_FORWARDER, bypasser.address);

    log("Give the privilege to not pay royalties to Bypass-Forwarder.");
    await freeport.grantRole(BYPASS_SENDER, bypasser.address);

    log();
};