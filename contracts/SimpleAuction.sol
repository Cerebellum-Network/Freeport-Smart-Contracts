pragma solidity ^0.8.0;

import "./davinciParts/MetaTxContext.sol";
import "./Davinci.sol";
import "./token/ERC1155/utils/ERC1155Holder.sol";


/**
- Make offers to sell NFTs by auction.
- Bid.
- Settle the sale.
- Capture variable royalties.
 */
contract SimpleAuction is /* AccessControl, */ MetaTxContext, ERC1155Holder {

    /** Supports interfaces of AccessControl and ERC1155Receiver.
     */
    function supportsInterface(bytes4 interfaceId)
    public view virtual override(AccessControl, ERC1155Receiver) returns (bool) {
        return AccessControl.supportsInterface(interfaceId)
        || ERC1155Receiver.supportsInterface(interfaceId);
    }

    Davinci public davinci;

    /** This contract must have the TRANSFER_OPERATOR role in the Davinci contract.
     */
    constructor(Davinci _davinci) {
        davinci = _davinci;
    }

    /** The token ID that represents the CERE currency for all payments in this contract. */
    uint256 public constant CURRENCY = 0;

    struct Bid {
        address buyer; // 0 means no buyer yet.
        uint256 price; // The highest bid price. The initial value is set by the seller.
        uint256 closeTimeSec; // Bidding is open until the close time. After this time, the settlement becomes possible. A non-zero value also means that the auction exists.
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
        Bid storage bid = sellerNftBids[seller][nftId];

        // Check that the auction does not exist.
        require(bid.closeTimeSec == 0, "the auction must not exist");

        // Check that the close time is non-zero and in the future.
        require(block.timestamp < closeTimeSec, "the close time must be in the future");

        // Deduct the minimum increment to work with the logic of minPrice in the function bid().
        uint256 price = minPrice * 100 / 110;
        require(price > 0, "the starting price must be greater than 0");

        // TODO: Check that minPrice is greater than the fixed royalty, if any.

        // Create the auction.
        bid.buyer = address(0);
        bid.price = price;
        bid.closeTimeSec = closeTimeSec;

        // Take the NFT from the seller.
        davinci.safeTransferFrom(seller, address(this), nftId, 1, "");

        emit StartAuction(seller, nftId, price, closeTimeSec);
    }

    /**
     */
    function bidOnAuction(address seller, uint256 nftId, uint256 price)
    public {
        address buyer = _msgSender();
        Bid storage bid = sellerNftBids[seller][nftId];

        // Check that the auction exists and is open.
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
            davinci.safeTransferFrom(address(this), previousBuyer, CURRENCY, previousDeposit, "");
        }

        // Take the new deposit from the new buyer.
        bid.buyer = buyer;
        bid.price = price;
        davinci.safeTransferFrom(buyer, address(this), CURRENCY, price, "");

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
            davinci.safeTransferFrom(address(this), seller, CURRENCY, price, "");

            // Transfer the NFT to the buyer.
            davinci.safeTransferFrom(address(this), buyer, nftId, 1, "");

            // Collect royalty.
            // TODO: uncomment, requires a deployment of Davinci with public captureFee().
            //davinci.captureFee(seller, nftId, price, 1);
        } else {
            // Otherwise, there was no buyer,
            // give back the NFT to the seller.
            davinci.safeTransferFrom(address(this), seller, nftId, 1, "");
        }

        // Reset the storage. Make the auction not exist anymore.
        bid.buyer = address(0);
        bid.price = 0;
        bid.closeTimeSec = 0;

        emit SettleAuction(seller, nftId, price, buyer);
    }
}