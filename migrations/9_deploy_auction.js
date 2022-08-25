const Freeport = artifacts.require("Freeport");
const Auction = artifacts.require("Auction");
const {deployProxy} = require('@openzeppelin/truffle-upgrades');
const ctx = require("./deployment_context.json");
const log = console.log;

module.exports = async function (deployer, network, accounts) {
    const freeport = await Freeport.at(ctx.dev.deploys.Freeport);
    log("Operating on Freeport contract", freeport.address);

    const auction = await deployProxy(Auction, [freeport.address], {deployer, kind: "uups"});
    log("Deployed Auction proxy", auction.address);

    const TRANSFER_OPERATOR = await freeport.TRANSFER_OPERATOR.call();

    log("Give the permission to make transfers to SimpleAuction.")
    await freeport.grantRole(TRANSFER_OPERATOR, auction.address);

    log();
};

