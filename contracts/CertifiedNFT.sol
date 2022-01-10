pragma solidity ^0.8.0;

/** Goals:
- Verifiable minter.
- Cross-chain / cross-platform identification.
- Legacy compatibility.
*/

/** An NFT contract that can authenticate the minter of an NFT. */
interface INFTCertifiable {
    function isMinter(uint256 nftId, address account) external view returns (bool);
}

/** An NFT contract that can return the minter of an NFT. */
interface INFTGetMinter {
    function getMinter(uint256 nftId) external view returns (address);
}

/** An NFT contract that can authenticate the minter of an NFT, cross-chain.
 * The NFT ID includes the minter address.
 */
interface INFTCertifiableXChain {
    /** The NFT contract must use this function to generate its NFT IDs. */
    function getMinterNftId(address minter, uint96 nftNumber) returns (uint256);
}

abstract contract NFTMinterID is INFTCertifiable, INFTCertifiableXChain {
    uint constant FIRST_20_BYTES = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF000000000000000000000000;

    /** INFTCertifiableXChain */
    function getMinterNftId(address minter, uint96 nftNumber)
    public returns (uint256 nftId) {
        nftId = (uint256(uint160(minter)) << 96) | uint256(nftNumber);
    }

    function getMinter(uint256 nftId)
    public view returns (address minter) {
        minter = address(uint160(nftId >> 96));
    }

    /** INFTCertifiable */
    function isMinter(uint256 nftId, address account)
    public view returns (bool) {
        address minter = getMinter(nftId);
        return (account == minter);
    }
}

/** An NFT contract that uses NFT certificate IDs as its NFT IDs. */
interface INFTCertified {
    /** The NFT contract must use this function to generate its NFT IDs. */
    function getCertifiedNftId(address minter, uint96 nftNumber) returns (uint256);
}

abstract contract NFTCertified is CertifiedNFT_utils {
    function getCertifiedNftId(address minter, uint96 nftNumber)
    public returns (uint256 nftId) {
        nftId = getNFTCertificateID(
            minter,
            block.chainid,
            address(this),
            uint256(originNumber));
    }
}


/**
 */
contract CertifiedNFT_utils {

    /**
     * Full size:       32 + 32 + 32 + 32 = 128
     * Packed size:     32 + 20 + 20 + 12 = 84
     * Compressed size:  1 + 20 + 20 + 1 + rle overhead = ~46
     */
    struct NFTCertificate {
        uint256 chainId;
        address originContract;
        address minter;
        uint96 originNumber; // The NFT ID in the origin NFT contract. It is usually a counter.
    }

    // NFT Certificate ID generator.
    bytes32 private constant NFT_CERTIFICATE_TYPEHASH = keccak256("NFTCertificate(uint256 chainid,address originContract,address minter,uint96 originNumber)");

    uint constant FIRST_20_BYTES = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF000000000000000000000000;
    uint constant LAST__12_BYTES = 0x0000000000000000000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFF;

    function getNFTCertificateID(uint256 chainId, address originContract, address minter, uint96 originNumber)
    public returns (uint CNFT) {
        uint hash = _hashTypedDataV4(keccak256(abi.encode(
                NFT_CERTIFICATE_TYPEHASH,
                chainId,
                originContract,
                minter,
                originNumber
            )));
        CNFT = (hash & FIRST_20_BYTES) | (originNumber & LAST__12_BYTES);
    }

    function verifyNFTCertificateID(uint CNFT, uint256 chainId, address originContract, address minter)
    public returns (bool) {
        uint originNumber = (CNFT & LAST__12_BYTES);
        uint expectCNFT = getNFTCertificateID(chainId, originContract, minter, originNumber);
        return (CNFT == expectCNFT);
    }

    function verifyNFTCertificateID_legacy(uint CNFT, uint256 chainId, address originContract, address minter, uint256 originNumber)
    public returns (bool) {
        uint expectCNFT = getNFTCertificateID(chainId, originContract, minter, originNumber);
        return (CNFT == expectCNFT);
    }
}
