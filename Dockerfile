FROM node:alpine as builder
LABEL maintainer="team@cere.network"
LABEL description="This is the build stage install all dependecies"
WORKDIR /davinci_nft
COPY . /davinci_nft
# Install ganache-cli globally and all dependecies
RUN npm install -g truffle ganache-cli
RUN npm install
# Compile polygon
RUN npm run compile

FROM trufflesuite/ganache-cli:latest as runtime
COPY --from=builder /davinci_nft /app/davinci_nft
RUN cd /app/davinci_nft && npm install -g truffle
