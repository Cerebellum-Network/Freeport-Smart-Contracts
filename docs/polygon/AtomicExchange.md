## Contract `AtomicExchange`

- Owner creates an offer to sell NFTs.
- Buyer pays and receives the NFT.

- TODO: Support for single transaction compatible with OpenSea / Wyvern Protocol (using a signature from the seller).




#### `offerToSell(uint256 nftId, uint256 price, uint256 amount)` (public)

Create an offer to sell an amount of NFTs for a price per unit.

To cancel, call again with an amount of 0.



#### `buyOffer(address seller, uint256 nftId, uint256 price, uint256 amount)` (public)

Accept an offer, paying the price per unit for an amount of NFTs.

The offer must have been created beforehand by offerToSell.



#### `buySignedOffer(uint256 nftId, uint256 price, uint256 amount, bytes sellerSignature)` (public)

Accept an offer, paying the price per unit for an amount of NFTs.

The offer is proved using sellerSignature generated offchain.

[Not implemented]



#### `_mathIsSafe()` (internal)

Guarantee that a version of Solidity with safe math is used.




