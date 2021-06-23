## Contract `AtomicExchange`

- Owner creates an offer to sell NFTs.
- Buyer pays and receives the NFT.

- TODO: Support for single transaction compatible with OpenSea / Wyvern Protocol (using a signature from the seller).




#### `offerToSell(uint256 nftId, uint256 price, uint256 amount)` (public)

Create an offer to sell an amount of NFTs for a price per unit.

To cancel, call again with an amount of 0.



#### `buyOffer(address seller, uint256 nftId, uint256 price, uint256 amount)` (public)

Accept an offer, paying the price per unit for an amount of NFTs.

The offer must have been created beforehand by offerToSell.



#### `buySignedOffer(uint256 nftId, uint256 price, uint256 amount, bytes sellerSignature)` (public)

Accept an offer, paying the price per unit for an amount of NFTs.

The offer is proved using sellerSignature generated offchain.

[Not implemented]



#### `_mathIsSafe()` (internal)

Guarantee that a version of Solidity with safe math is used.






## Contract `BaseNFT`

An implementation of ERC1155 from OpenZeppelin.

- Hold NFTs.
- Hold a currency for fees.







## Contract `Davinci`

Main contract, including all components.

- Hold and transfer NFTs using ERC1155.
- Support atomic exchanges of NFTs for currency.
- Issuance of NFTs with fixed supply.
- Accounts that distribute their funds over multiple owners.
- Capture royalties on primary and secondary transfers, configurable per NFT type.







## Contract `DistributionAccounts`

Handle accounts of multiple owners.
Each owner of an account has a claim to a share of its funds.

Distribution accounts support the contract currency only. They cannot be used for NFTs.

Owners must be external accounts; nesting distribution accounts is not supported.




#### `createDistributionAccount(address[] owners, uint256[] shares) → address` (public)

Create an account such that multiple owners have a claim on their respective share.

The share numbers are given as a fraction of the TOTAL_SHARES constant. The sum of shares must equal TOTAL_SHARES.
An owner address can not be repeated.

Anyone can create distribution accounts including any owners.



#### `getAddressOfDistributionAccount(address[] owners, uint256[] shares) → address` (public)

Generate a unique address identifying a list of owners and shares.

It may be used to predict the address of a distribution account and receive payments
even before calling the function createDistributionAccount.



#### `availableToOwnerOfDistributionAccount(address account, address owner) → uint256` (public)

Calculate the amount of tokens that an owner of a distribution account can withdraw right now.



#### `withdrawFromDistributionAccount(address account) → uint256` (public)

Withdraw all tokens available to an owner of a distribution account.

The function createDistributionAccount must be called beforehand.






## Contract `Issuance`

- Issue NFTs.
- Keep track of the address of the issuer of an NFT.
- Enforce rules of issuance: the supply is fixed.

##### Structure of an NFT

The following attributes of a type of NFT are immutable. They are used to derive the ID of the NFTs.
- Issuer: the address of the issuer of this type of NFT.
- Supply: how many NFT of this type exists.




#### `issue(uint32 nonce, uint64 supply, bytes data) → uint256` (public)

Issue a supply of NFTs of a new type.

No more NFT of this type can be issued again.

The caller will be recorded as the issuer and it will initially own the entire supply.

A same account must provide a distinct nonce value for each NFT type that it issues.



#### `_issueAs(address issuer, uint32 nonce, uint64 supply, bytes data) → uint256` (internal)

Internal implementation of the function issue.



#### `_isIssuer(address addr, uint256 nftId) → bool` (internal)

Return whether an address is the issuer of an NFT type.

This does not imply that the NFTs exist.



#### `_isIssuerAndOnlyOwner(address addr, uint256 id) → bool` (internal)

Return whether the address is the issuer of an NFT type, and
currently owns all NFT of this type (normally right after issuance).



#### `getNftId(address issuer, uint32 nonce, uint64 supply) → uint256` (public)

Calculate the ID of an NFT type, identifying its issuer, its supply, and an arbitrary nonce.



#### `_parseNftId(uint256 id) → address issuer, uint32 nonce, uint64 supply` (internal)

Parse an NFT ID into its issuer, its supply, and an arbitrary nonce.

This does not imply that the NFTs exist.






## Contract `Subscription`

- Subscribe to recurring services (and prepaid, refund).
- Report subscription status to service providers.
- Distribute revenues.

[Not implemented]







## Contract `TransferFees`

- Hold configuration of NFTs: services, royalties.
- Capture royalties on primary and secondary transfers.
- Report configured royalties to service providers.




#### `hasRoyalties(uint256 nftId, address addr) → uint256 primaryFee, uint256 secondaryFee` (public)

Return the amount of royalties earned by an address on each primary and secondary transfer of an NFT.



#### `setRoyalties(uint256 nftId, address primaryRoyaltyAccount, uint256 primaryRoyaltyFee, address secondaryRoyaltyAccount, uint256 secondaryRoyaltyFee)` (public)

Configure the amounts and beneficiaries of royalties on primary and secondary transfers of this NFT.

This setting is available to the issuer while he holds all NFTs of this type (normally right after issuance).

A transfer is primary if it comes from the issuer of this NFT (normally the first sale after issuance).
Otherwise, it is a secondary transfer.

There can be one beneficiary account for each primary and secondary royalties. To distribute revenues amongst
several parties, use a distribution account (see function createDistributionAccount).



#### `_beforeTokenTransfer(address operator, address from, address to, uint256[] tokenIds, uint256[] amounts, bytes data)` (internal)

Internal hook to trigger the collection of royalties due on a batch of transfers.



#### `_captureFee(address from, uint256 nftId, uint256 amount)` (internal)

Calculate the royalty due on a transfer.

Collect the royalty using an internal transfer of currency.



#### `_isPrimaryTransfer(address from, uint256 nftId) → bool` (internal)

Determine whether a transfer is primary (true) or secondary (false).

See the function setRoyalties.




