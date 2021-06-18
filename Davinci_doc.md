## `Davinci`

- Hold and transfer NFTs using ERC1155.
- Support atomic exchanges of NFTs for currency.
- Issuance of NFTs with fixed supply.
- Accounts that distribute their funds over multiple owners.
- Capture royalties on primary and secondary transfers, configurable per NFT type.


## `BaseNFT`

- Hold NFTs.
- Hold a currency for fees.


## `AtomicExchange`

- Owner creates an offer to sell NFTs.
- Buyer pays and receives the NFT.

- TODO: Support for single transaction compatible with OpenSea / Wyvern Protocol (using a signature from the seller).

### `offerToSell(uint256 nftId, uint256 price, uint256 amount)` (public)

### `buyOffer(address seller, uint256 nftId, uint256 price, uint256 amount)` (public)

### `buySignedOffer(uint256 nftId, uint256 price, uint256 amount, bytes sellerSignature)` (public)

### `_mathIsSafe()` (internal)


## `Issuance`

- Issue NFTs.
- Keep track of the address of the issuer of an NFT.
- Enforce rules of issuance: the supply is fixed.

#### Structure of an NFT

The following attributes of a type of NFT are immutable. They are used to derive the ID of the NFTs.
- Issuer: the address of the issuer of this type of NFT.
- Supply: how many NFT of this type exists.

### `issue(uint32 nonce, uint64 supply, bytes data) → uint256` (public)

### `_issueAs(address issuer, uint32 nonce, uint64 supply, bytes data) → uint256` (internal)

### `_isIssuer(address addr, uint256 id) → bool` (internal)

### `_isIssuerAndOnlyOwner(address addr, uint256 id) → bool` (internal)

### `_makeNftId(address issuer, uint32 nonce, uint64 supply) → uint256` (internal)

### `_parseNftId(uint256 id) → address issuer, uint32 nonce, uint64 supply` (internal)


## `DistributionAccounts`

Handle accounts of multiple owners.
Each owner of an account has a claim to a share of its funds.

### `createDistributionAccount(address[] owners, uint256[] shares) → address` (public)

### `getAddressOfDistributionAccount(address[] owners, uint256[] shares) → address` (public)

### `availableToOwnerOfDistributionAccount(address account, address owner) → uint256` (public)

### `withdrawFromDistributionAccount(address account)` (public)


## `TransferFees`

- Hold configuration of NFTs: services, royalties.
- Capture royalties on primary and secondary transfers.
- Report configured royalties to service providers.
### `hasRoyalties(uint256 nftId, address addr) → uint256 primaryFee, uint256 secondaryFee` (public)

### `setRoyalties(uint256 nftId, address primaryRoyaltyAccount, uint256 primaryRoyaltyFee, address secondaryRoyaltyAccount, uint256 secondaryRoyaltyFee)` (public)

### `_beforeTokenTransfer(address operator, address from, address to, uint256[] tokenIds, uint256[] amounts, bytes data)` (internal)

### `_captureFee(address from, uint256 tokenId)` (internal)

### `_idsAreAllCurrency(uint256[] tokenIds) → bool` (internal)

### `_isPrimaryTransfer(address from, uint256 nftId) → bool` (internal)


## `Subscription`

- Subscribe to recurring services (and prepaid, refund).
- Report subscription status to service providers.
- Distribute revenues.
