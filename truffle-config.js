const HDWalletProvider = require('@truffle/hdwallet-provider');
// create a file at the root of your project and name it .env -- there you can set process variables
// like the mnemomic and Infura project key below. Note: .env is ignored by git to keep your private information safe
require('dotenv').config();
const mnemonic = process.env["MNEMONIC"];
const infuraProjectId = process.env["INFURA_PROJECT_ID"];

module.exports = {

  networks: {
    development: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 8545,            // Standard Ethereum port (default: none)
      network_id: "*",       // Any network (default: none)
      gasPrice: 1e9,
    },
    //polygon Infura mainnet
    polygon_infura_mainnet: {
      provider: () => new HDWalletProvider({
        mnemonic: {
          phrase: mnemonic
        },
        providerOrUrl:
         "https://polygon-mainnet.infura.io/v3/" + infuraProjectId
      }),
      network_id: 137,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
      chainId: 137,
      gasPrice: 1e9,
    },
    //polygon Infura testnet
    polygon_infura_testnet: {
      provider: () => new HDWalletProvider({
        mnemonic: {
          phrase: mnemonic
        },
        addressIndex: 1,
        providerOrUrl:
         "https://polygon-mumbai.infura.io/v3/" + infuraProjectId
      }),
      network_id: 80001,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
      chainId: 80001,
      gasPrice: 1e9,
    },
    //polygon testnet
    polygon_testnet: {
      provider: () => new HDWalletProvider({
        mnemonic: {
          phrase: mnemonic
        },
        addressIndex: 1,
        providerOrUrl:  `https://rpc-mumbai.maticvigil.com`,
        //providerOrUrl:  `https://rpc-mumbai.matic.today`,
        chainId: 80001,
        pollingInterval: 30e3,
      }),
      network_id: 80001,
      confirmations: 1,
      deploymentPollingInterval: 30e3,
      timeoutBlocks: 200,
      skipDryRun: true,
      chainId: 80001,
      gas: 4e6,
      gasPrice: 11e9,
    },
    //polygon mainnet
    polygon_mainnet: {
      provider: () => new HDWalletProvider({
        mnemonic: {
          phrase: mnemonic
        },
        providerOrUrl:  `https://polygon-rpc.com`,
        chainId: 137
      }),
      network_id: 137,
      confirmations: 2,
      deploymentPollingInterval: 30e3,
      timeoutBlocks: 200,
      skipDryRun: false,
      chainId: 137,
      gas: 2e6,
      gasPrice: 80e9,
    }
  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.4",
      settings: {
        optimizer: {
          enabled: true,
          runs: 10
        },
      },
    }
  },
  db: {
    enabled: false
  }
}
