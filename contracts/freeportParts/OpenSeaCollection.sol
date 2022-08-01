pragma solidity ^0.8.0;

/** Open sea compatible NFT collection.
 */
abstract contract OpenSeaCollection {
    function __OpenSeaCollection_init(string memory _name, string memory __contractURI) internal {
        name = _name;
        _contractURI = __contractURI;
    }

    // Name of the collection for open sea.
    string public name;
    // Contract metadata URI of the collection.
    string private _contractURI;

    function contractURI() public view returns (string memory) {
        return _contractURI;
    }
}
