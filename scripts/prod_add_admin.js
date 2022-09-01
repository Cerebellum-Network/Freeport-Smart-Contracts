const Freeport = artifacts.require("Freeport");
const FiatGateway = artifacts.require("FiatGateway");
const SimpleAuction = artifacts.require("SimpleAuction");
const NFTAttachment = artifacts.require("NFTAttachment");
const CollectionFactory = artifacts.require("CollectionFactory");
const Marketplace = artifacts.require("Marketplace");
const log = console.log;

module.exports = async function (done) {

    const gnosis = "0x87A0892F98914c567379475a806A1419143406F6";

    const accounts = await web3.eth.getAccounts();
    const admin = accounts[0];
    log("From admin account", admin);
    let freeport = await Freeport.deployed();
    let gateway = await FiatGateway.deployed();
    let auction = await SimpleAuction.deployed();
    let attachment = await NFTAttachment.deployed();
    let collectionFactory = await CollectionFactory.deployed();
    let marketplace = await Marketplace.deployed();
    const DEFAULT_ADMIN_ROLE = await freeport.DEFAULT_ADMIN_ROLE.call();

    const contracts = [
        ["Freeport", freeport],
        ["FiatGateway", gateway],
        ["SimpleAuction", auction],
        ["NFTAttachment", attachment],
        ["CollectionFactory", collectionFactory],
        ["Marketplace", marketplace],
    ];

    for (let [contractName, contract] of contracts) {
        log();
        log("Operating on", contractName, contract.address);

        log("Make Gnosis admin", gnosis);
        await contract.grantRole(DEFAULT_ADMIN_ROLE, gnosis);
    }

    done();
};
