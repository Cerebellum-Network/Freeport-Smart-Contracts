const Freeport = artifacts.require("Freeport");
const TestERC20 = artifacts.require("TestERC20");
const Sale = artifacts.require("Sale");
const {deployProxy} = require('@openzeppelin/truffle-upgrades');
const log = console.log;

module.exports = async function (deployer, network, accounts) {
    const freeport = await Freeport.deployed();
    let isDev = (network === "development") || network.includes("testnet");
    let ERC20Address = process.env.ERC20_ADDRESS; 
    
    if (isDev) {
        const ERC20Contract = await TestERC20.deployed(); 
        ERC20Address = ERC20Contract.address;
    }    
    const sale = await deployProxy(Sale, [freeport.address, ERC20Address], {deployer, kind: "uups"});
    log("Deployed Sale proxy", sale.address);
};
