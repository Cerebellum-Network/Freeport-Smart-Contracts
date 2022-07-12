const Freeport = artifacts.require("Freeport");
const USDC = artifacts.require("USDC");
const FiatGateway = artifacts.require("FiatGateway");
const SimpleAuction = artifacts.require("SimpleAuction");
const {getSigner} = require("../test/utils");
const log = console.log;

module.exports = async function (done) {

    // The service account of the fiat gateway.
    let serviceAccount = "0xc2fA210a9f518EDAAceD047D7a527C8F7FcadE28";

    const CURRENCY = 0;
    let tenM = "10" + "000" + "000" + "000000"; // 10M with 6 decimals;
    let oneM = "1" + "000" + "000" + "000000"; // 1M with 6 decimals;

    let accounts = await web3.eth.getAccounts();
    let admin = accounts[0];
    let freeport = await Freeport.deployed();
    let erc20 = await USDC.deployed();
    let gateway = await FiatGateway.deployed();
    log("Operating on Freeport contract", freeport.address);
    log("Operating on USDC contract", erc20.address);
    log("Operating on FiatGateway contract", gateway.address);
    log("From admin account", admin);

    let mintUSDC = async (account, amount) => {
        let amountEncoded = web3.eth.abi.encodeParameter("uint256", amount);
        await erc20.deposit(account, amountEncoded);
    };

    log("Set an exchange rate of 1:1 (0.01 with 6 decimals of ERC20 for $0.01)");
    await gateway.setExchangeRate(0.01e6);

    log("Give the permission to execute payments to the service account", serviceAccount);
    const PAYMENT_SERVICE = await gateway.PAYMENT_SERVICE.call();
    await gateway.grantRole(PAYMENT_SERVICE, serviceAccount);

    // In staging, mint some TEST-USDC to dev accounts.

    await mintUSDC(gateway.address, tenM);
    log("Sent 10M of currency to FiatGateway");

    let devAccounts = [
        admin,
        "0x6108E8aFFe0c51D4e2515A773aeF16b19ED6feB9", // e2e tests (Pavel)
        "0x6d2b28389d3153689c57909829dFCf6241d36388", // Evgeny
        "0x1Bf6FCa28253A1257e4B5B3440F7fbE0c59D1546", // Sergey
        "0x51c5590504251A5993Ba6A46246f87Fa0eaE5897", // Aurel
    ];

    for (let devAccount of devAccounts) {
        await mintUSDC(devAccount, oneM);
        log("Sent 1M of currency to", devAccount);
    }

    done();
};
