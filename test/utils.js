import { version } from "../package.json";

export const typedData = (addr, nftId) => ({
  domain: {
    name: "Freeport",
    version: version
  },
  types: {
    Bid: [
      {
        name: 'seller',
        type: 'address'
      },
      {
        name: 'nftId',
        type: 'uint'
      }      
    ]
  },
  data: {
    buyer: {
      seller: addr,
      nftId: nftId
    }
  }
});
