const {createProvider, createProviderSigner} = require("@cere/freeport-sdk");
const {Wallet} = require("ethers");

async function getSigner() {
  //const {signer, provider} = await createProviderSigner({
  //  rpcUrl: process.env.HTTP_PROVIDER_URL,
  //  mnemonic: process.env.MNEMONIC,
  //  biconomyApiKey: process.env.BICONOMY_API_KEY,
  //  biconomyDebug: true
  //});
  //return provider.getSigner();
  const mnemonic = Wallet.fromMnemonic(process.env.MNEMONIC);
  const provider = await createProvider(process.env.HTTP_PROVIDER_URL);
  return new Wallet(mnemonic.privateKey, provider);
}  

function typedData(addr, nftId) {
  return {
    domain: {      
    },
    types: {
      Bid: [
        {
          name: 'seller',
          type: 'address'
        },
        {
          name: 'nftId',
          type: 'uint'
        }      
      ]
    },
    value: {
      buyer: {
        seller: addr,
        nftId: nftId
      }
    }
  }
}

module.exports = {
  getSigner,
  typedData
}
