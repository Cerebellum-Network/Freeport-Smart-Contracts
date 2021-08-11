# Davinci Smart Contracts

## Introduction

A set of contracts to hold NFTs, capture royalties, and subscribe to services.

See [Davinci](contracts/Davinci.sol).

See the [documentation](docs/Davinci.md) (regenerate with `npm run doc`).

## Releases

### 2021-08-11: Fiat Gateway

- Add a contract to handle fiat payments and buy CERE and NFTs. See [FiatGateway](docs/FiatGateway.md).

Commit be6ed7dc on Polygon Mumbai:
[Davinci](https://mumbai.polygonscan.com/address/0x4F908981A3CFdd440f7a3d114b06b1695DA8373b) and
[Fiat Gateway](https://mumbai.polygonscan.com/address/0xf038C9F12884b4544497fE5857506D1B78E8aC41)

### 2021-08-09: Simple Exchange

- Add a basic NFT sale functionality with `make / take` functions. This captures variable royalties based on the NFT
  price. See [SimpleExchange](docs/davinciParts/SimpleExchange.md).

Commit e1852250 on Polygon
Mumbai: [0x656E87eC4607E81896C41de2135db72ee8abce13](https://mumbai.polygonscan.com/address/0x656E87eC4607E81896C41de2135db72ee8abce13)

### 2021-07-23: Integration with meta-transactions, marketplaces, and royalties bypass

- Add access control mechanism to support other features in a flexible way.

- Introduce a meta-transactions forwarder contract and deployment.
  See [MinimalForwarder](contracts/MinimalForwarder.sol)
  and the [deploy script](migrations/2_deploy_forwarder.js).

- Support meta-transactions using the standard ERC2771. See the role `META_TX_FORWARDER`
  in [MetaTxContext](contracts/davinciParts/MetaTxContext.sol)

- Add a mechanism to bypass royalties. There can be a meta-transaction forwarder whose transactions are not subject to
  royalties. See the role `BYPASS_SENDER` in [TransferFees](contracts/davinciParts/TransferFees.sol), used
  for [BypassForwarder](contracts/BypassForwarder.sol).

- Support marketplaces in a generic way. The smart contracts from marketplaces can be connected by giving them
  permissions to make transfers. See the role `TRANSFER_OPERATOR` in `TransferOperator.sol`

### 2021-07-14: ERC20 bridge

- Add support for
  [Polygon Bridge](https://docs.matic.network/docs/develop/ethereum-matic/pos/mapping-assets/#custom-child-token)
  with the `deposit` and `withdraw` functions.
- Make the contract verifiable on Polyscan (solidity version, dependencies, flattening).

Commit 309ba894 on Polygon Mumbai:
[0x09cA13A8dA7A049696dEc9df57f8948ed6702a71](https://mumbai.polygonscan.com/address/0x09cA13A8dA7A049696dEc9df57f8948ed6702a71)

This contract is bridged to a test ERC20 on Ethereum
Goerli: [0x35C33219cFC617BA362860e28E7cf25085cA1355](https://goerli.etherscan.io/address/0x35C33219cFC617BA362860e28E7cf25085cA1355)
. Try it with [Polygon UI](https://wallet.matic.today/bridge).

![Polygon bridge](https://user-images.githubusercontent.com/8718243/127128156-b1f9cfc1-e9cf-4a36-be4d-d4fe71f537be.png)

### 2021-07-05: First version

- ERC1155 and mint function
- Royalties configurable per NFT
- Royalties capture in transfers
- Joint Accounts

Commit 021f0116 on Polygon Mumbai
[0x509Dfd7c670AC89246723EFe0f80f433BfbB6E5c](https://mumbai.polygonscan.com/address/0x509Dfd7c670AC89246723EFe0f80f433BfbB6E5c)

## How to deploy

    npm test
    npm run migrate --network=polygon_testnet

Write down the contract address and current version in the Releases section above.

Commit these files in `build/contracts/`: `Davinci.json`, `MinimalForwarder.json`, `BypassForwarder.json`
, `FiatGateway.json`.

On testnet, setup testing accounts:

    truffle exec scripts/dev_setup.js --network=polygon_testnet

On testnet, setup the Polygon bridge:

    truffle exec scripts/dev_bridge.js --network=polygon_testnet

Verify on Polyscan using the information in Davinci.json and the flattened code:

    npm run flatten

More instructions can be found in the original [README of the template](BUILD.md).
