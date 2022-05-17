const Freeport = artifacts.require("Freeport");
const ERC20 = artifacts.require("TestERC20");
const Auction = artifacts.require("Auction");
const log = console.log;

module.exports = async function (done) {

    let accounts = await web3.eth.getAccounts();
    let admin = accounts[0];
    let seller = admin;
    let buyer = accounts[1];
    const freeport = await Freeport.deployed();
    const auction = await Auction.deployed();
    const erc20 = await ERC20.deployed();
    const UNIT = 1e10;
    log("Operating on Freeport contract", freeport.address);
    log("Operating on Auction contract", auction.address);
    log("Operating on ERC20 contract", erc20.address);
    log("With Seller account", seller);
    log("With Buyer account", buyer);
    
    let amount = 1000;
    log("Sending", amount, "ERC20 to", buyer);
    let encodedAmount = web3.eth.abi.encodeParameter('uint256', amount * UNIT);
    await erc20.mint(buyer, encodedAmount, {from: admin});

    let nftId = await freeport.issue.call(10, "0x", {from: seller});
    log("Seller mints an NFT", nftId.toString());
    await freeport.issue(10, "0x", {from: seller});

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
