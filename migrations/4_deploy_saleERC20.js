const Freeport = artifacts.require("Freeport");
const SaleERC20 = artifacts.require("SaleERC20");
const {deployProxy} = require('@openzeppelin/truffle-upgrades');
const log = console.log;

module.exports = async function (deployer, network, accounts) {
    const freeport = await Freeport.deployed();
    const sale = await deployProxy(SaleERC20, [freeport.address], {deployer, kind: "uups"});
    log("Deployed SaleERC20 proxy", sale.address);
};
