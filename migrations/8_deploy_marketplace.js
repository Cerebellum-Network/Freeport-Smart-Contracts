const Marketplace = artifacts.require("Marketplace");
const Freeport = artifacts.require("Freeport");
const {deployProxy} = require('@openzeppelin/truffle-upgrades');
const ctx = require("./deployment_context.json")
const log = console.log;

module.exports = async function (deployer, network, accounts) {
    const freeport = await Freeport.at(ctx.dev.deploys.Freeport);
    log("Operating Marketplace with Freeport contract", freeport.address);

    const cf = await deployProxy(Marketplace, [freeport.address], {deployer, kind: "uups"});
    log("Deployed Marketplace proxy", cf.address);
};
