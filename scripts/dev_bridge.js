const Davinci = artifacts.require("Davinci");
const log = console.log;

// For TESTNET Mumbai
const childChainManagerProxy = "0xb5505a6d998549090530911180f38aC5130101c6";

module.exports = async function (done) {

    let accounts = await web3.eth.getAccounts();

    let davinci = await Davinci.deployed();
    log("Contract", davinci.address, "from account", accounts[0]);

    log("Set ChildChainManager", childChainManagerProxy);
    await davinci.updateChildChainManager(childChainManagerProxy);

    done();
};
