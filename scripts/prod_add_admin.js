const Freeport = artifacts.require("Freeport");
const FiatGateway = artifacts.require("FiatGateway");
const SimpleAuction = artifacts.require("SimpleAuction");
const NFTAttachment = artifacts.require("NFTAttachment");
const CollectionFactory = artifacts.require("CollectionFactory");
const Marketplace = artifacts.require("Marketplace");
const log = console.log;

module.exports = async function (done) {

    const gnosis = "0xB537f7D82b1c3625b29Da794017937F5D0A9b3c6";

    const accounts = await web3.eth.getAccounts();
    const admin = accounts[0];
    log("From admin account", admin);
    let freeport = await Freeport.at("0x702BA959B5542B2Bf88a1C5924F73Ed97482c64B");
    let gateway = await FiatGateway.at("0x106Bf3D61952faE9279B08bdcB2e548316E0C1Ae");
    let auction = await SimpleAuction.at("0xCEAc6c102bEcE4ed2E5ede9df096F7175BB8CbaD");
    let attachment = await NFTAttachment.at("0x39B27a0bc81C1366E2b05E02642Ef343a4f9223a");
    let collectionFactory = await CollectionFactory.at("0xc4018973d7ae51b4669dDe7948904d034A79Bb86");
    let marketplace = await CollectionFactory.at("0xB0D3aF64CD682aF52d5Dd77D2402EE253be38107");
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
