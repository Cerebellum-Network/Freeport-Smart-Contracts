#!/usr/bin/env bash

export MNEMONIC="${1:-'spatial spin account funny glue cancel cushion twelve inmate author night dust'}"
export NETWORK_ID="${2:-5777}"
export NPM_CONFIG_NETWORK="${3:-development}"

#Run ganache
id=$(docker run -d \
  -p 8545:8545 \
  --network=bridge \
  -v "$PWD"/artifacts/db:/app/db \
  -v "$PWD"/artifacts/contracts:/app/davinci_nft/build/contracts \
  338287888375.dkr.ecr.us-west-2.amazonaws.com/crb-davinci-nft-test:builder \
  --db /app/db \
  --mnemonic "$MNEMONIC" \
  --networkId "$NETWORK_ID")

#Deploy contracts
docker exec "$id" sh -c "cd /app/davinci_nft && npm_config_network=$NPM_CONFIG_NETWORK npm run migrate"

#Create snapshot
curl -H "Content-Type: application/json" -X POST --data \
  '{"id":1337,"jsonrpc":"2.0","method":"evm_snapshot","params":[]}' \
  http://localhost:8545

#Run tests
docker exec "$id" sh -c "cd /app/davinci_nft && npm_config_network=$NPM_CONFIG_NETWORK npm run test"

#Revert to snapshot, after tests
curl -H "Content-Type: application/json" -X POST --data \
  '{"id":1337,"jsonrpc":"2.0","method":"evm_revert","params":["0x1"]}' \
  http://localhost:8545

#Create snapshot for test purposes
curl -H "Content-Type: application/json" -X POST --data \
  '{"id":1337,"jsonrpc":"2.0","method":"evm_snapshot","params":[]}' \
  http://localhost:8545

#Kill ganache docker container
docker kill "$id"
