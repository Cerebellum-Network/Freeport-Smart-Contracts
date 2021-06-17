pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/utils/Context.sol";

/**
 * Hold configuration of NFTs: services, fees, royalties.
 */
contract Controller is Context, IERC1155 {
    uint256 public constant WCERE = 0;

    address public serviceProvider;
    uint256 public serviceTransferFee;
    uint256 public serviceIssuanceFee;

    // Token ID to fee beneficiary.
    mapping(uint256 => bool) public tokenExists;
    mapping(uint256 => address) public beneficiaries;
    mapping(uint256 => uint256) public beneficiaryFees;

    constructor() {
        serviceProvider = _msgSender();
        serviceTransferFee = 10;
        serviceIssuanceFee = 10;
    }

    function issue(uint32 nonce, uint256 supply, bytes memory data) public returns (uint256) {
        address issuer = _msgSender();
        return _issueAs(issuer, nonce, supply, data);
    }

    function _issueAs(address issuer, uint32 nonce, uint256 supply, bytes memory data) internal returns (uint256) {
        uint256 id = _makeId(issuer, nonce, supply);

        // Pay issuance fee.
        if (serviceIssuanceFee != 0) {
            safeTransferFrom(
                issuer,
                serviceProvider,
                WCERE,
                serviceIssuanceFee,
                ""
            );
        }

        require(tokenExists[id] == false);
        tokenExists[id] = true;

        _mint(issuer, id, supply, "");

        return id;
    }

    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal {
        // Do not apply on pure currency transfers.
        // This also prevents recursion.
        bool all_currency = true;
        for (uint256 i = 0; i < ids.length; ++i) {
            uint256 token_id = ids[i];
            if (token_id != WCERE) {
                all_currency = false;
                break;
            }
        }
        if (all_currency) return;

        // Pay a fee per transfer to a beneficiary, if any.
        for (uint256 i = 0; i < ids.length; ++i) {
            uint256 token_id = ids[i];
            uint256 beneficiaryFee = beneficiaryFees[token_id];

            if (beneficiaryFee != 0) {
                address beneficiary = beneficiaries[token_id];
                safeTransferFrom(
                    from,
                    beneficiary,
                    WCERE,
                    beneficiaryFee,
                    ""
                );
            }
        }

        // Pay a fee per transfer to the service provider.
        if (serviceTransferFee != 0) {
            safeTransferFrom(
                from,
                serviceProvider,
                WCERE,
                serviceTransferFee * ids.length,
                ""
            );
        }
    }

    function configure_nft(uint256 id, address beneficiary, uint256 fee) public {
        address issuer = _msgSender();
        require(_isIssuerAndOwner(issuer, id));
        require(beneficiary != address(0));

        beneficiaries[id] = beneficiary;
        beneficiaryFees[id] = fee;
    }


    function _isIssuer(address addr, uint256 id) internal returns (bool) {
        (address issuer, uint32 nonce, uint64 supply) = _parseId(id);
        return addr == issuer;
    }

    function _isIssuerAndOwner(address addr, uint256 id) internal returns (bool) {
        (address issuer, uint32 nonce, uint64 supply) = _parseId(id);
        uint64 balance = uint64(balanceOf(issuer, id));

        bool isIssuer = addr == issuer;
        bool ownsAll = balance == supply;
        return isIssuer && ownsAll;
    }

    function _makeId(address issuer, uint32 nonce, uint64 supply) internal returns (uint256) {
        // issuer || nonce || supply: 160 + 32 + 64 = 256 bits
        uint256 id = (uint256(issuer) << (32 + 64))
        + (nonce << 64)
        + supply;
        return id;
    }

    function _parseId(uint256 id) internal returns (address issuer, uint32 nonce__, uint64 supply_) {
        issuer = address((id & 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF000000000000000000000000) >> (32 + 64));
        nonce__ = uint32((id & 0x0000000000000000000000000000000000000000FFFFFFFF0000000000000000) >> 64);
        supply_ = uint64((id & 0x000000000000000000000000000000000000000000000000FFFFFFFFFFFFFFFF));
        return (issuer, nonce__, supply_);
    }
}