const {version} = require("../package.json");
const {Wallet} = require("ethers");
const {createProviderSigner, createProvider} = require("@cere/freeport-sdk");

async function getSigner() {
  const BICONOMY_API_KEY = process.env.BICONOMY_API_KEY;
  const {signer, provider} = await createProviderSigner({
    rpcUrl: process.env.HTTP_PROVIDER_URL,
    mnemonic: process.env.MNEMONIC,
    biconomyApiKey: BICONOMY_API_KEY,
    biconomyDebug: true
  });
  return provider.getSigner();
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
  getAuthorizerWallet,
  typedData
}
