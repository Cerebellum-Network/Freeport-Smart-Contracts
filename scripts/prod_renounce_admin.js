const Freeport = artifacts.require("Freeport");
const FiatGateway = artifacts.require("FiatGateway");
const SimpleAuction = artifacts.require("SimpleAuction");
const log = console.log;
const assert = require('assert').strict;

module.exports = async function (done) {

    const gnosisStaysAdmin = "0x87A0892F98914c567379475a806A1419143406F6";

    const accounts = await web3.eth.getAccounts();
    const adminToRevoke = accounts[0];
    log("From admin account", adminToRevoke);
    let freeport = await Freeport.deployed();
    let gateway = await FiatGateway.deployed();
    let auction = await SimpleAuction.deployed();
    log("Operating on Freeport contract", freeport.address);
    log("Operating on TestERC20 contract", erc20.address);
    log("Operating on FiatGateway contract", gateway.address);
    log("Operating on SimpleAuction contract", auction.address);
    const DEFAULT_ADMIN_ROLE = await freeport.DEFAULT_ADMIN_ROLE.call();

    let gnosisHasRole = await freeport.hasRole.call(DEFAULT_ADMIN_ROLE, gnosisStaysAdmin);
    assert(gnosisHasRole, "gnosis must be admin");
    log("gnosis stays admin", gnosisStaysAdmin);

    log("Renounce previous admin", adminToRevoke);
    await freeport.renounceRole(DEFAULT_ADMIN_ROLE, adminToRevoke);

    done();
};
