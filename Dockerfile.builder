FROM node:12.18.4-alpine as builder
LABEL maintainer="team@cere.network"
LABEL description="This is the build stage install all dependecies"

WORKDIR /davinci_nft
COPY . /davinci_nft

RUN apt-get update && \
      apt-get -y install sudo

RUN useradd -m docker && echo "docker:docker" | chpasswd && adduser docker sudo

USER docker

# Install truffle globally and all dependencies
RUN npm install -g truffle@5.4.7
RUN npm install

# Compile polygon
RUN npm run compile

FROM trufflesuite/ganache-cli:v6.12.2 as runtime
COPY --from=builder /davinci_nft /app/davinci_nft
RUN cd /app/davinci_nft && npm install -g truffle@5.4.7
