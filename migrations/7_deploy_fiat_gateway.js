const Freeport = artifacts.require("Freeport");
const FiatGateway = artifacts.require("FiatGateway");
const Sale = artifacts.require("Sale");
const {deployProxy} = require('@openzeppelin/truffle-upgrades');
const log = console.log;

module.exports = async function (deployer, network, accounts) {
    const admin = accounts[0];
    const freeport = await Freeport.deployed();
    const sale = await Sale.deployed();
    log("Operating on Freeport contract", freeport.address);
    log("From admin account", admin);

    const gateway = await deployProxy(FiatGateway, [freeport.address, sale.address], {deployer, kind: "uups"});
    log("Deployed FiatGateway proxy", gateway.address);

    const EXCHANGE_RATE_ORACLE = await gateway.EXCHANGE_RATE_ORACLE.call();

    log("Operating on Admin account", admin);
    log("Give the permission to withdraw funds to Admin."); // In constructor.

    log("Give the permission to change the exchange rate to Admin.");
    await gateway.grantRole(EXCHANGE_RATE_ORACLE, admin);

    log();
};
