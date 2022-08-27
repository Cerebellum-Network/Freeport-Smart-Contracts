const Freeport = artifacts.require("Freeport");
const NFTAttachment = artifacts.require("NFTAttachment");
const CollectionFactory = artifacts.require("CollectionFactory");
const {deployProxy} = require('@openzeppelin/truffle-upgrades');
const ctx = require("./deployment_context.json")
const log = console.log;

module.exports = async function (deployer, network, accounts) {
    const freeport = await Freeport.deployed();
    const nftAttachment = await NFTAttachment.deployed();
    const marketplace = await NFTAttachment.deployed();
    const auction = await NFTAttachment.deployed();
    log("Operating CollectionFactory with Freeport contract", freeport.address);
    log("Operating CollectionFactory with NFTAttachment contract", nftAttachment.address);
    log("Operating CollectionFactory with Marketplace contract", marketplace.address);
    log("Operating CollectionFactory with Auction contract", auction.address);

    const cf = await deployProxy(CollectionFactory, [freeport.address, nftAttachment.address, marketplace.address, auction.address], {deployer, kind: "uups"});
    log("Deployed CollectionFactory proxy", cf.address);
};
