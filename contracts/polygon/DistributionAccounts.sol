pragma solidity ^0.8.0;

import "./Issuance.sol";

/**
Handle accounts of multiple owners.
Each owner of an account has a claim to a share of its funds.
 */
contract DistributionAccounts is Issuance {
    uint256 public TOTAL_SHARES = 10000;

    // Account - Owner => share.
    mapping(address => mapping(address => uint256)) public accountOwnerShares;

    // Account - Owner => amount withdrawn by this owner.
    mapping(address => mapping(address => uint256)) public accountOwnerWithdrawn;

    // Account => total amount withdrawn by all owners.
    mapping(address => uint256) public accountTotalWithdrawn;

    function createDistributionAccount(address[] memory owners, uint256[] memory shares) public returns (address) {
        address account = getAddressOfDistributionAccount(owners, shares);

        uint256 totalShares = 0;
        for (uint256 i = 0; i < owners.length; i++) {
            accountOwnerShares[account][owners[i]] = shares[i];
            totalShares += shares[i];
        }
        require(totalShares == TOTAL_SHARES);

        return account;
    }

    function getAddressOfDistributionAccount(address[] memory owners, uint256[] memory shares) public returns (address) {
        bytes32 hash = keccak256(abi.encodePacked(owners, shares));
        return address(bytes20(hash));
    }

    function availableToOwnerOfDistributionAccount(address account, address owner) public returns (uint256) {
        uint256 accountEarned = balanceOf(account, CURRENCY) + accountTotalWithdrawn[account];
        uint256 ownerShare = accountOwnerShares[account][owner];
        uint256 ownerEarned = accountEarned * ownerShare / TOTAL_SHARES;
        uint256 ownerWithdrawn = accountOwnerWithdrawn[account][owner];
        uint256 ownerAvailable = ownerEarned - ownerWithdrawn;
        return ownerAvailable;
    }

    function withdrawFromDistributionAccount(address account) public {
        address owner = _msgSender();
        uint256 ownerAvailable = availableToOwnerOfDistributionAccount(account, owner);

        accountTotalWithdrawn[account] += ownerAvailable;
        accountOwnerWithdrawn[account][owner] += ownerAvailable;

        safeTransferFrom(
            account,
            owner,
            CURRENCY,
            ownerAvailable,
            ""
        );
    }
}