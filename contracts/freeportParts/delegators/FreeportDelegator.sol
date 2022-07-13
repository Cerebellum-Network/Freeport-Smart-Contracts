pragma solidity ^0.8.0;

import "../../Freeport.sol";

/** Simply delegates calls to Freeport SC.
*/
abstract contract FreeportDelegator {
    function __FreeportDelegator_init(address _freeport) internal {
        freeport = _freeport;
    }

    // The address of Freeport contract.
    Freeport public freeport;

}
