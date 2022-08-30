const Freeport = artifacts.require("Freeport");
const CollectionFactory = artifacts.require("CollectionFactory");
const Collection = artifacts.require("Collection");
const Marketplace = artifacts.require("Marketplace");
const Auction = artifacts.require("Auction");
const USDC = artifacts.require("USDC");
const log = console.log;
const {deployProxy} = require('@openzeppelin/truffle-upgrades');
const {expectEvent, expectRevert, time} = require('@openzeppelin/test-helpers');
const BN = require('bn.js');


contract("Auction", accounts => {
    const deployer = accounts[0];
    const minter = accounts[1];
    const buyer = accounts[2];
    const buyerNumberTwo = accounts[3];
    const beneficiary = accounts[4];

    const CURRENCY = 0;
    const UNIT = 1e6;
    const aLot = 100e3 * UNIT;
    const freeportUSDCAmount = 10e3 * UNIT;

    let deploy = async (freeport) => {
        let erc20;
        if (freeport) {
            let erc20address = await freeport.currencyContract.call();
            erc20 = await USDC.at(erc20address);
        } else {
            freeport = await deployProxy(Freeport, [], {kind: "uups"});
            erc20 = await USDC.new();
            await erc20.initialize("USD Coin (PoS)", "F_T_USDC", 6, deployer);
            await freeport.setERC20(erc20.address);
        }

        let mintUSDC = async (account, amount) => {
            let amountEncoded = web3.eth.abi.encodeParameter("uint256", amount);
            await erc20.deposit(account, amountEncoded);
        };

        await mintUSDC(deployer, aLot);
        await mintUSDC(freeport.address, freeportUSDCAmount);
        await erc20.approve(freeport.address, aLot);
        await freeport.deposit(aLot);

        let withdraw = async (account) => {
            let balance = await freeport.balanceOf(account, CURRENCY);
            await freeport.withdraw(balance, {from: account});
        };

        return {freeport, erc20, mintUSDC, withdraw};
    };

    let freeport;
    let factory;
    let marketplace;
    let auction;
    let erc20;
    let mintUSDC;
    let withdraw;

    before(async () => {
        let freeportOfMigrations = await Freeport.deployed();
        let x = await deploy(freeportOfMigrations);
        freeport = x.freeport;
        factory = await CollectionFactory.deployed();
        marketplace = await Marketplace.deployed();
        auction = await Auction.deployed();
        erc20 = x.erc20;
        mintUSDC = x.mintUSDC;
        withdraw = x.withdraw;
    });

    it("sells an NFT by auction", async () => {

        const PERCENT = 100; // 1% in basis points.

        // Give some initial tokens to the buyers.
        let someMoney = 1000;
        await mintUSDC(buyer, someMoney * UNIT);
        await mintUSDC(buyerNumberTwo, someMoney * UNIT);

        let nftSupply = 10;
        const {addr: collectionAddress} = await createCollection(minter, "Minter's collections")

        const {_id: nftId} = await mintNFT(collectionAddress, minter, nftSupply)
        log("’Minter’ creates", nftSupply, "NFTs of type", nftId.toString(16));
        log()

        let closeTime = (await time.latest()).toNumber() + 1000;

        let checkBalances = async (expected, nftId) => {
            for (let [account, expectedERC20, expectedNFTs] of expected) {
                log("#@#@#@#@#@#@#@#")
                log(`account, expectedERC20, expectedNFTs = [${account}, ${expectedERC20}, ${expectedNFTs}]`)
                let ercBalance = await erc20.balanceOf(account);
                log(`ercBalance = [${ercBalance}]`)
                log("#@#@#@#@#@#@#@#")
                let currency = await freeport.balanceOf.call(account, CURRENCY);
                let nfts = await collection.balanceOf.call(account, nftId);
                assert.equal(ercBalance, expectedERC20 * UNIT);
                assert.equal(currency, 0);
                assert.equal(nfts, expectedNFTs);
            }
        };

        // The buyer (or anyone else except minter) cannot auction an NFT that he does not have.
        await expectRevert(
            auction.startAuction(nftId, 100 * UNIT, closeTime, {from: buyer}),
            "ERC1155: insufficient balance for transfer");

        const collection = await Collection.at(collectionAddress)
        await collection.setupRoyaltyConfiguration(
            beneficiary,
            /* primaryCut */ 10 * PERCENT,
            /* primaryMinimum */ 0,
            beneficiary,
            /* secondaryCut */ 0,
            /* secondaryMinimum */ 0,
            {from: minter});
        log("’Minter’ configures royalties for his NFT collection: 10% on primary sales");
        log();

        await auction.startAuction(nftId, 100 * UNIT, closeTime, {from: minter});

        await checkBalances([
            [minter, 0, 9], // The seller put 1 of 10 NFTs as deposit.
            [auction.address, 0, 1], // The contract took 1 NFT as deposit.
        ], nftId);

        await erc20.approve(auction.address, 1e9 * UNIT, {from: buyer});
        await auction.bidOnAuction(minter, nftId, 100 * UNIT, {from: buyer});

        await checkBalances([
            [buyer, someMoney - 100, 0], // Buyer put 100 money as deposit.
            [auction.address, 100, 1], // The contract took 100 money as deposit.
        ], nftId);

        await expectRevert(
            auction.bidOnAuction(minter, nftId, 109 * UNIT, {from: buyerNumberTwo}),
            "a new bid must be 10% greater than the current bid");

        await erc20.approve(auction.address, 1e9 * UNIT, {from: buyerNumberTwo});
        await auction.bidOnAuction(minter, nftId, 110 * UNIT, {from: buyerNumberTwo});

        let tooMuchMoney = someMoney + 1;
        await expectRevert(
            auction.bidOnAuction(minter, nftId, tooMuchMoney * UNIT, {from: buyer}),
            "ERC20: transfer amount exceeds balance");

        await checkBalances([
            [buyer, someMoney, 0], // Buyer got back his 100 money.
            [buyerNumberTwo, someMoney - 110, 0], // BuyerNumberTwo put 110 money as deposit.
            [auction.address, 110, 1], // The contract took 110 money as deposit.
        ], nftId);

        // Cannot restart an active auction.
        await expectRevert(
            auction.startAuction(nftId, 100 * UNIT, closeTime, {from: minter}),
            "the auction must not exist");

        // Cannot settle before the close time.
        /* This is no longer required.
        await expectRevert(
            auction.settleAuction(issuer, nftId),
            "the auction must be closed");
         */

        // Wait for the close time.
        await time.increaseTo(closeTime + 1);

        // Settle the sale to buyerNumberTwo at 110 tokens.
        await auction.settleAuction(minter, nftId);

        // Minter and Beneficiary withdraw their earnings to ERC20.
        await withdraw(minter);
        await withdraw(beneficiary);

        /* Temporary irrelevant cause of captureFee skipping.
        // Check every balance after settlement.
        await checkBalances([
            [minter, 110 - 11, 9], // Earned 110 money, spent 11 in royalties, spent 1 of 10 NFTs.
            [buyer, someMoney, 0], // No change, BuyerBob got his refund.
            [buyerNumberTwo, someMoney - 110, 1], // Spent 110 money, earned the NFT.
            [auction.address, 0, 0], // No change, the contract gave back all deposits.
            [beneficiary, 11, 0], // The beneficiary earned 10% of 110.
        ], nftId);
         */

        // Check every balance after settlement.
        await checkBalances([
            [minter, 110, 9], // Earned 110 money, spent 1 of 10 NFTs.
            [buyer, someMoney, 0], // No change, BuyerBob got his refund.
            [buyerNumberTwo, someMoney - 110, 1], // Spent 110 money, earned the NFT.
            [auction.address, 0, 0], // No change, the contract gave back all deposits.
            [beneficiary, 0, 0], // The beneficiary earned 0% of the price.
        ], nftId);

        // Cannot settle twice.
        await expectRevert(
            auction.settleAuction(minter, nftId),
            "the auction must exist");

        // Can start another auction.
        await auction.startAuction(nftId, 100 * UNIT, closeTime + 2000, {from: minter});
    });

    const createCollection = async (collectionManager, name) => {
        // Deployer creates a collection for the minter.
        let createTx = await factory.createCollection(collectionManager, name, "https://{id}.json", "https://my_contract", {from: deployer});

        return getEvent(createTx, "CollectionCreated")
    }

    const mintNFT = async (collectionAddr, to, supply) => {
        // The minter mints some NFTs.
        let mintTx = await factory.mintOnBehalf(collectionAddr, to, supply, "0x", {from: to});

        return getEvent(mintTx, "MintOnBehalf")
    }
});

function getEvent(tx, eventName) {
    return tx.logs.find((log) =>
        log.event === eventName
    ).args;
}
