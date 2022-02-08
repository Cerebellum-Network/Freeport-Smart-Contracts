// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";

abstract contract SignatureVerifier is EIP712 {

  using ECDSA for bytes32;

  struct BuyAuthorization {
    address buyer;
    uint nftId;    
  }

  bytes32 private constant BUY_AUTHORIZATION_TYPEHASH = keccak256("BuyAuthorization(address buyer, uint nftId)");
  bytes32 public constant BUY_AUTHORIZER_ROLE = keccak256("BUY_AUTHORIZER");

  function recoverAddressFromSignature(address buyer, uint nftId, bytes32 signature) internal view virtual {
    address authorizer = _hashTypedDataV4(keccak256(abi.encode(
      BUY_AUTHORIZATION_TYPEHASH,
      buyer,
      nftId
    ))).recover(signature);

    return authorizer;
  }

}