const Davinci = artifacts.require("Davinci");
const Forwarder = artifacts.require("MinimalForwarder");
const Bypasser = artifacts.require("BypassForwarder");
const log = console.log;

module.exports = async function (deployer) {
    await deployer.deploy(Forwarder);
    await deployer.deploy(Bypasser);

    const davinci = await Davinci.deployed();
    const forwarder = await Forwarder.deployed();
    const bypasser = await Bypasser.deployed();
    log("Operating on Davinci contract", davinci.address);
    log("Operating on Forwarder contract", forwarder.address);
    log("Operating on Bypass-Forwarder contract", bypasser.address);

    const META_TX_FORWARDER = await davinci.META_TX_FORWARDER.call();
    const BYPASS_SENDER = await davinci.BYPASS_SENDER.call();

    log("Give the permission to forward meta-transactions to Forwarder");
    davinci.grantRole(META_TX_FORWARDER, forwarder.address);

    log("Give the permission to forward meta-transactions to Bypass-Forwarder");
    davinci.grantRole(META_TX_FORWARDER, bypasser.address);

    log("Give the privilege to not pay royalties to Bypass-Forwarder.");
    davinci.grantRole(BYPASS_SENDER, bypasser.address);

    log();
};
