const Davinci = artifacts.require("Davinci");
const SimpleAuction = artifacts.require("SimpleAuction");
const log = console.log;

module.exports = async function (done) {

    let accounts = await web3.eth.getAccounts();
    let admin = accounts[0];
    let seller = admin;
    let buyer = accounts[1];
    let davinci = await Davinci.deployed();
    let auction = await SimpleAuction.deployed();
    const CURRENCY = 0;
    const UNIT = 1e10;
    log("Operating on Davinci contract", davinci.address);
    log("Operating on SimpleAuction contract", auction.address);
    log("With Seller account", seller);
    log("With Buyer account", buyer);

    let amount = 1000;
    log("Sending", amount, "CERE to", buyer);
    let encodedAmount = web3.eth.abi.encodeParameter('uint256', amount * UNIT);
    await davinci.deposit(buyer, encodedAmount, {from: admin});

    let nftId = await davinci.issue.call(10, "0x", {from: seller});
    log("Seller mints an NFT", nftId.toString());
    await davinci.issue(10, "0x", {from: seller});

    let priceCere = 10;
    let closeTime = parseInt((+new Date()) / 1000) + 60;

    log("Issuer auction one NFT with a minimum price", priceCere, "CERE, close time in 1 minute (", closeTime, "UNIX seconds).");
    await auction.startAuction(nftId, priceCere * UNIT, closeTime, {from: seller});

    log("Buyer bids", 20, "CERE on the NFT.");
    await auction.bidOnAuction(seller, nftId, 20 * UNIT, {from: buyer});

    log("Waiting 2 minutes for the auction to close. /!\\ Unreliable, a manual retry might be necessary.");
    setTimeout(async () => {
        log("Seller settles the auction.");
        await auction.settleAuction(seller, nftId, {from: seller});

        done();
    }, 120e3);
};
