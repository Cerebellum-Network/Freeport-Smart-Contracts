# Davinci Smart Contracts

## Introduction

A set of contracts to hold NFTs, capture royalties, and subscribe to services.

See `contracts/polygon/*.sol`

See the [documentation](docs/polygon/) (regenerate with `npm run doc`).

See the [build instructions](BUILD.md).

## Releases

### 2021-07-14: ERC20 bridge

- Add support for
  [Polygon Bridge](https://docs.matic.network/docs/develop/ethereum-matic/pos/mapping-assets/#custom-child-token)
  with the `deposit` and `withdraw` functions.
- Make the contract verifiable on Polyscan (solidity version, dependencies, flattening).

Commit 309ba894 on Polygon Mumbai:
[0x09cA13A8dA7A049696dEc9df57f8948ed6702a71](https://mumbai.polygonscan.com/address/0x09cA13A8dA7A049696dEc9df57f8948ed6702a71)

### 2021-07-05: First version

- ERC1155 and mint function
- Royalties configurable per NFT
- Royalties capture in transfers
- Joint Accounts

Commit 021f0116 on Polygon Mumbai
[0x509Dfd7c670AC89246723EFe0f80f433BfbB6E5c](https://mumbai.polygonscan.com/address/0x509Dfd7c670AC89246723EFe0f80f433BfbB6E5c)
>>>>>>> master

## How to deploy

    npm run migrate:polygon --network=polygon_testnet

Write down the contract address and current version in the table above.

Commit the file `build/polygon-contracts/Davinci.json`

On testnet, setup testing accounts:

    truffle --config=truffle-config.polygon.js exec scripts/dev_setup.js --network=polygon_testnet

On testnet, setup the Polygon bridge:

    truffle --config=truffle-config.polygon.js exec scripts/dev_bridge.js --network=polygon_testnet

Verify on Polyscan using the information in Davinci.json and the flattened code:

    npm run flatten:polygon
