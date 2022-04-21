const Freeport = artifacts.require("Freeport");
const Sale = artifacts.require("Sale");
const {deployProxy} = require('@openzeppelin/truffle-upgrades');
const log = console.log;

module.exports = async function (deployer, network, accounts) {
    const freeport = await Freeport.deployed();
    const sale = await deployProxy(Sale, [freeport.address], {deployer, kind: "uups"});
    log("Deployed Sale proxy", sale.address);
};
