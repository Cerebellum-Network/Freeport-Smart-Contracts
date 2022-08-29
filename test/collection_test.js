const Freeport = artifacts.require("Freeport");
const CollectionFactory = artifacts.require("CollectionFactory");
const Collection = artifacts.require("Collection");
const Marketplace = artifacts.require("Marketplace");
const Auction = artifacts.require("Auction");
const ERC20 = artifacts.require("TestERC20");
const log = console.log;
const {deployProxy} = require('@openzeppelin/truffle-upgrades');
const {expectEvent, expectRevert} = require('@openzeppelin/test-helpers');
const BN = require('bn.js');


contract("Collection", accounts => {
    const deployer = accounts[0];
    const minter = accounts[1];
    const buyer = accounts[2];

    const CURRENCY = 0;
    const UNIT = 1e6;
    const aLot = 100e3 * UNIT;
    const freeportUSDCAmount = 10e3 * UNIT;

    let deploy = async (freeport) => {
        let erc20;
        if (freeport) {
            let erc20address = await freeport.currencyContract.call();
            erc20 = await ERC20.at(erc20address);
        } else {
            freeport = await deployProxy(Freeport, [], {kind: "uups"});
            erc20 = await ERC20.new();
            await freeport.setERC20(erc20.address);
        }

        await erc20.mint(deployer, aLot);
        await erc20.mint(freeport.address, freeportUSDCAmount);
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
    let factory;
    let marketplace;
    let auction;
    let erc20;
    let deposit;
    let withdraw;

    before(async () => {
        let freeportOfMigrations = await Freeport.deployed();
        let x = await deploy(freeportOfMigrations);
        freeport = x.freeport;
        factory = await CollectionFactory.deployed();
        marketplace = await Marketplace.deployed();
        auction = await Auction.deployed();
        erc20 = x.erc20;
        deposit = x.deposit;
        withdraw = x.withdraw;
    });

    it("creates a collection", async () => {
        // Deployer creates a collection for the minter.
        let createTx = await factory.createCollection(minter, "my collection", "https://{id}.json", "https://my_contract", {from: deployer});

        let collectionAddr = getEvent(createTx, "CollectionCreated").addr;

        // The minter mints some NFTs.
        let mintTx = await factory.mintOnBehalf(collectionAddr, minter, 10, "0x", {from: minter});

        let mintEvent = getEvent(mintTx, "MintOnBehalf");
        let nftId = mintEvent._id;
        assert.equal(mintEvent._operator, minter);
        assert.equal(mintEvent._collection, collectionAddr);
        assert.equal(mintEvent._holder, minter);
        assert.equal(mintEvent._amount, 10);

        let parsedId = await factory.parseNftId(nftId);
        assert.equal(parsedId.collection, collectionAddr);
        assert.equal(parsedId.innerId.toNumber(), 1);
        assert.equal(parsedId.supply.toNumber(), 0);

        let collection = await Collection.at(collectionAddr);
        let balance = await collection.balanceOf(minter, nftId);
        assert.equal(balance.toNumber(), 10);

        // The minter puts the NFTs for sale.
        let price = 100;
        let makeOfferTx = await marketplace.makeOffer(nftId, price, {from: minter});
        let makeOfferEv = getEvent(makeOfferTx, "MakeOffer");
        assert.equal(makeOfferEv.seller, minter);
        assert.equal(makeOfferEv.nftId.toString(), nftId.toString());
        assert.equal(makeOfferEv.price.toNumber(), price);

        // The buyer gets some money.
        await erc20.mint(buyer, 1000);

        // The buyer approves the marketplace.
        await erc20.approve(marketplace.address, aLot, {from: buyer});

        // The buyer buys one NFT.
        let takeOfferTx = await marketplace.takeOffer(buyer, minter, nftId, 0, 2, {from: buyer});
        let takeOfferEv = getEvent(takeOfferTx, "TakeOffer");
        assert.equal(takeOfferEv.buyer, buyer);
        assert.equal(takeOfferEv.seller, minter);
        assert.equal(takeOfferEv.nftId.toString(), nftId.toString());
        assert.equal(takeOfferEv.price.toNumber(), price);
        assert.equal(takeOfferEv.amount.toNumber(), 2);
    });

});

function getEvent(tx, eventName) {
    return tx.logs.find((log) =>
        log.event === eventName
    ).args;
}
