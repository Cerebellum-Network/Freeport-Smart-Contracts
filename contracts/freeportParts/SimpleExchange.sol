pragma solidity ^0.8.0;

import "./TransferFees.sol";


/**
- Make offers to sell NFTs.
- Accept offer.
- Capture variable royalties.
 */
abstract contract SimpleExchange is TransferFees {
    function __SimpleExchange_init() internal {
        __TransferFees_init();
    }

    /** Seller => NFT ID => Price.
     */
    mapping(address => mapping(uint256 => uint256)) sellerNftPriceOffers;

    /** An event emitted when an account `seller` has offered to sell a type of NFT
     * at a given price.
     *
     * This replaces previous offers by the same seller on the same NFT ID, if any.
     * A price of 0 means "no offer" and the previous offer is cancelled.
     *
     * An offer does not imply that the seller owns any amount of this NFT.
     * An offer remains valid until cancelled, for the entire balance at a given time,
     * regardless of incoming and outgoing transfers on the seller account.
     */
    event MakeOffer(
        address indexed seller,
        uint256 indexed nftId,
        uint256 price);

    /** An offer of `seller` was taken by `buyer`.
     * The transfers of `amount` NFTs of type `nftId`
     * against `amount * price` of CERE Units were executed.
     */
    event TakeOffer(
        address indexed buyer,
        address indexed seller,
        uint256 indexed nftId,
        uint256 price,
        uint256 amount);

    /** Create an offer to sell a type of NFTs for a price per unit.
     * All the NFTs of this type owned by the caller will be for sale.
     *
     * To cancel, call again with a price of 0.
     */
    function makeOffer(uint256 nftId, uint256 price)
    public {
        address seller = _msgSender();
        sellerNftPriceOffers[seller][nftId] = price;

        emit MakeOffer(seller, nftId, price);
    }

    /** Return the price offered by the given seller for the given NFT type.
     */
    function getOffer(address seller, uint256 nftId)
    public view returns (uint256) {
        uint price = sellerNftPriceOffers[seller][nftId];
        return price;
    }

    /** Accept an offer, paying the price per unit for an amount of NFTs.
     *
     * The offer must have been created beforehand by makeOffer.
     *
     * The buyer receives the NFT.
     * The sender pays the seller. The sender is not necessarily the same as buyer, see FiatGateway.
     * The same authorization as safeTransferFrom apply to the caller (sender or approved operator).
     *
     * The parameter expectedPriceOrZero can be used to validate the price that the buyer expects to pay. This prevents
     * a race condition with makeOffer or setExchangeRate. Pass 0 to disable this validation and accept any current price.
     */
    function takeOffer(address buyer, address seller, uint256 nftId, uint256 expectedPriceOrZero, uint256 amount)
    public {
        address payer = _msgSender();

        // Check and update the amount offered.
        uint256 price = sellerNftPriceOffers[seller][nftId];
        require(price != 0, "Not for sale");
        require(expectedPriceOrZero == 0 || expectedPriceOrZero == price, "Unexpected price");

        // Pay. This verifies the intent of the payer.
        uint totalPrice = price * amount;
        safeTransferFrom(payer, seller, CURRENCY, totalPrice, "");

        // Take a fee from the seller (really a cut of the above payment).
        uint totalFee = _captureFee(seller, nftId, price, amount);
        require(totalFee <= totalPrice, "Cannot take more fees than the price.");

        // Move the NFTs to the buyer.
        _forceTransfer(seller, buyer, nftId, amount);

        emit TakeOffer(buyer, seller, nftId, price, amount);
    }

    /** Guarantee that a version of Solidity with safe math is used.
     */
    function _mathIsSafe() internal pure {
    unchecked {} // Use a keyword from Solidity 0.8.0.
    }
}
