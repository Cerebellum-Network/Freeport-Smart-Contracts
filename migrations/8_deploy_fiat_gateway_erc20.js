const Freeport = artifacts.require("Freeport");
const FiatGateway = artifacts.require("FiatGatewayERC20");
const Sale = artifacts.require("SaleERC20");
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

    const TRANSFER_OPERATOR = await freeport.TRANSFER_OPERATOR.call();
    const EXCHANGE_RATE_ORACLE = await gateway.EXCHANGE_RATE_ORACLE.call();
    const PAYMENT_SERVICE = await gateway.PAYMENT_SERVICE.call();

    // No longer necessary after v2.0.0
    //log("Give the permission to make transfers to FiatGateway.")
    //await freeport.grantRole(TRANSFER_OPERATOR, gateway.address);

    log("Operating on Admin account", admin);
    log("Give the permission to withdraw funds to Admin."); // In constructor.

    log("Give the permission to change the exchange rate to Admin.");
    await gateway.grantRole(EXCHANGE_RATE_ORACLE, admin);

    log();
};
