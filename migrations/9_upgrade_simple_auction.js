const SimpleAuction = artifacts.require("SimpleAuction");
const Freeport = artifacts.require("Freeport");
const {upgradeProxy} = require('@openzeppelin/truffle-upgrades');
const ctx = require("./deployment_context.json");
const log = console.log;

module.exports = async function (deployer, network, accounts) {
    const auction = await SimpleAuction.deployed();
    log("Operating on SimpleAuction contract", auction.address);

    const freeport = await Freeport.at("0x702BA959B5542B2Bf88a1C5924F73Ed97482c64B");
    log("Operating SimpleAuction with Freeport contract", freeport.address);

    try {
        const auction2 = await upgradeProxy(auction.address, SimpleAuction, {deployer, kind: "uups",
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
