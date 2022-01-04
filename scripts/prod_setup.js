const Freeport = artifacts.require("Freeport");
const FiatGateway = artifacts.require("FiatGateway");
const log = console.log;

module.exports = async function (done) {

    // A fixed account for tests.
    let serviceAccount = "0x2352f1167F1c1c5273bB64a1FEEAf9dF49702A19";

    let accounts = await web3.eth.getAccounts();
    let admin = accounts[0];
    let freeport = await Freeport.at("0x521296be238B164b9A391b6F6175741826CB5F33");
    let gateway = await FiatGateway.at("0xf6d782Cd0dC9976170242B94C8E653C7bA489634");
    log("Operating on Freeport contract", freeport.address);
    log("No ERC20 contract");
    log("Operating on FiatGateway contract", gateway.address);
    log("From admin account", admin);

    log("Set an exchange rate of 1:1 (0.01 with 6 decimals of ERC20 for $0.01)");
    await gateway.setExchangeRate(0.01e6);

    log("Give the permission to execute payments to the service account", serviceAccount);
    const PAYMENT_SERVICE = await gateway.PAYMENT_SERVICE.call();
    await gateway.grantRole(PAYMENT_SERVICE, serviceAccount);

    done();
};
