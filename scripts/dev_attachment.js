const Freeport = artifacts.require("Freeport");
const NFTAttachment = artifacts.require("NFTAttachment");
const log = console.log;

module.exports = async function (done) {

    let accounts = await web3.eth.getAccounts();
    let sender = accounts[0];
    let freeport = await Freeport.deployed();
    let attachment = await NFTAttachment.deployed();

    log("Operating on Freeport contract", freeport.address);
    log("Operating on NFTAttachment contract", attachment.address);
    log("With Sender account", sender);

    let nftId = await freeport.issue.call(10, "0x", {from: sender});
    log("Sender mints an NFT", nftId.toString());
    await freeport.issue(10, "0x", {from: sender});

    let cid = "0x1122334455667788990011223344556677889900112233445566778899001122";
    log("Sender attaches the CID", cid);
    await attachment.attachToNFT(nftId, cid);

    done();
};
