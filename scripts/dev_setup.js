const Freeport = artifacts.require("Freeport");
const USDC = artifacts.require("USDC");
const FiatGateway = artifacts.require("FiatGateway");
const SimpleAuction = artifacts.require("SimpleAuction");
const {getSigner} = require("../test/utils");
const log = console.log;

module.exports = async function (done) {

    // A fixed account for tests.
    let serviceAccount = "0x0EA2A95dE281826d5B30587C2bA2218d97476008";

    const CURRENCY = 0;
    let tenM = "10" + "000" + "000" + "000000"; // 10M with 6 decimals;
    let oneM = "1" + "000" + "000" + "000000"; // 1M with 6 decimals;
    
    const signer = await getSigner();
    let authorizer = signer.address;
    let accounts = await web3.eth.getAccounts();
    let admin = accounts[0];
    let freeport = await Freeport.at("0x702BA959B5542B2Bf88a1C5924F73Ed97482c64B");
    let erc20 = await USDC.at("0x5517c3c3fe3688AEF2B5BBEc2B4D3b523B9E8144");
    let gateway = await FiatGateway.at("0x106Bf3D61952faE9279B08bdcB2e548316E0C1Ae");
    let auction = await SimpleAuction.at("0x7e4FCB28B5794dBf729E860f0abe97C3412E62e4");
    log("Operating on Freeport contract", freeport.address);
    log("Operating on USDC contract", erc20.address);
    log("Operating on FiatGateway contract", gateway.address);
    log("Operating on SimpleAuction contract", auction.address);
    log("From admin account", admin);
    log("With Authorizer account", authorizer.address);

    let mintUSDC = async (account, amount) => {
        let amountEncoded = web3.eth.abi.encodeParameter("uint256", amount);
        await erc20.deposit(account, amountEncoded);
    };
    
    log("Set an exchange rate of 1:1 (0.01 with 6 decimals of ERC20 for $0.01)");
    await gateway.setExchangeRate(0.01e6);

    log("Give the permission to execute payments to the service account", serviceAccount);
    const PAYMENT_SERVICE = await gateway.PAYMENT_SERVICE.call();
    await gateway.grantRole(PAYMENT_SERVICE, serviceAccount);

    log("Grant role to address for bid authorization");
    const BUY_AUTHORIZER_ROLE = await auction.BUY_AUTHORIZER_ROLE.call();
    await auction.grantRole(BUY_AUTHORIZER_ROLE, authorizer);

    await mintUSDC(gateway.address, tenM);
    log("Sent 10M of currency to FiatGateway");

    let devAccounts = [
        admin,
        "0x6108E8aFFe0c51D4e2515A773aeF16b19ED6feB9", // e2e tests (Pavel)
        "0x6d2b28389d3153689c57909829dFCf6241d36388", // Evgeny
        "0x1Bf6FCa28253A1257e4B5B3440F7fbE0c59D1546", // Sergey
        "0x51c5590504251A5993Ba6A46246f87Fa0eaE5897", // Aurel
    ];

    for (let devAccount of devAccounts) {
        await mintUSDC(devAccount, oneM);
        log("Sent 1M of currency to", devAccount);
    }

    done();
};
