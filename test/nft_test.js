const Freeport = artifacts.require("Freeport");
const Sale = artifacts.require("Sale");
const Forwarder = artifacts.require("MinimalForwarder");
const FiatGateway = artifacts.require("FiatGateway");
const TestERC20 = artifacts.require("TestERC20");
const log = console.log;
const {deployProxy} = require('@openzeppelin/truffle-upgrades');
const {expectEvent, expectRevert} = require('@openzeppelin/test-helpers');
const BN = require('bn.js');

contract("Freeport", accounts => {
    const deployer = accounts[0];
    const issuer = accounts[1];
    const partner = accounts[2];
    const buyer = accounts[3];
    const buyer2 = accounts[4];
    const fiatService = accounts[5];
    const someone = accounts[6];

    const CURRENCY = 0;
    const UNIT = 1e6;
    const aLot = 100e3 * UNIT;
    const freeportUSDCAmount = 10e3 * UNIT;

    let deploy = async (freeport) => {
        let erc20;
        if (freeport) {
            let erc20address = await freeport.currencyContract.call();
            erc20 = await TestERC20.at(erc20address);
        } else {
            freeport = await deployProxy(Freeport, [], {kind: "uups"});
            erc20 = await TestERC20.new();
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


    it("can change metadata URI", async () => {
        let currentURI = await freeport.uri(0);
        assert(currentURI.includes("{id}"), "there must be a default URI");

        const newURI = "https://some.site/{id}/metadata";
        await freeport.setURI(newURI);

        currentURI = await freeport.uri(0);
        assert.equal(currentURI, newURI, "the URI must be changed");

        await expectRevert(
            freeport.setURI(newURI, {from: accounts[1]}),
            "only admin");

        let ERC1155Metadata_URI = "0x0e89341c";
        let supportsURI = await freeport.supportsInterface(ERC1155Metadata_URI);
        assert(supportsURI, "must support ERC1155Metadata_URI interface");
    });


    it("issues unique NFT IDs.", async () => {
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
            let nftId2 = await freeport.issue.call(supply, "0x", {from: issuer});
            assert.equal("0x" + nftId.toString(16), expectedId);
            assert.equal("0x" + nftId2.toString(16), expectedId);

            // Balance should be 0.
            let balance = await freeport.balanceOf(issuer, expectedId);
            assert.equal(balance, 0);

            // Issue.
            await freeport.issue(supply, "0x", {from: issuer});

            // Balance should be supply
            balance = await freeport.balanceOf(issuer, expectedId);
            assert.equal(balance, supply);
        }
    });


    it.skip("issues an NFT, create a Joint Account, collect royalties, distribute to JA.", async () => {
        log();
        const {freeport, deposit, erc20} = await deploy();
        let BASIS_POINTS = +await freeport.BASIS_POINTS.call();
        assert.equal(BASIS_POINTS, 100 * 100);

        let pocketMoney = 1000 * UNIT;
        await erc20.mint(issuer, pocketMoney);
        await erc20.mint(buyer, pocketMoney);
        let issuerBalance = await erc20.balanceOf.call(issuer);
        assert.equal(issuerBalance, pocketMoney);
        let buyerBalance = await erc20.balanceOf.call(buyer);
        assert.equal(buyerBalance, pocketMoney);
        log("Deposit", pocketMoney / UNIT, "ERC20 from the bridge to account ’Issuer’");
        log("Deposit", pocketMoney / UNIT, "ERC20 from the bridge to account ’Buyer’");
        log();

        let nftSupply = 10;
        let nftId = await freeport.issue.call(nftSupply, "0x", {from: issuer});
        await freeport.issue(nftSupply, "0x", {from: issuer});
        let nftBalance = await freeport.balanceOf.call(issuer, nftId);
        assert.equal(nftBalance, nftSupply, "NFTs should be minted to the issuer");
        log("’Issuer’ creates", nftSupply, "NFTs of type", nftId.toString(16));
        log();

        let owners = [issuer, partner];
        let fractions = [9000, 1000];
        let account = await freeport.makeAddressOfJointAccount.call(owners, fractions);
        await freeport.createJointAccount(owners, fractions, {from: issuer});
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
            {from: issuer});
        log("’Issuer’ configures royalties for this NFT type");
        {
            let {primaryMinimum, secondaryMinimum} = await freeport.getRoyaltiesForBeneficiary.call(nftId, account);
            log("Royalties per transfer (primary/secondary):", +primaryMinimum / UNIT, +secondaryMinimum / UNIT, "ERC20");
        }
        {
            let {primaryMinimum, secondaryMinimum} = await freeport.getRoyaltiesForBeneficiary.call(nftId, issuer);
            log("..............................for ’Issuer’:", +primaryMinimum / UNIT, +secondaryMinimum / UNIT, "ERC20");
        }
        {
            let {primaryMinimum, secondaryMinimum} = await freeport.getRoyaltiesForBeneficiary.call(nftId, partner);
            log(".............................for ’Partner’:", +primaryMinimum / UNIT, +secondaryMinimum / UNIT, "ERC20");
        }
        log();

        await freeport.safeTransferFrom(issuer, buyer, nftId, 3, "0x", {from: issuer});
        let primaryEarnings = 100 * 3 * UNIT;
        await freeport.safeTransferFrom(buyer, buyer2, nftId, 2, "0x", {from: buyer});
        let secondaryEarnings = 50 * 2 * UNIT;
        log("Primary transfer from ’Issuer’ to ’Buyer’:  ", 3, "NFTs");
        log("Secondary transfer from ’Buyer’ to ’Buyer2’:", 2, "NFTs");
        log();

        let issuerBalanceAfter = await erc20.call(issuer);
        assert.equal(issuerBalanceAfter, issuerBalance - primaryEarnings);
        let buyerBalanceAfter = await erc20.call(buyer);
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

        const {freeport, erc20, deposit, withdraw} = await deploy();
        const sale = await Sale.deployed();

        let pocketMoney = 1000 * UNIT;
        await erc20.mint(buyer, pocketMoney);
        await erc20.mint(buyer2, pocketMoney);
        log("Deposit", pocketMoney / UNIT, "ERC20 to account ’Buyer’");
        log();

        let nftSupply = 1;
        let nftId = await freeport.issue.call(nftSupply, "0x", {from: issuer});
        await freeport.issue(nftSupply, "0x", {from: issuer});
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
            {from: issuer});
        log("’Issuer’ configures royalties for this NFT type");


        // Primary sale.
        let salePrice = 200 * UNIT;
        await sale.makeOffer(nftId, salePrice, nftSupply, {from: issuer});

        // Check offer.
        let {price, quantity} = await sale.getOffer(issuer, nftId);
        assert.equal(price * quantity, salePrice);

        // Cannot take an offer that does not exist (wrong price).
        await expectRevert.unspecified(
            sale.takeOffer(buyer, issuer, nftId, salePrice - 1, nftSupply, {from: buyer}));

        // Buy.
        await erc20.approve(freeport.address, 1e9 * UNIT, {from: buyer});
        await sale.takeOffer(buyer, issuer, nftId, price1, nftSupply, {from: buyer});

        // Cannot take the offer again.
        await expectRevert.unspecified(
            sale.takeOffer(buyer, issuer, nftId, price1, nftSupply, {from: buyer}));

        // Secondary sale.
        let price2 = 300 * UNIT;
        await sale.makeOffer(nftId, price2, nftSupply, {from: buyer});
        // Buy.
        await erc20.approve(sale.address, 1e9 * UNIT, {from: buyer2});
        await sale.takeOffer(buyer2, buyer, nftId, price2, nftSupply, {from: buyer2});

        let partnerFee = price1 * 10 / 100; // Primary royalty on initial price.
        let someoneFee = price2 * 5 / 100; // Secondary royalty on a resale price.
        
        // Check everybody’s money after the deals.
        for (let [account, expectedERC20] of [
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
            let ercBalance = await erc20.balanceOf(account);
            assert.equal(ercBalance, expectedERC20);
        }
    });


    it("accepts meta-transactions from the forwarder contract", async () => {
        const forwarder = await Forwarder.deployed();

        const META_TX_FORWARDER = await freeport.META_TX_FORWARDER.call();
        const isForwarder = await freeport.hasRole.call(META_TX_FORWARDER, forwarder.address);

        assert.equal(isForwarder, true);
    });


    it("lets a marketplace or meta-transaction service make transfers.", async () => {
        // Issue an NFT.
        let nftId = await freeport.issue.call(1, "0x", {from: issuer});
        await freeport.issue(1, "0x", {from: issuer});

        // Give the role full operator to a partner account.
        // In reality "partner" should be a smart contract, for instance for a marketplace or a meta-transaction service.
        // This contract must verify consent from token owners.
        const TRANSFER_OPERATOR = await freeport.TRANSFER_OPERATOR.call();
        await freeport.grantRole(TRANSFER_OPERATOR, partner);

        // The full operator can transfer.
        await freeport.safeTransferFrom(issuer, someone, nftId, 1, "0x", {from: partner});

        let balance = await freeport.balanceOf.call(someone, nftId);
        assert.equal(balance, 1);
    });


    it("bypasses royalties on transfers from a bypass sender.", async () => {
        // Issue an NFT with royalties.
        let nftId = await freeport.issue.call(1, "0x", {from: issuer});
        await freeport.issue(1, "0x", {from: issuer});
        await freeport.configureRoyalties(
            nftId, issuer, 1, 1, issuer, 1, 1, {from: issuer});

        // Seller has no currency, he cannot pay royalties.
        let balance = await freeport.balanceOf.call(issuer, CURRENCY);
        assert.equal(balance, 0);

        // Transfer fails because royalties are not paid.
        await expectRevert(
            freeport.safeTransferFrom(issuer, someone, nftId, 1, "0x", {from: issuer}),
            "ERC1155: insufficient balance for transfer");

        // Give the role to bypass royalties to the sender.
        const BYPASS_SENDER = await freeport.BYPASS_SENDER.call();
        await freeport.grantRole(BYPASS_SENDER, issuer);

        // Now the transfer will work because there are no royalties or currency needed.
        await freeport.safeTransferFrom(issuer, someone, nftId, 1, "0x", {from: issuer});

        balance = await freeport.balanceOf.call(someone, nftId);
        assert.equal(balance, 1);
    });

    let setupFiatService = async (gateway) => {
        const PAYMENT_SERVICE = await gateway.PAYMENT_SERVICE.call();
        await gateway.grantRole(PAYMENT_SERVICE, fiatService);
    };

    it("cannot buy CERE from USD", async () => {
        const gateway = await FiatGateway.deployed();
        await setupFiatService(gateway);

        let addressConfigured = await gateway.freeport.call();
        assert.equal(addressConfigured, freeport.address);

        // Top up FiatGateway with CERE.
        let liquidities = 1000 * UNIT;
        await deposit(gateway.address, liquidities);

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
        await expectRevert(
            gateway.buyCereFromUsd(
                pricePennies,
                buyer,
                0,
                {from: fiatService}),
            "Discontinued");
    });

    it("buys an NFT from USD", async () => {
        const gateway = await FiatGateway.deployed();
        await setupFiatService(gateway);

        // Issue an NFT.
        let nftId = await freeport.issue.call(10, "0x", {from: issuer});
        await freeport.issue(10, "0x", {from: issuer});

        // Offer to sell.
        let priceCere = 200 * UNIT;
        await freeport.makeOffer(nftId, priceCere, {from: issuer});

        // Top up FiatGateway with CERE.
        let liquidities = 1000 * UNIT;
        await erc20.mint(gateway.address, liquidities);

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
            0,
            {from: fiatService});

        // Only the service account can do that.
        await expectRevert.unspecified(gateway.buyNftFromUsd(
            pricePennies,
            buyer,
            issuer,
            nftId,
            priceCere,
            0,
            {from: deployer}));

        // Check all balances.
        let balance = await erc20.balanceOf(gateway.address);
        assert.equal(balance, liquidities - priceCere);

        balance = await freeport.balanceOf(issuer, CURRENCY);
        assert.equal(balance, priceCere);

        balance = await freeport.balanceOf(buyer, CURRENCY);
        assert.equal(balance, 0);

        balance = await freeport.balanceOf(issuer, nftId);
        assert.equal(balance, 10 - 1);

        balance = await freeport.balanceOf(buyer, nftId);
        assert.equal(balance, 1);

        // Issuer withdraws to ERC20.
        await withdraw(issuer);

        balance = await freeport.balanceOf(issuer, CURRENCY);
        assert.equal(balance, 0);

        balance = await erc20.balanceOf(issuer);
        assert.equal(balance, priceCere);

        // Admin withdraws what remains in the gateway.
        balance = await gateway.withdrawERC20.call();
        assert.equal(balance, liquidities - priceCere);
        await gateway.withdrawERC20();
        balance = await erc20.balanceOf(accounts[0]);
        assert.equal(balance, liquidities - priceCere);
    });

    it("exchange ERC20 into internal currency", async () => {
        let {freeport, erc20, deposit} = await deploy();

        let balanceERC = await erc20.balanceOf(deployer);
        let balanceFP = await freeport.balanceOf(deployer, CURRENCY);
        assert.equal(balanceERC, 0);
        assert.equal(balanceFP, aLot);

        await deposit(buyer, 100);

        balanceERC = await erc20.balanceOf(buyer);
        balanceFP = await freeport.balanceOf(buyer, CURRENCY);
        assert.equal(balanceERC, 0);
        assert.equal(balanceFP, 100);

        await freeport.withdraw(60, {from: buyer});

        balanceERC = await erc20.balanceOf(buyer);
        balanceFP = await freeport.balanceOf(buyer, CURRENCY);
        assert.equal(balanceERC, 60);
        assert.equal(balanceFP, 40);

        // Cannot withdraw more than the balance.
        await expectRevert(
            freeport.withdraw(60, {from: buyer}),
            "ERC1155: burn amount exceeds balance");
    });

    it("rejects deposits when ERC20 adapter is not configured", async () => {
        let freeport = await deployProxy(Freeport, [], {kind: "uups"});

        await expectRevert(
            freeport.deposit(100),
            "revert"); // Call to 0 address.

        await expectRevert(
            freeport.withdraw(100),
            "revert"); // Call to 0 address.

        let balance = await freeport.balanceOf(deployer, CURRENCY);
        assert.equal(balance, 0);
    });
});
