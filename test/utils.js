const { createProvider, createProviderSigner } = require("@cere/freeport-sdk");
const { Wallet, utils } = require("ethers");

async function getSigner() {
  const mnemonic = Wallet.fromMnemonic(process.env.MNEMONIC);
  const provider = await createProvider(process.env.HTTP_PROVIDER_URL);
  return new Wallet(mnemonic.privateKey, provider);
}

function typedData(addr, nftId) {
  return {
    domain: {
      name: 'Freeport',
      version: '2.0.0',
      chainId: 80001,
      verifyingContract: '',
    },
    types: {
      Bid: [
        { name: 'seller', type: 'address' },
        { name: 'nftId', type: 'string' }
      ]
    },
    value: {
      seller: `'${addr}'`,
      nftId: nftId    
    }
  }
}

module.exports = {
  getSigner,
  typedData
}
