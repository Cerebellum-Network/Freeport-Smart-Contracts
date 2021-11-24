## Contract `SimpleExchange`

- Make offers to sell NFTs.
- Accept offer.
- Capture variable royalties.




#### `makeOffer(uint256 nftId, uint256 price)` (public)

Create an offer to sell a type of NFTs for a price per unit.
All the NFTs of this type owned by the caller will be for sale.

To cancel, call again with a price of 0.



#### `getOffer(address seller, uint256 nftId) → uint256` (public)

Return the price offered by the given seller for the given NFT type.



#### `takeOffer(address buyer, address seller, uint256 nftId, uint256 expectedPriceOrZero, uint256 amount)` (public)

Accept an offer, paying the price per unit for an amount of NFTs.

The offer must have been created beforehand by makeOffer.

The same authorization as safeTransferFrom apply to the buyer (sender or approved operator).

The parameter expectedPriceOrZero can be used to validate the price that the buyer expects to pay. This prevents
a race condition with makeOffer or setExchangeRate. Pass 0 to disable this validation and accept any current price.



#### `_mathIsSafe()` (internal)

Guarantee that a version of Solidity with safe math is used.




#### `MakeOffer(address seller, uint256 nftId, uint256 price)` (event)

An event emitted when an account `seller` has offered to sell a type of NFT
at a given price.

This replaces previous offers by the same seller on the same NFT ID, if any.
A price of 0 means "no offer" and the previous offer is cancelled.

An offer does not imply that the seller owns any amount of this NFT.
An offer remains valid until cancelled, for the entire balance at a given time,
regardless of incoming and outgoing transfers on the seller account.



#### `TakeOffer(address buyer, address seller, uint256 nftId, uint256 price, uint256 amount)` (event)

An offer of `seller` was taken by `buyer`.
The transfers of `amount` NFTs of type `nftId`
against `amount * price` of CERE Units were executed.



