# Davinci Smart Contracts

## Introduction

A set of contracts to hold NFTs, capture royalties, and subscribe to services.

See `contracts/polygon/*.sol`

See the [documentation](docs/polygon/) (regenerate with `npm run doc`).

See the [build instructions](BUILD.md).

## Releases

### 2021-07-23: Integration with meta-transactions, marketplaces, and royalties bypass

- Add access control mechanism to support other features in a flexible way.

- Introduce a meta-transactions forwarder contract and deployment. See `contracts/polygon/metatx/MinimalForwarder.sol` and `migrations/2_deploy_forwarder.js`

- Support meta-transactions using the standard ERC2771. See the role `META_TX_FORWARDER` in `MetaTxContext.sol`

- Add a mechanism to bypass royalties. There can be a meta-transaction forwarder whose transactions are not subject to royalties. See the role `BYPASS_SENDER` in `TransferFees.sol`

- Support marketplaces in a generic way. The smart contracts from marketplaces can be connected by giving them permissions to make transfers. See the role `TRANSFER_OPERATOR` in `TransferOperator.sol`


### 2021-07-14: ERC20 bridge

- Add support for
  [Polygon Bridge](https://docs.matic.network/docs/develop/ethereum-matic/pos/mapping-assets/#custom-child-token)
  with the `deposit` and `withdraw` functions.
- Make the contract verifiable on Polyscan (solidity version, dependencies, flattening).

Commit 309ba894 on Polygon Mumbai:
[0x09cA13A8dA7A049696dEc9df57f8948ed6702a71](https://mumbai.polygonscan.com/address/0x09cA13A8dA7A049696dEc9df57f8948ed6702a71)

This contract is bridged to a test ERC20 on Ethereum Goerli: [0x35C33219cFC617BA362860e28E7cf25085cA1355](https://goerli.etherscan.io/address/0x35C33219cFC617BA362860e28E7cf25085cA1355). Try it with [Polygon UI](https://wallet.matic.today/bridge).

![Polygon bridge](https://user-images.githubusercontent.com/8718243/127128156-b1f9cfc1-e9cf-4a36-be4d-d4fe71f537be.png)

### 2021-07-05: First version

- ERC1155 and mint function
- Royalties configurable per NFT
- Royalties capture in transfers
- Joint Accounts

Commit 021f0116 on Polygon Mumbai
[0x509Dfd7c670AC89246723EFe0f80f433BfbB6E5c](https://mumbai.polygonscan.com/address/0x509Dfd7c670AC89246723EFe0f80f433BfbB6E5c)

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
