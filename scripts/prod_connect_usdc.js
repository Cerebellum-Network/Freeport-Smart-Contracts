const Freeport = artifacts.require("Freeport");
const FiatGateway = artifacts.require("FiatGateway");
const log = console.log;

module.exports = async function (done) {
    // USDC on Polygon.
    const usdcAddress = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";

    let accounts = await web3.eth.getAccounts();
    let admin = accounts[0];
    let freeport = await Freeport.at("0x521296be238B164b9A391b6F6175741826CB5F33");
    log("Operating on Freeport contract", freeport.address);
    log("From admin account", admin);

    log("Connect to the USDC ERC20 contract", usdcAddress);
    await freeport.setERC20(usdcAddress);
    let after = await freeport.currencyContract.call();
    log("set:", after);

    done();
};
