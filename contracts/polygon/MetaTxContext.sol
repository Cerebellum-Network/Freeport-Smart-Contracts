// Based on @openzeppelin/contracts/metatx/ERC2771Context.sol 4.1.0
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./TransferOperator.sol";

/*
 * @dev Context variant with ERC2771 support.
 */
abstract contract MetaTxContext is TransferOperator {

    bytes32 public constant META_TX_FORWARDER = keccak256("META_TX_FORWARDER");

    function isTrustedForwarder(address forwarder) public view virtual returns (bool) {
        return hasRole(META_TX_FORWARDER, forwarder);
    }

    function _msgSender() internal view virtual override returns (address sender) {
        if (isTrustedForwarder(msg.sender)) {
            // The assembly code is more direct than the Solidity version using `abi.decode`.
            assembly {sender := shr(96, calldataload(sub(calldatasize(), 20)))}
        } else {
            return super._msgSender();
        }
    }

    function _msgData() internal view virtual override returns (bytes calldata) {
        if (isTrustedForwarder(msg.sender)) {
            return msg.data[: msg.data.length - 20];
        } else {
            return super._msgData();
        }
    }
}
