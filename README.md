# Davinci Smart Contracts

## Introduction

A set of contracts to hold NFTs, capture royalties, and subscribe to services.

See `contracts/polygon/*.sol`

See the [documentation](docs/polygon/) (regenerate with `npm run doc`).

See the [build instructions](BUILD.md).

|  Deployments | Version | Contract |
| ------------ | ------- | -------- |
| Polygon Mumbai Testnet | 2021-07-01, 2355f975 | [0xBb391c59403818A56A4ddb51FeE561c42571aFf4](https://explorer-mumbai.maticvigil.com/address/0xBb391c59403818A56A4ddb51FeE561c42571aFf4/transactions) |

## How to deploy

    npm run migrate:polygon --network=polygon_testnet

Write down the contract address and current version in the table above.

Commit the file `build/polygon-contracts/Davinci.json`

On testnet, setup testing accounts:

    truffle --config=truffle-config.polygon.js exec scripts/dev_setup.js --network=polygon_testnet
