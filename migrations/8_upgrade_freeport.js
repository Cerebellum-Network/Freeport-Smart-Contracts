const Freeport = artifacts.require("Freeport");
const {AdminClient} = require('defender-admin-client');
const API_KEY = process.env.DEFENDER_API_KEY;
const API_SECRET = process.env.DEFENDER_SECRET_KEY;
const PROXY_ADDRESS = process.env.FREEPORT_PROXY_ADDRESS;
const client = new AdminClient({apiKey: API_KEY, apiSecret: API_SECRET});
const log = console.log;

module.exports = async function (deployer, network, accounts) {
    const freeport = await Freeport.deployed();
    log("Operating on Freeport contract", freeport.address);

    try {
        const newImplementation = freeport.address;
        const contract = { network, address: PROXY_ADDRESS }
        await client.proposeUpgrade({ newImplementation }, contract);
    } catch(e) {
        log("Error", e);
        throw e;
    }
    log();
};
