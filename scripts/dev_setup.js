const Freeport = artifacts.require("Freeport");
const FiatGateway = artifacts.require("FiatGateway");
const log = console.log;

module.exports = async function (done) {

    // A fixed account for tests.
    // Mnemonic: "spatial spin account funny glue cancel cushion twelve inmate author night dust"
    let serviceAccount = "0xc0DAe4aE8d21250a830B2A79314c9D43cAeab145";

    let accounts = await web3.eth.getAccounts();
    let admin = accounts[0];
    let freeport = await Freeport.deployed();
    let gateway = await FiatGateway.deployed();
    log("Operating on Freeport contract", freeport.address);
    log("Operating on FiatGateway contract", gateway.address);
    log("From admin account", admin);

    const PAYMENT_SERVICE = await gateway.PAYMENT_SERVICE.call();

    log("Set an exchange rate of 0.1 token for $0.01");
    await gateway.setExchangeRate(0.1e10);

    log("Give the permission to execute payments to the service account", serviceAccount);
    await gateway.grantRole(PAYMENT_SERVICE, serviceAccount);

    let devAccounts = [
        gateway.address,
        serviceAccount,
        "0x6d2b28389d3153689c57909829dFCf6241d36388", // Evgeny
        "0x1Bf6FCa28253A1257e4B5B3440F7fbE0c59D1546", // Sergey
        "0x51c5590504251A5993Ba6A46246f87Fa0eaE5897", // Aurel
        "0xd1BA02B47986057Ca8d74b75705A8d1E1006D4f5", // Ruslan
    ];

    let amount = "10" + "000" + "000" + "0000000000"; // 10M with 10 decimals;
    let encodedAmount = web3.eth.abi.encodeParameter('uint256', amount);

    for (let devAccount of devAccounts) {
        await freeport.deposit(devAccount, encodedAmount);
        log("Sent 100k of currency to", devAccount);
    }

    done();
};
