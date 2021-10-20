pragma solidity ^0.8.0;

import "./SimpleExchange.sol";


/**
- Make offers to sell NFTs by auction.
- Bid.
- Settle the sale.
- Capture variable royalties.
 */
abstract contract SimpleAuction is SimpleExchange {

    struct Bid {
        address buyer; // 0 means no buyer yet.
        uint256 price; // The highest bid price. The initial value is set by the seller.
        uint256 closeTimeSec;
    }

    /** Seller => NFT ID => Bid.
     */
    mapping(address => mapping(uint256 => Bid)) sellerNftBids;

    /**
     */
    event StartAuction(
        address indexed seller,
        uint256 indexed nftId,
        uint256 price,
        uint256 closeTimeSec);

    /**
     */
    event BidOnAuction(
        address indexed seller,
        uint256 indexed nftId,
        uint256 price,
        uint256 closeTimeSec,
        address buyer);

    /**
     */
    event SettleAuction(
        address indexed seller,
        uint256 indexed nftId,
        uint256 price,
        address buyer); // buyer == 0 means no buyer, and the NFT went back to the seller.

    /**
     */
    function startAuction(uint256 nftId, uint256 minPrice, uint closeTimeSec)
    public {
        address seller = _msgSender();
        require(block.timestamp < closeTimeSec, "the close time must be in the future");

        // Deduce the minimum increment to work with the logic of minPrice in the function bid().
        uint256 price = minPrice * 100 / 110;
        require(price > 0, "the starting price must be greater than 0");

        sellerNftBids[seller][nftId] = Bid(address(0), price, closeTimeSec);

        // Take the NFT from the seller. This verifies the intent of the seller.
        safeTransferFrom(seller, address(this), nftId, 1, "");

        emit StartAuction(seller, nftId, price, closeTimeSec);
    }

    /**
     */
    function bidOnAuction(address seller, uint256 nftId, uint256 price)
    public {
        address buyer = _msgSender();

        Bid storage bid = sellerNftBids[seller][nftId];

        // Check that the auction is open.
        require(block.timestamp < bid.closeTimeSec, "the auction must be open");

        // Push back the end of the auction if it is too close.
        if (bid.closeTimeSec < block.timestamp + 10 * 60) {
            bid.closeTimeSec += 10 * 60;
        }

        // Check that the new bid is sufficiently large.
        uint256 previousDeposit = bid.price;
        uint minPrice = previousDeposit * 110 / 100;
        require(price >= minPrice, "a new bid must be 10% greater than the current bid");

        // Refund the previous buyer.
        address previousBuyer = bid.buyer;
        if (previousBuyer != address(0)) {
            _forceTransferCurrency(address(this), previousBuyer, previousDeposit);
        }

        // Take the new deposit from the new buyer. This verifies the intent of the buyer.
        bid.buyer = buyer;
        bid.price = price;
        safeTransferFrom(buyer, address(this), CURRENCY, price, "");
        // TODO: make "this" a ERC1155 receiver contract.

        emit BidOnAuction(seller, nftId, price, bid.closeTimeSec, buyer);
    }

    function settleAuction(address seller, uint256 nftId)
    public {
        Bid storage bid = sellerNftBids[seller][nftId];

        // Check that the auction exists.
        require(bid.closeTimeSec != 0, "the auction must exist");

        // Check that the auction is closed.
        require(bid.closeTimeSec <= block.timestamp, "the auction must be closed");

        address buyer = bid.buyer;
        uint256 price = bid.price;

        if (buyer != address(0)) {
            // In case there was a buyer,
            // transfer the payment to the seller.
            _forceTransferCurrency(address(this), seller, price);

            // Transfer the NFT to the buyer.
            _forceTransfer(address(this), buyer, nftId, 1);

            // TODO: collect royalty.
        } else {
            // Otherwise, there was no buyer,
            // give back the NFT to the seller.
            _forceTransfer(address(this), seller, nftId, 1);
        }

        // Reset the storage. Make the auction not exist anymore.
        bid.buyer = address(0);
        bid.price = 0;
        bid.closeTimeSec = 0;

        emit SettleAuction(seller, nftId, price, buyer);
    }
}
