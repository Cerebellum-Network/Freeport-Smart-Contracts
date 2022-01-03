const Freeport = artifacts.require("Freeport");
const log = console.log;

module.exports = async function (done) {

    let accounts = await web3.eth.getAccounts();
    let issuer = accounts[1];
    let freeport = await Freeport.deployed();
    log("Operating on Freeport contract", freeport.address);
    log("From Issuer (account 1)", issuer);

    let nftId = await freeport.issue.call(1, "0x", {from: issuer});
    log("Issuing NFT", nftId.toString(16));
    let tx = await freeport.issue(1, "0x", {from: issuer});
    log(tx);

    done();
};
