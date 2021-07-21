## Contract `BaseNFT`

An implementation of ERC1155 from OpenZeppelin.

- Hold NFTs.
- Hold a currency for fees.




#### `supportsInterface(bytes4 interfaceId) → bool` (public)

Supports interfaces of AccessControl, ERC1155, and ERC1155 MetadataURI.



#### `_forceTransferCurrency(address from, address to, uint256 amount)` (internal)





#### `isApprovedForAll(address account, address operator) → bool` (public)

The role FULL_OPERATOR is allowed to make any transfer.
This is useful to connect a marketplace contract.



See {IERC1155-isApprovedForAll}.


