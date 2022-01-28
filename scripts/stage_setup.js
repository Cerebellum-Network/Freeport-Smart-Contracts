const Freeport = artifacts.require("Freeport");
const TestERC20 = artifacts.require("TestERC20");
const FiatGateway = artifacts.require("FiatGateway");
const log = console.log;

module.exports = async function (done) {

    // A fixed account for tests.
    let serviceAccount = "0x53B53189e668dC2ee3bA7A44Bb033E60F400d395";

    const CURRENCY = 0;
    let tenM = "10" + "000" + "000" + "000000"; // 10M with 6 decimals;
    let fiveM = "5" + "000" + "000" + "000000"; // 9M with 6 decimals;
    let oneM = "1" + "000" + "000" + "000000"; // 1M with 6 decimals;

    let accounts = await web3.eth.getAccounts();
    let admin = accounts[0];
    let freeport = await Freeport.at("0xacd8105cBA046307d2228794ba2F81aA15e82E0D");
    let erc20 = await TestERC20.at("0x93E73E25F290f8A50281A801109f75CB4E8e3233");
    let gateway = await FiatGateway.at("0xe25b31Aa454E28110E28C694ded69cD241A27Db1");
    log("Operating on Freeport contract", freeport.address);
    log("Operating on TestERC20 contract", erc20.address);
    log("Operating on FiatGateway contract", gateway.address);
    log("From admin account", admin);

    log("Set an exchange rate of 1:1 (0.01 with 6 decimals of ERC20 for $0.01)");
    await gateway.setExchangeRate(0.01e6);

    log("Give the permission to execute payments to the service account", serviceAccount);
    const PAYMENT_SERVICE = await gateway.PAYMENT_SERVICE.call();
    await gateway.grantRole(PAYMENT_SERVICE, serviceAccount);

    log("Mint and deposit some ERC20 to the admin account.");
    await erc20.mint(admin, tenM);
    await erc20.approve(freeport.address, tenM);
    await freeport.deposit(tenM);

    await freeport.safeTransferFrom(admin, gateway.address, CURRENCY, fiveM, "0x");
    log("Sent 5M of currency to FiatGateway");

    let devAccounts = [
        "0x6108E8aFFe0c51D4e2515A773aeF16b19ED6feB9", // e2e tests (Pavel)
        "0x6d2b28389d3153689c57909829dFCf6241d36388", // Evgeny
        "0x1Bf6FCa28253A1257e4B5B3440F7fbE0c59D1546", // Sergey
        "0x51c5590504251A5993Ba6A46246f87Fa0eaE5897", // Aurel
    ];

    for (let devAccount of devAccounts) {
        await freeport.safeTransferFrom(admin, devAccount, CURRENCY, oneM, "0x");
        log("Sent 1M of currency to", devAccount);
    }

    done();
};
