pragma solidity ^0.8.0;

import "./freeportParts/collections/CollectionRoyalties.sol";
import "./freeportParts/collections/CollectionIssuance.sol";
import "./freeportParts/collections/CollectionNFTAttachment.sol";
import "./freeportParts/OpenSeaCollection.sol";


/** This this contract describes the collection of NFTs associated with a particular user.
 *
 */
contract Collection is OpenSeaCollection, CollectionRoyalties, CollectionIssuance, CollectionNFTAttachment, BaseNFT {
    function initialize(address admin, address minter, string memory _name, string memory _uri, string memory __contractURI, Freeport _freeport, NFTAttachment _nftAttachment) public initializer {
        __OpenSeaCollection_init(_name, __contractURI);
        __CollectionRoyalties_init(_freeport);
        __CollectionNFTAttachment_init(_nftAttachment);
        __CollectionIssuance_init();
        __BaseNFT_init();
        if (bytes(_uri).length == 0) _setURI(_uri);

        _setupRole(DEFAULT_ADMIN_ROLE, admin);
        _setupRole(COLLECTION_MANAGER_ROLE, minter);
    }

}
