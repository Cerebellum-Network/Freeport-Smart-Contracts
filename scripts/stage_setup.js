const Freeport = artifacts.require("Freeport");
const TestERC20 = artifacts.require("TestERC20");
const FiatGateway = artifacts.require("FiatGateway");
const log = console.log;

module.exports = async function (done) {

    // A fixed account for tests.
    let serviceAccount = "0x53B53189e668dC2ee3bA7A44Bb033E60F400d395";

    const CURRENCY = 0;
    let tenM = "10" + "000" + "000" + "000000"; // 10M with 6 decimals;
    let nineM = "9" + "000" + "000" + "000000"; // 9M with 6 decimals;
    let hundredK = "100" + "000" + "000000";    // 100K with 6 decimals;

    let accounts = await web3.eth.getAccounts();
    let admin = accounts[0];
    let freeport = await Freeport.at("0x8bD1D3a93C7FB1786fFE3d0610987C3879287698");
    let erc20 = await TestERC20.at("0x93E73E25F290f8A50281A801109f75CB4E8e3233");
    let gateway = await FiatGateway.at("0x1C59A68ff017f14D1a8B80644F25F047b1CC58C5");
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

    await freeport.safeTransferFrom(admin, gateway.address, CURRENCY, nineM, "0x");
    log("Sent 9M of currency to FiatGateway");

    let devAccounts = [
        "0x6108E8aFFe0c51D4e2515A773aeF16b19ED6feB9", // e2e tests (Pavel)
        "0x6d2b28389d3153689c57909829dFCf6241d36388", // Evgeny
        "0x1Bf6FCa28253A1257e4B5B3440F7fbE0c59D1546", // Sergey
        "0x51c5590504251A5993Ba6A46246f87Fa0eaE5897", // Aurel
    ];

    for (let devAccount of devAccounts) {
        await freeport.safeTransferFrom(admin, devAccount, CURRENCY, hundredK, "0x");
        log("Sent 100k of currency to", devAccount);
    }

    done();
};
