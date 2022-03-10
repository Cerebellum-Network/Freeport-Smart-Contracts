pragma solidity ^0.8.0;

import "./freeportParts/MetaTxContext.sol";
import "./Freeport.sol";
import "./SignatureVerifier.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/utils/ERC1155HolderUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/**
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

This contract is not meant to be used from another contract; if it is,
it will not call onERC1155Received hooks for security reasons.

This contract must have the TRANSFER_OPERATOR role in the Freeport contract.
 */
contract SimpleAuction is /* AccessControl, */ MetaTxContext, ERC1155HolderUpgradeable, SignatureVerifier {

    /** Supports interfaces of AccessControl and ERC1155Receiver.
     */
    function supportsInterface(bytes4 interfaceId)
    public view virtual override(AccessControlUpgradeable, ERC1155ReceiverUpgradeable) returns (bool) {
        return AccessControlUpgradeable.supportsInterface(interfaceId)
        || ERC1155ReceiverUpgradeable.supportsInterface(interfaceId);
    }

    Freeport public freeport;

    /** Initialize this contract and its dependencies.
     */
    function initialize(Freeport _freeport) public initializer {
        __MetaTxContext_init();
        __ERC1155Holder_init();
        __SignatureVerifier_init();
        freeport = _freeport;
    }

    /** Initialize this contract after version 2.0.0.
     *
     * Allow deposit of USDC into Freeport.
     */
    function initialize_v2_0_0() public {
        IERC20 erc20 = freeport.currencyContract();

        bool init = erc20.allowance(address(this), address(freeport)) > 0;
        if (init) return;

        uint256 maxInt = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;
        erc20.approve(address(freeport), maxInt);
    }

    /** The token ID that represents the CERE currency for all payments in this contract. */
    uint256 public constant CURRENCY = 0;

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
        address buyer,
        bool secured);

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

    /**
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

    /**
     */
    function bidOnSecuredAuction(address seller, uint256 nftId, uint256 price, bytes memory signature)
    public {
        address buyer = _msgSender();
        Bid storage bid = sellerNftBids[seller][nftId];
        
        if (bid.secured) {
            address verifier = recoverAddressFromSignature(buyer, nftId, signature);
            require(hasRole(BUY_AUTHORIZER_ROLE, verifier), "Authroizer doesn't have a role");        
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
        
        emit BidOnAuction(seller, nftId, price, bid.closeTimeSec, buyer, bid.secured);
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

            // Collect royalty.
            try freeport.captureFee(seller, nftId, price, 1) {
            } catch {}
        } else {
            // Otherwise, there was no buyer,
            // give back the NFT to the seller.
            freeport.transferFrom(address(this), seller, nftId, 1);
        }

        emit SettleAuction(seller, nftId, price, buyer);
    }

    /** Take USDC as deposit.
     */
    function _takeDeposit(
        address from,
        uint amount
    ) internal {
        freeport.currencyContract().transferFrom(from, address(this), amount);
    }

    /** Return the USDC deposit.
     */
    function _returnDeposit(
        address to,
        uint amount
    ) internal {
        freeport.currencyContract().transfer(to, amount);
    }

    /** Convert the USDC deposit into Freeport-USDC and pay out to the seller.
     *
     * This supports joint accounts and royalties (captureFee).
     */
    function _finalizePayment(
        address to,
        uint amount
    ) internal {
        freeport.deposit(amount);
        freeport.transferFrom(address(this), to, CURRENCY, amount);
    }
}
