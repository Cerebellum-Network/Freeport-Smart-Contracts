// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./MinimalForwarder.sol";

/* A variant of MinimalForwarder used to forward transactions that bypass royalties.
 */
contract BypassForwarder is MinimalForwarder {}
