const Freeport = artifacts.require("Freeport");
const {deployProxy} = require('@openzeppelin/truffle-upgrades');
const log = console.log;

module.exports = async function (deployer, network, accounts) {
    const freeport = await deployProxy(Freeport, [], {deployer, kind: "uups"});
    log("Deployed Freeport proxy", freeport.address);
};
