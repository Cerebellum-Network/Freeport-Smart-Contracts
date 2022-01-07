const Freeport = artifacts.require("Freeport");
const NFTAttachment = artifacts.require("NFTAttachment");
const log = console.log;

module.exports = async function (done) {
    try {
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

        let url = "ddc://1234567890/1234567890/1234567890/1234567890/1234567890";
        let data = web3.utils.asciiToHex(url);
        log("Attaching text", url.length, "bytes:", url);
        log("Attaching encoded", data);

        log("Minter attaches data");
        await attachment.minterAttachToNFT(nftId, data);

        log("Owner attaches data");
        await attachment.ownerAttachToNFT(nftId, data);

        log("Anonym attaches data");
        await attachment.anonymAttachToNFT(nftId, data);

        done();
    } catch (e) {
        done(e);
    }
};
