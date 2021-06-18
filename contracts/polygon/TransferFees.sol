pragma solidity ^0.8.0;

import "./DistributionAccounts.sol";

/**
- Hold configuration of NFTs: services, royalties.
- Capture royalties on primary and secondary transfers.
- Report configured royalties to service providers.
 */
contract TransferFees is DistributionAccounts {

    // Royalties configurable per NFT by issuers.
    mapping(uint256 => address) public primaryRoyaltyAccounts;
    mapping(uint256 => uint256) public primaryRoyaltyFees;
    mapping(uint256 => address) public secondaryRoyaltyAccounts;
    mapping(uint256 => uint256) public secondaryRoyaltyFees;

    function hasRoyalties(uint256 nftId, address addr)
    public view returns (uint256 primaryFee, uint256 secondaryFee) {

        // Primary royalties.
        uint256 fee = primaryRoyaltyFees[nftId];
        address account = primaryRoyaltyAccounts[nftId];
        if (account == addr) {
            primaryFee = fee;
        } else {
            primaryFee = fee * accountOwnerShares[account][addr] / TOTAL_SHARES;
        }

        // Secondary royalties.
        fee = secondaryRoyaltyFees[nftId];
        account = secondaryRoyaltyAccounts[nftId];
        if (account == addr) {
            secondaryFee = fee;
        } else {
            secondaryFee = fee * accountOwnerShares[account][addr] / TOTAL_SHARES;
        }

        return (primaryFee, secondaryFee);
    }

    function setRoyalties(
        uint256 nftId,
        address primaryRoyaltyAccount,
        uint256 primaryRoyaltyFee,
        address secondaryRoyaltyAccount,
        uint256 secondaryRoyaltyFee
    ) public {
        address issuer = _msgSender();
        require(_isIssuerAndOnlyOwner(issuer, nftId));

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
    ) internal override {
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
        (address issuer, uint32 nonce, uint64 supply) = _parseNftId(nftId);
        return from == issuer;
    }

}