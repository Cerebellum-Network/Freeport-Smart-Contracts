pragma solidity ^0.8.0;

import "./Issuance.sol";

/**
Handle accounts of multiple owners.
Each owner of an account has a claim to a share of its funds.

Distribution Accounts support the contract currency only. They cannot be used for NFTs.

An owner may be another Distribution Account, or a smart contract.
It is possible to withdraw funds through nested DAs,
because anyone can trigger a withdrawal from a DA to its owners,
including if that owner is itself a DA.

[An implementation that distributes to all owners at once.]
*/
contract DistributionAccounts2 is Issuance {
    /** The reference number of shares representing 100% of an account.
     */
    uint256 public BASIS_POINTS = 100 * 100;

    uint256 public MAX_DA_OWNERS = 10;

    struct DAShare {
        address owner;
        uint256 basisPoints;
    }

    mapping(address => DAShare[]) public distributionAccounts;

    event DistributionAccountCreated(
        address indexed account,
        address indexed owner,
        uint256 basisPoints);

    /** Create an account such that multiple owners have a claim on their respective share.
     *
     * The share numbers are given in basis points (1% of 1%). The sum of shares must equal 10,000.
     *
     * Anyone can create distribution accounts including any owners.
     */
    function createDistributionAccount(address[] memory owners, uint256[] memory basisPointss)
    public returns (address) {
        require(owners.length == basisPointss.length, "Arrays of owners and shares must have the same length");
        require(owners.length <= MAX_DA_OWNERS, "Too many owners");

        address account = getAddressOfDistributionAccount(owners, basisPointss);
        DAShare[] storage storeShares = distributionAccounts[account];

        require(storeShares.length == 0, "The account already exists");

        uint256 totalPoints = 0;
        for (uint256 i = 0; i < owners.length; i++) {

            address owner = owners[i];
            uint256 basisPoints = basisPointss[i];
            require(owner != address(0) && basisPoints != 0, "0 values are not permitted");

            storeShares.push(DAShare({owner : owner, basisPoints : basisPoints}));
            totalPoints += basisPoints;

            emit DistributionAccountCreated(account, owner, basisPoints);
        }
        require(totalPoints == BASIS_POINTS, "Total shares must be 10,000");

        return account;
    }

    /** Withdraw all tokens available to all owners of a distribution account.
     *
     * The function createDistributionAccount must be called beforehand.
     *
     * Anyone can trigger the withdrawal.
     */
    function distributeAccount(address account)
    public {
        uint accountBalance = balanceOf(account, CURRENCY);
        DAShare[] storage shares = distributionAccounts[account];

        for (uint i = 0; i < shares.length; i++) {
            DAShare storage share = shares[i];
            uint256 ownerBalance = accountBalance * share.basisPoints / BASIS_POINTS;

            _forceTransfer(account, share.owner, CURRENCY, ownerBalance);
        }
    }

    /** Generate a unique address identifying a list of owners and shares.
     *
     * It may be used to predict the address of a distribution account and receive payments
     * even before calling the function createDistributionAccount.
     */
    function getAddressOfDistributionAccount(address[] memory owners, uint256[] memory shares)
    public pure returns (address) {
        bytes32 hash = keccak256(abi.encodePacked(owners, shares));
        return address(bytes20(hash));
    }

    /** Return the share of an account owned by the given address, in basis points (1% of 1%).
     *
     * If the account does not exist, or if the given address is not an owner of it, this returns 0.
     * If the owner appears more than once in the account, this reports only the first share.
     */
    function getShareOfOwner(address account, address maybeOwner)
    public view returns (uint) {
        DAShare[] storage storeShares = distributionAccounts[account];
        for (uint256 i = 0; i < storeShares.length; i++) {

            DAShare storage share = storeShares[i];
            if (share.owner == maybeOwner) {
                return share.basisPoints;
            }
        }
        return 0;
    }

    /** Calculate the amount of tokens that an owner of a distribution account can withdraw right now.
     */
    function availableToOwnerOfDistributionAccount(address account, address owner)
    public view returns (uint256) {
        uint basisPoints = getShareOfOwner(account, owner);
        uint accountBalance = balanceOf(account, CURRENCY);
        uint256 ownerBalance = accountBalance * basisPoints / BASIS_POINTS;
        return ownerBalance;
    }

}