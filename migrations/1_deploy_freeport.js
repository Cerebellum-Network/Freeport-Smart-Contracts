const Freeport = artifacts.require("Freeport");
const {deployProxy} = require('@openzeppelin/truffle-upgrades');
const log = console.log;
const url = process.env.METADATA_BASE_URL;

module.exports = async function (deployer, network, accounts) {
    const freeport = await deployProxy(Freeport, [url], {deployer, kind: "uups"});
    log("Deployed Freeport proxy", freeport.address);
};
