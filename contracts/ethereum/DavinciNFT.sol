pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "./Issuance.sol";

/**
* Hold NFTs.
* Hold a currency for fees.
* Notifies a controller contract of transfers.
* Pays fees based on instructions from the controller.
*/
contract NFTC is ERC1155, Controller {
    constructor() ERC1155("https://cere.network/nft/{id}.json") {}
}