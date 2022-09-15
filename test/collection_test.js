const Freeport = artifacts.require("Freeport");
const CollectionFactory = artifacts.require("CollectionFactory");
const NFTAttachment = artifacts.require("NFTAttachment");
const Collection = artifacts.require("Collection");
const Marketplace = artifacts.require("Marketplace");
const Auction = artifacts.require("Auction");
const USDC = artifacts.require("USDC");
const log = console.log;
const {deployProxy} = require('@openzeppelin/truffle-upgrades');
const {expectEvent, expectRevert} = require('@openzeppelin/test-helpers');
const BN = require('bn.js');


contract("Collection", accounts => {
    const deployer = accounts[0];
    const minter = accounts[1];
    const buyer = accounts[2];
    const anon = accounts[9];

    const CURRENCY = 0;
    const UNIT = 1e6;
    const aLot = 100e3 * UNIT;
    const freeportUSDCAmount = 10e3 * UNIT;
    const attachmentData = "0x11223344556677889900112233445566778899001122334455667788990011223344556677889900";

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
    let attachment;
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
        attachment = await NFTAttachment.deployed();
        erc20 = x.erc20;
        mintUSDC = x.mintUSDC;
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
        let balance = +(await collection.balanceOf(minter, nftId));
        assert.equal(balance, 10);

        // The minter puts the NFTs for sale.
        let price = 100;
        let makeOfferTx = await marketplace.makeOffer(nftId, price, {from: minter});
        let makeOfferEv = getEvent(makeOfferTx, "MakeOffer");
        assert.equal(makeOfferEv.seller, minter);
        assert.equal(makeOfferEv.nftId.toString(), nftId.toString());
        assert.equal(makeOfferEv.price.toNumber(), price);

        await expectRevert(
            attachment.collectionManagerAttachToNFT(nftId, attachmentData, {from: anon}),
            "sender is not collection manager");

        let receipt = await attachment.collectionManagerAttachToNFT(nftId, attachmentData, {from: minter});
        expectEvent(receipt, 'MinterAttachToNFT', {
            minter,
            nftId,
            attachment: attachmentData,
        });

        // The buyer gets some money.
        await mintUSDC(buyer, 1000);
        // The buyer approves the marketplace.
        await erc20.approve(marketplace.address, aLot, {from: buyer});

        let minterMoney0 = +(await erc20.balanceOf(minter));
        let buyerMoney0 = +(await erc20.balanceOf(buyer));

        // The buyer buys one NFT.
        let takeOfferTx = await marketplace.takeOffer(buyer, minter, nftId, 0, 2, {from: buyer});
        let takeOfferEv = getEvent(takeOfferTx, "TakeOffer");
        assert.equal(takeOfferEv.buyer, buyer);
        assert.equal(takeOfferEv.seller, minter);
        assert.equal(takeOfferEv.nftId.toString(), nftId.toString());
        assert.equal(takeOfferEv.price.toNumber(), price);
        assert.equal(takeOfferEv.amount.toNumber(), 2);
        let transferSingleEv = getEvent(takeOfferTx, "TransferSingle", collection.address);
        assert.equal(transferSingleEv.operator.toString(), marketplace.address);
        assert.equal(transferSingleEv.from.toString(), minter);
        assert.equal(transferSingleEv.to.toString(), buyer);
        assert.equal(transferSingleEv.id.toString(), nftId.toString());
        assert.equal(transferSingleEv.value.toNumber(), 2);
        let factoryTransferSingleEv = getEvent(takeOfferTx, "TransferSingle", factory.address);
        assert.equal(factoryTransferSingleEv.operator.toString(), marketplace.address);
        assert.equal(factoryTransferSingleEv.from.toString(), minter);
        assert.equal(factoryTransferSingleEv.to.toString(), buyer);
        assert.equal(factoryTransferSingleEv.id.toString(), nftId.toString());
        assert.equal(factoryTransferSingleEv.value.toNumber(), 2);


        // The NFTs were transferred.
        let minterNfts = +(await collection.balanceOf(minter, nftId));
        let buyerNfts = +(await collection.balanceOf(buyer, nftId));
        assert.equal(minterNfts, 10 - 2);
        assert.equal(buyerNfts, 2);

        // Where's the money Lebowski?
        let minterMoney1 = +(await erc20.balanceOf(minter));
        let buyerMoney1 = +(await erc20.balanceOf(buyer));
        assert.equal(minterMoney1 - minterMoney0, price * 2);
        assert.equal(buyerMoney1 - buyerMoney0, -price * 2);
    });

});

function getEvent(tx, eventName, address) {
    if (address) {
        return tx.logs.find((log) =>
            log.event === eventName && log.address === address
        ).args;
    } else {
        return tx.logs.find((log) =>
            log.event === eventName
        ).args;
    }
}
