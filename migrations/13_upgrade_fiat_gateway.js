const FiatGateway = artifacts.require("FiatGateway");
const {upgradeProxy} = require('@openzeppelin/truffle-upgrades');
const ctx = require("./deployment_context.json");
const log = console.log;

module.exports = async function (deployer, network, accounts) {
    const gateway = await FiatGateway.at(ctx.dev.deploys.FiatGateway);
    log("Operating on FiatGateway contract", gateway.address);

    try {
        const gateway2 = await upgradeProxy(gateway.address, FiatGateway, {deployer, kind: "uups"});
        log("Upgraded", gateway2.address);

        await gateway2.initialize_v2_0_0();
        log("Done initialize_v2_0_0");
    } catch (e) {
        log("Error", e);
        throw e;
    }

    log();
};
