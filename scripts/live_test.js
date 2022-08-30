const Freeport = artifacts.require("Freeport");
const USDC = artifacts.require("USDC");
const FiatGateway = artifacts.require("FiatGateway");
const SimpleAuction = artifacts.require("SimpleAuction");
const {time} = require('@openzeppelin/test-helpers');
const log = console.log;
const isDev = (config.network === 'development');
const assert = require('assert').strict;


module.exports = async function (done) {
    try {
        const CURRENCY = 0;
        const UNIT = 1e6;
        let oneK = "1" + "000" + "000000"; // 1K with 6 decimals;

        let accounts = await web3.eth.getAccounts();
        let seller = accounts[0];
        let buyer = accounts[1];
        log("From seller account", seller);
        log("From buyer account", buyer);
        let freeport = await Freeport.deployed();
        let erc20 = await USDC.deployed();
        let gateway = await FiatGateway.deployed();
        let auction = await SimpleAuction.deployed();
        log("Operating on Freeport contract", freeport.address);
        log("Operating on USDC contract", erc20.address);
        log("Operating on FiatGateway contract", gateway.address);
        log("Operating on SimpleAuction contract", auction.address);

        let mintUSDC = async (account, amount) => {
            let amountEncoded = web3.eth.abi.encodeParameter("uint256", amount);
            await erc20.deposit(account, amountEncoded);
        };


        // Issue an NFT.
        let nftId = await freeport.issue.call(10, "0x", {from: seller});
        await freeport.issue(10, "0x", {from: seller});
        log("issue ok");

        // Offer to sell.
        let price = 100 * UNIT;
        await freeport.makeOffer(nftId, price, {from: seller});
        log("makeOffer ok");

        // Get money ready.
        await mintUSDC(buyer, oneK);
        await erc20.approve(freeport.address, 1e9 * UNIT, {from: buyer});
        await erc20.approve(auction.address, 1e9 * UNIT, {from: buyer});

        // Track balances.
        let balanceSeller0 = await erc20.balanceOf(seller);
        let balanceBuyer0 = await erc20.balanceOf(buyer);

        // Buy.
        await freeport.takeOffer(buyer, seller, nftId, price, 1, {from: buyer});
        log("takeOffer ok");

        // Withdraw revenues.
        let balance1 = await freeport.balanceOf(seller, CURRENCY);
        await freeport.withdraw(balance1, {from: seller});
        log("withdraw ok");

        // Check balances.
        let balanceSeller1 = await erc20.balanceOf(seller);
        let balanceBuyer1 = await erc20.balanceOf(buyer);
        let changeSeller1 = +balanceSeller1 - balanceSeller0;
        let changeBuyer1 = +balanceBuyer1 - balanceBuyer0;
        assert.equal(changeSeller1, price);
        assert.equal(changeBuyer1, -price);
        log("balances ok");

        // Put on auction.
        let duration = 20;
        let closeTime = (await time.latest()).toNumber() + duration;
        await auction.startAuction(nftId, price, closeTime, {from: seller});
        log("startAuction ok");

        // Buy.
        await auction.bidOnAuction(seller, nftId, price * 2, {from: buyer});
        log("bidOnAuction ok");
        await auction.bidOnAuction(seller, nftId, price * 3, {from: buyer});
        log("bidOnAuction again ok");

        // Settle.
        log("Waiting for auction close");
        let extendedDuration = duration + 10 * 60;
        await sleep(extendedDuration);

        await auction.settleAuction(seller, nftId);
        log("settleAuction ok");

        // Withdraw revenues.
        let balance = await freeport.balanceOf(seller, CURRENCY);
        await freeport.withdraw(balance, {from: seller});
        log("withdraw ok");

        // Check balances.
        let balanceSeller2 = await erc20.balanceOf(seller);
        let balanceBuyer2 = await erc20.balanceOf(buyer);
        let changeSeller2 = +balanceSeller2 - balanceSeller1;
        let changeBuyer2 = +balanceBuyer2 - balanceBuyer1;
        assert.equal(changeSeller2, price * 3);
        assert.equal(changeBuyer2, -price * 3);
        log("balances ok");

        done();
    } catch (e) {
        done(e);
    }
};

function sleep(seconds) {
    if (isDev) {
        return time.increase(seconds);
    } else {
        return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
    }
}