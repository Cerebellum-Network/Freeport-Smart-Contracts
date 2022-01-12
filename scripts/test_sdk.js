const log = console.log;
const ethers = require("ethers");
const sdk = require("@cere/freeport-sdk");
const {Biconomy} = require("@biconomy/mexa");

const waitOnBiconomy = (biconomy) => new Promise((resolve, reject) => {
    biconomy.onEvent(biconomy.READY, resolve).onEvent(biconomy.ERROR, reject);
});

module.exports = async function (done) {
    try {
        let accounts = await web3.eth.getAccounts();
        let truffleProvider = web3.currentProvider;
        let ethersProvider; // = new ethers.providers.Web3Provider(truffleProvider);
        let deployment = "dev";

        // Pass connected wallet provider under walletProvider field
        let biconomy = new Biconomy(truffleProvider,
            {
                walletProvider: truffleProvider,
                apiKey: "WijpEd4xz.589021f1-32b9-438e-bc34-e289bd81b016",
                debug: true
            });

        await waitOnBiconomy(biconomy);

        ethersProvider = new ethers.providers.Web3Provider(biconomy);


        const freeportAddress = await sdk.getFreeportAddress(
            ethersProvider,
            deployment,
        );
        log("Freeport", freeportAddress);

        let freeport = sdk.createFreeport({
            provider: ethersProvider,
            contractAddress: freeportAddress,
        });

        let tx = await freeport.issue(10, [0]);
        log("TX", tx);
        let receipt = await tx.wait();
        log("RECEIPT", receipt);

        let event = receipt.events[0];
        //console.assert(event.eventSignature === "TransferSingle(address,address,address,uint256,uint256)");
        //console.assert(event.args.from === '0x0000000000000000000000000000000000000000');
        //console.assert(event.args.to === accounts[0]);

        log("OK");
        done();
    } catch (e) {
        done(e);
    }
};
