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




