const Davinci = artifacts.require("Davinci");
const Forwarder = artifacts.require("MinimalForwarder");
const log = console.log;

module.exports = async function (deployer) {
    await deployer.deploy(Forwarder);

    const forwarder = await Forwarder.deployed();
    const davinci = await Davinci.deployed();

    log("Set", forwarder.address, "as meta-transaction forwarder for", davinci.address, "\n");
    const META_TX_FORWARDER = await davinci.META_TX_FORWARDER.call();
    davinci.grantRole(META_TX_FORWARDER, forwarder.address);
};
