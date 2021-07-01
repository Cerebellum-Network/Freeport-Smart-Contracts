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




#### `_forceTransfer(address from, address to, uint256 id, uint256 amount)` (internal)








## Contract `Davinci`

Main contract, including all components.

- Hold and transfer NFTs using ERC1155.
- Support atomic exchanges of NFTs for currency.
- Issuance of NFTs with fixed supply.
- Joint Accounts that distribute their funds over multiple owners.
- Capture royalties on primary and secondary transfers, configurable per NFT type.







## Contract `ERC1155`



Implementation of the basic standard multi-token.
See https://eips.ethereum.org/EIPS/eip-1155
Originally based on code by Enjin: https://github.com/enjin/erc-1155

_Available since v3.1._


#### `constructor(string uri_)` (public)



See {_setURI}.

#### `supportsInterface(bytes4 interfaceId) → bool` (public)



See {IERC165-supportsInterface}.

#### `uri(uint256) → string` (public)



See {IERC1155MetadataURI-uri}.

This implementation returns the same URI for *all* token types. It relies
on the token type ID substitution mechanism
https://eips.ethereum.org/EIPS/eip-1155#metadata[defined in the EIP].

Clients calling this function must replace the `\{id\}` substring with the
actual token type ID.

#### `balanceOf(address account, uint256 id) → uint256` (public)



See {IERC1155-balanceOf}.

Requirements:

- `account` cannot be the zero address.

#### `balanceOfBatch(address[] accounts, uint256[] ids) → uint256[]` (public)



See {IERC1155-balanceOfBatch}.

Requirements:

- `accounts` and `ids` must have the same length.

#### `setApprovalForAll(address operator, bool approved)` (public)



See {IERC1155-setApprovalForAll}.

#### `isApprovedForAll(address account, address operator) → bool` (public)



See {IERC1155-isApprovedForAll}.

#### `safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes data)` (public)



See {IERC1155-safeTransferFrom}.

#### `safeBatchTransferFrom(address from, address to, uint256[] ids, uint256[] amounts, bytes data)` (public)



See {IERC1155-safeBatchTransferFrom}.

#### `_setURI(string newuri)` (internal)



Sets a new URI for all token types, by relying on the token type ID
substitution mechanism
https://eips.ethereum.org/EIPS/eip-1155#metadata[defined in the EIP].

By this mechanism, any occurrence of the `\{id\}` substring in either the
URI or any of the amounts in the JSON file at said URI will be replaced by
clients with the token type ID.

For example, the `https://token-cdn-domain/\{id\}.json` URI would be
interpreted by clients as
`https://token-cdn-domain/000000000000000000000000000000000000000000000000000000000004cce0.json`
for token type ID 0x4cce0.

See {uri}.

Because these URIs cannot be meaningfully represented by the {URI} event,
this function emits no events.

#### `_mint(address account, uint256 id, uint256 amount, bytes data)` (internal)



Creates `amount` tokens of token type `id`, and assigns them to `account`.

Emits a {TransferSingle} event.

Requirements:

- `account` cannot be the zero address.
- If `account` refers to a smart contract, it must implement {IERC1155Receiver-onERC1155Received} and return the
acceptance magic value.

#### `_mintBatch(address to, uint256[] ids, uint256[] amounts, bytes data)` (internal)



xref:ROOT:erc1155.adoc#batch-operations[Batched] version of {_mint}.

Requirements:

- `ids` and `amounts` must have the same length.
- If `to` refers to a smart contract, it must implement {IERC1155Receiver-onERC1155BatchReceived} and return the
acceptance magic value.

#### `_burn(address account, uint256 id, uint256 amount)` (internal)



Destroys `amount` tokens of token type `id` from `account`

Requirements:

- `account` cannot be the zero address.
- `account` must have at least `amount` tokens of token type `id`.

#### `_burnBatch(address account, uint256[] ids, uint256[] amounts)` (internal)



xref:ROOT:erc1155.adoc#batch-operations[Batched] version of {_burn}.

Requirements:

- `ids` and `amounts` must have the same length.

#### `_beforeTokenTransfer(address operator, address from, address to, uint256[] ids, uint256[] amounts, bytes data)` (internal)



Hook that is called before any token transfer. This includes minting
and burning, as well as batched variants.

