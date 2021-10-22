## Contract `SimpleAuction`

An auction is characterized by a sequence of transactions and their corresponding events:

- `StartAuction`: A seller offers to sell one NFT to the highest bidder, with a minimum price, and a closing time.

- Any number of `BidOnAuction`: A potential buyer accepts the minimum price or a price at least 10% higher
than that of the previous bidder.
The closing time may be extended.
A deposit is taken from the new bidder. The deposit of the previous bidder is returned, if any.
Bidding is no longer possible after the closing time.

- `SettleAuction`: The sale is completed between the seller and the highest bidder, or cancelled if there was no bidder.
Some royalties may be taken from the sale price, as configured by the NFT creator (see `TransferFees.sol`).
The settlement is only possible after the closing time.

While an auction is active, it is identified by the tuple `(seller address, NFT ID)`.
However, after the auction is settled, a new auction with the *same tuple* may start.




#### `supportsInterface(bytes4 interfaceId) → bool` (public)

Supports interfaces of AccessControl and ERC1155Receiver.



#### `constructor(contract Davinci _davinci)` (public)

This contract must have the TRANSFER_OPERATOR role in the Davinci contract.



#### `startAuction(uint256 nftId, uint256 minPrice, uint256 closeTimeSec)` (public)





#### `bidOnAuction(address seller, uint256 nftId, uint256 price)` (public)





#### `settleAuction(address seller, uint256 nftId)` (public)






#### `StartAuction(address seller, uint256 nftId, uint256 price, uint256 closeTimeSec)` (event)

Note: `price` is the minimum price minus 10%, because a bid must be 10% higher, resulting in the requested minimum price.



#### `BidOnAuction(address seller, uint256 nftId, uint256 price, uint256 closeTimeSec, address buyer)` (event)

Note: `price`, `closeTimeSec`, and `buyer` may have changed for the auction `(seller, nftId)`.



#### `SettleAuction(address seller, uint256 nftId, uint256 price, address buyer)` (event)

Note: `buyer == 0` means no buyer, and the NFT went back to the seller.



