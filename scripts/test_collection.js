const CollectionFactory = artifacts.require("CollectionFactory");
const Collection = artifacts.require("Collection");
const {getSigner} = require("../test/utils");
const log = console.log;

module.exports = async function (done) {

    // A fixed account for tests.
    let serviceAccount = "0xc0DAe4aE8d21250a830B2A79314c9D43cAeab145";

    const signer = await getSigner();
    let accounts = await web3.eth.getAccounts();
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
    await collectionFactory.createCollection(collectionManager, "test collection5", {from: collectionCreator});
    const newCollectionAddr = await collectionFactory.getPastEvents('CollectionCreated').then(events => events.pop().returnValues.addr)
    log(`New collection has been created at ${newCollectionAddr} address`);

    const collection = await Collection.attach(newCollectionAddr)
    log(`Minting NFT on ${collection} collection...`);
    const oneNftId = await collection.issueNft.call(3, "", {from: collectionManager})
    await collection.issueNft(3, "", {from: collectionManager})
    log(`Minted NFT with global nft id = ${oneNftId}`);

    done();
};
