const Freeport = artifacts.require("./Freeport.sol");
const SimpleAuction = artifacts.require("SimpleAuction");
const TestERC20 = artifacts.require("TestERC20");
const log = console.log;
const { deployProxy } = require('@openzeppelin/truffle-upgrades');
const { expectEvent, expectRevert, constants, time } = require('@openzeppelin/test-helpers');
const BN = require('bn.js');
const { typedData } = require("./utils");
const ethers = require("ethers");

contract("SimpleAuction", accounts => {
    const [deployer, issuer, buyerBob, buyerBill, benificiary] = accounts;

    const CURRENCY = 0;
    const UNIT = 1e6;
    const aLot = 100e3 * UNIT;

    let deploy = async (freeport) => {
        let erc20;
        if (freeport) {
            let erc20address = await freeport.currencyContract.call();
            erc20 = await TestERC20.at(erc20address);
        } else {
            freeport = await deployProxy(Freeport, [], { kind: "uups" });
            erc20 = await TestERC20.new();
            await freeport.setERC20(erc20.address);
        }

        await erc20.mint(deployer, aLot);
        await erc20.approve(freeport.address, aLot);
        await freeport.deposit(aLot);

        let deposit = async (account, amount) => {
            await freeport.safeTransferFrom(deployer, account, CURRENCY, amount, "0x");
        };

        let withdraw = async (account) => {
            let balance = await freeport.balanceOf(account, CURRENCY);
            await freeport.withdraw(balance, {from: account});
        };

        return {freeport, erc20, deposit, withdraw};
    };

    let freeport;
    let erc20;
    let deposit;
    let withdraw;

    before(async () => {
        let freeportOfMigrations = await Freeport.deployed();
        let x = await deploy(freeportOfMigrations);
        freeport = x.freeport;
        erc20 = x.erc20;
        deposit = x.deposit;
        withdraw = x.withdraw;
    });


    it("sells an NFT by auction", async () => {

        const mnemonic = process.env.MNEMONIC;
        const auction = await SimpleAuction.deployed();
        const PERCENT = 100; // 1% in basis points.

        // Give some initial tokens to the buyers.
        let someMoney = 1000;
        await erc20.mint(buyerBob, someMoney * UNIT);
        await erc20.mint(buyerBill, someMoney * UNIT);

        let nftSupply = 10;
        let nftId = await freeport.issue.call(nftSupply, "0x", { from: issuer });
        let closeTime = (await time.latest()).toNumber() + 1000;

        // A helper function to check currency and NFT balances.
        let checkBalances = async (expected) => {
            for (let [account, expectedERC20, expectedNFTs] of expected) {
                let ercBalance = await erc20.balanceOf(account);
                let currency = await freeport.balanceOf.call(account, CURRENCY);
                let nfts = await freeport.balanceOf.call(account, nftId);
                assert.equal(ercBalance, expectedERC20 * UNIT);
                assert.equal(currency, 0);
                assert.equal(nfts, expectedNFTs);
            }
        };
        
        // The issuer cannot auction an NFT that he does not have yet.
        await expectRevert(
            auction.startAuction(nftId, 100 * UNIT, closeTime, { from: issuer }),
            "ERC1155: insufficient balance for transfer");

        await freeport.issue(nftSupply, "0x", { from: issuer });
        log("’Issuer’ creates", nftSupply, "NFTs of type", nftId.toString(16));
        log();

        await freeport.configureRoyalties(
            nftId,
            benificiary,
            /* primaryCut */ 10 * PERCENT,
            /* primaryMinimum */ 0,
            benificiary,
            /* secondaryCut */ 0,
            /* secondaryMinimum */ 0,
            { from: issuer });
        log("’Issuer’ configures royalties for this NFT type: 10% on primary sales");
        log();

        await auction.startAuction(nftId, 100 * UNIT, closeTime, { from: issuer });

        await checkBalances([
            [issuer, 0, 9], // The seller put 1 of 10 NFTs as deposit.
            [auction.address, 0, 1], // The contract took 1 NFT as deposit.
        ]);

        await erc20.approve(auction.address, 1e9 * UNIT, {from: buyerBob});
        await auction.bidOnAuction(issuer, nftId, 100 * UNIT, {from: buyerBob});

        await checkBalances([
            [buyerBob, someMoney - 100, 0], // BuyerBob put 100 money as deposit.
            [auction.address, 100, 1], // The contract took 100 money as deposit.
        ]);

        await expectRevert(
            auction.bidOnAuction(issuer, nftId, 109 * UNIT, signedTypedData, { from: buyerBill }),
            "a new bid must be 10% greater than the current bid");

        await erc20.approve(auction.address, 1e9 * UNIT, {from: buyerBill});
        await auction.bidOnAuction(issuer, nftId, 110 * UNIT, {from: buyerBill});

        let tooMuchMoney = someMoney + 1;
        await expectRevert(
            auction.bidOnAuction(issuer, nftId, tooMuchMoney * UNIT, {from: buyerBob}),
            "ERC20: transfer amount exceeds balance");

        await checkBalances([
            [buyerBob, someMoney, 0], // BuyerBob got back his 100 money.
            [buyerBill, someMoney - 110, 0], // BuyerBill put 110 money as deposit.
            [auction.address, 110, 1], // The contract took 110 money as deposit.
        ]);

        // Cannot restart an active auction.
        await expectRevert(
            auction.startAuction(nftId, 100 * UNIT, closeTime, { from: issuer }),
            "the auction must not exist");

        // Cannot settle before the close time.
        await expectRevert(
            auction.settleAuction(issuer, nftId),
            "the auction must be closed");

        // Wait for the close time.
        await time.increaseTo(closeTime + 1);

        // Settle the sale to buyer2 at 110 tokens.
        await auction.settleAuction(issuer, nftId);

        // Issuer and benificiaries withdraw their earnings to ERC20.
        await withdraw(issuer);
        await withdraw(benificiary);

        // Check every balance after settlement.
        await checkBalances([
            [issuer, 110 - 11, 9], // Earned 110 money, spent 11 in royalties, spent 1 of 10 NFTs.
            [buyerBill, someMoney - 110, 1], // Spent 110 money, earned the NFT.
            [buyerBob, someMoney, 0], // No change, BuyerBob got his refund.
            [auction.address, 0, 0], // No change, the contract gave back all deposits.
            [benificiary, 11, 0], // The beneficiary earned 10% of 110.
        ]);

        // Cannot settle twice.
        await expectRevert(
            auction.settleAuction(issuer, nftId),
            "the auction must exist");

        // Can start another auction.
        await auction.startAuction(nftId, 100 * UNIT, closeTime + 2000, { from: issuer });
    });
});