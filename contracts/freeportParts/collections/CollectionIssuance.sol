pragma solidity ^0.8.0;

import "../../token/ERC1155/ERC1155Upgradeable.sol";
import "../access_control/WithCollectionManager.sol";
import "../HasGlobalNftId.sol";
import "./CollectionIdCounter.sol";


/**
- Issue NFTs.
- Enforce rules of issuance: the supply is fixed.

##### Structure of an NFT

The following attributes of a type of NFT are immutable. They are used to derive the ID of the NFTs.
- Issuer: the address of the collection with this type of NFT.
- Supply: how many NFT of this type exists.

*/
abstract contract CollectionIssuance is ERC1155Upgradeable, WithCollectionManager, CollectionIdCounter, HasGlobalNftId {
    function __CollectionIssuance_init() internal initializer {
        __ERC1155_init("https://api.freeport.cere.network/erc1155/{id}.json");
        __WithCollectionManager_init();
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC1155Upgradeable, AccessControlUpgradeable) returns (bool) {
        return interfaceId == type(CollectionIssuance).interfaceId
        || super.supportsInterface(interfaceId);
    }

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

    /** Issue a supply of NFTs of a new type on behalf of minter, and return its ID.
     *
     * No more NFT of this type can be issued again.
     *
     * The caller will be recorded as the issuer and it will initially own the entire supply.
     *
     * Only for collection manager role.
     */
    function issueOnBehalfOf(address minter, uint64 supply, bytes memory data)
    public onlyRole(COLLECTION_MANAGER_ROLE) returns (uint256) {
        return _issueAs(minter, supply, data);
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

}
