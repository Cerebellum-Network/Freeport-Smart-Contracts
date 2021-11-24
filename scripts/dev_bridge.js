const Freeport = artifacts.require("Freeport");
const log = console.log;

// For TESTNET Mumbai
const childChainManagerProxy = "0xb5505a6d998549090530911180f38aC5130101c6";

module.exports = async function (done) {

    let accounts = await web3.eth.getAccounts();

    let freeport = await Freeport.deployed();
    log("Contract", freeport.address, "from account", accounts[0]);

    log("Set ChildChainManager", childChainManagerProxy);
    await freeport.updateChildChainManager(childChainManagerProxy);

    done();
};
