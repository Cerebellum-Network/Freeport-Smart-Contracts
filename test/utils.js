const { createProvider, createProviderSigner } = require("@cere/freeport-sdk");
const { Wallet, utils } = require("ethers");

async function getRPCSigner() {
  const {provider, signer} = await createProviderSigner({
    rpcUrl: process.env.HTTP_PROVIDER_URL,
    mnemonic: process.env.MNEMONIC,
    biconomyApiKey: null,
    biconomyDebug: null,
  });
  return provider.getSigner();
}

async function getSigner() {
  const mnemonic = Wallet.fromMnemonic(process.env.MNEMONIC);
  const provider = await createProvider(process.env.HTTP_PROVIDER_URL);
  return new Wallet(mnemonic.privateKey, provider);
}

function typedData(addr, nftId) {
  return {
    domain: {
      name: 'Freeport',
      version: '2'
    },
    types: {
      Bid: [
        { name: 'buyer', type: 'address' },
        { name: 'nftId', type: 'string' }
      ]
    },
    value: {
      buyer: `'${addr}'`,
      nftId: nftId    
    }
  }
}

module.exports = {
  getSigner,
  getRPCSigner,
  typedData
}
