pragma solidity ^0.8.0;

import "./freeportParts/BaseNFT.sol";
import "./Freeport.sol";
import "./NFTAttachment.sol";

/** This this contract describes the collection of NFTs associated with a particular user.
 *
 */
contract Collection is BaseNFT {
    function initialize(address admin, address minter, string memory _name, string memory _uri, string memory __contractURI, Freeport _freeport, NFTAttachment _nftAttachment) public initializer {
        __BaseNFT_init();
        _setURI(_uri);
        _setupRole(DEFAULT_ADMIN_ROLE, admin);
        _setupRole(COLLECTION_MANAGER_ROLE, minter);

        name = _name;
        _contractURI = __contractURI;
        freeport = Freeport(_freeport);
        nftAttachment = NFTAttachment(_nftAttachment);
    }

    // Name of the collection for open sea.
    string public name;
    // Contract metadata URI of the collection.
    string private _contractURI;
    /** Collection manager role.
     *  Used for configuring the amounts and beneficiaries of royalties on primary and secondary transfers of this NFT.
     */
    bytes32 public constant COLLECTION_MANAGER_ROLE = keccak256("COLLECTION_MANAGER_ROLE");
    // The address of Freeport contract.
    Freeport public freeport;
    // The address of NFTAttachment contract.
    NFTAttachment public nftAttachment;
    /** A counter of NFT types issued.
     * This is used to generate unique NFT IDs.
     */
    uint32 public idCounter;

    function contractURI() public view returns (string memory) {
        return _contractURI;
    }

    /// Issuer interface
    /** Issue NFT of a new type, and return its ID.
     *
     * No more NFT of this type can be issued again.
     *
     * The caller will be recorded as the issuer and it will initially own the NFT.
     */
    function issueNft(uint64 supply, bytes memory data)
    public returns (uint256) {
        require(hasRole(COLLECTION_MANAGER_ROLE, _msgSender()), "only manager");
        return getGlobalNftId(_issueAs(_msgSender(), supply, data));
    }

    /** Internal implementation of the function issue.
     */
    function _issueAs(address issuer, uint64 supply, bytes memory data)
    internal returns (uint32) {
        _mint(issuer, idCounter + 1, supply, data);

        idCounter = idCounter + 1;
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
        require(hasRole(COLLECTION_MANAGER_ROLE, _msgSender()), "only manager");

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

    /** Return the current configuration of royalties for all NFTs of the collection.
     */
    function getRoyalties()
    public view returns (
        address primaryRoyaltyAccount,
        uint256 primaryRoyaltyCut,
        uint256 primaryRoyaltyMinimum,
        address secondaryRoyaltyAccount,
        uint256 secondaryRoyaltyCut,
        uint256 secondaryRoyaltyMinimum
    ) {
        return freeport.getRoyalties(getGlobalNftId(1)); // we are checking only the first minted NFT because we do not have interface for collection to set up royalties of specific NFTs.
    }

    /** Return the amount of royalties earned by a beneficiary on each primary and secondary transfer of an NFT.
     *
     * This function supports Joint Accounts. If royalties are paid to a JA and beneficiary is an owner of the JA,
     * the shares of the royalties for this owner are returned.
     */
    function getRoyaltiesForBeneficiary(address beneficiary)
    public view returns (uint256 primaryCut, uint256 primaryMinimum, uint256 secondaryCut, uint256 secondaryMinimum) {
        return freeport.getRoyaltiesForBeneficiary(getGlobalNftId(1), beneficiary);
    }
    /// Royalty management interface

    /// NFT attachment interface
    /** Attach data `attachment` to the collection NFT with specific inner NFT id, as the minter of this NFT type.
     *
     * This only works for NFT IDs in the Freeport format.
     */
    function minterAttachToNFT(uint32 innerNftId, bytes calldata attachment)
    public {
        require(hasRole(COLLECTION_MANAGER_ROLE, _msgSender()), "only manager");
        nftAttachment.minterAttachToNFT(getGlobalNftId(innerNftId), attachment);
    }

    /** Attach data `attachment` to the collection NFT with specific inner NFT id.
     */
    function anonymAttachToNFT(uint32 innerNftId, bytes calldata attachment)
    public {
        nftAttachment.anonymAttachToNFT(getGlobalNftId(innerNftId), attachment);
    }
    /// NFT attachment interface

    /// NFT ID utilities
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
    /// NFT ID utilities
}
