pragma solidity ^0.8.0;

import "./TransferFees.sol";


/**
- Make offers to sell NFTs.
- Accept offer.
- Capture variable royalties.
 */
abstract contract SimpleExchange is TransferFees {

    /** Seller => NFT ID => Price => Remaining amount offered.
     */
    mapping(address => mapping(uint256 => mapping(uint256 => uint256))) sellerNftPriceOffers;

    /** Create an offer to sell an amount of NFTs for a price per unit.
     *
     * To cancel, call again with an amount of 0.
     */
    function makeOffer(uint256 nftId, uint256 price, uint256 amount)
    public {
        address seller = _msgSender();
        sellerNftPriceOffers[seller][nftId][price] = amount;
    }

    /** Accept an offer, paying the price per unit for an amount of NFTs.
     *
     * The offer must have been created beforehand by offerToSell.
     */
    function takeOffer(address seller, uint256 nftId, uint256 price, uint256 amount)
    public {
        // Check and update the amount offered.
        sellerNftPriceOffers[seller][nftId][price] -= amount;

        address buyer = _msgSender();

        // Pay.
        uint totalPrice = price * amount;
        _forceTransferCurrency(buyer, seller, totalPrice);

        // Take a fee from the seller (really a cut of the above payment).
        uint totalFee = _captureFee(seller, nftId, price, amount);
        require(totalFee <= totalPrice, "Cannot take more fees than the price.");

        // Move the NFTs to the buyer.
        _forceTransfer(seller, buyer, nftId, amount);
    }

    /** Guarantee that a version of Solidity with safe math is used.
     */
    function _mathIsSafe() internal pure {
    unchecked {} // Use a keyword from Solidity 0.8.0.
    }
}