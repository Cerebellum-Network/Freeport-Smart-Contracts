pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

/** Extension that creates Collection Manager role.
*/
abstract contract WithCollectionManager is AccessControlUpgradeable {
    function __WithCollectionManager_init() internal {
        __AccessControl_init();
    }

    /** Collection manager role.
     *  Used for configuring the amounts and beneficiaries of royalties on primary and secondary transfers of this NFT.
     */
    bytes32 public constant COLLECTION_MANAGER_ROLE = keccak256("COLLECTION_MANAGER_ROLE");

}

