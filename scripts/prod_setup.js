const Freeport = artifacts.require("Freeport");
const FiatGateway = artifacts.require("FiatGateway");
const SimpleAuction = artifacts.require("SimpleAuction");
const {getSigner} = require("../test/utils");
const log = console.log;

module.exports = async function (done) {

    // USDC on Polygon.
    const usdcAddress = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";

    // A fixed account for tests.
    let serviceAccount = "0x2352f1167F1c1c5273bB64a1FEEAf9dF49702A19";

    let accounts = await web3.eth.getAccounts();
    let admin = accounts[0];
    let freeport = await Freeport.at("0xf9AC6022F786f6f64Fd8abf661190b8517D92396");
    let gateway = await FiatGateway.at("0x4478e3B0B71531DAc9d0ECe9357eBB0043669804");
    log("Operating on Freeport contract", freeport.address);
    log("Operating on FiatGateway contract", gateway.address);
    log("From admin account", admin);

    log("Set an exchange rate of 1:1 (0.01 with 6 decimals of ERC20 for $0.01)");
    await gateway.setExchangeRate(0.01e6);

    log("Give the permission to execute payments to the service account", serviceAccount);
    const PAYMENT_SERVICE = await gateway.PAYMENT_SERVICE.call();
    await gateway.grantRole(PAYMENT_SERVICE, serviceAccount);

    log("Connect to the USDC ERC20 contract", usdcAddress);
    await freeport.setERC20(usdcAddress);
    let after = await freeport.currencyContract.call();
    log("set:", after);

    done();
};
