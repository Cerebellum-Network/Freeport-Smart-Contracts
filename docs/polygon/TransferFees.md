## Contract `TransferFees`

- Hold configuration of NFTs: services, royalties.
- Capture royalties on primary and secondary transfers.
- Report configured royalties to service providers (supports Joint Accounts).




#### `getRoyalties(uint256 nftId) → address primaryRoyaltyAccount, uint256 primaryRoyaltyCut, uint256 primaryRoyaltyMinimum, address secondaryRoyaltyAccount, uint256 secondaryRoyaltyCut, uint256 secondaryRoyaltyMinimum` (public)

Return the current configuration of royalties for NFTs of type nftId, as set by configureRoyalties.



#### `getRoyaltiesForBeneficiary(uint256 nftId, address beneficiary) → uint256 primaryCut, uint256 primaryMinimum, uint256 secondaryCut, uint256 secondaryMinimum` (public)

Return the amount of royalties earned by a beneficiary on each primary and secondary transfer of an NFT.

This function supports Joint Accounts. If royalties are paid to a JA and beneficiary is an owner of the JA,
the shares of the royalties for this owner are returned.



#### `configureRoyalties(uint256 nftId, address primaryRoyaltyAccount, uint256 primaryRoyaltyCut, uint256 primaryRoyaltyMinimum, address secondaryRoyaltyAccount, uint256 secondaryRoyaltyCut, uint256 secondaryRoyaltyMinimum, uint256 lockUntil)` (public)

Configure the amounts and beneficiaries of royalties on primary and secondary transfers of this NFT.
This configuration is available to the issuer of this NFT.

A transfer is primary if it comes from the issuer of this NFT (normally the first sale after issuance).
Otherwise, it is a secondary transfer.

A royalty is defined in two parts (both optional):
a cut of the sale price of an NFT, and a minimum royalty per transfer.
For simple transfers not attached to a price, or a too low price, the minimum royalty is charged.

The cuts are given in basis points (1% of 1%). The minimums are given in currency amounts.

The configuration can be changed at any time by default. However, the issuer may commit to it for a period of time,
effectively giving up his ability to modify the royalties. Set lockUntil to a time in the future to lock the
configuration of this NFT type until the specified time (in UNIX seconds). Set to 0xFFFFFFFF to lock forever.
Set to 0 to keep the configuration modifiable.

There can be one beneficiary account for each primary and secondary royalties. To distribute revenues amongst
several parties, use a Joint Account (see function createJointAccount).



#### `_beforeTokenTransfer(address operator, address from, address to, uint256[] tokenIds, uint256[] amounts, bytes data)` (internal)

Internal hook to trigger the collection of royalties due on a batch of transfers.



#### `_captureFee(address from, uint256 nftId, uint256 price, uint256 amount)` (internal)

Calculate the royalty due on a transfer.

Collect the royalty using an internal transfer of currency.



#### `_isPrimaryTransfer(address from, uint256 nftId) → bool` (internal)

Determine whether a transfer is primary (true) or secondary (false).

See the function setRoyalties.




#### `RoyaltiesConfigured(uint256 nftId, address primaryRoyaltyAccount, uint256 primaryRoyaltyCut, uint256 primaryRoyaltyMinimum, address secondaryRoyaltyAccount, uint256 secondaryRoyaltyCut, uint256 secondaryRoyaltyMinimum, uint256 lockUntil)` (event)

Notify that royalties were configured on an NFT type.



