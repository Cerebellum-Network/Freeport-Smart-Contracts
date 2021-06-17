pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/utils/Context.sol";

/**
 * Issue NFTs and enforce of issuance.
 * Hold configuration of NFTs: services, royalties.
 * Capture royalties on primary and secondary transfers.
 * Report configured royalties to service providers.
 */
contract Controller is Context, IERC1155 {
    uint256 public constant CURRENCY = 0;

    // Royalties configurable per NFT by issuers.
    mapping(uint256 => address) public primaryRoyaltyAccounts;
    mapping(uint256 => uint256) public primaryRoyaltyFees;
    mapping(uint256 => address) public secondaryRoyaltyAccounts;
    mapping(uint256 => uint256) public secondaryRoyaltyFees;

    // State of NFTs.
    mapping(uint256 => bool) public nftExists;

    constructor() {}

    function issue(uint32 nonce, uint256 supply, bytes memory data) public returns (uint256) {
        return _issueAs(_msgSender(), nonce, supply, data);
    }

    function _issueAs(address issuer, uint32 nonce, uint256 supply, bytes memory data) internal returns (uint256) {
        uint256 nftId = _makeId(issuer, nonce, supply);

        require(nftExists[nftId] == false);
        nftExists[nftId] = true;

        _mint(issuer, nftId, supply, "");

        return nftId;
    }

    function setFee(
        uint256 nftId,
        address primaryRoyaltyAccount,
        uint256 primaryRoyaltyFee,
        address secondaryRoyaltyAccount,
        uint256 secondaryRoyaltyFee
    ) public {
        address issuer = _msgSender();
        require(_isIssuerAndOwner(issuer, nftId));

        if (primaryRoyaltyFee != 0) {
            require(primaryRoyaltyAccount != address(0));
            primaryRoyaltyAccounts[nftId] = primaryRoyaltyAccount;
            primaryRoyaltyFees[nftId] = primaryRoyaltyFee;
        }

        if (secondaryRoyaltyFee != 0) {
            require(secondaryRoyaltyAccount != address(0));
            secondaryRoyaltyAccounts[nftId] = secondaryRoyaltyAccount;
            secondaryRoyaltyFees[nftId] = secondaryRoyaltyFee;
        }
    }

    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory tokenIds,
        uint256[] memory amounts,
        bytes memory data
    ) internal {
        // Do not apply on pure currency transfers.
        // This also prevents recursion.
        if (_idsAreAllCurrency(tokenIds)) return;

        // Pay a fee per transfer to a beneficiary, if any.
        for (uint256 i = 0; i < tokenIds.length; ++i) {
            uint256 tokenId = tokenIds[i];
            _captureFee(from, tokenId);
        }
    }

    function _captureFee(address from, uint256 tokenId) internal {
        uint256 royaltyFee;
        address royaltyAccount;
        bool isPrimary = _isPrimaryTransfer(from, tokenId);
        if (isPrimary) {
            royaltyFee = primaryRoyaltyFees[tokenId];
            royaltyAccount = primaryRoyaltyAccounts[tokenId];
        } else {
            royaltyFee = secondaryRoyaltyFees[tokenId];
            royaltyAccount = secondaryRoyaltyAccounts[tokenId];
        }

        if (royaltyFee != 0) {
            safeTransferFrom(
                from,
                royaltyAccount,
                CURRENCY,
                royaltyFee,
                ""
            );
        }
    }

    function _idsAreAllCurrency(uint256[] memory tokenIds) internal returns (bool) {
        for (uint256 i = 0; i < tokenIds.length; ++i) {
            uint256 tokenId = tokenIds[i];
            if (tokenId != CURRENCY) {
                return false;
            }
        }
        return true;
    }

    function _isPrimaryTransfer(address from, uint256 nftId)
    internal returns (bool) {
        (address issuer, uint32 nonce, uint64 supply) = _parseId(id);
        return from == issuer;
    }

    /*
        // Pay issuance fee.
        if (primaryTransferFee != 0) {
            safeTransferFrom(
                issuer,
                vendor,
                CURRENCY,
                primaryTransferFee,
                ""
            );
        }
    */

    function _isIssuer(address addr, uint256 id) internal returns (bool) {
        (address issuer, uint32 nonce, uint64 supply) = _parseId(id);
        return addr == issuer;
    }

    function _isIssuerAndOwner(address addr, uint256 id) internal returns (bool) {
        (address issuer, uint32 nonce, uint64 supply) = _parseId(id);
        uint64 balance = uint64(balanceOf(issuer, id));

        bool isIssuer = addr == issuer;
        bool ownsAll = balance == supply;
        return isIssuer && ownsAll;
    }

    function _makeId(address issuer, uint32 nonce, uint64 supply) internal returns (uint256) {
        // issuer || nonce || supply: 160 + 32 + 64 = 256 bits
        uint256 id = (uint256(issuer) << (32 + 64))
        + (nonce << 64)
        + supply;
        return id;
    }

    function _parseId(uint256 id) internal returns (address issuer, uint32 nonce__, uint64 supply_) {
        issuer = address((id & 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF000000000000000000000000) >> (32 + 64));
        nonce__ = uint32((id & 0x0000000000000000000000000000000000000000FFFFFFFF0000000000000000) >> 64);
        supply_ = uint64((id & 0x000000000000000000000000000000000000000000000000FFFFFFFFFFFFFFFF));
        return (issuer, nonce__, supply_);
    }
}