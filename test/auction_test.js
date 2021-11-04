const Davinci = artifacts.require("./Davinci.sol");
const SimpleAuction = artifacts.require("SimpleAuction");
const log = console.log;
const {expectEvent, expectRevert, constants, time} = require('@openzeppelin/test-helpers');
const BN = require('bn.js');

contract("SimpleAuction", accounts => {
    const [deployer, issuer, buyerBob, buyerBill, benificiary] = accounts;

    it("sells an NFT by auction", async () => {

        const davinci = await Davinci.deployed();
        const auction = await SimpleAuction.deployed();
        const CURRENCY = await davinci.CURRENCY.call();
        const UNIT = 1e10;
        const PERCENT = 100; // 1% in basis points.

        // Give some initial tokens to the buyers.
        let someMoney = 1000;
        let encodedMoney = web3.eth.abi.encodeParameter('uint256', someMoney * UNIT);
        await davinci.deposit(buyerBob, encodedMoney);
        await davinci.deposit(buyerBill, encodedMoney);

        let nftSupply = 10;
        let nftId = await davinci.issue.call(nftSupply, "0x", {from: issuer});
        let closeTime = (await time.latest()).toNumber() + 1000;

        // A helper function to check currency and NFT balances.
        let checkBalances = async (expected) => {
            for (let [account, expectedCurrency, expectedNFTs] of expected) {
                let currency = await davinci.balanceOf.call(account, CURRENCY);
                let nfts = await davinci.balanceOf.call(account, nftId);
                assert.equal(currency, expectedCurrency * UNIT);
                assert.equal(nfts, expectedNFTs);
            }
        };

        // The issuer cannot auction an NFT that he does not have yet.
        await expectRevert(
            auction.startAuction(nftId, 100 * UNIT, closeTime, {from: issuer}),
            "ERC1155: insufficient balance for transfer");

        await davinci.issue(nftSupply, "0x", {from: issuer});
        log("’Issuer’ creates", nftSupply, "NFTs of type", nftId.toString(16));
        log();

        await davinci.configureRoyalties(
            nftId,
            benificiary,
            /* primaryCut */ 10 * PERCENT,
            /* primaryMinimum */ 0,
            benificiary,
            /* secondaryCut */ 0,
            /* secondaryMinimum */ 0,
            {from: issuer});
        log("’Issuer’ configures royalties for this NFT type: 10% on primary sales");
        log();

        await auction.startAuction(nftId, 100 * UNIT, closeTime, {from: issuer});

        await checkBalances([
            [issuer, 0, 9], // The seller put 1 of 10 NFTs as deposit.
            [auction.address, 0, 1], // The contract took 1 NFT as deposit.
        ]);

        await auction.bidOnAuction(issuer, nftId, 100 * UNIT, {from: buyerBob});

        await checkBalances([
            [buyerBob, someMoney - 100, 0], // BuyerBob put 100 money as deposit.
            [auction.address, 100, 1], // The contract took 100 money as deposit.
        ]);

        await auction.bidOnAuction(issuer, nftId, 110 * UNIT, {from: buyerBill});

        await checkBalances([
            [buyerBob, someMoney, 0], // BuyerBob got back his 100 money.
            [buyerBill, someMoney - 110, 0], // BuyerBill put 110 money as deposit.
            [auction.address, 110, 1], // The contract took 110 money as deposit.
        ]);

        // Cannot restart an active auction.
        await expectRevert(
            auction.startAuction(nftId, 100 * UNIT, closeTime, {from: issuer}),
            "the auction must not exist");

        // Cannot settle before the close time.
        await expectRevert(
            auction.settleAuction(issuer, nftId),
            "the auction must be closed");

        // Wait for the close time.
        await time.increaseTo(closeTime + 1);

        // Settle the sale to buyer2 at 110 tokens.
        await auction.settleAuction(issuer, nftId);

        // Check every balance after settlement.
        await checkBalances([
            [issuer, 110 - 11, 9], // Earned 110 money, spent 11 in royalties, spent 1 of 10 NFTs.
            [buyerBill, someMoney - 110, 1], // Spent 110 money, earned the NFT.
            [buyerBob, someMoney, 0], // No change, BuyerBob got his refund.
            [auction.address, 0, 0], // No change, the contract gave back all deposits.
            [benificiary, 11, 0], // The beneficiary earned 10% of 110.
            [deployer, 0, 0], // No change.
        ]);

        // Cannot settle twice.
        await expectRevert(
            auction.settleAuction(issuer, nftId),
            "the auction must exist");

        // Can start another auction.
        await auction.startAuction(nftId, 100 * UNIT, closeTime + 2000, {from: issuer});
    });
});