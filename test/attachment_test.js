const Freeport = artifacts.require("./Freeport.sol");
const NFTAttachment = artifacts.require("NFTAttachment");
const log = console.log;
const {expectEvent, expectRevert, constants, time} = require('@openzeppelin/test-helpers');
const BN = require('bn.js');

contract("NFTAttachment", accounts => {
    const [sender] = accounts;

    it("sells an NFT by auction", async () => {

        const freeport = await Freeport.deployed();
        const attachment = await NFTAttachment.deployed();

        let gotFreeport = await attachment.nftContract.call();
        assert.equal(freeport.address, gotFreeport);

        let nftSupply = 10;
        let nftId = await freeport.issue.call(nftSupply, "0x", {from: sender});

        let cid = "0x1122334455667788990011223344556677889900112233445566778899001122";
        let receipt = await attachment.attachToNFT(nftId, cid);

        expectEvent(receipt, 'AttachToNFT', {
            sender,
            nftId,
            cid,
        });
    });
});