const { deployProxy } = require('@openzeppelin/truffle-upgrades');
const Freeport = artifacts.require("Freeport");
const SimpleAuction = artifacts.require("SimpleAuction");
const log = console.log;

module.exports = async function (deployer, network, accounts) {
    const freeport = await Freeport.deployed();
    log("Operating on Freeport contract", freeport.address);

    const instance = await deployProxy(SimpleAuction, [freeport.address], { deployer });
    log("Deployed SimpleAuction proxy", instance.address);
    const auction = await SimpleAuction.deployed();
    log("Operating on SimpleAuction contract", auction.address);

    const TRANSFER_OPERATOR = await freeport.TRANSFER_OPERATOR.call();

    log("Give the permission to make transfers to SimpleAuction.")
    await freeport.grantRole(TRANSFER_OPERATOR, auction.address);

    log();
};

