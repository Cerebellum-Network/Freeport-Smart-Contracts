const Freeport = artifacts.require("Freeport");
const log = console.log;

module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(Freeport);

  const admin = accounts[0];
  log("Operating on Admin account", admin);
  log("Make Admin the initial Polygon bridge manager."); // In constructor.
};
