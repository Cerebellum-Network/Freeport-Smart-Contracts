## Contract `SimpleExchange`

- Make offers to sell NFTs.
- Accept offer.
- Capture variable royalties.




#### `makeOffer(uint256 nftId, uint256 price)` (public)

Create an offer to sell a type of NFTs for a price per unit.
All the NFTs of this type owned by the caller will be for sale.

To cancel, call again with a price of 0.



#### `takeOffer(address buyer, address seller, uint256 nftId, uint256 price, uint256 amount)` (public)

Accept an offer, paying the price per unit for an amount of NFTs.

The offer must have been created beforehand by offerToSell.

The same authorization as safeTransferFrom apply to the buyer (sender or approved operator)..



#### `_mathIsSafe()` (internal)

Guarantee that a version of Solidity with safe math is used.




#### `MakeOffer(address seller, uint256 nftId, uint256 price)` (event)





#### `TakeOffer(address buyer, address seller, uint256 nftId, uint256 price, uint256 amount)` (event)





