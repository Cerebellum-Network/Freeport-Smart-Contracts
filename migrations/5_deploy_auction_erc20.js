const Freeport = artifacts.require("Freeport");
const AuctionERC20 = artifacts.require("AuctionERC20");
const {deployProxy} = require('@openzeppelin/truffle-upgrades');
const log = console.log;

module.exports = async function (deployer, network, accounts) {
    const freeport = await Freeport.deployed();
    log("Operating on Freeport contract", freeport.address);

    const auction = await deployProxy(AuctionERC20, [freeport.address], {deployer, kind: "uups"});
    log("Deployed AuctionERC20 proxy", auction.address);

    const TRANSFER_OPERATOR = await freeport.TRANSFER_OPERATOR.call();

    log("Give the permission to make transfers to AuctionERC20.")
    await freeport.grantRole(TRANSFER_OPERATOR, auction.address);

    log();
};

