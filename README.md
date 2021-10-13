# Davinci Smart Contracts

## Introduction

A set of contracts to hold NFTs, capture royalties, and subscribe to services.

See [Davinci](contracts/Davinci.sol).

See the [documentation](docs/Davinci.md) (regenerate with `npm run doc`).

## Releases

### 2021-09-13: Staging deployment

- Reduce permissions in migrate and dev_setup scripts.

Commit 7eb3e339 deployed on Polygon Mumbai.

Contracts [Davinci](https://mumbai.polygonscan.com/address/0xAD56017BAD84Fa4Eab489314C1e158C6adaca598) and
[Fiat Gateway](https://mumbai.polygonscan.com/address/0x7B7e644c49D6C1e7C4af63eFB8cAD382a7b397fB).

[Fiat-to-NFT Service Account](https://mumbai.polygonscan.com/address/0x50a2Cf81C5F8991780Ebc80222b835ecC4010956) (
see [stage_setup](scripts/stage_setup.js)).

[Admin Account](https://mumbai.polygonscan.com/address/0x51c5590504251A5993Ba6A46246f87Fa0eaE5897) (Aurel).

Exchange rate of 0.1 CERE_stage for $0.01.

### 2021-09-06: Exchange rate event and getter

- Add event SetExchangeRate and function getExchangeRate.

Commit 07c8ad0f on Polygon Mumbai:
[Davinci](https://mumbai.polygonscan.com/address/0xC7066eCAd7304Bed38E0b07aD8B9AD4dac92cb2B) and
[Fiat Gateway](https://mumbai.polygonscan.com/address/0xe4708fcCEA49b9305f48901bc2195664dC198097)

### 2021-09-03: Fiat Gateway and Simple Exchange

- Validate that enough CERE were bought. See [FiatGateway](docs/FiatGateway.md).
- Add getOffer function to get the NFT price. See [Davinci](contracts/Davinci.sol).

Commit e8d42c55 on Polygon Mumbai:
[Davinci](https://mumbai.polygonscan.com/address/0x411b7f7BB3B3137437A34fE2C7644d56c96EeA39) and
[Fiat Gateway](https://mumbai.polygonscan.com/address/0xBa51587d0a03dD07a4559823409843aFa49cdEd3)

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

For **dev** on Polygon testnet, setup test accounts:

    truffle exec scripts/dev_setup.js --network=polygon_testnet

For **staging** on Polygon testnet, setup test accounts:

    truffle exec scripts/stage_setup.js --network=polygon_testnet

The script will print the address of the different accounts, including the fiat-to-nft service account.

(optional) For tests or staging on Polygon testnet, setup the Polygon bridge:

    truffle exec scripts/dev_bridge.js --network=polygon_testnet

Verify on Polyscan using the information in Davinci.json and the flattened code:

    npm run flatten

More instructions can be found in the original [README of the template](BUILD.md).

## How to use test image

### 1. To copy the latest snapshot of db with deployed contract and built contracts use

`sudo . ./copy-artifacts.sh dir_path_to (copy to your directory)`\
`sudo . ./copy-artifacts.sh (copy to default ./artifacts directory)`

### 2. To run ganache cli locally with already deployed contract use

`export MNEMONIC='spatial spin account funny glue cancel cushion twelve inmate author night dust'`\
`export NETWORK_ID=5777`\
`docker run -d -p 8545:8545 338287888375.dkr.ecr.us-west-2.amazonaws.com/crb-davinci-nft-test:latest --db /app/db --mnemonic $MNEMONIC --networkId $NETWORK_ID`

## How to run e2e test locally
Readme.md for running e2e-test locally is [here](https://github.com/Cerebellum-Network/e2e-tests/blob/master/README.md).
For this service you need to create image and tag it with tag `338287888375.dkr.ecr.us-west-2.amazonaws.com/crb-davinci-nft-test:YOUR_CUSTOM_TAG`
and use `YOUR_CUSTOM_TAG` for running e2e-tests locally.

## Where to check the e2e-tests result after merge in dev ?
After merge in develop, make sure that tests passed in **@e2e-test-results** channel on Cere Slack.
