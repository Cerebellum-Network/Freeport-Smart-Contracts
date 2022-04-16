const SimpleAuction = artifacts.require("SimpleAuction");
const {prepareUpgrade} = require("@openzeppelin/truffle-upgrades");
const {AdminClient} = require('defender-admin-client');
const API_KEY = process.env.DEFENDER_API_KEY;
const API_SECRET = process.env.DEFENDER_SECRET_KEY;
const PROXY_ADDRESS = process.env.AUCTION_PROXY_ADDRESS;
const client = new AdminClient({apiKey: API_KEY, apiSecret: API_SECRET});
const log = console.log;

module.exports = async function (deployer, network, accounts) {
    const auction = await SimpleAuction.deployed();
    log("Operating on SimpleAuction contract", auction.address);

    try {
        const newImplementation = auction.address;
        const contract = { network, address: PROXY_ADDRESS };
        await prepareUpgrade(PROXY_ADDRESS, SimpleAuction);
        await client.proposeUpgrade({ newImplementation }, contract)
        log("Done initialize_v2_0_0");
    } catch (e) {
        log("Error\n", e);
        throw e;
    }
    log();
};
