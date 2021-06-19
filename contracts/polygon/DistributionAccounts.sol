pragma solidity ^0.8.0;

import "./Issuance.sol";

/**
Handle accounts of multiple owners.
Each owner of an account has a claim to a share of its funds.

Distribution accounts support the contract currency only. They cannot be used for NFTs.

Owners must be external accounts; nesting distribution accounts is not supported.
*/
contract DistributionAccounts is Issuance {
    /** The reference number of shares representing 100% of an account.
     */
    uint256 public TOTAL_SHARES = 10000;

    /** Account + Owner => The share of the account that belongs to the owner.
     */
    mapping(address => mapping(address => uint256)) public accountOwnerShares;

    /** Account + Owner => The amount already withdrawn by this owner.
     */
    mapping(address => mapping(address => uint256)) public accountOwnerWithdrawn;

    /** Account => The total amount already withdrawn by all owners.
     *
     * The all-time earnings of the account is this number + the current balance of the account.
     */
    mapping(address => uint256) public accountTotalWithdrawn;

    /** Create an account such that multiple owners have a claim on their respective share.
     *
     * The share numbers are given as a fraction of the TOTAL_SHARES constant. The sum of shares must equal TOTAL_SHARES.
     * An owner address can not be repeated.
     *
     * Anyone can create distribution accounts including any owners.
     */
    function createDistributionAccount(address[] memory owners, uint256[] memory shares)
    public returns (address) {
        address account = getAddressOfDistributionAccount(owners, shares);

        uint256 totalShares = 0;
        for (uint256 i = 0; i < owners.length; i++) {
            require(accountOwnerShares[account][owners[i]] == 0);

            accountOwnerShares[account][owners[i]] = shares[i];
            totalShares += shares[i];
        }
        require(totalShares == TOTAL_SHARES);

        return account;
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

    /** Calculate the amount of tokens that an owner of a distribution account can withdraw right now.
     */
    function availableToOwnerOfDistributionAccount(address account, address owner)
    public view returns (uint256) {
        uint256 accountEarned = balanceOf(account, CURRENCY) + accountTotalWithdrawn[account];
        uint256 ownerShare = accountOwnerShares[account][owner];
        uint256 ownerEarned = accountEarned * ownerShare / TOTAL_SHARES;
        uint256 ownerWithdrawn = accountOwnerWithdrawn[account][owner];
        uint256 ownerAvailable = ownerEarned - ownerWithdrawn;
        return ownerAvailable;
    }

    /** Withdraw all tokens available to an owner of a distribution account.
     *
     * The function createDistributionAccount must be called beforehand.
     */
    function withdrawFromDistributionAccount(address account)
    public returns (uint256) {
        address owner = _msgSender();
        uint256 ownerAvailable = availableToOwnerOfDistributionAccount(account, owner);

        if (ownerAvailable == 0) return 0;

        accountTotalWithdrawn[account] += ownerAvailable;
        accountOwnerWithdrawn[account][owner] += ownerAvailable;

        safeTransferFrom(
            account,
            owner,
            CURRENCY,
            ownerAvailable,
            ""
        );

        return ownerAvailable;
    }
}