const Sale = artifacts.require("Sale");
const {deployProxy} = require('@openzeppelin/truffle-upgrades');
const log = console.log;

module.exports = async function (deployer, network, accounts) {
    const sale = await deployProxy(Sale, [], {deployer, kind: "uups"});
    log("Deployed Sale proxy", sale.address);
};
