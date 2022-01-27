const log = console.log;
const ethers = require("ethers");
const sdk = require("@cere/freeport-sdk");
const {Biconomy} = require("@biconomy/mexa");

const BICONOMY_API_KEY = process.env.BICONOMY_API_KEY;

const waitOnBiconomy = (biconomy) => new Promise((resolve, reject) => {
    biconomy.onEvent(biconomy.READY, resolve).onEvent(biconomy.ERROR, reject);
});

module.exports = async function (done) {
    try {
        let accounts = await web3.eth.getAccounts();
        //let truffleProvider = web3.currentProvider;
        //let ethersProvider = new ethers.providers.Web3Provider(truffleProvider);
        let deployment = "dev";

        const provider = await sdk.createProvider(
            "https://rpc-mumbai.maticvigil.com",
            true,
            BICONOMY_API_KEY,
        );

        log(provider);

        const freeportAddress = await sdk.getFreeportAddress(
            provider,
            deployment,
        );
        log("Freeport address", freeportAddress);

        let freeport = sdk.createFreeport({
            provider,
            contractAddress: freeportAddress,
            mnemonic: "typical cable potato lamp popular submit forget slow fiction promote pulp please",
        });
        log("Freeport", freeport);

        log("provider signer", provider.getSigner());
        log("freeport provider signer", freeport.provider.getSigner());

        let tx = await freeport.issue(10, [0], {gasLimit: 1e6});
        log("TX", tx);
        let receipt = await tx.wait();
        log("RECEIPT", receipt);
        let event = receipt.events[0];
        log("EVENT", event);

        console.assert(event.eventSignature === "TransferSingle(address,address,address,uint256,uint256)");
        console.assert(event.args.from === '0x0000000000000000000000000000000000000000');
        console.assert(event.args.to === accounts[0]);


        log("OK");
        done();
    } catch (e) {
        done(e);
    }
};
