pragma solidity ^0.8.0;

import "./freeportParts/MetaTxContext.sol";
import "./Collection.sol";

/** This is a contract for creating standalone contracts (collections) for users.
 *
 */
contract CollectionFoundation is MetaTxContext  {
    function __CollectionIssuer_init() internal {
        __MetaTxContext_init();
    }

    // Standalone user collections.
    mapping(string => address) nameToCollection;

    // Deploying a new user collection.
    function createCollection(string memory name) public returns (address) {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "only admin");
        require(nameToCollection[name] == address(0), "already deployed");

        Collection collection = new Collection();
        collection.initialize();
        collection.setName(name);
        nameToCollection[name] = address(collection);
        return address(collection);
    }

    // Get a user collection by name.
    function takeCollection(string memory name) public view returns (address) {
        return nameToCollection[name];
    }

}
