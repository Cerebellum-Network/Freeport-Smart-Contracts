const Freeport = artifacts.require("Freeport");
const FiatGateway = artifacts.require("FiatGateway");
const ERC20 = artifacts.require("TestERC20");
const log = console.log;

module.exports = async function (done) {
    try {
        const maticAmount = "1" + "000000000000000000"; // MATIC to send (with 18 decimals).
        const usdcAmount = "100" + "000000"; // USDC to send (with 6 decimals).

        const usdcAddress = "0x2791bca1f2de4661ed88a30c99a7a9449aa84174";// USDC on Polygon.
        const usdc = await ERC20.at(usdcAddress);
        const freeport = await Freeport.at("0x521296be238B164b9A391b6F6175741826CB5F33");
        const gateway = await FiatGateway.at("0xf6d782Cd0dC9976170242B94C8E653C7bA489634");
        const serviceAddress = "0x2352f1167F1c1c5273bB64a1FEEAf9dF49702A19";

        const CURRENCY = 0;
        const accounts = await web3.eth.getAccounts();
        const admin = accounts[0];

        log("Operating on Freeport contract", freeport.address);
        log("Operating on USDC ERC20 contract", usdc.address);
        log("Operating on FiatGateway contract", gateway.address);
        log("Operating on Fiat Service account", serviceAddress);
        log("From admin account", admin);

        // ---- Top up USDC ----

        const usdcCheck = await freeport.currencyContract.call();
        console.assert(usdcCheck === usdc.address, "Unexpected USDC address");
        let gatewayBalanceBefore = await freeport.balanceOf(gateway.address, CURRENCY);
        log("Balance of FiatGateway contract: USDC", gatewayBalanceBefore.toNumber());

        log("Amount: USDC", usdcAmount);
        log("Approve Freeport to take a deposit");
        await usdc.approve(freeport.address, usdcAmount);
        log("Deposit into Freeport");
        await freeport.deposit(usdcAmount);
        log("Transfer to the FiatGateway contract");
        await freeport.safeTransferFrom(admin, gateway.address, CURRENCY, usdcAmount, "0x");

        // Check after.
        let gatewayBalanceAfter = await freeport.balanceOf(gateway.address, CURRENCY);
        log("Balance of FiatGateway: USDC", gatewayBalanceAfter.toNumber());

        // ---- Top up MATIC ----

        let serviceBalanceBefore = await web3.eth.getBalance(serviceAddress);
        log("Balance of Fiat Service: MATIC", serviceBalanceBefore);
        log("Sending MATIC to the Fiat Service", maticAmount);
        await web3.eth.sendTransaction({
            from: admin,
            to: serviceAddress,
            value: maticAmount,
        });
        let serviceBalanceAfter = await web3.eth.getBalance(serviceAddress);
        log("Balance of Fiat Service: MATIC", serviceBalanceAfter);

        log("OK");
        done();
    } catch (e) {
        done(e);
    }
};
