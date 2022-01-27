const {deployProxy} = require('@openzeppelin/truffle-upgrades');
const Freeport = artifacts.require("Freeport");
const log = console.log;

module.exports = async function (deployer, network, accounts) {
    const instance = await deployProxy(Freeport, [], {deployer, kind: "uups"});
    log("Deployed Freeport proxy", instance.address);
};
