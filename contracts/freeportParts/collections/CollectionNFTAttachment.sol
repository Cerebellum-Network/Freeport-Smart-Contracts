pragma solidity ^0.8.0;

import "../delegators/NFTAttachmentDelegator.sol";
import "../access_control/WithCollectionManager.sol";

/** NFT attachment for Collection.
*/
abstract contract CollectionNFTAttachment is NFTAttachmentDelegator, WithCollectionManager {
    function __CollectionNFTAttachment_init(address _nftAttachment) internal initializer {
        __NFTAttachmentDelegator_init(_nftAttachment);
    }

    /** Attach data `attachment` to the collection NFT with specific inner NFT id, as the minter of this NFT type.
     *
     * This only works for NFT IDs in the Freeport format.
     */
    function minterAttachToNFT(uint256 nftId, bytes calldata attachment)
    public onlyRole(COLLECTION_MANAGER_ROLE) {
        nftAttachment.minterAttachToNFT(nftId, attachment);
    }

    /** Attach data `attachment` to the collection NFT with specific inner NFT id.
     */
    function anonymAttachToNFT(uint256 nftId, bytes calldata attachment)
    public {
        nftAttachment.anonymAttachToNFT(nftId, attachment);
    }
}
