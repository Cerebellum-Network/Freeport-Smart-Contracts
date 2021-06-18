pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/utils/Context.sol";

/**
- Subscribe to recurring services (and prepaid, refund).
- Report subscription status to service providers.
- Distribute revenues.
 */
abstract contract Subscription is Context, IERC1155 {
    uint256 public constant CURRENCY = 0;

    
}