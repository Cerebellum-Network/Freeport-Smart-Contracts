const Auction = artifacts.require("Auction");
const Freeport = artifacts.require("Freeport");
const {upgradeProxy} = require('@openzeppelin/truffle-upgrades');
const ctx = require("./deployment_context.json");
const log = console.log;

module.exports = async function (deployer, network, accounts) {
    const auction = await Auction.deployed();
    log("Operating on Auction contract", auction.address);

    const freeport = await Freeport.deployed();
    log("Operating Auction with Freeport contract", freeport.address);

    try {
        const auction2 = await upgradeProxy(auction.address, Auction, {deployer, kind: "uups",
            call: {
                fn: 'initialize_update',
                args: [freeport.address]
            }});
        log("Upgraded", auction2.address);

        await auction2.initialize_v2_0_0();
        log("Done initialize_v2_0_0");
    } catch (e) {
        log("Error", e);
        throw e;
    }

    log();
};
