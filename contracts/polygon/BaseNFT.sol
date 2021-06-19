pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

/** An implementation of ERC1155 from OpenZeppelin.

- Hold NFTs.
- Hold a currency for fees.
*/
contract BaseNFT is Context, ERC1155 {
    uint256 public constant CURRENCY = 0;

    constructor() ERC1155("https://cere.network/nft/{id}.json") {}
}