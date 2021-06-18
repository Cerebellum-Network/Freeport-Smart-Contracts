pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

/**
- Hold NFTs.
- Hold a currency for fees.
- Notifies a controller contract of transfers.
- Pays fees based on instructions from the controller.
*/
contract DavinciNFT is Context, ERC1155 {
    uint256 public constant CURRENCY = 0;

    constructor() ERC1155("https://cere.network/nft/{id}.json") {}
}