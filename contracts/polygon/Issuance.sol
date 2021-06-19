pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "./AtomicExchange.sol";

/**
- Issue NFTs.
- Keep track of the address of the issuer of an NFT.
- Enforce rules of issuance: the supply is fixed.

##### Structure of an NFT

The following attributes of a type of NFT are immutable. They are used to derive the ID of the NFTs.
- Issuer: the address of the issuer of this type of NFT.
- Supply: how many NFT of this type exists.

*/
contract Issuance is AtomicExchange {
    /** NFT ID => Whether this NFT type was issued yet.
     *
     * This is used to prevent issuing more NFTs after their initial issuance.
     */
    mapping(uint256 => bool) public nftExists;

    /** Issue a supply of NFTs of a new type.
     *
     * No more NFT of this type can be issued again.
     *
     * The caller will be recorded as the issuer and it will initially own the entire supply.
     *
     * A same account must provide a distinct nonce value for each NFT type that it issues.
     */
    function issue(uint32 nonce, uint64 supply, bytes memory data)
    public returns (uint256) {
        return _issueAs(_msgSender(), nonce, supply, data);
    }

    /** Internal implementation of the function issue.
     */
    function _issueAs(address issuer, uint32 nonce, uint64 supply, bytes memory data)
    internal returns (uint256) {
        uint256 nftId = getNftId(issuer, nonce, supply);

        require(nftExists[nftId] == false);
        nftExists[nftId] = true;

        require(supply > 0);
        _mint(issuer, nftId, supply, data);

        return nftId;
    }

    /** Return whether an address is the issuer of an NFT type.
     *
     * This does not imply that the NFTs exist.
     */
    function _isIssuer(address addr, uint256 nftId)
    internal pure returns (bool) {
        (address issuer, uint32 nonce, uint64 supply) = _parseNftId(nftId);
        return addr == issuer;
    }

    /** Return whether the address is the issuer of an NFT type, and
     * currently owns all NFT of this type (normally right after issuance).
     */
    function _isIssuerAndOnlyOwner(address addr, uint256 id)
    internal view returns (bool) {
        (address issuer, uint32 nonce, uint64 supply) = _parseNftId(id);
        uint64 balance = uint64(balanceOf(issuer, id));

        bool isIssuer = addr == issuer;
        bool ownsAll = balance == supply;
        return isIssuer && ownsAll;
    }

    /** Calculate the ID of an NFT type, identifying its issuer, its supply, and an arbitrary nonce.
     */
    function getNftId(address issuer, uint32 nonce, uint64 supply)
    public pure returns (uint256) {
        // issuer || nonce || supply: 160 + 32 + 64 = 256 bits
        uint256 id = (uint256(uint160(issuer)) << (32 + 64))
        + (nonce << 64)
        + supply;
        return id;
    }

    /** Parse an NFT ID into its issuer, its supply, and an arbitrary nonce.
     *
     * This does not imply that the NFTs exist.
     */
    function _parseNftId(uint256 id)
    internal pure returns (address issuer, uint32 nonce, uint64 supply) {
        issuer = address(uint160((id & 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF000000000000000000000000) >> (32 + 64)));
        nonce = /*     */ uint32((id & 0x0000000000000000000000000000000000000000FFFFFFFF0000000000000000) >> 64);
        supply = /*    */ uint64((id & 0x000000000000000000000000000000000000000000000000FFFFFFFFFFFFFFFF));
        return (issuer, nonce, supply);
    }
}