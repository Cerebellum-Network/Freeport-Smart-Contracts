const Davinci = artifacts.require("Davinci");
const FiatGateway = artifacts.require("FiatGateway");
const log = console.log;

module.exports = async function (deployer, network, accounts) {
    const davinci = await Davinci.deployed();
    log("Operating on Davinci contract", davinci.address);

    await deployer.deploy(FiatGateway, davinci.address);
    const gateway = await FiatGateway.deployed();
    log("Operating on FiatGateway contract", gateway.address);

    const TRANSFER_OPERATOR = await davinci.TRANSFER_OPERATOR.call();
    const EXCHANGE_RATE_ORACLE = await gateway.EXCHANGE_RATE_ORACLE.call();
    const PAYMENT_SERVICE = await gateway.PAYMENT_SERVICE.call();

    log("Give the permission to make transfers to FiatGateway.")
    await davinci.grantRole(TRANSFER_OPERATOR, gateway.address);

    const admin = accounts[0];
    log("Operating on Admin account", admin);
    log("Give the permission to withdraw funds to Admin."); // In constructor.

    log("Give the permission to change the exchange rate to Admin.");
    await gateway.grantRole(EXCHANGE_RATE_ORACLE, admin);

    log("Give the permission to execute payments to Admin.");
    await gateway.grantRole(PAYMENT_SERVICE, admin);

    log();
};
