const FiatGateway = artifacts.require("FiatGatewayERC20");
const {upgradeProxy} = require('@openzeppelin/truffle-upgrades');
const log = console.log;

module.exports = async function (deployer, network, accounts) {
    const gateway = await FiatGateway.deployed();
    log("Operating on FiatGatewayERC20 contract", gateway.address);

    try {
        const gatewayProxy = await upgradeProxy(gateway.address, FiatGateway, {deployer, kind: "uups"});
        log("Upgraded", gatewayProxy.address);

        await gatewayProxy.initialize_v2_0_0();
        log("Done initialize_v2_0_0");
    } catch (e) {
        log("Error", e);
        throw e;
    }

    log();
};
