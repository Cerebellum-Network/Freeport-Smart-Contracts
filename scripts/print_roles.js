const Freeport = artifacts.require("Freeport");
const FiatGateway = artifacts.require("FiatGateway");
const SimpleAuction = artifacts.require("SimpleAuction");
const NFTAttachment = artifacts.require("NFTAttachment");
const CollectionFactory = artifacts.require("CollectionFactory");
const Marketplace = artifacts.require("Marketplace");
const Auction = artifacts.require("Auction");
const log = console.log;

module.exports = async function (done) {
    try {
        let deployers = await web3.eth.getAccounts();
        let freeport = await Freeport.deployed();
        let gateway = await FiatGateway.deployed();
        let simpleAuction = await SimpleAuction.deployed();
        let attachment = await NFTAttachment.deployed();
        let factory = await CollectionFactory.deployed();
        let marketplace = await Marketplace.deployed();
        let auction = await Auction.deployed();
        const DEFAULT_ADMIN_ROLE = await freeport.DEFAULT_ADMIN_ROLE();

        const contracts = [
            ["Freeport", freeport],
            ["FiatGateway", gateway],
            ["SimpleAuction", simpleAuction],
            ["NFTAttachment", attachment],
            ["CollectionFactory", factory],
            ["Marketplace", marketplace],
            ["Auction", auction],
        ];

        const accounts = [
            //["Deployer", deployers[0]],
            ["Aurel", "0x63846e2D234e4F854F43423014430b4e131f697b"],
            ["Anton", "0x8C71475ebF0C3Dde04c97892F6B6CEAb6cCC9d2E"],
            ["Gnosis Prod", "0x87A0892F98914c567379475a806A1419143406F6"],
        ];

        for (let [contractName, contract] of contracts) {
            log();
            log("Operating on", contractName, contract.address);

            for (let [accountName, account] of accounts) {
                let hasRole = await contract.hasRole(DEFAULT_ADMIN_ROLE, account);
                log(accountName, account, hasRole ? "HAS" : "DOES NOT HAVE", "role ADMIN");
            }
        }

        done();
    } catch (e) {
        done(e);
    }
};
