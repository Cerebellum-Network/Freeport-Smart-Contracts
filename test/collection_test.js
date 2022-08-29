const Freeport = artifacts.require("Freeport");
const CollectionFactory = artifacts.require("CollectionFactory");
const Collection = artifacts.require("Collection");
const Marketplace = artifacts.require("Marketplace");
const Auction = artifacts.require("Auction");
const ERC20 = artifacts.require("TestERC20");
const log = console.log;
const {deployProxy} = require('@openzeppelin/truffle-upgrades');
const {expectEvent, expectRevert} = require('@openzeppelin/test-helpers');
const BN = require('bn.js');


contract("Collection", accounts => {
    const deployer = accounts[0];

    const CURRENCY = 0;
    const UNIT = 1e6;
    const aLot = 100e3 * UNIT;
    const freeportUSDCAmount = 10e3 * UNIT;

    let deploy = async (freeport) => {
        let erc20;
        if (freeport) {
            let erc20address = await freeport.currencyContract.call();
            erc20 = await ERC20.at(erc20address);
        } else {
            freeport = await deployProxy(Freeport, [], {kind: "uups"});
            erc20 = await ERC20.new();
            await freeport.setERC20(erc20.address);
        }

        await erc20.mint(deployer, aLot);
        await erc20.mint(freeport.address, freeportUSDCAmount);
        await erc20.approve(freeport.address, aLot);
        await freeport.deposit(aLot);

        let deposit = async (account, amount) => {
            await freeport.safeTransferFrom(deployer, account, CURRENCY, amount, "0x");
        };

        let withdraw = async (account) => {
            let balance = await freeport.balanceOf(account, CURRENCY);
            await freeport.withdraw(balance, {from: account});
        };

        return {freeport, erc20, deposit, withdraw};
    };

    let freeport;
    let factory;
    let marketplace;
    let auction;
    let erc20;
    let deposit;
    let withdraw;

    before(async () => {
        let freeportOfMigrations = await Freeport.deployed();
        let x = await deploy(freeportOfMigrations);
        freeport = x.freeport;
        factory = await CollectionFactory.deployed();
        marketplace = await Marketplace.deployed();
        auction = await Auction.deployed();
        erc20 = x.erc20;
        deposit = x.deposit;
        withdraw = x.withdraw;
    });

    it("creates a collection", async () => {
        let collectionAddr = await factory.createCollection(deployer, "my collection", "https://{id}.json", "https://my_contract");
        log("collectionAddr", collectionAddr);
    });

});
