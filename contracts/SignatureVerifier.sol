// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/utils/cryptography/ECDSAUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/draft-EIP712Upgradeable.sol";

abstract contract SignatureVerifier is EIP712Upgradeable {

  using ECDSAUpgradeable for bytes32;

  struct BuyAuthorization {
    address buyer;
    uint nftId;
  }

  bytes32 public constant BUY_AUTHORIZATION_TYPEHASH = keccak256("BuyAuthorization(address buyer,uint nftId)");
  bytes32 public constant BUY_AUTHORIZER_ROLE = keccak256("BUY_AUTHORIZER");
  bytes32 private constant _HASHED_NAME = keccak256("Freeport");
  bytes32 private constant _HASHED_VERSION = keccak256("2");

  /** The hash of the name parameter for the EIP712 domain. This replaces __EIP712_init.
   * The name is "Freeport".
   */
  function _EIP712NameHash() internal override view returns (bytes32) {
    return _HASHED_NAME;
  }

  /** The hash of the version parameter for the EIP712 domain. This replaces __EIP712_init.
   * The version is "2".
   */
  function _EIP712VersionHash() internal override view returns (bytes32) {
    return _HASHED_VERSION;
  }

  function recoverAddressFromSignature(address buyer, uint nftId, bytes memory signature) internal view returns(address) {
    address authorizer = _hashTypedDataV4(keccak256(abi.encode(
      BUY_AUTHORIZATION_TYPEHASH,
      buyer,
      nftId
    ))).recover(signature);

    return authorizer;
  }

}