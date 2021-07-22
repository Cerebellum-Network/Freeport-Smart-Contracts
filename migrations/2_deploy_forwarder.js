const Davinci = artifacts.require("Davinci");
const Forwarder = artifacts.require("MinimalForwarder");

module.exports = async function (deployer) {
  await deployer.deploy(Forwarder);

  const forwarder = await Forwarder.deployed();
  const davinci = await Davinci.deployed();

  const META_TX_FORWARDER = await davinci.META_TX_FORWARDER.call();
  davinci.grantRole(META_TX_FORWARDER, forwarder.address);
};
