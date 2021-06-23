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
- Accounts that distribute their funds over multiple owners.
- Capture royalties on primary and secondary transfers, configurable per NFT type.







## Contract `DistributionAccounts`

Handle accounts of multiple owners.
Each owner of an account has a claim to a share of its funds.

Distribution Accounts support the contract currency only. They cannot be used for NFTs.

An owner may be another Distribution Account, or a smart contract.
It is possible to withdraw funds through nested DAs,
because anyone can trigger a withdrawal from a DA to its owners,
including if that owner is itself a DA.




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



#### `withdrawFromDistributionAccount(address account, address owner) → uint256` (public)

Withdraw all tokens available to an owner of a distribution account.

The function createDistributionAccount must be called beforehand.

Anyone can trigger the withdrawal.






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




