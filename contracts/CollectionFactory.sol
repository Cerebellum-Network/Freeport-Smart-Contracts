pragma solidity ^0.8.0;

import "./freeportParts/MetaTxContext.sol";
import "./freeportParts/HasGlobalNftId.sol";
import "./Collection.sol";
import "./Marketplace.sol";
import "./NFTAttachment.sol";
import "./Auction.sol";

/** This is a contract for creating standalone contracts (collections) for users.
 *
 */
contract CollectionFactory is MetaTxContext, HasGlobalNftId {
    function initialize(Freeport _freeport, NFTAttachment _nftAttachment, Marketplace _marketplace, Auction _auction, address _txForwarder) public initializer {
        __MetaTxContext_init();

        freeport = _freeport;
        nftAttachment = _nftAttachment;
        marketplace = _marketplace;
        auction = _auction;

        txForwarder = _txForwarder;
    }

    function initialize_update(Freeport _freeport, NFTAttachment _nftAttachment, Marketplace _marketplace, Auction _auction, address _txForwarder) external onlyRole(DEFAULT_ADMIN_ROLE) {
        freeport = _freeport;
        nftAttachment = _nftAttachment;
        marketplace = _marketplace;
        auction = _auction;

        txForwarder = _txForwarder;
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
    mapping(address => mapping(address => bool)) mintAllowance;

    /** Allowance mapping for mint on behalf for each Collection.
     */
    bytes32 public constant COLLECTION_MANAGER_ROLE = keccak256("COLLECTION_MANAGER_ROLE");

    // The address of Marketplace contract.
    Marketplace public marketplace;
    // The address of Auction contract.
    Auction public auction;
    // Transaction forwarder
    address public txForwarder;

    /** An event emitted when new collection is created.
     *
     * Contains unique name of collection and its address.
     */
    event CollectionCreated(string name, address indexed addr);

    /** An event emitted when NFT is minted on behalf of factory.
     */
    event MintOnBehalf(address _operator, address _collection, address _holder, uint256 _id, uint64 _amount);

    /**
     * @dev Emitted when `value` tokens of token type `id` are transferred from `from` to `to` by `operator`.
     */
    event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value);

    /**
     * @dev Equivalent to multiple {TransferSingle} events, where `operator`, `from` and `to` are the same for all
     * transfers.
     */
    event TransferBatch(address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] values);

    /** Deploying a new user collection.
     *
     *  Emits a {CollectionCreated} event.
     */
    function createCollection(address collectionManager, string memory name, string memory uriTpl, string memory contractURI) external returns (address) {
        //        require(hasRole(COLLECTION_CREATOR_ROLE, _msgSender()), "only collection creator");
        require(collectionManager != address(0), "zero address collection manager");
        require(nameToCollection[name] == address(0), "collection name already exists");

        Collection collection = new Collection();
        collection.initialize(address(this), collectionManager, name, uriTpl, contractURI, freeport, nftAttachment, marketplace, auction, txForwarder, this);

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

    /**
     * @dev This method merely a hook for {IERC1155-TransferSingle} on Collection.
     */
    function transferSingleHook(address operator, address from, address to, uint256 nftId, uint256 amount) external {
        address sender = _msgSender();
        (address collection, uint32 innerId, uint64 supply) = _parseNftId(nftId);
        require(collection == sender, "collection does not have this NFT");

        emit TransferSingle(operator, from, to, nftId, amount);
    }

    /**
     * @dev This method merely a hook for {IERC1155-TransferBatch} on Collection.
     */
    function transferBatchHook(address operator, address from, address to, uint256[] memory ids, uint256[] memory amounts) external {
        address sender = _msgSender();
        for (uint256 i = 0; i < ids.length; ++i) {
            (address collection, uint32 innerId, uint64 supply) = _parseNftId(ids[i]);
            require(collection == sender, "collections does not have provided NFT");
        }

        emit TransferBatch(operator, from, to, ids, amounts);
    }

    function parseNftId(uint256 id) pure external
    returns (address collection, uint32 innerId, uint64 supply) {
        return _parseNftId(id);
    }
}
