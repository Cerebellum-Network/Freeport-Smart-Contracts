const Davinci = artifacts.require("Davinci");
const FiatGateway = artifacts.require("FiatGateway");
const log = console.log;

module.exports = async function (done) {

    let accounts = await web3.eth.getAccounts();
    let admin = accounts[0];
    let issuer = admin;
    let buyer = accounts[1];
    let davinci = await Davinci.deployed();
    let gateway = await FiatGateway.deployed();
    const CURRENCY = 0;
    const UNIT = 1e10;
    log("Operating on Davinci contract", davinci.address);
    log("Operating on FiatGateway contract", gateway.address);
    log("From Admin account", admin);
    log("With Issuer account", issuer);

    const EXCHANGE_RATE_ORACLE = await gateway.EXCHANGE_RATE_ORACLE.call();
    const PAYMENT_SERVICE = await gateway.PAYMENT_SERVICE.call();

    log("Give the permission to change the exchange rate to Admin");
    await gateway.grantRole(EXCHANGE_RATE_ORACLE, admin);

    log("Set an exchange rate of 0.1 token for $0.01");
    await gateway.setExchangeRate(0.1e10);

    log("Give the permission to execute payments to Admin");
    await gateway.grantRole(PAYMENT_SERVICE, admin);

    let nftId = await davinci.issue.call(10, "0x", {from: issuer});
    log("Issuer mints an NFT", nftId.toString());
    await davinci.issue(10, "0x", {from: issuer});

    let cerePerPenny = await gateway.getExchangeRate();
    let pricePennies = 20 * 100;
    let priceCere = pricePennies * cerePerPenny;

    log("Issuer offers to sell for", +pricePennies, "pennies, or", +priceCere, "CERE units.");
    await davinci.makeOffer(nftId, priceCere, {from: issuer});

    log("Buy the NFT after a fiat payment for Buyer", buyer);
    await gateway.buyNftFromUsd(
        pricePennies,
        buyer,
        issuer,
        nftId,
        priceCere,
        0);

    done();
};
