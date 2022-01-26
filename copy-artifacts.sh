#!/usr/bin/env bash

export dir_path_to="${1:-./artifacts}"
docker pull 524725240689.dkr.ecr.us-west-2.amazonaws.com/crb-davinci-nft-test:latest
id=$(docker create "524725240689.dkr.ecr.us-west-2.amazonaws.com/crb-davinci-nft-test:latest")
docker cp "$id":/app "$dir_path_to"
docker rm -v "$id"
