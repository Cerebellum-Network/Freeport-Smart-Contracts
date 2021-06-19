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

    /** Return the amount of royalties earned by an address on each primary and secondary transfer of an NFT.
     */
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

    /** Configure the amounts and beneficiaries of royalties on primary and secondary transfers of this NFT.
     *
     * This setting is available to the issuer while he holds all NFTs of this type (normally right after issuance).
     *
     * A transfer is primary if it comes from the issuer of this NFT (normally the first sale after issuance).
     * Otherwise, it is a secondary transfer.
     *
     * There can be one beneficiary account for each primary and secondary royalties. To distribute revenues amongst
     * several parties, use a distribution account (see function createDistributionAccount).
     */
    function setRoyalties(
        uint256 nftId,
        address primaryRoyaltyAccount,
        uint256 primaryRoyaltyFee,
        address secondaryRoyaltyAccount,
        uint256 secondaryRoyaltyFee)
    public {
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

    /** Internal hook to trigger the collection of royalties due on a batch of transfers.
     */
    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory tokenIds,
        uint256[] memory amounts,
        bytes memory data)
    internal override {
        // Pay a fee per transfer to a beneficiary, if any.
        for (uint256 i = 0; i < tokenIds.length; ++i) {
            uint256 tokenId = tokenIds[i];
            bool isNFT = tokenId != CURRENCY;
            if (isNFT) {
                _captureFee(from, tokenId, amounts[i]);
            }
        }
    }

    /** Calculate the royalty due on a transfer.
     *
     * Collect the royalty using an internal transfer of currency.
     */
    function _captureFee(address from, uint256 nftId, uint256 amount)
    internal {
        uint256 royaltyFee;
        address royaltyAccount;
        bool isPrimary = _isPrimaryTransfer(from, nftId);
        if (isPrimary) {
            royaltyFee = primaryRoyaltyFees[nftId];
            royaltyAccount = primaryRoyaltyAccounts[nftId];
        } else {
            royaltyFee = secondaryRoyaltyFees[nftId];
            royaltyAccount = secondaryRoyaltyAccounts[nftId];
        }

        if (royaltyFee != 0) {
            safeTransferFrom(
                from,
                royaltyAccount,
                CURRENCY,
                royaltyFee * amount,
                ""
            );
        }
    }

    /** Determine whether a transfer is primary (true) or secondary (false).
     *
     * See the function setRoyalties.
     */
    function _isPrimaryTransfer(address from, uint256 nftId)
    internal pure returns (bool) {
        (address issuer, uint32 nonce, uint64 supply) = _parseNftId(nftId);
        return from == issuer;
    }

}