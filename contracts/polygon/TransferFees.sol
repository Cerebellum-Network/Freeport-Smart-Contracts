pragma solidity ^0.8.0;

import "./JointAccounts.sol";

/**
- Hold configuration of NFTs: services, royalties.
- Capture royalties on primary and secondary transfers.
- Report configured royalties to service providers (supports Joint Accounts).
 */
contract TransferFees is JointAccounts {

    // Royalties configurable per NFT by issuers.
    mapping(uint256 => address) primaryRoyaltyAccounts;
    mapping(uint256 => uint256) primaryRoyaltyCuts;
    mapping(uint256 => uint256) primaryRoyaltyMinimums;
    mapping(uint256 => address) secondaryRoyaltyAccounts;
    mapping(uint256 => uint256) secondaryRoyaltyCuts;
    mapping(uint256 => uint256) secondaryRoyaltyMinimums;
    mapping(uint256 => uint256) royaltiesConfigLockedUntil;

    /** Notify that royalties were configured on an NFT type.
     */
    event RoyaltiesConfigured(
        uint256 indexed nftId,
        address primaryRoyaltyAccount,
        uint256 primaryRoyaltyCut,
        uint256 primaryRoyaltyMinimum,
        address secondaryRoyaltyAccount,
        uint256 secondaryRoyaltyCut,
        uint256 secondaryRoyaltyMinimum);

    /** Notify that royalties are locked and cannot change, until the given time (in UNIX seconds),
     * or forever (lockUntil = 0xFFFFFFFF).
     */
    event RoyaltiesLocked(
        uint256 indexed nftId,
        uint256 lockUntil);

    /** Return the current configuration of royalties for NFTs of type nftId, as set by configureRoyalties.
     */
    function getRoyalties(uint256 nftId)
    public view returns (
        address primaryRoyaltyAccount,
        uint256 primaryRoyaltyCut,
        uint256 primaryRoyaltyMinimum,
        address secondaryRoyaltyAccount,
        uint256 secondaryRoyaltyCut,
        uint256 secondaryRoyaltyMinimum
    ) {
        return (primaryRoyaltyAccounts[nftId], primaryRoyaltyCuts[nftId], primaryRoyaltyMinimums[nftId],
        secondaryRoyaltyAccounts[nftId], secondaryRoyaltyCuts[nftId], secondaryRoyaltyMinimums[nftId]);
    }

    /** Return the amount of royalties earned by a beneficiary on each primary and secondary transfer of an NFT.
     *
     * This function supports Joint Accounts. If royalties are paid to a JA and beneficiary is an owner of the JA,
     * the shares of the royalties for this owner are returned.
     */
    function getRoyaltiesForBeneficiary(uint256 nftId, address beneficiary)
    public view returns (uint256 primaryCut, uint256 primaryMinimum, uint256 secondaryCut, uint256 secondaryMinimum) {

        // If the royalty account is the given beneficiary, return the configured fees.
        // Otherwise, the royalty account may be a Joint Account, and the beneficiary a share owner of it.
        // Otherwise, "fraction" will be 0, and 0 values will be returned.

        // Primary royalties.
        primaryCut = primaryRoyaltyCuts[nftId];
        primaryMinimum = primaryRoyaltyMinimums[nftId];
        address primaryAccount = primaryRoyaltyAccounts[nftId];
        if (primaryAccount != beneficiary) {
            uint256 fraction = fractionOfJAOwner(primaryAccount, beneficiary);
            primaryCut = primaryCut * fraction / BASIS_POINTS;
            primaryMinimum = primaryMinimum * fraction / BASIS_POINTS;
        }

        // Secondary royalties.
        secondaryCut = secondaryRoyaltyCuts[nftId];
        secondaryMinimum = secondaryRoyaltyMinimums[nftId];
        address secondaryAccount = secondaryRoyaltyAccounts[nftId];
        if (secondaryAccount != beneficiary) {
            uint256 fraction = fractionOfJAOwner(secondaryAccount, beneficiary);
            secondaryCut = secondaryCut * fraction / BASIS_POINTS;
            secondaryMinimum = secondaryMinimum * fraction / BASIS_POINTS;
        }

        return (primaryCut, primaryMinimum, secondaryCut, secondaryMinimum);
    }

    /** Configure the amounts and beneficiaries of royalties on primary and secondary transfers of this NFT.
     * This configuration is available to the issuer of this NFT.
     *
     * A transfer is primary if it comes from the issuer of this NFT (normally the first sale after issuance).
     * Otherwise, it is a secondary transfer.
     *
     * A royalty is defined in two parts (both optional):
     * a cut of the sale price of an NFT, and a minimum royalty per transfer.
     * For simple transfers not attached to a price, or a too low price, the minimum royalty is charged.
     *
     * The cuts are given in basis points (1% of 1%). The minimums are given in currency amounts.
     *
     * The configuration can be changed at any time by default. However, the issuer may commit to it for a period of time,
     * effectively giving up his ability to modify the royalties. See the function lockRoyalties.
     *
     * There can be one beneficiary account for each primary and secondary royalties. To distribute revenues amongst
     * several parties, use a Joint Account (see function createJointAccount).
     */
    function configureRoyalties(
        uint256 nftId,
        address primaryRoyaltyAccount,
        uint256 primaryRoyaltyCut,
        uint256 primaryRoyaltyMinimum,
        address secondaryRoyaltyAccount,
        uint256 secondaryRoyaltyCut,
        uint256 secondaryRoyaltyMinimum)
    public {
        address issuer = _msgSender();
        require(_isIssuer(issuer, nftId), "Only the issuer of this NFT can set royalties");
        require(block.timestamp >= royaltiesConfigLockedUntil[nftId], "Royalties configuration is locked for now");

        require(primaryRoyaltyAccount != address(0) || (primaryRoyaltyCut == 0 && primaryRoyaltyMinimum == 0),
            "The account must not be 0, unless fees are 0");
        primaryRoyaltyAccounts[nftId] = primaryRoyaltyAccount;
        primaryRoyaltyCuts[nftId] = primaryRoyaltyCut;
        primaryRoyaltyMinimums[nftId] = primaryRoyaltyMinimum;

        require(secondaryRoyaltyAccount != address(0) || (secondaryRoyaltyCut == 0 && secondaryRoyaltyMinimum == 0),
            "The account must not be 0, unless fees are 0");
        secondaryRoyaltyAccounts[nftId] = secondaryRoyaltyAccount;
        secondaryRoyaltyCuts[nftId] = secondaryRoyaltyCut;
        secondaryRoyaltyMinimums[nftId] = secondaryRoyaltyMinimum;

        emit RoyaltiesConfigured(
            nftId,
            primaryRoyaltyAccount,
            primaryRoyaltyCut,
            primaryRoyaltyMinimum,
            secondaryRoyaltyAccount,
            secondaryRoyaltyCut,
            secondaryRoyaltyMinimum);
    }

    /** Lock the configuration of royalties for this NFT type. Only the issuer may lock the configuration,
     * after which he himself will no longer be able to change the configuration, for some time, or forever.
     *
     * Set lockUntil to a time in the future to lock the configuration until the specified time (in UNIX seconds).
     * Set to 0xFFFFFFFF to lock forever.
     */
    function lockRoyalties(
        uint256 nftId,
        uint256 lockUntil)
    public {
        address issuer = _msgSender();
        require(_isIssuer(issuer, nftId));

        require(lockUntil > royaltiesConfigLockedUntil[nftId], "Royalties configuration cannot be unlocked earlier");
        royaltiesConfigLockedUntil[nftId] = lockUntil;

        emit RoyaltiesLocked(nftId, lockUntil);
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
            _captureFee(from, tokenIds[i], /*price*/ 0, amounts[i]);
        }
    }

    /** Calculate the royalty due on a transfer.
     *
     * Collect the royalty using an internal transfer of currency.
     */
    function _captureFee(address from, uint256 nftId, uint256 price, uint256 amount)
    internal {
        if (nftId == CURRENCY) return;

        uint256 cut;
        uint256 minimum;
        address royaltyAccount;
        bool isPrimary = _isPrimaryTransfer(from, nftId);
        if (isPrimary) {
            cut = primaryRoyaltyCuts[nftId];
            minimum = primaryRoyaltyMinimums[nftId];
            royaltyAccount = primaryRoyaltyAccounts[nftId];
        } else {
            cut = secondaryRoyaltyCuts[nftId];
            minimum = secondaryRoyaltyMinimums[nftId];
            royaltyAccount = secondaryRoyaltyAccounts[nftId];
        }

        uint256 perTransferFee = price * cut / BASIS_POINTS;
        if (perTransferFee < minimum) perTransferFee = minimum;

        uint256 totalFee = perTransferFee * amount;
        if (totalFee != 0) {
            _forceTransfer(from, royaltyAccount, CURRENCY, totalFee);
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