The same hook is called on both single and batched variants. For single
transfers, the length of the `id` and `amount` arrays will be 1.

Calling conditions (for each `id` and `amount` pair):

- When `from` and `to` are both non-zero, `amount` of ``from``'s tokens
of token type `id` will be  transferred to `to`.
- When `from` is zero, `amount` tokens of token type `id` will be minted
for `to`.
- when `to` is zero, `amount` of ``from``'s tokens of token type `id`
will be burned.
- `from` and `to` are never both zero.
- `ids` and `amounts` have the same, non-zero length.

To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks].




## Contract `Issuance`

- Issue NFTs.
- Keep track of the address of the issuer of an NFT.
- Enforce rules of issuance: the supply is fixed.

##### Structure of an NFT

The following attributes of a type of NFT are immutable. They are used to derive the ID of the NFTs.
- Issuer: the address of the issuer of this type of NFT.
- Supply: how many NFT of this type exists.




#### `issue(uint64 supply, bytes data) → uint256` (public)

Issue a supply of NFTs of a new type, and return its ID.

No more NFT of this type can be issued again.

The caller will be recorded as the issuer and it will initially own the entire supply.



#### `_issueAs(address issuer, uint64 supply, bytes data) → uint256` (internal)

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






## Contract `JointAccounts`

A Joint Account (JA) is an account such that multiple owners have a claim on their respective share of the funds.

Joint Accounts support the contract currency only. They cannot be used for NFTs.

An owner may be another Joint Account, or a smart contract.
It is possible to withdraw funds through nested JAs,
because anyone can trigger a withdrawal from a JA to its owners,
including if that owner is itself a JA.

[An implementation that distributes to all owners at once.]




#### `createJointAccount(address[] owners, uint256[] fractions) → address` (public)

Create an account such that multiple owners have a claim on their respective share.

The size of a share is given as a fraction in basis points (1% of 1%). The sum of share fractions must equal 10,000.

Anyone can create Joint Accounts including any owners.



#### `distributeJointAccount(address account)` (public)

Distribute all tokens available to all owners of a Joint Account.

The function createJointAccount must be called beforehand.

Anyone can trigger the distribution.



#### `makeAddressOfJointAccount(address[] owners, uint256[] fractions) → address` (public)

Generate a unique address identifying a list of owners and shares.

It may be used to predict the address of a Joint Account and receive payments
even before calling the function createJointAccount.



#### `fractionOfJAOwner(address account, address maybeOwner) → uint256` (public)

Return the fraction of an account owned by the given address, in basis points (1% of 1%).

If the account does not exist, or if the given address is not an owner of it, this returns 0.
If the owner appears more than once in the account, this reports only the first share.



#### `balanceOfJAOwner(address account, address owner) → uint256` (public)

Calculate the amount of tokens that an owner of a Joint Account can withdraw right now.




#### `JointAccountShareCreated(address account, address owner, uint256 fraction)`







## Contract `Subscription`

- Subscribe to recurring services (and prepaid, refund).
- Report subscription status to service providers.
- Distribute revenues.

[Not implemented]







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



#### `configureRoyalties(uint256 nftId, address primaryRoyaltyAccount, uint256 primaryRoyaltyCut, uint256 primaryRoyaltyMinimum, address secondaryRoyaltyAccount, uint256 secondaryRoyaltyCut, uint256 secondaryRoyaltyMinimum)` (public)

Configure the amounts and beneficiaries of royalties on primary and secondary transfers of this NFT.

This setting is available to the issuer while he holds all NFTs of this type (normally right after issuance).

A transfer is primary if it comes from the issuer of this NFT (normally the first sale after issuance).
Otherwise, it is a secondary transfer.

A royalty is defined in two parts (both optional):
a cut of the sale price of an NFT, and a minimum royalty per transfer.
For simple transfers not attached to a price, or a too low price, the minimum royalty is charged.

The cuts are given in basis points (1% of 1%). The minimums are given in currency amounts.

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




#### `RoyaltiesConfigured(uint256 nftId, address primaryRoyaltyAccount, uint256 primaryRoyaltyCut, uint256 primaryRoyaltyMinimum, address secondaryRoyaltyAccount, uint256 secondaryRoyaltyCut, uint256 secondaryRoyaltyMinimum)`





