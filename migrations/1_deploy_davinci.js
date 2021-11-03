const Davinci = artifacts.require("Davinci");
const log = console.log;

module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(Davinci);

  const admin = accounts[0];
  log("Operating on Admin account", admin);
  log("Make Admin the initial Polygon bridge manager."); // In constructor.
};
