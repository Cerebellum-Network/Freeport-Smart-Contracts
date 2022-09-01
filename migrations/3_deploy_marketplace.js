const Marketplace = artifacts.require("Marketplace");
const Freeport = artifacts.require("Freeport");
const {deployProxy} = require('@openzeppelin/truffle-upgrades');
const ctx = require("./deployment_context.json")
const log = console.log;

module.exports = async function (deployer, network, accounts) {
    const freeport = await Freeport.deployed();
    log("Operating Marketplace with Freeport contract", freeport.address);

    const marketplace = await deployProxy(Marketplace, [freeport.address], {deployer, kind: "uups"});
    log("Deployed Marketplace proxy", marketplace.address);

    const TRANSFER_OPERATOR = await freeport.TRANSFER_OPERATOR.call();

    log("Give the permission to make transfers to Auction.")
    await freeport.grantRole(TRANSFER_OPERATOR, marketplace.address);
};
