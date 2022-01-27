const Freeport = artifacts.require("Freeport");
const FiatGateway = artifacts.require("FiatGateway");
const SimpleAuction = artifacts.require("SimpleAuction");
const NFTAttachment = artifacts.require("NFTAttachment");
const TestERC20 = artifacts.require("TestERC20");
const TestFreeport2 = artifacts.require("TestFreeport2");
const TestAuction2 = artifacts.require("TestAuction2");
const log = console.log;
const {deployProxy, upgradeProxy} = require('@openzeppelin/truffle-upgrades');
const {expectEvent, expectRevert, constants, time} = require('@openzeppelin/test-helpers');
const BN = require('bn.js');

contract("Upgrades", accounts => {
    const [deployer, issuer, buyerBob, buyerBill, benificiary] = accounts;

    const CURRENCY = 0;
    const UNIT = 1e6;
    const aLot = 100e3 * UNIT;

    let freeport, erc20, gateway, auction, attachment, ADMIN_ROLE;

    before(async () => {
        freeport = await Freeport.deployed();
        erc20 = await freeport.currencyContract();
        gateway = await FiatGateway.deployed();
        auction = await SimpleAuction.deployed();
        attachment = await NFTAttachment.deployed();
        ADMIN_ROLE = await freeport.DEFAULT_ADMIN_ROLE();
    });


    it("deployer is admin", async () => {
        expect(await freeport.hasRole(ADMIN_ROLE, deployer)).equal(true);
        expect(await gateway.hasRole(ADMIN_ROLE, deployer)).equal(true);
        expect(await auction.hasRole(ADMIN_ROLE, deployer)).equal(true);
        expect(await attachment.hasRole(ADMIN_ROLE, deployer)).equal(true);
    });

    it("Freeport and SimpleAuction can be upgraded", async () => {
        // Upgrade to TestFreeport2.
        const freeport2 = await upgradeProxy(freeport.address, TestFreeport2);
        expect(freeport2.address).equal(freeport.address);

        // Use a new function of TestFreeport2.
        const nftId = await freeport2.testIssue.call();
        await freeport2.testIssue();
        let balance = await freeport.balanceOf.call(deployer, nftId);
        expect(+balance).equal(1);

        // Start an auction.
        let closeTime = (await time.latest()).toNumber() + 1e6;
        auction.startAuction(nftId, 100 * UNIT, closeTime);

        // Upgrade to TestAuction2.
        const auction2 = await upgradeProxy(auction.address, TestAuction2);
        expect(auction2.address).equal(auction.address);

        // Use a new function of TestAuction2.
        balance = await freeport.balanceOf.call(deployer, nftId);
        expect(+balance).equal(0); // during auction.

        await auction2.testForceSettle(deployer, nftId);

        balance = await freeport.balanceOf.call(deployer, nftId);
        expect(+balance).equal(1); // after auction.
    });

});