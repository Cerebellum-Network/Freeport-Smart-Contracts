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

    // ----
    event MinterAttachToNFT1(
        address indexed minter,
        uint256 indexed nftId,
        bytes attachment);

    function minterAttachToNFT1(uint256 nftId, bytes calldata attachment)
    public {
        require(nftId != CURRENCY, "0 is not a valid NFT ID");
        address minter = _msgSender();
        address actualMinter = _minterFromNftId(nftId);
        require(minter == actualMinter, "Only minter");
        emit MinterAttachToNFT1(minter, nftId, attachment);
    }

    // ----
    event MinterAttachToNFT2(
        address indexed minter,
        uint256 indexed nftId,
        bytes32 a, bytes32 b);

    function minterAttachToNFT2(uint256 nftId, bytes32 a, bytes32 b)
    public {
        require(nftId != CURRENCY, "0 is not a valid NFT ID");
        address minter = _msgSender();
        address actualMinter = _minterFromNftId(nftId);
        require(minter == actualMinter, "Only minter");
        emit MinterAttachToNFT2(minter, nftId, a, b);
    }

    // ----
    event MinterAttachToNFT3(
        address indexed minter,
        uint256 indexed nftId,
        bytes32 a, bytes32 b, bytes32 c, bytes32 d);

    function minterAttachToNFT3(uint256 nftId, bytes32 a, bytes32 b, bytes32 c, bytes32 d)
    public {
        require(nftId != CURRENCY, "0 is not a valid NFT ID");
        address minter = _msgSender();
        address actualMinter = _minterFromNftId(nftId);
        require(minter == actualMinter, "Only minter");
        emit MinterAttachToNFT3(minter, nftId, a, b, c, d);
    }

    // ----
    event MinterAttachToNFT4(
        uint64 len,
        address indexed minter,
        uint256 indexed nftId,
        bytes32 a, bytes32 b, bytes32 c);

    function minterAttachToNFT4(uint256 nftId, uint64 len, bytes32 a, bytes32 b, bytes32 c)
    public {
        require(nftId != CURRENCY, "0 is not a valid NFT ID");
        address minter = _msgSender();
        address actualMinter = _minterFromNftId(nftId);
        require(minter == actualMinter, "Only minter");
        emit MinterAttachToNFT4(len, minter, nftId, a, b, c);
    }

    // ----
    function minterAttachToNFT0(uint256 nftId, bytes calldata attachment)
    public {
        require(nftId != CURRENCY, "0 is not a valid NFT ID");
        address minter = _msgSender();
        address actualMinter = _minterFromNftId(nftId);
        require(minter == actualMinter, "Only minter");
    }

}
