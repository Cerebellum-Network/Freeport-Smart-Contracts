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
        let TOTAL_SHARES = +await davinci.TOTAL_SHARES.call();

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
        await davinci.issue(0, 10, "0x", {from: issuer});
        let nftBalance = await davinci.balanceOf.call(issuer, nftId);
        assert.equal(nftBalance, nftSupply, "NFTs should be minted to the issuer");
        log("’Issuer’ creates", nftSupply, "NFTs of type", nftId.toString(16));
        log();

        let owners = [issuer, partner];
        let shares = [9000, 1000];
        let account = await davinci.getAddressOfDistributionAccount.call(owners, shares);
        await davinci.createDistributionAccount(owners, shares, {from: issuer});
        log("’Issuer’ creates a Distribution Account:", account);
        log("..........................’Issuer’ gets:", shares[0] * 100 / TOTAL_SHARES, "%");
        log(".........................’Partner’ gets:", shares[1] * 100 / TOTAL_SHARES, "%");
        log();

        let primaryFee = 100;
        let secondaryFee = 50;
        await davinci.setRoyalties(nftId, account, primaryFee * UNIT, account, secondaryFee * UNIT, {from: issuer});
        log("’Issuer’ configures royalties for this NFT type");
        {
            let {primaryFee, secondaryFee} = await davinci.hasRoyalties.call(nftId, account);
            log("Royalties per transfer (primary/secondary):", +primaryFee / UNIT, +secondaryFee / UNIT, "CERE");
        }
        {
            let {primaryFee, secondaryFee} = await davinci.hasRoyalties.call(nftId, issuer);
            log("..............................for ’Issuer’:", +primaryFee / UNIT, +secondaryFee / UNIT, "CERE");
        }
        {
            let {primaryFee, secondaryFee} = await davinci.hasRoyalties.call(nftId, partner);
            log(".............................for ’Partner’:", +primaryFee / UNIT, +secondaryFee / UNIT, "CERE");
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
            let royaltyEarned = await davinci.availableToOwnerOfDistributionAccount.call(account, issuer);
            log("...............................for ’Issuer’:", +royaltyEarned / UNIT, "CERE");
            assert.equal(royaltyEarned, expectedEarnings * 9 / 10);
        }
        {
            let royaltyEarned = await davinci.availableToOwnerOfDistributionAccount.call(account, partner);
            log("..............................for ’Partner’:", +royaltyEarned / UNIT, "CERE");
            assert.equal(royaltyEarned, expectedEarnings * 1 / 10);
        }
        log();

        await davinci.withdrawFromDistributionAccount(account, owners[0]);
        await davinci.withdrawFromDistributionAccount(account, owners[1]);
        log("Withdraw the funds from the Distribution Account to ’Issuer’ and to ’Partner’");
        log();
    });
});
