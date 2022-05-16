pragma solidity ^0.8.0;

import "./freeportParts/BaseNFT.sol";
import "./Freeport.sol";

/** This this contract describes the collection of NFTs associated with a particular user.
 *
 */
contract Collection is BaseNFT {
    function initialize() public initializer {
        __BaseNFT_init();
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        owner = _msgSender();
    }

    // Name of the collection for open sea.
    string public name;
    // Owner contract address.
    address public owner;
    /** Royalty manager role.
     *  Used for configuring the amounts and beneficiaries of royalties on primary and secondary transfers of this NFT.
     */
    bytes32 public constant ROYALTY_MANAGER_ROLE = keccak256("ROYALTY_MANAGER_ROLE");
    // The address of Freeport contract.
    Freeport public freeport;
    /** A counter of NFT types issued.
     * This is used to generate unique NFT IDs.
     */
    uint32 public idCounter;

    function setName(string memory newName) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "only admin");
        name = newName;
    }

    /** Sets Freeport contract address.
     */
    function setFreeport(address _freeportContract) public {
        require(freeport == Freeport(address(0)));
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()));

        freeport = Freeport(_freeportContract);
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
    public view virtual override(BaseNFT) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /// Issuer interface
    /** Issue NFT of a new type, and return its ID.
     *
     * No more NFT of this type can be issued again.
     *
     * The caller will be recorded as the issuer and it will initially own the NFT.
     */
    function issueNft(bytes memory data)
    public returns (uint256) {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "only admin");
        return _issueAs(_msgSender(), data);
    }

    /** Internal implementation of the function issue.
     */
    function _issueAs(address issuer, bytes memory data)
    internal returns (uint32) {
        idCounter = idCounter + 1;

        _mint(issuer, idCounter, 1, data);

        return idCounter;
    }
    /// Issuer interface

    /// Royalty management interface
    /** Configure the amounts and beneficiaries of royalties on primary and secondary transfers of this NFT.
     *  Delegating to Freeport implementation.
     */
    function setupRoyaltyConfiguration(
        address primaryRoyaltyAccount,
        uint256 primaryRoyaltyCut,
        uint256 primaryRoyaltyMinimum,
        address secondaryRoyaltyAccount,
        uint256 secondaryRoyaltyCut,
        uint256 secondaryRoyaltyMinimum)
    public {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender())
            || hasRole(ROYALTY_MANAGER_ROLE, _msgSender()), "only admin or royalty manager");

        for (uint32 i = 1; i <= idCounter; i++) {
            freeport.configureRoyalties(
                getGlobalNftId(i),
                primaryRoyaltyAccount,
                primaryRoyaltyCut,
                primaryRoyaltyMinimum,
                secondaryRoyaltyAccount,
                secondaryRoyaltyCut,
                secondaryRoyaltyMinimum
            );
        }
    }
    /// Royalty management interface

    /// NFT ID utilities
    /** Calculate the global ID of an NFT type, identifying its inner nft id.
     */
    function getGlobalNftId(uint32 innerNftId)
    public view returns (uint256) {
        // issuer || innerNftId || supply (always equals to 1): 160 + 32 + 64 = 256 bits
        uint256 id = (uint256(uint160(address(this))) << (32 + 64))
        | (uint256(innerNftId) << 64)
        | uint256(1);
        return id;
    }
    /// NFT ID utilities
}
