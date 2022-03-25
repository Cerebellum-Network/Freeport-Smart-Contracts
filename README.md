# Freeport Smart Contracts

## Introduction

A set of contracts to hold NFTs, capture royalties, and subscribe to services.

See [Freeport.sol](contracts/Freeport.sol).

See the [documentation](docs/Freeport.md) (regenerate with `npm run doc`).

## Deployments


#### v2.0.0 on Polygon (Production)

Contracts: [Freeport](https://polygonscan.com/address/0xf9AC6022F786f6f64Fd8abf661190b8517D92396) and
[Fiat Gateway](https://polygonscan.com/address/0x4478e3B0B71531DAc9d0ECe9357eBB0043669804)
and [Simple Auction](https://polygonscan.com/address/0xf6a530242B233B1b4208c449D6C72FB7c6133cC0)
and [NFT Attachment](https://polygonscan.com/address/0x651f2C6942F1c290632Ad5bB61D9ece789f82f35)
and [USDC ERC20](https://polygonscan.com/address/0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174).

Accounts:
[Fiat-to-NFT Service](https://polygonscan.com/address/0x2352f1167F1c1c5273bB64a1FEEAf9dF49702A19) (
see [prod_setup](scripts/prod_setup.js)). Biconomy enabled.
[Admin](https://polygonscan.com/address/0x87A0892F98914c567379475a806A1419143406F6).

#### v2.0.0 on Polygon Mumbai testnet (Staging)

Contracts: [Freeport](https://mumbai.polygonscan.com/address/0xacd8105cBA046307d2228794ba2F81aA15e82E0D) and
[Fiat Gateway](https://mumbai.polygonscan.com/address/0xe25b31Aa454E28110E28C694ded69cD241A27Db1)
and [Simple Auction](https://mumbai.polygonscan.com/address/0x71091eA5466E3Ca50971bd51c11069e5629a49dB)
and [NFT Attachment](https://mumbai.polygonscan.com/address/0x84766787c6b9131927A76634F7DDCfcf3ff2e9d1)
and [TestERC20](https://mumbai.polygonscan.com/address/0x93E73E25F290f8A50281A801109f75CB4E8e3233).

Accounts:
[Fiat-to-NFT Service](https://mumbai.polygonscan.com/address/0x53B53189e668dC2ee3bA7A44Bb033E60F400d395) (
see [stage_setup](scripts/stage_setup.js)). Biconomy enabled.
[Admin](https://mumbai.polygonscan.com/address/0x63846e2D234e4F854F43423014430b4e131f697b).

#### v2.0.0 on Polygon Mumbai testnet (Dev)

Contracts: [Freeport](https://mumbai.polygonscan.com/address/0x702BA959B5542B2Bf88a1C5924F73Ed97482c64B) and
[Fiat Gateway](https://mumbai.polygonscan.com/address/0x106Bf3D61952faE9279B08bdcB2e548316E0C1Ae)
and [Simple Auction](https://mumbai.polygonscan.com/address/0xCEAc6c102bEcE4ed2E5ede9df096F7175BB8CbaD)
and [NFT Attachment](https://mumbai.polygonscan.com/address/0x39B27a0bc81C1366E2b05E02642Ef343a4f9223a)
and [TestERC20](https://mumbai.polygonscan.com/address/0x4e5a86E128f8Fb652169f6652e2Cd17aAe409e96).

Accounts:
[Fiat-to-NFT Service](https://mumbai.polygonscan.com/address/0xD2B94CBF0fFAA9bc07126ab53f980Cd95a5Ed243) (
see [dev_setup](scripts/dev_setup.js)). Biconomy enabled.
[Admin](https://mumbai.polygonscan.com/address/0x63846e2D234e4F854F43423014430b4e131f697b).

#### v2.1.0 on Polygon Mumbai (Experiment @AlekseiMisyukevich)

Contracts: [Freeport](https://mumbai.polygonscan.com/address/0xD6e5Ce841f2C044b552DF862Dfb1D936070FC5c6) and
[Fiat Gateway](https://mumbai.polygonscan.com/address/0x6546CB4776cF16f565c7D0E38c7ef85534eAE689)
and [Simple Auction](https://mumbai.polygonscan.com/address/0xC4820D5983122618Ef4aBEA9Dc429111e7802003)
and [NFT Attachment](https://mumbai.polygonscan.com/address/0x8001f8229E67Ed35A04fE2A6cA92D28feCD2D85b)
and [TestERC20](https://mumbai.polygonscan.com/address/0x2C390FAB1c3568F783aDEb31F88E1c207ca1E721).

Accounts:
[Fiat-to-NFT Service](https://mumbai.polygonscan.com/address/0xD2B94CBF0fFAA9bc07126ab53f980Cd95a5Ed243) (
see [dev_setup](scripts/dev_setup.js)). Biconomy enabled.
[Admin](https://mumbai.polygonscan.com/address/0x63846e2D234e4F854F43423014430b4e131f697b).

## How to upgrade

Review all code changes since the last deployed release. Understand how upgradeable contracts work (see [doc](https://docs.openzeppelin.com/upgrades-plugins/1.x/writing-upgradeable)). Pay attention to:
- Events: make sure the event listeners are upgraded to support **both new and old** versions of events at the same time.
- Structure changes: make sure existing fields do not change in any way, only new fields are added.
- Existing data: the existing objects in the contract will have a zero value for new fields; make sure the code handles this correctly.
- Functions: make sure that no public function was removed or signature changed.
- Initialization: if a new feature requires some initialization, make sure this happens in a new `initialize_vX.X.X` function, and that this function is called during the upgrade (example: [initialize_v2_0_0](https://github.com/Cerebellum-Network/Freeport-Smart-Contracts/blob/bc0aae14cc6d0dbbdb3656b6aba6e15085b03fbf/migrations/9_upgrade_auction.js#L13)).
- Unit tests: understand what behavior changed.

Bump the version, maintain [CHANGELOG.md](CHANGELOG.md), and create a release in github.

Choose a [migration script](migrations/) depending on which contract to upgrade (e.g.: N=8). For the DEV environment, you need to edit the addresses in `build/*.json`. Then run:

    npm run test
    export MNEMONIC="  …mnemonic of a wallet that is admin…  "
    truffle migrate --compile-all --network=polygon_testnet -f N --to N

Release the JS SDK (see [instructions](https://github.com/Cerebellum-Network/Freeport-Smart-Contracts-SDK#publishing-to-npm)).

## How to deploy

    npm test
    npm run migrate --network=polygon_testnet

Write down the contract address and current version in the Releases section above.

Commit these files in `build/contracts/`: `Freeport.json`, `FiatGateway.json`, `SimpleAuction.json`
, `NFTAttachment.json`.

For **dev** on Polygon testnet, setup test accounts:

    truffle exec scripts/dev_setup.js --network=polygon_testnet

For **staging** on Polygon testnet, setup test accounts:

    truffle exec scripts/stage_setup.js --network=polygon_testnet

The script will print the address of the different accounts, including the fiat-to-nft service account.

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

1. Open [SDK](https://github.com/Cerebellum-Network/Freeport-Smart-Contracts-SDK) project in IDE, switch to master
   branch
2. Copy smart-contract artifacts from `/build/contracts` to SDK's `/src/artifacts`
3. Run `yarn update-types`
4. Commit changes with message like *"artifacts from commit e57691bc"*
5. Check that `npm whoami` returns "cere-io" (otherwise update your NPM_TOKEN env var for publishing @cere packages)
6. Run `yarn deploy` and publish next version (
   see [Versioning](https://github.com/Cerebellum-Network/Freeport-Smart-Contracts-SDK#versioning))
7. Push changes to the remote branch
8. Install the new version of SDK in projects that use it

## How to run e2e test locally

Readme.md for running e2e-test locally
is [here](https://github.com/Cerebellum-Network/e2e-tests/blob/master/README.md#how-to-run-e2e-tests-locally). For this
service you need to create image locally and tag it with
tag `524725240689.dkr.ecr.us-west-2.amazonaws.com/crb-davinci-nft-test:YOUR_CUSTOM_TAG`
and use `YOUR_CUSTOM_TAG` for running e2e-tests locally.

## Where to check the e2e-tests result after merge in dev?

After merge in develop, make sure that tests passed in **@e2e-test-results** channel on Cere Slack.
