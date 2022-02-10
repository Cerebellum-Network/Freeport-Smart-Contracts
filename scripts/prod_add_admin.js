const Freeport = artifacts.require("Freeport");
const FiatGateway = artifacts.require("FiatGateway");
const log = console.log;

module.exports = async function (done) {

    const gnosis = "0x87A0892F98914c567379475a806A1419143406F6";

    const accounts = await web3.eth.getAccounts();
    const admin = accounts[0];
    const freeport = await Freeport.deployed();
    const DEFAULT_ADMIN_ROLE = await freeport.DEFAULT_ADMIN_ROLE.call();
    log("Operating on Freeport contract", freeport.address);
    log("From admin account", admin);

    log("Make Gnosis admin", gnosis);
    await freeport.grantRole(DEFAULT_ADMIN_ROLE, gnosis);

    done();
};
