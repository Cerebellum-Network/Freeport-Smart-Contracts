const CollectionFactory = artifacts.require("CollectionFactory");
const Collection = artifacts.require("Collection");
const {getSigner} = require("../test/utils");
const log = console.log;

module.exports = async function (done) {

    const signer = await getSigner();
    let accounts = await web3.eth.getAccounts();
    log(`Prerequisites: \n  Some matic on ${accounts[0]}, ${accounts[2]}`);
    let admin = accounts[0];
    let collectionFactory = await CollectionFactory.deployed();
    log("Operating on CollectionFactory contract", collectionFactory.address);
    log("From admin account", admin);
    log("With Authorizer account", signer.address);

    log("Creating upgradeable user collection...");
    const collectionCreator = accounts[1]
    const collectionCreatorRole = await collectionFactory.COLLECTION_CREATOR_ROLE.call()
    await collectionFactory.grantRole(collectionCreatorRole, collectionCreator);
    log(`Role COLLECTION_CREATOR_ROLE is granted to ${collectionCreator} address`);

    const collectionManager = accounts[2]
    await collectionFactory.createCollection(collectionManager,
        "Freeport collection sample",
        "http://freeport.anton.s3-website.eu-central-1.amazonaws.com/{id}.json",
        "https://s3.eu-central-1.amazonaws.com/freeport.anton/metadata.json",
        {from: collectionCreator});
    const newCollectionAddr = await collectionFactory.getPastEvents('CollectionCreated').then(events => events.pop().returnValues.addr)
    log(`New collection has been created at ${newCollectionAddr} address with Collection Manager at ${collectionManager}`);

    const collection = await Collection.at(newCollectionAddr)
    log(`Minting NFT on ${collection.address} collection...`);
    const oneNftId = await collection.issueNft.call(3, "0x", {from: collectionManager})
    await collection.issueNft(3, "0x", {from: collectionManager})
    log(`Minted NFT with global nft id = ${web3.utils.toHex(oneNftId)}`);


    done();
};
