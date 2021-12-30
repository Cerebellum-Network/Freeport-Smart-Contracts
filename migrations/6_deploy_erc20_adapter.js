const Freeport = artifacts.require("Freeport");
const ERC20Adapter = artifacts.require("ERC20Adapter");
const log = console.log;

module.exports = async function(deployer, network, accounts) {
  const freeport = await Freeport.deployed();
  log("Running Freeport contract", freeport.address);

  await deployer.deploy(ERC20Adapter, accounts[0]);
  const adapter = await ERC20Adapter.deployed();
  log("Running ERC20Adapter contract", adapter.address);
}
