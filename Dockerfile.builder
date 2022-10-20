FROM node:16.4.2-alpine as builder
LABEL maintainer="team@cere.network"
LABEL description="This is the build stage install all dependecies"

WORKDIR /davinci_nft
COPY . /davinci_nft

# Install truffle globally and all dependencies
RUN npm install -g truffle@5.4.7
RUN npm install

# Compile polygon
RUN npm run compile

FROM trufflesuite/ganache-cli:v6.12.2 as runtime
COPY --from=builder /davinci_nft /app/davinci_nft
RUN cd /app/davinci_nft && npm install -g truffle@5.4.7
