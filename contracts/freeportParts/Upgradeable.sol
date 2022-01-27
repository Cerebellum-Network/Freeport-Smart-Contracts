// Based on @openzeppelin/contracts/metatx/ERC2771Context.sol 4.1.0
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

/*
 * Support for ERC1967Proxy.
 */
abstract contract Upgradeable is UUPSUpgradeable, AccessControlUpgradeable {
    function __Upgradeable_init() internal {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function _authorizeUpgrade(address newImplementation) internal override {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Only Admin");
    }
}
