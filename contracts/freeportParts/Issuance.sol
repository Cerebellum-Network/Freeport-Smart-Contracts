pragma solidity ^0.8.0;

import "./ERC20Adapter.sol";
import "../CertifiedNFT.sol";

/**
- Issue NFTs.
- Keep track of the address of the issuer of an NFT.
- Enforce rules of issuance: the supply is fixed.

##### Structure of an NFT

The following attributes of a type of NFT are immutable. They are used to derive the ID of the NFTs.
- Issuer: the address of the issuer of this type of NFT.
- Supply: how many NFT of this type exists.

*/
abstract contract Issuance is ERC20Adapter {

    /**
     * Supports the CertifiedNFT interface
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return interfaceId == type(INFTCertifiable).interfaceId
        || super.supportsInterface(interfaceId);
    }

    /** The definition of an NFT which is authenticated by the NFT ID.
     */
    struct NFTDefinition {
        uint256 chainId;
        address nftContract;
        address minter;
        uint256 supply;
        uint256 baseNftId; // The base NFT ID local to the host contract. For instance a counter.
        bytes attachment; // An initial and immutable attachment of an asset to this NFT.
    }

    bytes32 private constant NFT_DEFINITION_TYPEHASH = keccak256("NFTDefinition(uint256 chainid,address nftContract,address minter,uint256 supply,uint256 baseNftId,bytes attachment)");

    function getNftId(address minter, uint supply, uint baseNftId, bytes memory attachment)
    public returns (uint nftId) {
        nftId = _hashTypedDataV4(keccak256(abi.encode(
                NFT_DEFINITION_TYPEHASH,
                block.chainid,
                address(this),
                minter,
                supply,
                baseNftId,
                keccak256(attachment)
            )));
    }

    mapping(uint256 => address) public minters;

    /** Issue a supply of NFTs of a new type, and return its ID.
     *
     * No more NFT of this type can be issued again.
     *
     * The caller will be recorded as the issuer and it will initially own the entire supply.
     */
    function mint(uint64 supply, uint baseNftId, bytes memory attachment)
    public returns (uint256) {
        return _issueAs(_msgSender(), supply, baseNftId, attachment);
    }

    /** Internal implementation of the function issue.
     */
    function _issueAs(address minter, uint supply, uint baseNftId, bytes memory attachment)
    internal returns (uint256) {
        require(supply > 0);

        uint256 nftId = getNftId(minter, supply, baseNftId, attachment);

        require(minters[nftId] == address(0), "Already minted");
        minters[nftId] = minter;

        _mint(minter, nftId, supply, attachment);

        return nftId;
    }

    /** Return whether an address is the issuer of an NFT type.
     */
    function isMinter(address addr, uint256 nftId)
    internal pure returns (bool) {
        address minter = minters[nftId];
        return addr == minter;
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
        return isMinter && ownsAll;
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