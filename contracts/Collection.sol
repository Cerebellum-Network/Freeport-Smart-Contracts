pragma solidity ^0.8.0;

import "./freeportParts/BaseNFT.sol";

/** This this contract describes the collection of NFTs associated with a particular user.
 *
 */
contract Collection is BaseNFT {

    // Name of the collection for open sea.
    string public name;

    /** A counter of NFT types issued.
     * This is used to generate unique NFT IDs.
     */
    uint32 public idCounter;

    function initialize() public initializer {
        __BaseNFT_init();
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
    }

    function setName(string memory newName) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "only admin");
        name = newName;
    }

    /// From Issuance contract
    /** Issue a supply of NFTs of a new type, and return its ID.
     *
     * No more NFT of this type can be issued again.
     *
     * The caller will be recorded as the issuer and it will initially own the entire supply.
     */
    function issue(uint64 supply, bytes memory data)
    public returns (uint256) {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "only admin");
        return _issueAs(_msgSender(), supply, data);
    }

    /** Internal implementation of the function issue.
     */
    function _issueAs(address issuer, uint64 supply, bytes memory data)
    internal returns (uint256) {
        idCounter = idCounter + 1;

        uint256 nftId = getNftId(issuer, idCounter, supply);

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
        (address issuer, uint32 innerID, uint64 supply) = _parseNftId(nftId);
        return addr == issuer;
    }

    /** Calculate the ID of an NFT type, identifying its issuer, its supply, and an inner ID.
     */
    function getNftId(address issuer, uint32 innerID, uint64 supply)
    public pure returns (uint256) {
        // issuer || innerID || supply: 160 + 32 + 64 = 256 bits
        uint256 id = (uint256(uint160(issuer)) << (32 + 64))
        | (uint256(innerID) << 64)
        | uint256(supply);
        return id;
    }

    /** Parse an NFT ID into its issuer, its supply, and an inner ID.
     *
     * This does not imply that the NFTs exist.
     */
    function _parseNftId(uint256 id)
    internal pure returns (address issuer, uint32 innerID, uint64 supply) {
        issuer = address(uint160((id & 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF000000000000000000000000) >> (32 + 64)));
        innerID = /*   */ uint32((id & 0x0000000000000000000000000000000000000000FFFFFFFF0000000000000000) >> 64);
        supply = /*    */ uint64((id & 0x000000000000000000000000000000000000000000000000FFFFFFFFFFFFFFFF));
        return (issuer, innerID, supply);
    }
    /// From Issuance contract

    /// From TransferFees contract
}
