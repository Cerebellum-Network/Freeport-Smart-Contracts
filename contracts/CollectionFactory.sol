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

    /** Allowance mapping for mint on behalf for each Collection.
     */
    mapping (address => mapping(address => bool)) mintAllowance;

    /** An event emitted when new collection is created.
     *
     * Contains unique name of collection and its address.
     */
    event CollectionCreated(string name, address indexed addr);

    /** Deploying a new user collection.
     *
     *  Emits a {CollectionCreated} event.
     */
    function createCollection(address collectionManager, string memory name, string memory uriTpl, string memory contractURI) external returns (address) {
        require(hasRole(COLLECTION_CREATOR_ROLE, _msgSender()), "only collection creator");
        require(collectionManager != address(0), "zero address collection manager");
        require(nameToCollection[name] == address(0), "collection name already exists");

        Collection collection = new Collection();
        collection.initialize(address(this), collectionManager, name, uriTpl, contractURI, freeport, nftAttachment);

        address collAddr = address(collection);
        mintAllowance[collAddr][collectionManager] = true;

        addressProxies[collectionCounter] = address(collection);
        collectionCounter = collectionCounter + 1;

        nameToCollection[name] = address(collection);

        emit CollectionCreated(name, address(collection));
        return address(collection);
    }

    function setMintAllowance(address collection, address minter) external {
        require(hasRole(COLLECTION_CREATOR_ROLE, _msgSender()), "only collection creator");
        mintAllowance[collection][minter] = true;
    }

    function mintOnBehalf(address collection, uint64 supply, bytes memory data) external {
        require(hasRole(COLLECTION_CREATOR_ROLE, _msgSender()), "only collection creator");
        address operator = _msgSender();
        Collection(collection).issueOnBehalfOf(operator, supply, data);
    }
}
