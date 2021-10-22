const Davinci = artifacts.require("Davinci");
const SimpleAuction = artifacts.require("SimpleAuction");
const log = console.log;

module.exports = async function (deployer, network, accounts) {
    const davinci = await Davinci.deployed();
    log("Operating on Davinci contract", davinci.address);

    await deployer.deploy(SimpleAuction, davinci.address);
    const auction = await SimpleAuction.deployed();
    log("Operating on SimpleAuction contract", auction.address);

    const TRANSFER_OPERATOR = await davinci.TRANSFER_OPERATOR.call();

    log("Give the permission to make transfers to SimpleAuction.")
    await davinci.grantRole(TRANSFER_OPERATOR, auction.address);

    log();
};
