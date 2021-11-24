# Freeport Smart Contracts

## Introduction

A set of contracts to hold NFTs, capture royalties, and subscribe to services.

See [Freeport.sol](contracts/Freeport.sol).

See the [documentation](docs/Freeport.md) (regenerate with `npm run doc`).

## Releases

### 2021-11-08: CID Attachments

- Attach arbitrary objects to NFTs.

NFTAttachment commit 89696561 deployed for Freeport version 2021-09-13 and 2021-11-03 below.

### 2021-11-04: Auction with getter

- Add the getter for bids (sellerNftBids).
- Prevent potential reentrancy bug.

SimpleAuction commit a74e4db0 deployed for Freeport version 2021-09-13 and 2021-11-03 below.

### 2021-11-03: Auction with royalties

- Auction sales now capture royalties, if any.

Commit 6df6c349 deployed on Polygon Mumbai.

Contracts [Freeport](https://mumbai.polygonscan.com/address/0xd1EdBAC660307c5B6d22E678FB5e22668C70Ad96) and
[Fiat Gateway](https://mumbai.polygonscan.com/address/0x1f8eC932B6ec39A0326b74E9648A158F88B24082) and [Simple Auction](https://mumbai.polygonscan.com/address/0xd7cd23C84F9109F57f13eF28319e8787628DD7ad) and [NFT Attachment](https://mumbai.polygonscan.com/address/0x270693f873287a39172856Ad8cfbCd79b040b287).

[Fiat-to-NFT Service Account](https://mumbai.polygonscan.com/address/0x50a2Cf81C5F8991780Ebc80222b835ecC4010956) (
see [stage_setup](scripts/stage_setup.js)).
[Admin Account](https://mumbai.polygonscan.com/address/0x51c5590504251A5993Ba6A46246f87Fa0eaE5897) (Aurel).

Exchange rate of 0.1 CERE_stage for $0.01.

### 2021-10-21: Simple Auction

- A contract that holds auctions and make transfers in the main Freeport contract.
- An external function `captureFee` on the Freeport contract that can be used by authorized contracts (i.e., the auction contract).
- **Note:** The call to `captureFee` is disabled in this deployment in order to work with the previous versions of Freeport. After deployment of the Freeport of this commit, this call can be reenabled (see `TODO in SimpleAuction.sol`).

Commit 032fbc7d deployed in dev and staging, see the links to "Simple Auction" in the sections below.

### 2021-09-13: Staging deployment

- Reduce permissions in migrate and dev_setup scripts.

Commit 7eb3e339 deployed on Polygon Mumbai.

Contracts [Freeport](https://mumbai.polygonscan.com/address/0xAD56017BAD84Fa4Eab489314C1e158C6adaca598) and
[Fiat Gateway](https://mumbai.polygonscan.com/address/0x7B7e644c49D6C1e7C4af63eFB8cAD382a7b397fB) and [Simple Auction](https://mumbai.polygonscan.com/address/0x49a08A6d213649b50655979E222C8496ADac050c) and [NFT Attachment](https://mumbai.polygonscan.com/address/0x1282fdeC36aC4aaf025059D69077d4450703eeD0).

[Fiat-to-NFT Service Account](https://mumbai.polygonscan.com/address/0x50a2Cf81C5F8991780Ebc80222b835ecC4010956) (
see [stage_setup](scripts/stage_setup.js)).

[Admin Account](https://mumbai.polygonscan.com/address/0x51c5590504251A5993Ba6A46246f87Fa0eaE5897) (Aurel).

Exchange rate of 0.1 CERE_stage for $0.01.

### 2021-09-06: Exchange rate event and getter

- Add event SetExchangeRate and function getExchangeRate.

Commit 07c8ad0f on Polygon Mumbai:
[Freeport](https://mumbai.polygonscan.com/address/0xC7066eCAd7304Bed38E0b07aD8B9AD4dac92cb2B) and
[Fiat Gateway](https://mumbai.polygonscan.com/address/0xe4708fcCEA49b9305f48901bc2195664dC198097) and [Simple Auction](https://mumbai.polygonscan.com/address/0x9847941016d9d415e4d428FA74E5302555d01F45).

### 2021-09-03: Fiat Gateway and Simple Exchange

- Validate that enough CERE were bought. See [FiatGateway](docs/FiatGateway.md).
- Add getOffer function to get the NFT price. See [Freeport](contracts/Freeport.sol).

Commit e8d42c55 on Polygon Mumbai:
[Freeport](https://mumbai.polygonscan.com/address/0x411b7f7BB3B3137437A34fE2C7644d56c96EeA39) and
[Fiat Gateway](https://mumbai.polygonscan.com/address/0xBa51587d0a03dD07a4559823409843aFa49cdEd3)

### 2021-08-11: Fiat Gateway

- Add a contract to handle fiat payments and buy CERE and NFTs. See [FiatGateway](docs/FiatGateway.md).

Commit be6ed7dc on Polygon Mumbai:
[Freeport](https://mumbai.polygonscan.com/address/0x4F908981A3CFdd440f7a3d114b06b1695DA8373b) and
[Fiat Gateway](https://mumbai.polygonscan.com/address/0xf038C9F12884b4544497fE5857506D1B78E8aC41)

### 2021-08-09: Simple Exchange

- Add a basic NFT sale functionality with `make / take` functions. This captures variable royalties based on the NFT
  price. See [SimpleExchange](docs/freeportParts/SimpleExchange.md).

Commit e1852250 on Polygon
Mumbai: [0x656E87eC4607E81896C41de2135db72ee8abce13](https://mumbai.polygonscan.com/address/0x656E87eC4607E81896C41de2135db72ee8abce13)

### 2021-07-23: Integration with meta-transactions, marketplaces, and royalties bypass

- Add access control mechanism to support other features in a flexible way.

- Introduce a meta-transactions forwarder contract and deployment.
  See [MinimalForwarder](contracts/MinimalForwarder.sol)
  and the [deploy script](migrations/2_deploy_forwarder.js).

- Support meta-transactions using the standard ERC2771. See the role `META_TX_FORWARDER`
  in [MetaTxContext](contracts/freeportParts/MetaTxContext.sol)

- Add a mechanism to bypass royalties. There can be a meta-transaction forwarder whose transactions are not subject to
  royalties. See the role `BYPASS_SENDER` in [TransferFees](contracts/freeportParts/TransferFees.sol), used
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

Commit these files in `build/contracts/`: `Freeport.json`, `MinimalForwarder.json`, `BypassForwarder.json`
, `FiatGateway.json`.

For **dev** on Polygon testnet, setup test accounts:

    truffle exec scripts/dev_setup.js --network=polygon_testnet

For **staging** on Polygon testnet, setup test accounts:

    truffle exec scripts/stage_setup.js --network=polygon_testnet

The script will print the address of the different accounts, including the fiat-to-nft service account.

(optional) For tests or staging on Polygon testnet, setup the Polygon bridge:

    truffle exec scripts/dev_bridge.js --network=polygon_testnet

Verify on Polyscan using the information in Freeport.json and the flattened code:

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

## How to update Freeport SDK 

1. Open [SDK](https://github.com/Cerebellum-Network/Freeport-Smart-Contracts-SDK) project in IDE, switch to master branch
2. Copy smart-contract artifacts from `/build/contracts` to SDK's `/src/artifacts`
3. Run `yarn update-types`
4. Commit changes with message like *"artifacts from commit e57691bc"*
5. Check that `npm whoami` returns "cere-io" (otherwise update your NPM_TOKEN env var for publishing @cere packages)
6. Run `yarn deploy` and publish next version (see [Versioning](https://github.com/Cerebellum-Network/Freeport-Smart-Contracts-SDK#versioning))
7. Push changes to the remote branch
8. Install the new version of SDK in projects that use it

## How to run e2e test locally
Readme.md for running e2e-test locally is [here](https://github.com/Cerebellum-Network/e2e-tests/blob/master/README.md#how-to-run-e2e-tests-locally).
For this service you need to create image locally and tag it with tag `338287888375.dkr.ecr.us-west-2.amazonaws.com/crb-davinci-nft-test:YOUR_CUSTOM_TAG`
and use `YOUR_CUSTOM_TAG` for running e2e-tests locally.

## Where to check the e2e-tests result after merge in dev?
After merge in develop, make sure that tests passed in **@e2e-test-results** channel on Cere Slack.
