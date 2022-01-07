const Freeport = artifacts.require("./Freeport.sol");
const NFTAttachment = artifacts.require("NFTAttachment");
const log = console.log;
const {expectEvent, expectRevert, constants, time} = require('@openzeppelin/test-helpers');
const BN = require('bn.js');

contract("NFTAttachment", accounts => {
    const [minter, owner, anonym] = accounts;

    let freeport, nftAttachment, nftId;
    let nftSupply = 10;
    let attachment = "0x11223344556677889900112233445566778899001122334455667788990011223344556677889900";

    before(async () => {
        freeport = await Freeport.deployed();
        nftAttachment = await NFTAttachment.deployed();
        nftId = await freeport.issue.call(nftSupply, "0x", {from: minter});
        await freeport.issue(nftSupply, "0x", {from: minter});
    });

    it("NFTAttachment is configured", async () => {
        let gotFreeport = await nftAttachment.freeport.call();
        assert.equal(freeport.address, gotFreeport);
    });

    it("minter attaches data to an NFT", async () => {
        await expectRevert(
            nftAttachment.minterAttachToNFT(nftId, attachment, {from: anonym}),
            "Only minter");

        let receipt = await nftAttachment.minterAttachToNFT(nftId, attachment, {from: minter});
        expectEvent(receipt, 'MinterAttachToNFT', {
            minter,
            nftId,
            attachment,
        });
    });

    it("current owner attaches data to an NFT", async () => {
        // owner does not have an NFT yet.
        await expectRevert(
            nftAttachment.ownerAttachToNFT(nftId, attachment, {from: owner}),
            "Only current owner");

        // Give 1 NFT to an owner.
        await freeport.safeTransferFrom(minter, owner, nftId, 1, "0x");

        let receipt = await nftAttachment.ownerAttachToNFT(nftId, attachment, {from: owner});
        expectEvent(receipt, 'OwnerAttachToNFT', {
            owner,
            nftId,
            attachment,
        });
    });

    it("anonym attaches data to an NFT", async () => {
        let receipt = await nftAttachment.anonymAttachToNFT(nftId, attachment, {from: anonym});
        expectEvent(receipt, 'AnonymAttachToNFT', {
            anonym,
            nftId,
            attachment,
        });
    });

    it("cannot attach to the currency", async () => {
        let invalidId = 0;
        await expectRevert(
            nftAttachment.minterAttachToNFT(invalidId, attachment, {from: minter}),
            "0 is not a valid NFT ID");
        await expectRevert(
            nftAttachment.ownerAttachToNFT(invalidId, attachment, {from: owner}),
            "0 is not a valid NFT ID");
        await expectRevert(
            nftAttachment.anonymAttachToNFT(invalidId, attachment, {from: anonym}),
            "0 is not a valid NFT ID");
    });
});