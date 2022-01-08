/* ==== Results

Small payload size 60
Big   payload size 120

v0 - 2 words
Event data size 0 words. GAS 24669

v1 - 2 words
Event data size 4 words. GAS 27134

v2 - 2 words
Event data size 2 words. GAS 26328

v3 - 2 words + 2 zero words
Event data size 4 words. GAS 27223

v4 - 2 words + 1 zero word + length
Event data size 4 words. GAS 27185
----

v0 - 4 words
Event data size 0 GAS 25645

v1 - 4 words
Event data size 6 words. GAS 28634

v2 - 2 transactions of 2 words
Event data size 2 words. GAS 26328
Event data size 2 words. GAS 26328

v3 - 4 words
Event data size 4 words. GAS 27943

v4 - 3 words + length
Event data size 4 words. GAS 27569

 */


const Freeport = artifacts.require("Freeport");
const NFTAttachment = artifacts.require("NFTAttachment");
const log = console.log;

module.exports = async function (done) {
    try {
        let accounts = await web3.eth.getAccounts();
        let sender = accounts[0];
        let freeport = await Freeport.deployed();
        let attachment = await NFTAttachment.deployed();

        let nftId = "110247974162388513553861966617357322860562107490862675012951696337230318534666";
        let small = "ddc://1234567890/1234567890/1234567890/1234567890/1234567890";
        let smallHex = web3.utils.asciiToHex(small);
        let big = small + small;
        let bigHex = web3.utils.asciiToHex(big);
        let payloadA = "ddc://1234567890/1234567890/1234";
        let payloadB = "567890/1234567890/1234567890";
        let len = small.length;
        let a = web3.utils.asciiToHex(payloadA);
        let b = web3.utils.asciiToHex(payloadB);
        let z = "0x";
        //log("Attaching text", url.length, "bytes:", url);
        //log("Attaching encoded", data);
        log("Small payload size", small.length);
        log("Big   payload size", big.length);

        let print = (tx) => {
            let hexLen = tx.receipt.rawLogs[0].data.length;
            let dataLen = (hexLen - 2) / 2 / 32;
            log("Event data size", dataLen, "words. GAS", tx.receipt.gasUsed);
        };
        let tx;

        log("\nv0 - 2 words");
        tx = await attachment.minterAttachToNFT0(nftId, smallHex);
        log("Event data size", 0, "words. GAS", tx.receipt.gasUsed);

        log("\nv1 - 2 words");
        tx = await attachment.minterAttachToNFT1(nftId, smallHex);
        print(tx);

        log("\nv2 - 2 words");
        tx = await attachment.minterAttachToNFT2(nftId, a, b);
        print(tx);

        log("\nv3 - 2 words + 2 zero words");
        tx = await attachment.minterAttachToNFT3(nftId, a, b, z, z);
        print(tx);

        log("\nv4 - 2 words + 1 zero word + length");
        tx = await attachment.minterAttachToNFT4(nftId, len, a, b, z);
        print(tx);

        log("----");

        log("\nv0 - 4 words");
        tx = await attachment.minterAttachToNFT0(nftId, bigHex);
        log("Event data size", 0, "GAS", tx.receipt.gasUsed);

        log("\nv1 - 4 words");
        tx = await attachment.minterAttachToNFT1(nftId, bigHex);
        print(tx);

        log("\nv2 - 2 transactions of 2 words");
        tx = await attachment.minterAttachToNFT2(nftId, a, b);
        print(tx);
        tx = await attachment.minterAttachToNFT2(nftId, a, b);
        print(tx);

        log("\nv3 - 4 words");
        tx = await attachment.minterAttachToNFT3(nftId, a, b, a, b);
        print(tx);

        log("\nv4 - 3 words + length");
        tx = await attachment.minterAttachToNFT4(nftId, len, a, b, a);
        print(tx);

        done();
    } catch (e) {
        done(e);
    }
};
