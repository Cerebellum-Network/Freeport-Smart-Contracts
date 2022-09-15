pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Strings.sol";
import "./freeportParts/collections/CollectionRoyalties.sol";
import "./freeportParts/collections/CollectionIssuance.sol";
import "./freeportParts/collections/CollectionNFTAttachment.sol";
import "./freeportParts/OpenSeaCollection.sol";
import "./freeportParts/BaseTransferOperator.sol";
import "./freeportParts/BaseNFT.sol";
import "./Marketplace.sol";
import "./CollectionFactory.sol";
import "./Auction.sol";


/** This this contract describes the collection of NFTs associated with a particular user.
 *
 */
contract Collection is OpenSeaCollection, CollectionRoyalties, CollectionIssuance, CollectionNFTAttachment, BaseTransferOperator, BaseNFT {

    using Strings for uint256;

    function initialize(address admin, address manager, string memory _name, string memory _uri, string memory __contractURI, Freeport _freeport, NFTAttachment _nftAttachment, Marketplace _marketplace, Auction _auction, CollectionFactory _collectionFactory) public initializer {
        __OpenSeaCollection_init(_name, __contractURI);
        __CollectionRoyalties_init(_freeport);
        __CollectionNFTAttachment_init(_nftAttachment);
        __CollectionIssuance_init();
        __BaseTransferOperator_init();
        __BaseNFT_init();
        if (bytes(_uri).length != 0) _setURI(_uri);
        collectionFactory = _collectionFactory;

        _setupRole(TRANSFER_OPERATOR, address(_marketplace));
        _setupRole(TRANSFER_OPERATOR, address(_auction));

        _setupRole(DEFAULT_ADMIN_ROLE, admin);
        _setupRole(COLLECTION_MANAGER_ROLE, manager);
        _setupRole(COLLECTION_MANAGER_ROLE, admin);
    }

    /** Native Collection factory.
     */
    CollectionFactory collectionFactory;

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(CollectionIssuance, BaseTransferOperator, BaseNFT, AccessControlUpgradeable) returns (bool) {
        return interfaceId == type(CollectionIssuance).interfaceId
        || interfaceId == type(BaseTransferOperator).interfaceId
        || interfaceId == type(BaseNFT).interfaceId
        || interfaceId == type(AccessControlUpgradeable).interfaceId
        || super.supportsInterface(interfaceId);
    }

    // Enable the implementation of meta transactions (ERC2771).
    function _msgSender() internal view virtual override(BaseNFT, ContextUpgradeable) returns (address sender) {
        return super._msgSender();
    }

    // Enable the implementation of meta transactions (ERC2771).
    function _msgData() internal view virtual override(BaseNFT, ContextUpgradeable) returns (bytes calldata) {
        return super._msgData();
    }

    function isApprovedForAll(address account, address operator)
    public view virtual override(BaseTransferOperator, ERC1155Upgradeable) returns (bool) {
        return super.isApprovedForAll(account, operator);
    }

    /**
     * @dev Wrapper around {IERC1155-balanceOf}.
     *
     * Convenient way of getting NFT balance.
     */
    function balanceOfGlobalNftId(address account, uint256 nftId) public view returns (uint256) {
        (address issuer, uint32 innerId, uint64 supply) = _parseNftId(nftId);
        return ERC1155Upgradeable.balanceOf(account, innerId);
    }

    /** @dev URI override for OpenSea traits compatibility. */
    function uri(uint256 nftId) override public view returns (string memory) {
        return string(abi.encodePacked(ERC1155Upgradeable.uri(nftId), Strings.toString(nftId)));
    }

    // Hooks

    function _onTransferSingle(
        address operator,
        address from,
        address to,
        uint256 id,
        uint256 amount
    ) override internal {
        collectionFactory.transferSingleHook(operator, from, to, id, amount);
    }

    function _onTransferBatch(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts
    ) override internal {
        collectionFactory.transferBatchHook(operator, from, to, ids, amounts);
    }
}
