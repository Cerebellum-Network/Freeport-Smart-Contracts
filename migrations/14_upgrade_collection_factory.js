const CollectionFactory = artifacts.require("CollectionFactory");
const Freeport = artifacts.require("Freeport");
const NFTAttachment = artifacts.require("NFTAttachment");
const Marketplace = artifacts.require("Marketplace");
const Auction = artifacts.require("Auction");
const {upgradeProxy} = require('@openzeppelin/truffle-upgrades');
const ctx = require("./deployment_context.json");
const log = console.log;

module.exports = async function (deployer, network, accounts) {
    const collectionFactory = await CollectionFactory.deployed();
    log("Operating on CollectionFactory contract", collectionFactory.address);

    const freeport = await Freeport.at(ctx.dev.deploys.Freeport);
    const nftAttachment = await NFTAttachment.at(ctx.dev.deploys.NFTAttachment);
    const marketplace = await Marketplace.at(ctx.dev.deploys.Marketplace);
    const auction = await Auction.at(ctx.dev.deploys.Auction);
    log("Operating CollectionFactory with Freeport contract", freeport.address);
    log("Operating CollectionFactory with NFTAttachment contract", nftAttachment.address);
    log("Operating CollectionFactory with Marketplace contract", marketplace.address);
    log("Operating CollectionFactory with Auction contract", auction.address);

    try {
        const collectionFactory2 = await upgradeProxy(collectionFactory.address, CollectionFactory, {deployer, kind: "uups",
            call: {
                fn: 'initialize_update',
                args: [freeport.address, nftAttachment.address, marketplace.address, auction.address]
            }
        });
        log("Upgraded", collectionFactory2.address);
    } catch (e) {
        log("Error", e);
        throw e;
    }

    log();
};
