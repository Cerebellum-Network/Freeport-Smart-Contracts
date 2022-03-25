const Freeport = artifacts.require("Freeport");
const log = console.log;

module.exports = async function (done) {
    try {

        const newURI = "https://api.freeport.dev.cere.network/nft/{id}/metadata";

        let accounts = await web3.eth.getAccounts();
        let admin = accounts[0];
        let freeport = await Freeport.at("0x702BA959B5542B2Bf88a1C5924F73Ed97482c64B");
        log("Operating on Freeport contract", freeport.address);
        log("From admin account", admin);

        let currentURI = await freeport.uri(0);
        log("Current URI", currentURI);

        await freeport.setURI(newURI);

        currentURI = await freeport.uri(0);
        log("New URI", currentURI);

        done();
    } catch (err) {
        done(err);
    }
};
