pragma solidity ^0.8.0;

import "./Currency.sol";

/** Utility functions for global NFT ID parsing.
 */
abstract contract HasGlobalNftId {
    /** Calculate the global ID of an NFT type, identifying its inner nft id.
     */
    function getGlobalNftId(uint32 innerNftId)
    public view returns (uint256) {
        // issuer || innerNftId || supply (always equals to 0): 160 + 32 + 64 = 256 bits
        uint256 id = (uint256(uint160(address(this))) << (32 + 64))
        | (uint256(innerNftId) << 64)
        | uint256(0);
        return id;
    }

    /** Parse an NFT ID into its issuer, its inner NFT ID and its supply.
     * This does not imply that the NFTs exist.
     */
    function _parseNftId(uint256 id)
    internal pure returns (address issuer, uint32 innerId, uint64 supply) {
        issuer = address(uint160((id & 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF000000000000000000000000) >> (32 + 64)));
        innerId = /*   */ uint32((id & 0x0000000000000000000000000000000000000000FFFFFFFF0000000000000000) >> 64);
        supply = /*    */ uint64((id & 0x000000000000000000000000000000000000000000000000FFFFFFFFFFFFFFFF));
        return (issuer, innerId, supply);
    }
}
