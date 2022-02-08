const {version} = require("../package.json");
const {Wallet, providers} = require("ethers");

function getAuthorizerWallet(truffleProvider) {
  const wallet = new Wallet.fromMnemonic(process.env.MNEMONIC);
  const ethersProvider = new providers.Web3Provider(truffleProvider);    
  const privateKey = wallet.privateKey;
  return new Wallet(privateKey, ethersProvider);
}  

function typedData(addr, nftId) {
  return {
    domain: {
      name: "Freeport",
      version: version
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
