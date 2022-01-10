pragma solidity ^0.8.0;

import "./freeportParts/MetaTxContext.sol";
import "./Freeport.sol";

/** The contract NFTAttachment allows users to attach objects to NFTs.
 * Some application can listen for the events and interpret the objects in some way.
 *
 * There are three roles who can attach objects to an NFT:
 * the minter, any current owner, or any anonymous account.
 * A different event is emitted for each role.
 *
 * The attachment data is meant to identify an object hosted externally,
 * such as a CID, a.k.a. Content Identifier, or a DDC URL.
 * The content may be retrieved from Cere DDC or some other store.
 */
contract NFTGlobal is /* AccessControl, */ MetaTxContext {

    /** The definition of an NFT which is authenticated by the NFT GID.
     */
    struct GIDDefinition {
        address minter;
        uint256 chainId;
        address originContract;
        uint256 originId; // The base NFT ID local to the NFT contract. For instance a counter.
    }

    bytes32 private constant GID_DEFINITION_TYPEHASH = keccak256("NFTDefinition(address minter,uint256 chainid,address originContract,uint256 originId)");

    event GIDDefinition(
        uint256 indexed nftGid,
        address minter,
        uint256 chainId,
        address originContract,
        uint256 originId);

    /** The account `minter` wished to attach data `attachment` to the NFT type `nftGid`.
     *
     * The `minter` is the minter who created this NFT type, or may create it in the future if it does not exist.
     */
    event MinterAttachToNFT(
        uint256 indexed nftGid,
        bytes attachment);

    /** The account `anonym` wished to attach data `attachment` to the NFT type `nftGid`.
     *
     * There is absolutely no validation. It is the responsibility of the reader of this event to decide
     * who the sender is and what the attachment means.
     */
    event AnonymAttachToNFT(
        address indexed anonym,
        uint256 indexed nftGid,
        bytes attachment);

    function getNftGid(address minter, uint256 chainId, address originContract, uint originId)
    public returns (uint nftGid) {
        nftGid = _hashTypedDataV4(keccak256(abi.encode(
                GID_DEFINITION_TYPEHASH,
                minter,
                chainId,
                originContract,
                originId
            )));
    }

    /** Attach data `attachment` to the NFT type `nftGid`, as the minter of this NFT type.
     */
    function minterAttachToNFT_globalID(
        uint256 chainId, address originContract, /*address minter,*/ uint originId,
        bytes calldata attachment)
    public {
        address minter = _msgSender();
        uint nftGid = getNftGid(chainId, originContract, minter, originId);

        emit GIDDefinition(
            nftGid,
            minter, chainId, originContract, originId);

        emit MinterAttachToNFT(nftGid, attachment);
    }

    /** Attach data `attachment` to the NFT type `nftGid`, as any account.
     */
    function anonymAttachToNFT(uint256 nftGid, bytes calldata attachment)
    public {
        address anonym = _msgSender();
        emit AnonymAttachToNFT(anonym, nftGid, attachment);
    }

    /** Record the definition of an NFT in an event.
     */
    function defineNft(address minter, uint256 chainId, address originContract, uint originId, uint256 supply)
    public returns (uint nftGid) {
        nftGid = getNftGid(minter, chainId, originContract, originId);

        emit GIDDefinition(
            nftGid,
            minter, chainId, originContract, originId);
    }


    // ---- An alternative stateful implementation. ----

    mapping(uint256 => address) public minters;

    function storeDefinition(address minter, uint256 chainId, address originContract, uint originId)
    public returns (uint nftGid) {
        nftGid = defineNft(minter, chainId, originContract, originId);
        require(minters[nftGid] == address(0), "Already defined");
        minters[nftGid] = minter;
    }

    function minterAttachToNFT_stored(
        uint nftGid,
        bytes calldata attachment)
    public {
        address minter = _msgSender();
        require(minter == minters[nftGid], "Only minter and after storeDefinition");
        emit MinterAttachToNFT(nftGid, attachment);
    }
}
