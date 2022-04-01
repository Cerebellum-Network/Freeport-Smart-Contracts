require('dotenv').config();
require('@nomiclabs/hardhat-ethers');
require('@openzeppelin/hardhat-upgrades');
require("@nomiclabs/hardhat-truffle5");

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defender: {
    apiKey: process.env.API_KEY,
    apiSecret: process.env.API_SECRET,
  },
  networks: {
    polygon_testnet: {
      url: "https://rpc-mumbai.maticvigil.com",
      accounts: { mnemonic: process.env.MNEMONIC },
      chainId: 80001,
      gas: 5e6,
      gasPrice: 4e9      
    },
    polygon_mainnet: {
      url: "https://polygon-mainnet.infura.io/v3/",
      accounts: { mnemonic: process.env.MNEMONIC },
      chainId: 137,
      gas: 5e6,
      gasPrice: 40e9
    } 
  },
  solidity: '0.8.4'
}
