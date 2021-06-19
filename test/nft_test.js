const Davinci = artifacts.require("./Davinci.sol");
const log = console.log;

contract("Davinci", accounts => {
    const bridge = accounts[0];
    const issuer = accounts[1];
    const partner = accounts[2];
    const buyer = accounts[3];
    const buyer2 = accounts[4];

    it("issues an NFT.", async () => {
        const davinci = await Davinci.deployed();
        const CURRENCY = await davinci.CURRENCY.call();
        const UNIT = 1e10;

        let currencySupply = await davinci.balanceOf.call(bridge, CURRENCY);
        log("Currency", +CURRENCY, +currencySupply / UNIT);

        let nftId = await davinci.getNftId.call(issuer, 0, 10);
        log("NFT", nftId.toString(16));

        await davinci.issue(0, 10, "0x", {from: issuer});

        let nftSupply = await davinci.balanceOf.call(issuer, nftId);
        assert.equal(nftSupply, 10, "NFTs should be minted to the issuer");

        let owners = [issuer, partner];
        let shares = [9000, 1000];
        let account = await davinci.getAddressOfDistributionAccount.call(owners, shares);
        log("Distribution Account:", account);
        log();

        await davinci.createDistributionAccount(owners, shares);

        await davinci.setRoyalties(nftId, account, 100 * UNIT, account, 50 * UNIT, {from: issuer});

        {
            let {primaryFee, secondaryFee} = await davinci.hasRoyalties.call(nftId, account);
            log("Royalties per transfer (primary/secondary):", +primaryFee / UNIT, +secondaryFee / UNIT);
        }
        {
            let {primaryFee, secondaryFee} = await davinci.hasRoyalties.call(nftId, issuer);
            log("............................for the issuer:", +primaryFee / UNIT, +secondaryFee / UNIT);
        }
        {
            let {primaryFee, secondaryFee} = await davinci.hasRoyalties.call(nftId, partner);
            log("...........................for the partner:", +primaryFee / UNIT, +secondaryFee / UNIT);
        }
        log();

        await davinci.safeTransferFrom(bridge, issuer, CURRENCY, 1000 * UNIT, "0x", {from: bridge});
        await davinci.safeTransferFrom(bridge, buyer, CURRENCY, 1000 * UNIT, "0x", {from: bridge});

        // Primary transfer of 3 NFTs.
        await davinci.safeTransferFrom(issuer, buyer, nftId, 3, "0x", {from: issuer});

        // Secondary transfer of 1 NFT.
        await davinci.safeTransferFrom(buyer, buyer2, nftId, 1, "0x", {from: buyer});

        let expectedEarnings = (100 * 3 + 50) * UNIT;
        {
            let royaltyEarned = await davinci.balanceOf.call(account, CURRENCY);
            log("Royalties earned (3x primary, 1x secondary):", +royaltyEarned / UNIT);
            assert.equal(royaltyEarned, expectedEarnings);
        }
        {
            let royaltyEarned = await davinci.availableToOwnerOfDistributionAccount.call(account, issuer);
            log(".............................for the issuer:", +royaltyEarned / UNIT);
            assert.equal(royaltyEarned, expectedEarnings * 9 / 10);
        }
        {
            let royaltyEarned = await davinci.availableToOwnerOfDistributionAccount.call(account, partner);
            log("............................for the partner:", +royaltyEarned / UNIT);
            assert.equal(royaltyEarned, expectedEarnings * 1 / 10);
        }
        log();
    });
});
