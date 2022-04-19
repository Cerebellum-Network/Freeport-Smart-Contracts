const SaleERC20 = artifacts.require("SaleERC20");
const {deployProxy} = require('@openzeppelin/truffle-upgrades');
const log = console.log;

module.exports = async function (deployer, network, accounts) {
    const sale = await deployProxy(SaleERC20, [], {deployer, kind: "uups"});
    log("Deployed SaleERC20 proxy", sale.address);
};
