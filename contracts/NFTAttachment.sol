pragma solidity ^0.8.0;

import "./freeportParts/MetaTxContext.sol";

/** The contract NFTAttachment allows users to attach objects to NFTs.
 * Some application can listen for the events and interpret the objects in some way.
 *
 * Anyone can attach objects to any NFT. It is the responsibility of the app to
 * interpret who the sender is and what the object means.
 *
 * An object is identified by CID, a.k.a. Content Identifier or IPFS file, of maximum 32 bytes.
 * The content may be retrieved from Cere DDC or some other store.
 */
contract NFTAttachment is /* AccessControl, */ MetaTxContext {

    /** This attachment contract refers to the NFT contract in this variable.
     * This is informative, there is no validation.
     */
    address public nftContract;

    /** Set which NFT contract to refer to.
     */
    constructor(address _nftContract) {
        nftContract = _nftContract;
    }

    /** The account `sender` wished to attach an object identified by `cid` to the NFT type `nftId`.
     *
     * There is absolutely no validation. It is the responsibility of the reader of this event to decide
     * who the sender is and what the object means.
     */
    event AttachToNFT(
        address indexed sender,
        uint256 indexed nftId,
        bytes attachment);

    /** Attach an object identified by `cid` to the NFT type `nftId`.
     *
     * There is absolutely no validation. It is the responsibility of the reader of this event to decide
     * who the sender is and what the object means.
     */
    function attachToNFT(uint256 nftId, bytes calldata attachment)
    public {
        address sender = _msgSender();
        emit AttachToNFT(sender, nftId, attachment);
    }
}
