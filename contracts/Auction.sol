pragma solidity ^0.8.0;

import "./auction/SignatureVerifier.sol";
import "./auction/AuctionBase.sol";

contract Auction is AuctionBase, SignatureVerifier {

    function initialize(Freeport freeport, address token) public initializer {
        __AuctionBase_init(freeport, token);
    }

	struct Bid {
    	address buyer; // 0 means no buyer yet.
    	uint256 price; // The highest bid price. The initial value is set by the seller.
    	uint256 closeTimeSec; // Bidding is open until the close time. After this time, the settlement becomes possible. A non-zero value also means that the auction exists.
    	bool secured;
	}

	/** Seller => NFT ID => Bid.
     */
    mapping(address => mapping(uint256 => Bid)) public sellerNftBids;

	/**
     * Note: `price` is the minimum price minus 10%, because a bid must be 10% higher, resulting in the requested minimum price.
     */
    event StartAuction(
        address indexed seller,
        uint256 indexed nftId,
        uint256 price,
        uint256 closeTimeSec,
        bool secured);

    /**
     * Note: `price`, `closeTimeSec`, and `buyer` may have changed for the auction `(seller, nftId)`.
     */
    event BidOnAuction(
        address indexed seller,
        uint256 indexed nftId,
        uint256 price,
        uint256 closeTimeSec,
        address buyer);

    /**
     * Note: `buyer == 0` means no buyer, and the NFT went back to the seller.
     */
    event SettleAuction(
        address indexed seller,
        uint256 indexed nftId,
        uint256 price,
        address buyer);

	function startAuction(uint256 nftId, uint256 minPrice, uint closeTimeSec) 
    public {
        startSecuredAuction(nftId, minPrice, closeTimeSec, false);
    }

    /** Starts auction that requires authorizing signature.
     */
    function startSecuredAuction(uint256 nftId, uint256 minPrice, uint closeTimeSec, bool secured)
    public {
        address seller = _msgSender();
        Bid storage bid = sellerNftBids[seller][nftId];

        // Cannot put the currency on auction.
        require(nftId != CURRENCY, "cannot auction currency");

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
        bid.secured = secured;

        // Take the NFT from the seller.
        // Use the TRANSFER_OPERATOR role.
        freeport.transferFrom(seller, address(this), nftId, 1);

        emit StartAuction(seller, nftId, price, closeTimeSec, secured);
    }

    function bidOnAuction(address seller, uint256 nftId, uint256 price) public {
        bidOnSecuredAuction(seller, nftId, price, "");
    }

    /** Accepts auction's participants bids 
     */
    function bidOnSecuredAuction(address seller, uint256 nftId, uint256 price, bytes memory signature)
    public {
        address buyer = _msgSender();
        Bid storage bid = sellerNftBids[seller][nftId];
        
        if (bid.secured) {
            address verifier = recoverAddressFromSignature(buyer, nftId, signature);
            require(hasRole(BUY_AUTHORIZER_ROLE, verifier), "Signature issuer hasn't specific role");        
        }

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
            _returnDeposit(previousBuyer, previousDeposit);
		}

        // Take the new deposit from the new buyer.
        bid.buyer = buyer;
        bid.price = price;
        _takeDeposit(buyer, price);
        
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

        // Reset the storage. Make the auction not exist anymore.
        bid.buyer = address(0);
        bid.price = 0;
        bid.closeTimeSec = 0;
        bid.secured = false;

        if (buyer != address(0)) {
            // In case there was a buyer,
            // transfer the payment to the seller.
            _finalizePayment(seller, price);
			
            // Transfer the NFT to the buyer.
            freeport.transferFrom(address(this), buyer, nftId, 1);
            (uint256 totalFee, address royaltyAccount) = freeport.calculateTotalRoyalties(seller, nftId, price, 1);
            // Collect royalty.
            try token.transferFrom(seller, royaltyAccount, totalFee) {
            } catch {}
        } else {
            // Otherwise, there was no buyer,
            // give back the NFT to the seller.
            freeport.transferFrom(address(this), seller, nftId, 1);
        }

        emit SettleAuction(seller, nftId, price, buyer);
    }

    /** Takes deposit in ERC20 from buyer.
     */
    function _takeDeposit(
        address from,
        uint amount
    ) internal {
		token.transferFrom(from, address(this), amount);
    }

    /** Returns deposit by address.
     */
    function _returnDeposit(
        address to,
        uint amount
    ) internal {     
		token.transfer(to, amount);
    }

    /** Pays out seller for sold item in ERC20.
     */
    function _finalizePayment(
        address to,
        uint amount
    ) internal {
        token.transferFrom(address(this), to, amount);
    }

}