# Freeport Smart Contracts

## Introduction

A set of contracts to hold NFTs, capture royalties, and subscribe to services.

See [Freeport.sol](contracts/Freeport.sol).

See the [documentation](docs/Freeport.md) (regenerate with `npm run doc`).

## Releases

### 2022-01-30: NFT transfer

Additional public function has been implemented in BaseNFT contract that rely on forceTranfer function internally. New one is used instead of safeTransferFrom because using it had been caused fees collection doubly.

### 2022-01-28: Upgradeability

Make Freeport, FiatGateway, SimpleAuction, and NFTAttachment upgradeable.
Commit bfb19163 deployed.

#### Mainnet

Contracts: [Freeport](https://polygonscan.com/address/0xf9AC6022F786f6f64Fd8abf661190b8517D92396) and
[Fiat Gateway](https://polygonscan.com/address/0x4478e3B0B71531DAc9d0ECe9357eBB0043669804) and [Simple Auction](https://polygonscan.com/address/0xf6a530242B233B1b4208c449D6C72FB7c6133cC0) and [NFT Attachment](https://polygonscan.com/address/0x651f2C6942F1c290632Ad5bB61D9ece789f82f35) and [USDC ERC20](https://polygonscan.com/address/0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174).

Accounts:
[Fiat-to-NFT Service](https://polygonscan.com/address/0x2352f1167F1c1c5273bB64a1FEEAf9dF49702A19) (
see [prod_setup](scripts/prod_setup.js)).
Biconomy enabled.
[Admin](https://polygonscan.com/address/0x4d632f8513554d7647a326c1f4ca72caeff93e63).

#### Stage

Contracts: [Freeport](https://mumbai.polygonscan.com/address/0xacd8105cBA046307d2228794ba2F81aA15e82E0D) and
[Fiat Gateway](https://mumbai.polygonscan.com/address/0xe25b31Aa454E28110E28C694ded69cD241A27Db1) and [Simple Auction](https://mumbai.polygonscan.com/address/0x71091eA5466E3Ca50971bd51c11069e5629a49dB) and [NFT Attachment](https://mumbai.polygonscan.com/address/0x84766787c6b9131927A76634F7DDCfcf3ff2e9d1) and [TestERC20](https://mumbai.polygonscan.com/address/0x93E73E25F290f8A50281A801109f75CB4E8e3233).

Accounts:
[Fiat-to-NFT Service](https://mumbai.polygonscan.com/address/0x53B53189e668dC2ee3bA7A44Bb033E60F400d395) (
see [stage_setup](scripts/stage_setup.js)).
Biconomy enabled.
[Admin](https://mumbai.polygonscan.com/address/0x63846e2D234e4F854F43423014430b4e131f697b).


#### Dev

Contracts: [Freeport](https://mumbai.polygonscan.com/address/0x702BA959B5542B2Bf88a1C5924F73Ed97482c64B) and
[Fiat Gateway](https://mumbai.polygonscan.com/address/0x106Bf3D61952faE9279B08bdcB2e548316E0C1Ae) and [Simple Auction](https://mumbai.polygonscan.com/address/0xCEAc6c102bEcE4ed2E5ede9df096F7175BB8CbaD) and [NFT Attachment](https://mumbai.polygonscan.com/address/0x39B27a0bc81C1366E2b05E02642Ef343a4f9223a) and [TestERC20](https://mumbai.polygonscan.com/address/0x4e5a86E128f8Fb652169f6652e2Cd17aAe409e96).

Accounts:
[Fiat-to-NFT Service](https://mumbai.polygonscan.com/address/0xD2B94CBF0fFAA9bc07126ab53f980Cd95a5Ed243) (
see [dev_setup](scripts/dev_setup.js)).
Biconomy enabled.
[Admin](https://mumbai.polygonscan.com/address/0x63846e2D234e4F854F43423014430b4e131f697b).


### 2022-01-07: Extended NFT Attachments

NFT Attachments now support variable-sized attachment data, and separate events for minter, owner, and anonymous senders. This is included in the deployment 2021-12-31 below.

### 2021-12-31: ERC20 Adapter

Use an ERC20 adapter instead of a Polygon bridge adapter.
Commit caefd460 deployed.

#### Mainnet

Contracts: [Freeport](https://polygonscan.com/address/0x521296be238B164b9A391b6F6175741826CB5F33) and
[Fiat Gateway](https://polygonscan.com/address/0xf6d782Cd0dC9976170242B94C8E653C7bA489634) and [Simple Auction](https://polygonscan.com/address/0x166996399a262d8F0976c2fa206E92F8BE77810F) and [NFT Attachment](https://polygonscan.com/address/0x5E376313fddBE3010F5d9fbC446C63d803590445) and [Forwarder](https://polygonscan.com/address/0x5e43bA1666B13C346E2ECdeD9dcDaaf02fbb0B22) and [Bypass Forwarder](https://polygonscan.com/address/0x1E77956B211cb4437317CF692141b292B1433f29) and [USDC ERC20](https://polygonscan.com/address/0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174).

Accounts:
[Fiat-to-NFT Service](https://polygonscan.com/address/0x2352f1167F1c1c5273bB64a1FEEAf9dF49702A19) (
see [prod_setup](scripts/prod_setup.js)).
No Meta-tx Relayer Account yet.
[Admin](https://polygonscan.com/address/0x4d632f8513554d7647a326c1f4ca72caeff93e63).

#### Stage

Contracts: [Freeport](https://mumbai.polygonscan.com/address/0x8bD1D3a93C7FB1786fFE3d0610987C3879287698) and
[Fiat Gateway](https://mumbai.polygonscan.com/address/0x1C59A68ff017f14D1a8B80644F25F047b1CC58C5) and [Simple Auction](https://mumbai.polygonscan.com/address/0xCEfC0a243D56fa9A986D173f6289EcBBD336643B) and [NFT Attachment](https://mumbai.polygonscan.com/address/0x64fe48A0555b3b822E5DAC8347DFD1FDc9A2E91D) and [Forwarder](https://mumbai.polygonscan.com/address/0x03988B5eaf8EFC804320B860dBb7f281EdF92420) and [Bypass Forwarder](https://mumbai.polygonscan.com/address/0x7a770bf5a93a3a686FA2B40cA399462ceD10725D) and [TestERC20](https://mumbai.polygonscan.com/address/0x93E73E25F290f8A50281A801109f75CB4E8e3233).

Accounts:
[Fiat-to-NFT Service](https://mumbai.polygonscan.com/address/0x53B53189e668dC2ee3bA7A44Bb033E60F400d395) (
see [stage_setup](scripts/stage_setup.js)).
No Meta-tx Relayer Account yet.
[Admin](https://mumbai.polygonscan.com/address/0x63846e2D234e4F854F43423014430b4e131f697b).


#### Dev

Contracts: [Freeport](https://mumbai.polygonscan.com/address/0xC59Af7FbE4553e07aA668C1A13CAa78Cd4550579) and
[Fiat Gateway](https://mumbai.polygonscan.com/address/0xE8949692827C3034c6fF185a38c192ca3059f6e5) and [Simple Auction](https://mumbai.polygonscan.com/address/0x9E3c717d9fD5839131e567fCAf755c979bF78D08) and [NFT Attachment](https://mumbai.polygonscan.com/address/0x5d0a9933D779265B67429147184261eB7163370b) and [Forwarder](https://mumbai.polygonscan.com/address/0x2d7FCbBfe773c5E7C7fccbA8434386048267c16D) and [Bypass Forwarder](https://mumbai.polygonscan.com/address/0xF7544C67e382230B2732C8360BfAEeAE840C8b1e) and [TestERC20](https://mumbai.polygonscan.com/address/0x4e5a86E128f8Fb652169f6652e2Cd17aAe409e96).

Accounts:
[Fiat-to-NFT Service](https://mumbai.polygonscan.com/address/0xD2B94CBF0fFAA9bc07126ab53f980Cd95a5Ed243) (
see [dev_setup](scripts/dev_setup.js)).
No Meta-tx Relayer Account yet.
[Admin](https://mumbai.polygonscan.com/address/0x63846e2D234e4F854F43423014430b4e131f697b).


### 2021-11-08: CID Attachments

- Attach arbitrary objects to NFTs.

NFTAttachment commit 89696561 deployed for Freeport version 2021-09-13 and 2021-11-03 below.

### 2021-11-04: Auction with getter

- Add the getter for bids (sellerNftBids).
- Prevent potential reentrancy bug.

SimpleAuction commit a74e4db0 deployed for Freeport version 2021-09-13 and 2021-11-03 below.

### 2021-11-03: Auction with royalties (dev deployment)

- Auction sales now capture royalties, if any.

Commit 6df6c349 deployed on Polygon Mumbai.

Contracts [Freeport](https://mumbai.polygonscan.com/address/0xd1EdBAC660307c5B6d22E678FB5e22668C70Ad96) and
[Fiat Gateway](https://mumbai.polygonscan.com/address/0x1f8eC932B6ec39A0326b74E9648A158F88B24082) and [Simple Auction](https://mumbai.polygonscan.com/address/0xd7cd23C84F9109F57f13eF28319e8787628DD7ad) and [NFT Attachment](https://mumbai.polygonscan.com/address/0x270693f873287a39172856Ad8cfbCd79b040b287).

[Fiat-to-NFT Service Account](https://mumbai.polygonscan.com/address/0xD2B94CBF0fFAA9bc07126ab53f980Cd95a5Ed243) (
see [dev_setup](scripts/dev_setup.js)).
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

[Fiat-to-NFT Service Account](https://mumbai.polygonscan.com/address/0x53B53189e668dC2ee3bA7A44Bb033E60F400d395) (
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
`docker run -d -p 8545:8545 524725240689.dkr.ecr.us-west-2.amazonaws.com/crb-davinci-nft-test:latest --db /app/db --mnemonic $MNEMONIC --networkId $NETWORK_ID`

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
For this service you need to create image locally and tag it with tag `524725240689.dkr.ecr.us-west-2.amazonaws.com/crb-davinci-nft-test:YOUR_CUSTOM_TAG`
and use `YOUR_CUSTOM_TAG` for running e2e-tests locally.

## Where to check the e2e-tests result after merge in dev?
After merge in develop, make sure that tests passed in **@e2e-test-results** channel on Cere Slack.
