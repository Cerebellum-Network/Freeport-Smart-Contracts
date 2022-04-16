const FiatGateway = artifacts.require("FiatGateway");
const {AdminClient} = require('defender-admin-client');
const API_KEY = process.env.DEFENDER_API_KEY;
const API_SECRET = process.env.DEFENDER_SECRET_KEY;
const PROXY_ADDRESS = process.env.FIAT_GATEWAY_PROXY_ADDRESS;
const client = new AdminClient({apiKey: API_KEY, apiSecret: API_SECRET});
const log = console.log;

module.exports = async function (deployer, network, accounts) {
    const gateway = await FiatGateway.deployed();
    log("Operating on FiatGateway contract", gateway.address);

    try {
        const newImplementation = gateway.address;
        const contract = { network, address: PROXY_ADDRESS }
        await client.proposeUpgrade({ newImplementation }, contract);
    } catch (e) {
        log("Error", e);
        throw e;
    }
    log();
};
