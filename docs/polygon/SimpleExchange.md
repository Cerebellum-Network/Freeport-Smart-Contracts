## Contract `SimpleExchange`

- Make offers to sell NFTs.
- Accept offer.
- Capture variable royalties.




#### `makeOffer(uint256 nftId, uint256 price, uint256 amount)` (public)

Create an offer to sell an amount of NFTs for a price per unit.

To cancel, call again with an amount of 0.



#### `takeOffer(address seller, uint256 nftId, uint256 price, uint256 amount)` (public)

Accept an offer, paying the price per unit for an amount of NFTs.

The offer must have been created beforehand by offerToSell.



#### `_mathIsSafe()` (internal)

Guarantee that a version of Solidity with safe math is used.




#### `MakeOffer(address seller, uint256 nftId, uint256 price, uint256 amount)` (event)





#### `TakeOffer(address buyer, address seller, uint256 nftId, uint256 price, uint256 amount)` (event)





