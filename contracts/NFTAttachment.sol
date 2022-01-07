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
contract NFTAttachment is /* AccessControl, */ MetaTxContext {

    /** This attachment contract refers to the NFT contract in this variable.
     */
    Freeport public freeport;

    /** The token ID that represents the internal currency for all payments in Freeport. */
    uint256 constant CURRENCY = 0;

    /** Set which NFT contract to refer to.
     *
     * The event `MinterAttachToNFT` is only supported for Freeport-compatible NFTs.
     *
     * The event `OwnerAttachToNFT` is supported for ERC-1155 NFTs, including Freeport.
     */
    constructor(Freeport _freeport) {
        require(address(_freeport) != address(0));
        freeport = _freeport;
    }

    /** The account `minter` wished to attach data `attachment` to the NFT type `nftId`.
     *
     * The `minter` is the minter who created this NFT type, or may create it in the future if it does not exist.
     */
    event MinterAttachToNFT(
        address indexed minter,
        uint256 indexed nftId,
        bytes attachment);

    /** The account `owner` wished to attach data `attachment` to the NFT type `nftId`.
     *
     * The `owner` owned at least one NFT of this type at the time of the event.
     */
    event OwnerAttachToNFT(
        address indexed owner,
        uint256 indexed nftId,
        bytes attachment);

    /** The account `anonym` wished to attach data `attachment` to the NFT type `nftId`.
     *
     * There is absolutely no validation. It is the responsibility of the reader of this event to decide
     * who the sender is and what the attachment means.
     */
    event AnonymAttachToNFT(
        address indexed anonym,
        uint256 indexed nftId,
        bytes attachment);

    /** Attach data `attachment` to the NFT type `nftId`, as the minter of this NFT type.
     *
     * This only works for NFT IDs in the Freeport format.
     */
    function minterAttachToNFT(uint256 nftId, bytes calldata attachment)
    public {
        require(nftId != CURRENCY, "0 is not a valid NFT ID");
        address minter = _msgSender();
        address actualMinter = _minterFromNftId(nftId);
        require(minter == actualMinter, "Only minter");
        emit MinterAttachToNFT(minter, nftId, attachment);
    }

    /** Attach data `attachment` to the NFT type `nftId`, as a current owner of an NFT of this type.
     *
     * This works for NFTs in the ERC-1155 or Freeport standards.
     */
    function ownerAttachToNFT(uint256 nftId, bytes calldata attachment)
    public {
        require(nftId != CURRENCY, "0 is not a valid NFT ID");
        address owner = _msgSender();
        uint256 balance = freeport.balanceOf(owner, nftId);
        require(balance > 0, "Only current owner");
        emit OwnerAttachToNFT(owner, nftId, attachment);
    }

    /** Attach data `attachment` to the NFT type `nftId`, as any account.
     */
    function anonymAttachToNFT(uint256 nftId, bytes calldata attachment)
    public {
        require(nftId != CURRENCY, "0 is not a valid NFT ID");
        address anonym = _msgSender();
        emit AnonymAttachToNFT(anonym, nftId, attachment);
    }

    /** Parse an NFT ID into its issuer, its supply, and an arbitrary nonce.
     *
     * This does not imply that the NFTs exist.
     *
     * This is specific to Freeport NFTs. See `freeportParts/Issuance.sol`
     */
    function _minterFromNftId(uint256 id)
    public pure returns (address minter) {
        minter = address(uint160((id & 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF000000000000000000000000) >> (32 + 64)));
        return minter;
    }
}
