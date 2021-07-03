const Davinci = artifacts.require("./Davinci.sol");
const log = console.log;

contract("Davinci", accounts => {
    const bridge = accounts[0];
    const issuer = accounts[1];
    const partner = accounts[2];
    const buyer = accounts[3];
    const buyer2 = accounts[4];

    it("issues an NFT.", async () => {
        log();
        const davinci = await Davinci.deployed();
        const CURRENCY = await davinci.CURRENCY.call();
        const UNIT = 1e10;
        let BASIS_POINTS = +await davinci.BASIS_POINTS.call();
        assert.equal(BASIS_POINTS, 100 * 100);

        let currencySupply = await davinci.balanceOf.call(bridge, CURRENCY);
        let pocketMoney = 1000;
        await davinci.safeTransferFrom(bridge, issuer, CURRENCY, pocketMoney * UNIT, "0x", {from: bridge});
        await davinci.safeTransferFrom(bridge, buyer, CURRENCY, pocketMoney * UNIT, "0x", {from: bridge});
        log("Supply of currencies in the bridge:", +currencySupply / UNIT, "CERE");
        log("Transfer", pocketMoney, "CERE to account ’Issuer’");
        log("Transfer", pocketMoney, "CERE to account ’Buyer’");
        log();

        let nftSupply = 10;
        let nftId = await davinci.getNftId.call(issuer, 0, nftSupply);
        await davinci.issue(10, "0x", {from: issuer});
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
            0, // Do not lock.
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
        await davinci.safeTransferFrom(buyer, buyer2, nftId, 1, "0x", {from: buyer});
        log("Primary transfer from ’Issuer’ to ’Buyer’:  ", 3, "NFTs");
        log("Secondary transfer from ’Buyer’ to ’Buyer2’:", 1, "NFTs");
        log();

        let expectedEarnings = (100 * 3 + 50) * UNIT;
        {
            let royaltyEarned = await davinci.balanceOf.call(account, CURRENCY);
            log("Royalties earned (3x primary, 1x secondary):", +royaltyEarned / UNIT, "CERE");
            assert.equal(royaltyEarned, expectedEarnings);
        }
        {
            let royaltyEarned = await davinci.balanceOfJAOwner.call(account, issuer);
            log("...............................for ’Issuer’:", +royaltyEarned / UNIT, "CERE");
            assert.equal(royaltyEarned, expectedEarnings * 9 / 10);
        }
        {
            let royaltyEarned = await davinci.balanceOfJAOwner.call(account, partner);
            log("..............................for ’Partner’:", +royaltyEarned / UNIT, "CERE");
            assert.equal(royaltyEarned, expectedEarnings * 1 / 10);
        }
        log();

        await davinci.distributeJointAccount(account);
        log("Withdraw the funds from the Joint Account to ’Issuer’ and to ’Partner’");
        log();
    });
});
