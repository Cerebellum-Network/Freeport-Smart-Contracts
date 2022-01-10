pragma solidity ^0.8.0;

import "./freeportParts/MetaTxContext.sol";

/** The contract NFTAttachment allows users to attach objects to NFTs.
 * Some application can listen for the events and interpret the objects in some way.
 *
 * There are two roles who can attach objects to an NFT:
 * the minter, or any anonymous account.
 * A different event is emitted for each role.
 *
 * The attachment data is meant to identify an object hosted externally,
 * such as a CID, a.k.a. Content Identifier, or a DDC URL.
 * The content may be retrieved from Cere DDC or some other store.
 */
contract NFTGlobalAttachment is /* AccessControl, */ MetaTxContext {

    /** The account `minter` wished to attach data `attachment` to the NFT type `nftId`.
     *
     * The `minter` is the minter who created this NFT type, or may create it in the future if it does not exist.
     */
    event MinterAttachToNFT(
        uint256 chainId,
        address originContract,
        uint256 nftId,
        bytes attachment);

    /** The account `anonym` wished to attach data `attachment` to the NFT type `nftId`.
     *
     * There is absolutely no validation. It is the responsibility of the reader of this event to decide
     * who the sender is and what the attachment means.
     */
    event AnonymAttachToNFT(
        address anonym,
        uint256 chainId,
        address originContract,
        uint256 nftId,
        bytes attachment);

    /** Attach data `attachment` to the NFT type `nftId`, as the minter of this NFT type.
     * Using the minter address in the NFT ID.
     */
    function minterAttachToNFT(
        uint256 chainId, address originContract, /*address minter,*/ uint nftId,
        bytes calldata attachment)
    public {
        address minter = _msgSender();
        uint expectedMinter = getMinter(nftId);
        require(minter == expectedMinter, "Only minter");

        emit MinterAttachToNFT(chainId, originContract, nftId, attachment);
    }

    /** Attach data `attachment` to the NFT type `nftId`, as any account.
     */
    function anonymAttachToNFT(uint256 nftId, bytes calldata attachment)
    public {
        address anonym = _msgSender();
        emit AnonymAttachToNFT(anonym, chainId, originContract, nftId, attachment);
    }

    function getMinter(uint256 nftId)
    public view returns (address minter) {
        minter = address(uint160(nftId >> 96));
    }
}
