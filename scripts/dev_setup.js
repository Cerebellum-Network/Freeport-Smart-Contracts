const Davinci = artifacts.require("Davinci");
const FiatGateway = artifacts.require("FiatGateway");
const log = console.log;

module.exports = async function (done) {

    let accounts = await web3.eth.getAccounts();
    let admin = accounts[0];
    let davinci = await Davinci.deployed();
    let gateway = await FiatGateway.deployed();
    log("Operating on Davinci contract", davinci.address);
    log("Operating on FiatGateway contract", gateway.address);
    log("From admin account", admin);

    const EXCHANGE_RATE_ORACLE = await gateway.EXCHANGE_RATE_ORACLE.call();
    const PAYMENT_SERVICE = await gateway.PAYMENT_SERVICE.call();

    log("Give the permission to change the exchange rate to Admin", admin);
    await gateway.grantRole(EXCHANGE_RATE_ORACLE, admin);

    log("Set an exchange rate of 0.1 token for $0.01");
    await gateway.setExchangeRate(0.1e10);

    let devAccounts = [
        gateway.address,
        "0xc0DAe4aE8d21250a830B2A79314c9D43cAeab145", // Fixed account for tests (mnemonic "spatial spin account funny glue cancel cushion twelve inmate author night dust").
        "0x6d2b28389d3153689c57909829dFCf6241d36388", // Evgeny
        "0x1Bf6FCa28253A1257e4B5B3440F7fbE0c59D1546", // Sergey
        "0x51c5590504251A5993Ba6A46246f87Fa0eaE5897", // Aurel
        "0xd1BA02B47986057Ca8d74b75705A8d1E1006D4f5", // Ruslan
    ];

    let amount = 100e3 * 1e10 // 100k with 10 decimals;
    let encodedAmount = web3.eth.abi.encodeParameter('uint256', amount);

    for (let devAccount of devAccounts) {
        await davinci.deposit(devAccount, encodedAmount);
        log("Sent 100k of currency to", devAccount);

        log("Give the permission to execute payments to", devAccount);
        await gateway.grantRole(PAYMENT_SERVICE, devAccount);
    }

    done();
};
