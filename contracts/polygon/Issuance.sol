pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "./DavinciNFT.sol";

/**
- Issue NFTs.
- Keep track of the address of the issuer of an NFT.
- Enforce rules of issuance: the supply is fixed.

#### Structure of an NFT

The following attributes of a type of NFT are immutable. They are used to derive the ID of the NFTs.
- Issuer: the address of the issuer of this type of NFT.
- Supply: how many NFT of this type exists.

*/
contract Issuance is DavinciNFT {
    // State of NFTs.
    mapping(uint256 => bool) public nftExists;

    function issue(uint32 nonce, uint64 supply, bytes memory data) public returns (uint256) {
        return _issueAs(_msgSender(), nonce, supply, data);
    }

    function _issueAs(address issuer, uint32 nonce, uint64 supply, bytes memory data) internal returns (uint256) {
        uint256 nftId = _makeNftId(issuer, nonce, supply);

        require(nftExists[nftId] == false);
        nftExists[nftId] = true;

        _mint(issuer, nftId, supply, data);

        return nftId;
    }

    function _isIssuer(address addr, uint256 id) internal returns (bool) {
        (address issuer, uint32 nonce, uint64 supply) = _parseNftId(id);
        return addr == issuer;
    }

    function _isIssuerAndOwner(address addr, uint256 id) internal returns (bool) {
        (address issuer, uint32 nonce, uint64 supply) = _parseNftId(id);
        uint64 balance = uint64(balanceOf(issuer, id));

        bool isIssuer = addr == issuer;
        bool ownsAll = balance == supply;
        return isIssuer && ownsAll;
    }

    function _makeNftId(address issuer, uint32 nonce, uint64 supply) internal returns (uint256) {
        // issuer || nonce || supply: 160 + 32 + 64 = 256 bits
        uint256 id = (uint256(uint160(issuer)) << (32 + 64))
        + (nonce << 64)
        + supply;
        return id;
    }

    function _parseNftId(uint256 id) internal returns (address issuer, uint32 nonce, uint64 supply) {
        issuer = address(uint160((id & 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF000000000000000000000000) >> (32 + 64)));
        nonce = /*     */ uint32((id & 0x0000000000000000000000000000000000000000FFFFFFFF0000000000000000) >> 64);
        supply = /*    */ uint64((id & 0x000000000000000000000000000000000000000000000000FFFFFFFFFFFFFFFF));
        return (issuer, nonce, supply);
    }
}