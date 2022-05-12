const CollectionFoundation = artifacts.require("CollectionFoundation");
const {deployProxy} = require('@openzeppelin/truffle-upgrades');
const log = console.log;

module.exports = async function (deployer, network, accounts) {
    const cf = await deployProxy(CollectionFoundation, [], {deployer, kind: "uups"});
    log("Deployed CollectionFoundation proxy", cf.address);
};
