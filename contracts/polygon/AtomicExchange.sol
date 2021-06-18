pragma solidity ^0.8.0;

import "./DavinciNFT.sol";

/**
- Owner creates an offer to sell NFTs.
- Buyer pays and receives the NFT.

- Nice-to-have: Support for single transaction using a signature from the seller.
*/
contract AtomicExchange is DavinciNFT {

    // Seller => NFT ID => Price => Remaining amount offered.
    mapping(address => mapping(uint256 => mapping(uint256 => uint256))) sellerNftPriceOffers;

    function offerToSell(uint256 nftId, uint256 price, uint256 amount) public {
        address seller = _msgSender();
        sellerNftPriceOffers[seller][nftId][price] = amount;
    }

    function buyOffer(address seller, uint256 nftId, uint256 price, uint256 amount) public {
        // Check and update the amount offered.
        sellerNftPriceOffers[seller][nftId][price] -= amount;

        address buyer = _msgSender();

        // Pay.
        safeTransferFrom(
            buyer,
            seller,
            CURRENCY,
            price,
            ""
        );

        // Get NFTs.
        safeTransferFrom(
            seller,
            buyer,
            nftId,
            amount,
            ""
        );
    }

    function buySignedOffer(uint256 nftId, uint256 price, uint256 amount, bytes memory sellerSignature) public {
        revert("not implemented");
    }

    function _mathIsSafe() internal {
    unchecked {} // Use this keyword to guarantee that the correct version of Solidity is used.
    }
}