const Freeport = artifacts.require("Freeport");
const USDC = artifacts.require("USDC");
const log = console.log;

module.exports = async function (deployer, network, accounts) {
    let isDev = (network === "development");
    if (isDev) {
        log("Deploying a test ERC20 on a development chain.");
        let admin = accounts[0];
        log("Admin", admin);
        await deployer.deploy(USDC);
        let usdc = await USDC.deployed();
        await usdc.initialize("USD Coin (PoS)", "F_T_USDC", 6, admin);
        let amountEncoded = web3.eth.abi.encodeParameter("uint256", 1e6 * 1e6);
        await usdc.deposit(admin, amountEncoded);
        log("Deployed a test USDC contract", usdc.address);
    }

    // Else, use the already deployed ERC20 for any new Freeport instance.

    let freeport = await Freeport.deployed();
    let erc20 = await USDC.deployed();
    log("Operating on Freeport contract", freeport.address);
    log("Operating on USDC contract", erc20.address);

    log("Connect Freeport to TestERC20");
    await freeport.setERC20(erc20.address);
};
