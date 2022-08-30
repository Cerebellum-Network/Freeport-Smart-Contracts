const Freeport = artifacts.require("Freeport");
const FiatGateway = artifacts.require("FiatGateway");
const SimpleAuction = artifacts.require("SimpleAuction");
const {getSigner} = require("../test/utils");
const log = console.log;

module.exports = async function (done) {

    // The service account of the fiat gateway.
    let serviceAccount = "0x718B310Be805e3Df552621b3ea11b59871183D19";

    let accounts = await web3.eth.getAccounts();
    let admin = accounts[0];
    let freeport = await Freeport.deployed();
    let gateway = await FiatGateway.deployed();
    log("Operating on Freeport contract", freeport.address);
    log("Operating on FiatGateway contract", gateway.address);
    log("From admin account", admin);

    log("Set an exchange rate of 1:1 (0.01 with 6 decimals of ERC20 for $0.01)");
    await gateway.setExchangeRate(0.01e6);

    log("Give the permission to execute payments to the service account", serviceAccount);
    const PAYMENT_SERVICE = await gateway.PAYMENT_SERVICE.call();
    await gateway.grantRole(PAYMENT_SERVICE, serviceAccount);

    done();
};
