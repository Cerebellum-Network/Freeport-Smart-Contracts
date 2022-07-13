pragma solidity ^0.8.0;

import "../../token/ERC1155/ERC1155Upgradeable.sol";
import "../access_control/WithCollectionManager.sol";


/**
- Issue NFTs.
- Enforce rules of issuance: the supply is fixed.

##### Structure of an NFT

The following attributes of a type of NFT are immutable. They are used to derive the ID of the NFTs.
- Issuer: the address of the collection with this type of NFT.
- Supply: how many NFT of this type exists.

*/
abstract contract CollectionIssuance is ERC1155Upgradeable, WithCollectionManager {
    function __CollectionIssuance_init() internal initializer {
        __ERC1155Upgradeable_init();
        __WithCollectionManager_init();
    }

    /** A counter of NFT types.
     * This is used to generate unique NFT IDs.
     */
    uint32 public idCounter;

    /** Issue a supply of NFTs of a new type, and return its ID.
     *
     * No more NFT of this type can be issued again.
     *
     * The caller will be recorded as the issuer and it will initially own the entire supply.
     */
    function issue(uint64 supply, bytes memory data)
    public onlyRole(COLLECTION_MANAGER_ROLE) returns (uint256) {
        return _issueAs(_msgSender(), supply, data);
    }

    /** Internal implementation of the function issue.
     */
    function _issueAs(address issuer, uint64 supply, bytes memory data)
    internal returns (uint256) {
        uint32 innerId = idCounter + 1;
        uint256 nftId = getGlobalNftId(innerId);

        require(supply > 0);
        _mint(issuer, nftId, supply, data);

        idCounter = idCounter + 1;
        return nftId;
    }

    /** Calculate the global ID of an NFT type, identifying its inner nft id.
     */
    function getGlobalNftId(uint32 innerNftId)
    public view returns (uint256) {
        // issuer || innerNftId || supply (always equals to 0): 160 + 32 + 64 = 256 bits
        uint256 id = (uint256(uint160(address(this))) << (32 + 64))
        | (uint256(innerNftId) << 64)
        | uint256(0);
        return id;
    }
}
