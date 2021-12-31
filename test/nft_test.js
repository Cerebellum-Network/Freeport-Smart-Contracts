const Freeport = artifacts.require("Freeport");
const Forwarder = artifacts.require("MinimalForwarder");
const FiatGateway = artifacts.require("FiatGateway");
const ERC20Adapter = artifacts.require("ERC20Adapter");
const Tether = artifacts.require("Tether");
const log = console.log;
const { expectEvent, expectRevert, constants } = require('@openzeppelin/test-helpers');
const { web3 } = require('@openzeppelin/test-helpers/src/setup');
const BN = require('bn.js');


contract("Freeport", accounts => {
    const deployer = accounts[0];
    const issuer = accounts[1];
    const partner = accounts[2];
    const buyer = accounts[3];
    const buyer2 = accounts[4];
    const relayer = accounts[5];
    const someone = accounts[6];
    const buyer3 = accounts[7];

    it("issues unique NFT IDs.", async () => {
        const freeport = await Freeport.deployed();

        let issuerLow = issuer.toLowerCase();
        const expectedIds = [
            [5, issuerLow + "000000000000000000000005"],
            [5, issuerLow + "000000010000000000000005"],
            [9, issuerLow + "000000020000000000000009"],
        ];

        for (let i of expectedIds.keys()) {
            let [supply, expectedId] = expectedIds[i];

            // Predict NFT ID using the getter, or simulating the issuance.
            let nftId = await freeport.getNftId.call(issuer, i, supply);
            let nftId2 = await freeport.issue.call(supply, "0x", { from: issuer });
            assert.equal("0x" + nftId.toString(16), expectedId);
            assert.equal("0x" + nftId2.toString(16), expectedId);

            // Balance should be 0.
            let balance = await freeport.balanceOf(issuer, expectedId);
            assert.equal(balance, 0);

            // Issue.
            await freeport.issue(supply, "0x", { from: issuer });

            // Balance should be supply
            balance = await freeport.balanceOf(issuer, expectedId);
            assert.equal(balance, supply);
        }
    });


    it("deposits and withdraws from the bridge", async () => {
        const freeport = await Freeport.new();
        const CURRENCY = await freeport.CURRENCY.call();
        const UNIT = 1e10;
        let amount = 1000 * UNIT;
        let encodedAmount = web3.eth.abi.encodeParameter('uint256', amount);

        // Check initial supply in the bridge.
        let currencySupply = await freeport.currencyInBridge.call();
        assert.equal(currencySupply, 10e9 * UNIT); // 10 billions with 10 decimals.

        // Everybody has 0 tokens.
        for (let account of accounts) {
            let balance = await freeport.balanceOf.call(account, CURRENCY);
            assert.equal(balance, 0);
        }

        // Some account cannot deposit.
        await expectRevert(
            freeport.deposit(someone, encodedAmount, { from: relayer }),
            "Only the ChainManager is allowed to deposit");

        // Some account cannot set the relayer.
        await expectRevert(
            freeport.updateChildChainManager(relayer, { from: relayer }),
            "Only the current ChainManager is allowed to change the ChainManager.");

        // The initial childChainManagerProxy is the deployer.
        let childChainManagerProxy = await freeport.childChainManagerProxy.call();
        assert.equal(childChainManagerProxy, deployer);

        // The deployer sets the relayer.
        await freeport.updateChildChainManager(relayer, { from: deployer });

        // The new childChainManagerProxy is the relayer.
        childChainManagerProxy = await freeport.childChainManagerProxy.call();
        assert.equal(childChainManagerProxy, relayer);

        // The deployer cannot deposit anymore.
        await expectRevert(
            freeport.deposit(someone, encodedAmount, { from: deployer }),
            "Only the ChainManager is allowed to deposit");

        // The deployer cannot set the relayer anymore.
        await expectRevert(
            freeport.updateChildChainManager(deployer, { from: deployer }),
            "Only the current ChainManager is allowed to change the ChainManager.");

        // The relayer deposits to someone’s account from the bridge.
        await freeport.deposit(someone, encodedAmount, { from: relayer });

        // Someone got the deposit, taken from the bridge supply.
        let someoneBalance = await freeport.balanceOf.call(someone, CURRENCY);
        assert.equal(someoneBalance, amount);
        let currencySupplyAfter = await freeport.currencyInBridge.call();
        assert.equal(currencySupplyAfter, currencySupply - amount);

        // Someone cannot withdraw more than what they have.
        await expectRevert(
            freeport.withdraw(amount + 1, { from: someone }),
            "ERC1155: insufficient balance for transfer");

        // Someone withdraws back into the bridge.
        let receipt = await freeport.withdraw(amount, { from: someone });

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
        someoneBalance = await freeport.balanceOf.call(someone, CURRENCY);
        assert.equal(someoneBalance, 0);
        currencySupplyAfter = await freeport.currencyInBridge.call();
        assert.equal(+currencySupplyAfter, +currencySupply);
    });


    it("issues an NFT, create a Joint Account, collect royalties, distribute to JA.", async () => {
        log();
        const freeport = await Freeport.new();
        const CURRENCY = await freeport.CURRENCY.call();
        const UNIT = 1e10;
        let BASIS_POINTS = +await freeport.BASIS_POINTS.call();
        assert.equal(BASIS_POINTS, 100 * 100);

        let currencySupply = await freeport.currencyInBridge.call();
        log("Supply of currencies in the bridge:", +currencySupply / UNIT, "CERE");

        let pocketMoney = 1000 * UNIT;
        let encodedMoney = web3.eth.abi.encodeParameter('uint256', pocketMoney);
        await freeport.deposit(issuer, encodedMoney);
        await freeport.deposit(buyer, encodedMoney);
        let issuerBalance = await freeport.balanceOf.call(issuer, CURRENCY);
        assert.equal(issuerBalance, pocketMoney);
        let buyerBalance = await freeport.balanceOf.call(buyer, CURRENCY);
        assert.equal(buyerBalance, pocketMoney);
        log("Deposit", pocketMoney / UNIT, "CERE from the bridge to account ’Issuer’");
        log("Deposit", pocketMoney / UNIT, "CERE from the bridge to account ’Buyer’");
        log();

        let nftSupply = 10;
        let nftId = await freeport.issue.call(nftSupply, "0x", { from: issuer });
        await freeport.issue(nftSupply, "0x", { from: issuer });
        let nftBalance = await freeport.balanceOf.call(issuer, nftId);
        assert.equal(nftBalance, nftSupply, "NFTs should be minted to the issuer");
        log("’Issuer’ creates", nftSupply, "NFTs of type", nftId.toString(16));
        log();

        let owners = [issuer, partner];
        let fractions = [9000, 1000];
        let account = await freeport.makeAddressOfJointAccount.call(owners, fractions);
        await freeport.createJointAccount(owners, fractions, { from: issuer });
        log("’Issuer’ creates a Joint Account:", account);
        log("..........................’Issuer’ gets:", fractions[0] * 100 / BASIS_POINTS, "%");
        log(".........................’Partner’ gets:", fractions[1] * 100 / BASIS_POINTS, "%");
        log();

        await freeport.configureRoyalties(
            nftId,
            account,
            /* primaryCut */ 0,
            /* primaryMinimum */ 100 * UNIT,
            account,
            /* secondaryCut */ 0,
            /* secondaryMinimum */ 50 * UNIT,
            { from: issuer });
        log("’Issuer’ configures royalties for this NFT type");
        {
            let { primaryMinimum, secondaryMinimum } = await freeport.getRoyaltiesForBeneficiary.call(nftId, account);
            log("Royalties per transfer (primary/secondary):", +primaryMinimum / UNIT, +secondaryMinimum / UNIT, "CERE");
        }
        {
            let { primaryMinimum, secondaryMinimum } = await freeport.getRoyaltiesForBeneficiary.call(nftId, issuer);
            log("..............................for ’Issuer’:", +primaryMinimum / UNIT, +secondaryMinimum / UNIT, "CERE");
        }
        {
            let { primaryMinimum, secondaryMinimum } = await freeport.getRoyaltiesForBeneficiary.call(nftId, partner);
            log(".............................for ’Partner’:", +primaryMinimum / UNIT, +secondaryMinimum / UNIT, "CERE");
        }
        log();

        await freeport.safeTransferFrom(issuer, buyer, nftId, 3, "0x", { from: issuer });
        let primaryEarnings = 100 * 3 * UNIT;
        await freeport.safeTransferFrom(buyer, buyer2, nftId, 2, "0x", { from: buyer });
        let secondaryEarnings = 50 * 2 * UNIT;
        log("Primary transfer from ’Issuer’ to ’Buyer’:  ", 3, "NFTs");
        log("Secondary transfer from ’Buyer’ to ’Buyer2’:", 2, "NFTs");
        log();

        let issuerBalanceAfter = await freeport.balanceOf.call(issuer, CURRENCY);
        assert.equal(issuerBalanceAfter, issuerBalance - primaryEarnings);
        let buyerBalanceAfter = await freeport.balanceOf.call(buyer, CURRENCY);
        assert.equal(buyerBalanceAfter, buyerBalance - secondaryEarnings);
        log("’Issuer’ paid", primaryEarnings / UNIT, "in primary royalties.");
        log("’Buyer’ paid", secondaryEarnings / UNIT, "in secondary royalties.");
        log();

        let totalEarnings = primaryEarnings + secondaryEarnings;
        {
            let royaltyEarned = await freeport.balanceOf.call(account, CURRENCY);
            log("Royalties earned (3x primary, 1x secondary):", +royaltyEarned / UNIT, "CERE");
            assert.equal(royaltyEarned, totalEarnings);
        }
        {
            let royaltyEarned = await freeport.balanceOfJAOwner.call(account, issuer);
            log("...............................for ’Issuer’:", +royaltyEarned / UNIT, "CERE");
            assert.equal(royaltyEarned, totalEarnings * 9 / 10);
        }
        {
            let royaltyEarned = await freeport.balanceOfJAOwner.call(account, partner);
            log("..............................for ’Partner’:", +royaltyEarned / UNIT, "CERE");
            assert.equal(royaltyEarned, totalEarnings * 1 / 10);
        }
        log();

        await freeport.distributeJointAccount(account);
        log("Withdraw the funds from the Joint Account to ’Issuer’ and to ’Partner’");
        log();
    });


    it("executes sales with variable royalties", async () => {
        log();

        const freeport = await Freeport.new();
        const CURRENCY = await freeport.CURRENCY.call();
        const UNIT = 1e10;

        let pocketMoney = 1000 * UNIT;
        let encodedMoney = web3.eth.abi.encodeParameter('uint256', pocketMoney);
        await freeport.deposit(buyer, encodedMoney);
        await freeport.deposit(buyer2, encodedMoney);
        log("Deposit", pocketMoney / UNIT, "CERE from the bridge to account ’Buyer’");
        log();

        // Other actors have no currency.
        for (let actor of [issuer, partner, someone]) {
            let zeroBalance = await freeport.balanceOf.call(actor, CURRENCY);
            assert.equal(zeroBalance, 0);
        }

        let nftSupply = 1;
        let nftId = await freeport.issue.call(nftSupply, "0x", { from: issuer });
        await freeport.issue(nftSupply, "0x", { from: issuer });
        let nftBalance = await freeport.balanceOf.call(issuer, nftId);
        assert.equal(nftBalance, nftSupply, "NFTs should be minted to the issuer");
        log("’Issuer’ creates", nftSupply, "NFTs of type", nftId.toString(16));
        log();

        await freeport.configureRoyalties(
            nftId,
            partner,
            /* primaryCut 10% */ 10 * 100,
            /* primaryMinimum */ 2 * UNIT,
            someone,
            /* secondaryCut 5% */ 5 * 100,
            /* secondaryMinimum */ 2 * UNIT,
            { from: issuer });
        log("’Issuer’ configures royalties for this NFT type");


        // Primary sale.
        let price1 = 200 * UNIT;
        await freeport.makeOffer(nftId, price1, { from: issuer });

        // Check offer.
        let offer1 = await freeport.getOffer(issuer, nftId);
        assert.equal(offer1, price1);

        // Cannot take an offer that does not exist (wrong price).
        await expectRevert.unspecified(
            freeport.takeOffer(buyer, issuer, nftId, price1 - 1, 1, { from: buyer }));

        await freeport.takeOffer(buyer, issuer, nftId, price1, 1, { from: buyer });

        // Cannot take the offer again.
        await expectRevert.unspecified(
            freeport.takeOffer(buyer, issuer, nftId, price1, 1, { from: buyer }));

        // Secondary sale.
        let price2 = 300 * UNIT;
        await freeport.makeOffer(nftId, price2, { from: buyer });
        await freeport.takeOffer(buyer2, buyer, nftId, price2, 1, { from: buyer2 });

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
            let balance = await freeport.balanceOf.call(account[0], CURRENCY);
            assert.equal(balance, account[1]);
        }
    });


    it("accepts meta-transactions from the forwarder contract", async () => {
        const freeport = await Freeport.deployed();
        const forwarder = await Forwarder.deployed();

        const META_TX_FORWARDER = await freeport.META_TX_FORWARDER.call();
        const isForwarder = await freeport.hasRole.call(META_TX_FORWARDER, forwarder.address);

        assert.equal(isForwarder, true);
    });


    it("lets a marketplace or meta-transaction service make transfers.", async () => {
        const freeport = await Freeport.deployed();

        // Issue an NFT.
        let nftId = await freeport.issue.call(1, "0x", { from: issuer });
        await freeport.issue(1, "0x", { from: issuer });

        // Give the role full operator to a partner account.
        // In reality "partner" should be a smart contract, for instance for a marketplace or a meta-transaction service.
        // This contract must verify consent from token owners.
        const TRANSFER_OPERATOR = await freeport.TRANSFER_OPERATOR.call();
        await freeport.grantRole(TRANSFER_OPERATOR, partner);

        // The full operator can transfer.
        await freeport.safeTransferFrom(issuer, someone, nftId, 1, "0x", { from: partner });

        let balance = await freeport.balanceOf.call(someone, nftId);
        assert.equal(balance, 1);
    });


    it("bypasses royalties on transfers from a bypass sender.", async () => {
        const freeport = await Freeport.deployed();

        // Issue an NFT with royalties.
        let nftId = await freeport.issue.call(1, "0x", { from: issuer });
        await freeport.issue(1, "0x", { from: issuer });
        await freeport.configureRoyalties(
            nftId, issuer, 1, 1, issuer, 1, 1, { from: issuer });

        // Seller has no currency, he cannot pay royalties.
        const CURRENCY = await freeport.CURRENCY.call();
        let balance = await freeport.balanceOf.call(issuer, CURRENCY);
        assert.equal(balance, 0);

        // Transfer fails because royalties are not paid.
        await expectRevert(
            freeport.safeTransferFrom(issuer, someone, nftId, 1, "0x", { from: issuer }),
            "ERC1155: insufficient balance for transfer");

        // Give the role to bypass royalties to the sender.
        const BYPASS_SENDER = await freeport.BYPASS_SENDER.call();
        await freeport.grantRole(BYPASS_SENDER, issuer);

        // Now the transfer will work because there are no royalties or currency needed.
        await freeport.safeTransferFrom(issuer, someone, nftId, 1, "0x", { from: issuer });

        balance = await freeport.balanceOf.call(someone, nftId);
        assert.equal(balance, 1);
    });

    it("buys CERE from USD", async () => {
        const freeport = await Freeport.deployed();
        const gateway = await FiatGateway.deployed();
        const CURRENCY = await freeport.CURRENCY.call();
        const UNIT = 1e10;

        let addressConfigured = await gateway.freeport.call();
        assert.equal(addressConfigured, freeport.address);

        // Top up FiatGateway with CERE.
        let liquidities = 1000 * UNIT;
        let encodedLiquidities = web3.eth.abi.encodeParameter('uint256', liquidities);
        await freeport.deposit(gateway.address, encodedLiquidities);

        // Set exchange rate.
        let cerePerPenny = 0.1 * UNIT;
        let receipt = await gateway.setExchangeRate(cerePerPenny);

        // Verify.
        expectEvent(receipt, 'SetExchangeRate', {
            cereUnitsPerPenny: new BN(cerePerPenny),
        });

        let currentCerePerPenny = await gateway.getExchangeRate();
        assert.equal(currentCerePerPenny, cerePerPenny);

        // Buy some CERE after a fiat payment.
        let priceCere = 200 * UNIT;
        let pricePennies = priceCere / cerePerPenny;
        await gateway.buyCereFromUsd(
            pricePennies,
            buyer,
            0);

        // Check all balances.
        let balance = await freeport.balanceOf(gateway.address, CURRENCY);
        assert.equal(balance, liquidities - priceCere);

        balance = await freeport.balanceOf(buyer, CURRENCY);
        assert.equal(balance, priceCere);

        balance = await gateway.totalCereUnitsSent();
        assert.equal(balance, priceCere);

        balance = await gateway.totalPenniesReceived();
        assert.equal(balance, pricePennies);

        // Withdraw liquidities to the admin.
        await gateway.withdraw();

        balance = await freeport.balanceOf(deployer, CURRENCY);
        assert.equal(balance, liquidities - priceCere);

        // Send back the tokens to clean up.
        await freeport.safeTransferFrom(buyer, deployer, CURRENCY, priceCere, "0x", { from: buyer });
    });

    it("buys an NFT from USD", async () => {
        const freeport = await Freeport.deployed();
        const gateway = await FiatGateway.deployed();
        const CURRENCY = await freeport.CURRENCY.call();
        const UNIT = 1e10;

        // Issue an NFT.
        let nftId = await freeport.issue.call(10, "0x", { from: issuer });
        await freeport.issue(10, "0x", { from: issuer });

        // Offer to sell.
        let priceCere = 200 * UNIT;
        await freeport.makeOffer(nftId, priceCere, { from: issuer });

        // Top up FiatGateway with CERE.
        let liquidities = 1000 * UNIT;
        let encodedLiquidities = web3.eth.abi.encodeParameter('uint256', liquidities);
        await freeport.deposit(gateway.address, encodedLiquidities);

        // Set exchange rate.
        let cerePerPenny = 0.1 * UNIT;
        await gateway.setExchangeRate(cerePerPenny);

        // Buy the NFT after a fiat payment.
        let pricePennies = priceCere / cerePerPenny;
        await gateway.buyNftFromUsd(
            pricePennies,
            buyer,
            issuer,
            nftId,
            priceCere,
            0);

        // Check all balances.
        let balance = await freeport.balanceOf(gateway.address, CURRENCY);
        assert.equal(balance, liquidities - priceCere);

        balance = await freeport.balanceOf(issuer, CURRENCY);
        assert.equal(balance, priceCere);

        balance = await freeport.balanceOf(buyer, CURRENCY);
        assert.equal(balance, 0);

        balance = await freeport.balanceOf(issuer, nftId);
        assert.equal(balance, 10 - 1);

        balance = await freeport.balanceOf(buyer, nftId);
        assert.equal(balance, 1);

        // Send back the tokens to clean up.
        await gateway.withdraw();
        await freeport.safeTransferFrom(issuer, deployer, CURRENCY, priceCere, "0x", { from: issuer });
    });

    it("exchange usdc into internal currency", async () => {
        const tetherInstance = await Tether.new(1000);
        const ercAdapter = await ERC20Adapter.new(tetherInstance.address);
        await tetherInstance.buy(buyer3, { from: deployer, value: 50000000 });
        log("BUYER TETHER BALANCE >>>> ", await tetherInstance.balanceOf(buyer3));
        await tetherInstance.approve(buyer3, 40000000, { from: buyer3 });
        log("ALLOWANCE >>>> ",    await tetherInstance.allowance(buyer3, buyer3));
        log("TOTAL SUPPLY >>>> ", await tetherInstance.totalSupply());
        
        await ercAdapter.depositERC20(10000, { from: buyer3 });
        await ercAdapter.withdrawERC20(500, { from: buyer3 });
        log("FINAL >>>> ", await web3.eth.getBalance(buyer3));
    });
});
