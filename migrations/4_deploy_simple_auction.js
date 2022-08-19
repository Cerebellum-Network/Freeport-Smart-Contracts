const Freeport = artifacts.require("Freeport");
const SimpleAuction = artifacts.require("SimpleAuction");
const {deployProxy} = require('@openzeppelin/truffle-upgrades');
const log = console.log;

module.exports = async function (deployer, network, accounts) {
    const freeport = await Freeport.deployed();
    log("Operating on Freeport contract", freeport.address);

    const auctionUSDC = await deployProxy(SimpleAuction, [freeport.address, config.USDC], {deployer, kind: "uups"});
    log("Deployed SimpleAuction proxy", auction.address);

    const auctionCERE = await deployProxy(SimpleAuction, [freeport.address, config.CERE], {deployer, kind: "uups"});
    log("Deployed SimpleAuction proxy", auction.address);

    const TRANSFER_OPERATOR = await freeport.TRANSFER_OPERATOR.call();

    log("Give the permission to make transfers to SimpleAuction.")
    await freeport.grantRole(TRANSFER_OPERATOR, auction.address);

    log();
};

