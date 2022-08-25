pragma solidity ^0.8.0;

import "./freeportParts/MetaTxContext.sol";
import "./Collection.sol";
import "./Marketplace.sol";
import "./Auction.sol";

/** This is a contract for creating standalone contracts (collections) for users.
 *
 */
contract CollectionFactory is MetaTxContext  {
    function initialize(Freeport _freeport, NFTAttachment _nftAttachment, Marketplace _marketplace, Auction _auction) public initializer {
        __MetaTxContext_init();

        freeport = _freeport;
        nftAttachment = _nftAttachment;
        marketplace = _marketplace;
        auction = _auction;
    }

    function initialize_update(Freeport _freeport, NFTAttachment _nftAttachment, Marketplace _marketplace, Auction _auction) external onlyRole(DEFAULT_ADMIN_ROLE) {
        freeport = _freeport;
        nftAttachment = _nftAttachment;
        marketplace = _marketplace;
        auction = _auction;
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

    /** Allowance mapping for mint on behalf for each Collection.
     */
    bytes32 public constant COLLECTION_MANAGER_ROLE = keccak256("COLLECTION_MANAGER_ROLE");

    // The address of Marketplace contract.
    Marketplace public marketplace;
    // The address of Auction contract.
    Auction public auction;

    /** An event emitted when new collection is created.
     *
     * Contains unique name of collection and its address.
     */
    event CollectionCreated(string name, address indexed addr);

    /** An event emitted when NFT is minted on behalf of factory.
     */
    event MintOnBehalf(address _operator, address _collection, address _holder, uint256 _id, uint64 _amount);

    /** Deploying a new user collection.
     *
     *  Emits a {CollectionCreated} event.
     */
    function createCollection(address collectionManager, string memory name, string memory uriTpl, string memory contractURI) external returns (address) {
//        require(hasRole(COLLECTION_CREATOR_ROLE, _msgSender()), "only collection creator");
        require(collectionManager != address(0), "zero address collection manager");
        require(nameToCollection[name] == address(0), "collection name already exists");

        Collection collection = new Collection();
        collection.initialize(address(this), collectionManager, name, uriTpl, contractURI, freeport, nftAttachment, marketplace, auction);

        address collAddr = address(collection);

        addressProxies[collectionCounter] = address(collection);
        collectionCounter = collectionCounter + 1;

        nameToCollection[name] = address(collection);

        emit CollectionCreated(name, address(collection));
        return address(collection);
    }

    function mintOnBehalf(address collection, address holder, uint64 supply, bytes memory data) external {
        address operator = _msgSender();
        require(Collection(collection).hasRole(COLLECTION_MANAGER_ROLE, operator), "sender is not collection manager");
        uint256 nftID = Collection(collection).issueOnBehalfOf(holder, supply, data);

        emit MintOnBehalf(operator, collection, holder, nftID, supply);
    }
}
