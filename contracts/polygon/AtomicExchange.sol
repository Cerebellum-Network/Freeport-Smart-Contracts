pragma solidity ^0.8.0;

import "./TransferFees.sol";

/**
- Owner creates an offer to sell NFTs.
- Buyer pays and receives the NFT.

- TODO: Support for single transaction compatible with OpenSea / Wyvern Protocol (using a signature from the seller).
*/
contract AtomicExchange is TransferFees {

    /** Seller => NFT ID => Price => Remaining amount offered.
     */
    mapping(address => mapping(uint256 => mapping(uint256 => uint256))) sellerNftPriceOffers;

    /** Create an offer to sell an amount of NFTs for a price per unit.
     *
     * To cancel, call again with an amount of 0.
     */
    function offerToSell(uint256 nftId, uint256 price, uint256 amount)
    public {
        address seller = _msgSender();
        sellerNftPriceOffers[seller][nftId][price] = amount;
    }

    /** Accept an offer, paying the price per unit for an amount of NFTs.
     *
     * The offer must have been created beforehand by offerToSell.
     */
    function buyOffer(address seller, uint256 nftId, uint256 price, uint256 amount)
    public {
        // Check and update the amount offered.
        sellerNftPriceOffers[seller][nftId][price] -= amount;

        address buyer = _msgSender();

        // Pay.
        _forceTransfer(buyer, seller, CURRENCY, price * amount);

        // Get NFTs.
        _forceTransfer(seller, buyer, nftId, amount);

        _captureFee(seller, nftId, price, amount);
    }

    /** Accept an offer, paying the price per unit for an amount of NFTs.
     *
     * The offer is proved using sellerSignature generated offchain.
     *
     * [Not implemented]
     */
    function buySignedOffer(uint256 nftId, uint256 price, uint256 amount, bytes memory sellerSignature)
    public {
        revert("not implemented");
    }

    /** Guarantee that a version of Solidity with safe math is used.
     */
    function _mathIsSafe() internal pure {
    unchecked {} // Use a keyword from Solidity 0.8.0.
    }
}