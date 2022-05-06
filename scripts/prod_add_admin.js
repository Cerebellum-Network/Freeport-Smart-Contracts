const Freeport = artifacts.require("Freeport");
const FiatGateway = artifacts.require("FiatGateway");
const FiatGatewayERC20 = artifacts.require("FiatGatewayERC20");
const Auction = artifacts.require("Auction");
const AuctionERC20 = artifacts.require("AuctionERC20")
const NFTAttachment = artifacts.require("NFTAttachment");
const log = console.log;

module.exports = async function (done) {

    const gnosis = "0x87A0892F98914c567379475a806A1419143406F6";

    const accounts = await web3.eth.getAccounts();
    const admin = accounts[0];
    log("From admin account", admin);
    let freeport = await Freeport.deployed();
    let gateway = await FiatGateway.deployed();
    let gatewayERC20 = await FiatGatewayERC20.deployed();
    let auction = await Auction.deployed();
    let auctionERC20 = await AuctionERC20.deployed();
    let attachment = await NFTAttachment.deployed();
    const DEFAULT_ADMIN_ROLE = await freeport.DEFAULT_ADMIN_ROLE.call();

    const contracts = [
        ["Freeport", freeport],
        ["FiatGateway", gateway],
        ["FiatGatewayERC20", gatewayERC20]
        ["Auction", auction],
        ["AuctionERC20", auctionERC20]
        ["NFTAttachment", attachment],
    ];

    for (let [contractName, contract] of contracts) {
        log();
        log("Operating on", contractName, contract.address);

        log("Make Gnosis admin", gnosis);
        await contract.grantRole(DEFAULT_ADMIN_ROLE, gnosis);
    }

    done();
};
