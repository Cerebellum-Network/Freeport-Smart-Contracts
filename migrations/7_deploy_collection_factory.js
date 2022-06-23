const Freeport = artifacts.require("Freeport");
const NFTAttachment = artifacts.require("NFTAttachment");
const CollectionFactory = artifacts.require("CollectionFactory");
const {deployProxy} = require('@openzeppelin/truffle-upgrades');
const log = console.log;

module.exports = async function (deployer, network, accounts) {
    const freeport = await Freeport.deployed();
    const nftAttachment = await NFTAttachment.deployed();
    log("Operating CollectionFactory with Freeport contract", freeport.address);
    log("Operating CollectionFactory with NFTAttachment contract", nftAttachment.address);

    const cf = await deployProxy(CollectionFactory, [freeport.address, nftAttachment.address], {deployer, kind: "uups"});
    log("Deployed CollectionFactory proxy", cf.address);
};
