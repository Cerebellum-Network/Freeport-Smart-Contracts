const Freeport = artifacts.require("Freeport");
const FiatGateway = artifacts.require("FiatGateway");
const SimpleAuction = artifacts.require("SimpleAuction");
const NFTAttachment = artifacts.require("NFTAttachment");
const log = console.log;

module.exports = async function (done) {
    try {
        let deployers = await web3.eth.getAccounts();
        let freeport = await Freeport.deployed();
        let gateway = await FiatGateway.deployed();
        let auction = await SimpleAuction.deployed();
        let attachment = await NFTAttachment.deployed();
        const DEFAULT_ADMIN_ROLE = await freeport.DEFAULT_ADMIN_ROLE();

        const contracts = [
            ["Freeport", freeport],
            ["FiatGateway", gateway],
            ["SimpleAuction", auction],
            ["NFTAttachment", attachment],
        ];

        const accounts = [
            ["Deployer", deployers[0]],
            ["Gnosis", "0x87A0892F98914c567379475a806A1419143406F6"],
        ];

        for (let [contractName, contract] of contracts) {
            log();
            log("Operating on", contractName, contract.address);

            for (let [accountName, account] of accounts) {
                let hasRole = await contract.hasRole(DEFAULT_ADMIN_ROLE, account);
                log(accountName, account, hasRole ? "HAS" : "DOES NOT HAVE", "role ADMIN");
            }
        }

        done();
    } catch (e) {
        done(e);
    }
};
