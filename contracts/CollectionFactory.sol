pragma solidity ^0.8.0;

import "./freeportParts/MetaTxContext.sol";
import "./Collection.sol";

/** This is a contract for creating standalone contracts (collections) for users.
 *
 */
contract CollectionFactory is MetaTxContext  {
    function initialize(Freeport _freeport, NFTAttachment _nftAttachment) public initializer {
        __MetaTxContext_init();

        freeport = _freeport;
        nftAttachment = _nftAttachment;
    }

    // Standalone user collections mapped to its names.
    mapping(string => address) nameToCollection;

    // The address of Freeport contract.
    Freeport public freeport;
    // The address of NFTAttachment contract.
    NFTAttachment public nftAttachment;

    // Collection id to address.
    mapping(uint256 => address) private addressProxies;
    uint256 private collectionCounter;

    /** Collection creator role.
     *  Used for configuring the amounts and beneficiaries of royalties on primary and secondary transfers of this NFT.
     */
    bytes32 public constant COLLECTION_CREATOR_ROLE = keccak256("COLLECTION_CREATOR_ROLE");

    /** An event emitted when new collection is created.
     *
     * Contains unique name of collection and its address.
     */
    event CollectionCreated(string name, address indexed addr);

    /** Deploying a new user collection.
     *
     *  Emits a {CollectionCreated} event.
     */
    function createCollection(address creator, string memory name) public returns (address) {
        require(hasRole(COLLECTION_CREATOR_ROLE, _msgSender()), "only collection creator");
        require(creator != address(0), "zero address creator");
        require(nameToCollection[name] == address(0), "collection name already exists");

        Collection collection = new Collection();
        collection.initialize(address(this), creator, name, freeport, nftAttachment);

        addressProxies[collectionCounter] = address(collection);
        collectionCounter = collectionCounter + 1;

        nameToCollection[name] = address(collection);

        emit CollectionCreated(name, address(collection));
        return address(collection);
    }
}
