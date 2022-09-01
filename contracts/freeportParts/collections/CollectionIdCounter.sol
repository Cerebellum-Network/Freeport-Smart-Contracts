pragma solidity ^0.8.0;

abstract contract CollectionIdCounter {
    /** A counter of NFT types.
     * This is used to generate unique NFT IDs.
     */
    uint32 public idCounter;
}
