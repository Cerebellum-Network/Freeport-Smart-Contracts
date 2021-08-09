const Davinci = artifacts.require("./Davinci.sol");
const Forwarder = artifacts.require("MinimalForwarder");
const log = console.log;
const {expectEvent, expectRevert, constants} = require('@openzeppelin/test-helpers');
const BN = require('bn.js');


contract("Davinci", accounts => {
    const deployer = accounts[0];
    const issuer = accounts[1];
    const partner = accounts[2];
    const buyer = accounts[3];
    const buyer2 = accounts[4];
    const relayer = accounts[5];
    const someone = accounts[6];


    it("issues unique NFT IDs.", async () => {
        const davinci = await Davinci.deployed();

        let issuerLow = issuer.toLowerCase();
        const expectedIds = [
            [5, issuerLow + "000000000000000000000005"],
            [5, issuerLow + "000000010000000000000005"],
            [9, issuerLow + "000000020000000000000009"],
        ];

        for (let i of expectedIds.keys()) {
            let [supply, expectedId] = expectedIds[i];

            // Predict NFT ID using the getter, or simulating the issuance.
            let nftId = await davinci.getNftId.call(issuer, i, supply);
            let nftId2 = await davinci.issue.call(supply, "0x", {from: issuer});
            assert.equal("0x" + nftId.toString(16), expectedId);
            assert.equal("0x" + nftId2.toString(16), expectedId);

            // Balance should be 0.
            let balance = await davinci.balanceOf(issuer, expectedId);
            assert.equal(balance, 0);

            // Issue.
            await davinci.issue(supply, "0x", {from: issuer});

            // Balance should be supply
            balance = await davinci.balanceOf(issuer, expectedId);
            assert.equal(balance, supply);
        }
    });


    it("deposits and withdraws from the bridge", async () => {
        const davinci = await Davinci.new();
        const CURRENCY = await davinci.CURRENCY.call();
        const UNIT = 1e10;
        let amount = 1000 * UNIT;
        let encodedAmount = web3.eth.abi.encodeParameter('uint256', amount);

        // Check initial supply in the bridge.
        let currencySupply = await davinci.currencyInBridge.call();
        assert.equal(currencySupply, 10e9 * UNIT); // 10 billions with 10 decimals.

        // Everybody has 0 tokens.
        for (let account of accounts) {
            let balance = await davinci.balanceOf.call(account, CURRENCY);
            assert.equal(balance, 0);
        }

        // Some account cannot deposit.
        await expectRevert(
            davinci.deposit(someone, encodedAmount, {from: relayer}),
            "Only the ChainManager is allowed to deposit");

        // Some account cannot set the relayer.
        await expectRevert(
            davinci.updateChildChainManager(relayer, {from: relayer}),
            "Only the current ChainManager is allowed to change the ChainManager.");

        // The initial childChainManagerProxy is the deployer.
        let childChainManagerProxy = await davinci.childChainManagerProxy.call();
        assert.equal(childChainManagerProxy, deployer);

        // The deployer sets the relayer.
        await davinci.updateChildChainManager(relayer, {from: deployer});

        // The new childChainManagerProxy is the relayer.
        childChainManagerProxy = await davinci.childChainManagerProxy.call();
        assert.equal(childChainManagerProxy, relayer);

        // The deployer cannot deposit anymore.
        await expectRevert(
            davinci.deposit(someone, encodedAmount, {from: deployer}),
            "Only the ChainManager is allowed to deposit");

        // The deployer cannot set the relayer anymore.
        await expectRevert(
            davinci.updateChildChainManager(deployer, {from: deployer}),
            "Only the current ChainManager is allowed to change the ChainManager.");

        // The relayer deposits to someone’s account from the bridge.
        await davinci.deposit(someone, encodedAmount, {from: relayer});

        // Someone got the deposit, taken from the bridge supply.
        let someoneBalance = await davinci.balanceOf.call(someone, CURRENCY);
        assert.equal(someoneBalance, amount);
        let currencySupplyAfter = await davinci.currencyInBridge.call();
        assert.equal(currencySupplyAfter, currencySupply - amount);

        // Someone cannot withdraw more than what they have.
        await expectRevert(
            davinci.withdraw(amount + 1, {from: someone}),
            "ERC1155: insufficient balance for transfer");

        // Someone withdraws back into the bridge.
        let receipt = await davinci.withdraw(amount, {from: someone});

        expectEvent(receipt, 'Transfer', {
            from: someone,
            to: constants.ZERO_ADDRESS, // Must be 0 to be detected by the relayer.
            value: new BN(amount),
        });

        expectEvent(receipt, 'TransferSingle', {
            from: someone,
            to: constants.ZERO_ADDRESS,
            value: new BN(amount),
            operator: someone,
            id: CURRENCY,
        });

        // Tokens moved from someone to the bridge.
        someoneBalance = await davinci.balanceOf.call(someone, CURRENCY);
        assert.equal(someoneBalance, 0);
        currencySupplyAfter = await davinci.currencyInBridge.call();
        assert.equal(+currencySupplyAfter, +currencySupply);
    });


    it("issues an NFT, create a Joint Account, collect royalties, distribute to JA.", async () => {
        log();
        const davinci = await Davinci.new();
        const CURRENCY = await davinci.CURRENCY.call();
        const UNIT = 1e10;
        let BASIS_POINTS = +await davinci.BASIS_POINTS.call();
        assert.equal(BASIS_POINTS, 100 * 100);

        let currencySupply = await davinci.currencyInBridge.call();
        log("Supply of currencies in the bridge:", +currencySupply / UNIT, "CERE");

        let pocketMoney = 1000 * UNIT;
        let encodedMoney = web3.eth.abi.encodeParameter('uint256', pocketMoney);
        await davinci.deposit(issuer, encodedMoney);
        await davinci.deposit(buyer, encodedMoney);
        let issuerBalance = await davinci.balanceOf.call(issuer, CURRENCY);
        assert.equal(issuerBalance, pocketMoney);
        let buyerBalance = await davinci.balanceOf.call(buyer, CURRENCY);
        assert.equal(buyerBalance, pocketMoney);
        log("Deposit", pocketMoney / UNIT, "CERE from the bridge to account ’Issuer’");
        log("Deposit", pocketMoney / UNIT, "CERE from the bridge to account ’Buyer’");
        log();

        let nftSupply = 10;
        let nftId = await davinci.issue.call(nftSupply, "0x", {from: issuer});
        await davinci.issue(nftSupply, "0x", {from: issuer});
        let nftBalance = await davinci.balanceOf.call(issuer, nftId);
        assert.equal(nftBalance, nftSupply, "NFTs should be minted to the issuer");
        log("’Issuer’ creates", nftSupply, "NFTs of type", nftId.toString(16));
        log();

        let owners = [issuer, partner];
        let fractions = [9000, 1000];
        let account = await davinci.makeAddressOfJointAccount.call(owners, fractions);
        await davinci.createJointAccount(owners, fractions, {from: issuer});
        log("’Issuer’ creates a Joint Account:", account);
        log("..........................’Issuer’ gets:", fractions[0] * 100 / BASIS_POINTS, "%");
        log(".........................’Partner’ gets:", fractions[1] * 100 / BASIS_POINTS, "%");
        log();

        await davinci.configureRoyalties(
            nftId,
            account,
            /* primaryCut */ 0,
            /* primaryMinimum */ 100 * UNIT,
            account,
            /* secondaryCut */ 0,
            /* secondaryMinimum */ 50 * UNIT,
            {from: issuer});
        log("’Issuer’ configures royalties for this NFT type");
        {
            let {primaryMinimum, secondaryMinimum} = await davinci.getRoyaltiesForBeneficiary.call(nftId, account);
            log("Royalties per transfer (primary/secondary):", +primaryMinimum / UNIT, +secondaryMinimum / UNIT, "CERE");
        }
        {
            let {primaryMinimum, secondaryMinimum} = await davinci.getRoyaltiesForBeneficiary.call(nftId, issuer);
            log("..............................for ’Issuer’:", +primaryMinimum / UNIT, +secondaryMinimum / UNIT, "CERE");
        }
        {
            let {primaryMinimum, secondaryMinimum} = await davinci.getRoyaltiesForBeneficiary.call(nftId, partner);
            log(".............................for ’Partner’:", +primaryMinimum / UNIT, +secondaryMinimum / UNIT, "CERE");
        }
        log();

        await davinci.safeTransferFrom(issuer, buyer, nftId, 3, "0x", {from: issuer});
        let primaryEarnings = 100 * 3 * UNIT;
        await davinci.safeTransferFrom(buyer, buyer2, nftId, 2, "0x", {from: buyer});
        let secondaryEarnings = 50 * 2 * UNIT;
        log("Primary transfer from ’Issuer’ to ’Buyer’:  ", 3, "NFTs");
        log("Secondary transfer from ’Buyer’ to ’Buyer2’:", 2, "NFTs");
        log();

        let issuerBalanceAfter = await davinci.balanceOf.call(issuer, CURRENCY);
        assert.equal(issuerBalanceAfter, issuerBalance - primaryEarnings);
        let buyerBalanceAfter = await davinci.balanceOf.call(buyer, CURRENCY);
        assert.equal(buyerBalanceAfter, buyerBalance - secondaryEarnings);
        log("’Issuer’ paid", primaryEarnings / UNIT, "in primary royalties.");
        log("’Buyer’ paid", secondaryEarnings / UNIT, "in secondary royalties.");
        log();

        let totalEarnings = primaryEarnings + secondaryEarnings;
        {
            let royaltyEarned = await davinci.balanceOf.call(account, CURRENCY);
            log("Royalties earned (3x primary, 1x secondary):", +royaltyEarned / UNIT, "CERE");
            assert.equal(royaltyEarned, totalEarnings);
        }
        {
            let royaltyEarned = await davinci.balanceOfJAOwner.call(account, issuer);
            log("...............................for ’Issuer’:", +royaltyEarned / UNIT, "CERE");
            assert.equal(royaltyEarned, totalEarnings * 9 / 10);
        }
        {
            let royaltyEarned = await davinci.balanceOfJAOwner.call(account, partner);
            log("..............................for ’Partner’:", +royaltyEarned / UNIT, "CERE");
            assert.equal(royaltyEarned, totalEarnings * 1 / 10);
        }
        log();

        await davinci.distributeJointAccount(account);
        log("Withdraw the funds from the Joint Account to ’Issuer’ and to ’Partner’");
        log();
    });


    it("executes sales with variable royalties", async () => {
        log();

        const davinci = await Davinci.new();
        const CURRENCY = await davinci.CURRENCY.call();
        const UNIT = 1e10;

        let pocketMoney = 1000 * UNIT;
        let encodedMoney = web3.eth.abi.encodeParameter('uint256', pocketMoney);
        await davinci.deposit(buyer, encodedMoney);
        await davinci.deposit(buyer2, encodedMoney);
        log("Deposit", pocketMoney / UNIT, "CERE from the bridge to account ’Buyer’");
        log();

        // Other actors have no currency.
        for (let actor of [issuer, partner, someone]) {
            let zeroBalance = await davinci.balanceOf.call(actor, CURRENCY);
            assert.equal(zeroBalance, 0);
        }

        let nftSupply = 1;
        let nftId = await davinci.issue.call(nftSupply, "0x", {from: issuer});
        await davinci.issue(nftSupply, "0x", {from: issuer});
        let nftBalance = await davinci.balanceOf.call(issuer, nftId);
        assert.equal(nftBalance, nftSupply, "NFTs should be minted to the issuer");
        log("’Issuer’ creates", nftSupply, "NFTs of type", nftId.toString(16));
        log();

        await davinci.configureRoyalties(
            nftId,
            partner,
            /* primaryCut 10% */ 10 * 100,
            /* primaryMinimum */ 2 * UNIT,
            someone,
            /* secondaryCut 5% */ 5 * 100,
            /* secondaryMinimum */ 2 * UNIT,
            {from: issuer});
        log("’Issuer’ configures royalties for this NFT type");


        // Primary sale.
        let price1 = 200 * UNIT;
        await davinci.makeOffer(nftId, price1, {from: issuer});

        // Cannot take an offer that does not exist (wrong price).
        await expectRevert.unspecified(
            davinci.takeOffer(issuer, nftId, price1 - 1, 1, {from: buyer}));

        await davinci.takeOffer(issuer, nftId, price1, 1, {from: buyer});

        // Cannot take the offer again.
        await expectRevert.unspecified(
            davinci.takeOffer(issuer, nftId, price1, 1, {from: buyer}));

        // Secondary sale.
        let price2 = 300 * UNIT;
        await davinci.makeOffer(nftId, price2, {from: buyer});
        await davinci.takeOffer(buyer, nftId, price2, 1, {from: buyer2});

        let partnerFee = price1 * 10 / 100; // Primary royalty on initial price.
        let someoneFee = price2 * 5 / 100; // Secondary royalty on a resale price.

        // Check everybody’s money after the deals.
        for (let account of [
            // Issuer got the initial price and paid a primary fee.
            [issuer, price1 - partnerFee],
            // Buyer bought at the initial price, resold at another price, and paid a secondary fee.
            [buyer, pocketMoney - price1 + price2 - someoneFee],
            // Buyer2 paid the price.
            [buyer2, pocketMoney - price2],
            // Partner got a primary fee.
            [partner, partnerFee],
            // Someone got a secondary fee.
            [someone, someoneFee],
        ]) {
            let balance = await davinci.balanceOf.call(account[0], CURRENCY);
            assert.equal(balance, account[1]);
        }
    });


    it("accepts meta-transactions from the forwarder contract", async () => {
        const davinci = await Davinci.deployed();
        const forwarder = await Forwarder.deployed();

        const META_TX_FORWARDER = await davinci.META_TX_FORWARDER.call();
        const isForwarder = await davinci.hasRole.call(META_TX_FORWARDER, forwarder.address);

        assert.equal(isForwarder, true);
    });


    it("lets a marketplace or meta-transaction service make transfers.", async () => {
        const davinci = await Davinci.deployed();

        // Issue an NFT.
        let nftId = await davinci.issue.call(1, "0x", {from: issuer});
        await davinci.issue(1, "0x", {from: issuer});

        // Give the role full operator to a partner account.
        // In reality "partner" should be a smart contract, for instance for a marketplace or a meta-transaction service.
        // This contract must verify consent from token owners.
        const TRANSFER_OPERATOR = await davinci.TRANSFER_OPERATOR.call();
        await davinci.grantRole(TRANSFER_OPERATOR, partner);

        // The full operator can transfer.
        await davinci.safeTransferFrom(issuer, someone, nftId, 1, "0x", {from: partner});

        let balance = await davinci.balanceOf.call(someone, nftId);
        assert.equal(balance, 1);
    });


    it("bypasses royalties on transfers from a bypass sender.", async () => {
        const davinci = await Davinci.deployed();

        // Issue an NFT with royalties.
        let nftId = await davinci.issue.call(1, "0x", {from: issuer});
        await davinci.issue(1, "0x", {from: issuer});
        await davinci.configureRoyalties(
            nftId, issuer, 1, 1, issuer, 1, 1, {from: issuer});

        // Seller has no currency, he cannot pay royalties.
        const CURRENCY = await davinci.CURRENCY.call();
        let balance = await davinci.balanceOf.call(issuer, CURRENCY);
        assert.equal(balance, 0);

        // Transfer fails because royalties are not paid.
        await expectRevert(
            davinci.safeTransferFrom(issuer, someone, nftId, 1, "0x", {from: issuer}),
            "ERC1155: insufficient balance for transfer");

        // Give the role to bypass royalties to the sender.
        const BYPASS_SENDER = await davinci.BYPASS_SENDER.call();
        await davinci.grantRole(BYPASS_SENDER, issuer);

        // Now the transfer will work because there are no royalties or currency needed.
        await davinci.safeTransferFrom(issuer, someone, nftId, 1, "0x", {from: issuer});

        balance = await davinci.balanceOf.call(someone, nftId);
        assert.equal(balance, 1);
    });
});
