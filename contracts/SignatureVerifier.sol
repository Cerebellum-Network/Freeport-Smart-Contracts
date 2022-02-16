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

  bytes32 private constant BUY_AUTHORIZATION_TYPEHASH = keccak256("BuyAuthorization(address buyer,uint nftId)");
  bytes32 public constant BUY_AUTHORIZER_ROLE = keccak256("BUY_AUTHORIZER");

  function __SignatureVerifier_init() internal initializer {
        __EIP712_init("Freeport", "2");
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