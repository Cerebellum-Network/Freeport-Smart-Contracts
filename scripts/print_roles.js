const Freeport = artifacts.require("Freeport");
const FiatGateway = artifacts.require("FiatGateway");
const log = console.log;

module.exports = async function (done) {

    let accounts = await web3.eth.getAccounts();
    let freeport = await Freeport.deployed();
    log("Operating on Freeport contract", freeport.address);
    const DEFAULT_ADMIN_ROLE = await freeport.DEFAULT_ADMIN_ROLE.call();
    log();

    for(let [name, account] of [
        ["deployer", accounts[0]],
        ["gnosis", "0x87A0892F98914c567379475a806A1419143406F6"],
    ]) {
        let hasRole = await freeport.hasRole.call(DEFAULT_ADMIN_ROLE, account);
        log(name, account, hasRole ? "HAS" : "DOES NOT HAVE", "role ADMIN");
    }

    done();
};
