const Freeport = artifacts.require("Freeport");
const FiatGateway = artifacts.require("FiatGateway");
const ERC20 = artifacts.require("TestERC20");
const log = console.log;

module.exports = async function (done) {
    try {
        // USDC on Polygon.
        const usdcAddress = "0x2791bca1f2de4661ed88a30c99a7a9449aa84174";

        const CURRENCY = 0;
        const UNIT = 1e6;
        const accounts = await web3.eth.getAccounts();
        const admin = accounts[0];
        const usdc = await ERC20.at(usdcAddress);
        const freeport = await Freeport.at("0x521296be238B164b9A391b6F6175741826CB5F33");
        const gateway = await FiatGateway.at("0xf6d782Cd0dC9976170242B94C8E653C7bA489634");
        log("Operating on Freeport contract", freeport.address);
        log("Operating on USDC ERC20 contract", usdc.address);
        log("Operating on FiatGateway contract", gateway.address);
        log("From admin account", admin);
        const usdcCheck = await freeport.currencyContract.call();
        console.assert(usdcCheck === usdc.address, "Unexpected USDC address");

        let gatewayBalanceBefore = await freeport.balanceOf(gateway.address, CURRENCY);
        log("Balance of FiatGateway: USDC", gatewayBalanceBefore.toNumber());

        const amount = 100 * UNIT;
        log("Amount: USDC", amount);
        log("Approve Freeport to take a deposit");
        await usdc.approve(freeport.address, amount);
        log("Deposit into Freeport");
        await freeport.deposit(amount);
        log("Transfer to the FiatGateway");
        await freeport.safeTransferFrom(admin, gateway.address, CURRENCY, amount, "0x");

        let gatewayBalanceAfter = await freeport.balanceOf(gateway.address, CURRENCY);
        log("Balance of FiatGateway: USDC", gatewayBalanceAfter.toNumber());

        log("OK");
        done();
    } catch (e) {
        done(e);
    }
};
