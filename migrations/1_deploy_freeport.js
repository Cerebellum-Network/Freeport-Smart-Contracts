const Freeport = artifacts.require("Freeport");
const log = console.log;

module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(Freeport);
};
