pragma solidity ^0.8.0;

import "./TransferFees.sol";


/**
- Make offers to sell NFTs.
- Accept offer.
- Capture variable royalties.
 */
abstract contract SimpleExchange is TransferFees {

    /** Seller => NFT ID => Price.
     */
    mapping(address => mapping(uint256 => uint256)) sellerNftPriceOffers;

    event MakeOffer(
        address indexed seller,
        uint256 indexed nftId,
        uint256 price);

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

    /** Accept an offer, paying the price per unit for an amount of NFTs.
     *
     * The offer must have been created beforehand by offerToSell.
     *
     * The same authorization as safeTransferFrom apply to the buyer (sender or approved operator)..
     */
    function takeOffer(address buyer, address seller, uint256 nftId, uint256 price, uint256 amount)
    public {
        // Check and update the amount offered.
        uint256 expectedPrice = sellerNftPriceOffers[seller][nftId];
        require(expectedPrice != 0, "Not for sale");
        require(price == expectedPrice, "Wrong price");

        // Pay. This verifies the intent of the buyer
        uint totalPrice = price * amount;
        safeTransferFrom(buyer, seller, CURRENCY, totalPrice, "");

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