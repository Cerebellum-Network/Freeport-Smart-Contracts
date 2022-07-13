pragma solidity ^0.8.0;

import "../../NFTAttachment.sol";

/** Simply delegates calls to NFTAttachment SC.
*/
abstract contract NFTAttachmentDelegator {
    function __NFTAttachmentDelegator_init(address _nftAttachment) internal {
        nftAttachment = _nftAttachment;
    }

    // The address of NFTAttachment contract.
    NFTAttachment public nftAttachment;

}
