# Davinci Smart Contracts

## Introduction

A set of contracts to hold NFTs, capture royalties, and subscribe to services.

See `contracts/polygon/*.sol`

See the [documentation](docs/polygon/) (regenerate with `npm run doc`).

See the [build instructions](BUILD.md).

|  Deployments | Version | Contract |
| ------------ | ------- | -------- |
| Polygon Mumbai Testnet | 2021-07-14, ef34b60e, with ERC20 bridge | [0x0710e2063758F5091A9347A30435e92e260D0069](https://explorer-mumbai.maticvigil.com/address/0x0710e2063758F5091A9347A30435e92e260D0069/transactions) |
| Polygon Mumbai Testnet | 2021-07-05, 021f0116 | [0x509Dfd7c670AC89246723EFe0f80f433BfbB6E5c](https://explorer-mumbai.maticvigil.com/address/0x509Dfd7c670AC89246723EFe0f80f433BfbB6E5c/transactions) |

## How to deploy

    npm run migrate:polygon --network=polygon_testnet

Write down the contract address and current version in the table above.

Commit the file `build/polygon-contracts/Davinci.json`

On testnet, setup testing accounts:

    truffle --config=truffle-config.polygon.js exec scripts/dev_setup.js --network=polygon_testnet
