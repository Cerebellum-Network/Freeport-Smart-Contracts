pragma solidity ^0.8.0;

import "./Issuance.sol";

/**
A Joint Account (JA) is an account such that multiple owners have a claim on their respective share of the funds.
Joint Accounts support the contract currency only. They cannot be used for NFTs.
An owner may be another Joint Account, or a smart contract.
It is possible to withdraw funds through nested JAs,
because anyone can trigger a withdrawal from a JA to its owners,
including if that owner is itself a JA.
[An implementation that distributes to all owners at once.]
*/
abstract contract JointAccounts is Issuance {
    function __JointAccounts_init() internal {
        __Issuance_init();
    }

    /** The total fraction representing 100% of an account.
     */
    uint256 public constant BASIS_POINTS = 100 * 100;

    uint256 public constant MAX_JOINT_ACCOUNT_SHARES = 10;

    struct JointAccountShare {
        address owner;
        uint256 fraction;
    }

    mapping(address => JointAccountShare[]) public jointAccounts;

    /** Notify that a Joint Account was created at the address `account`.
     *
     * One such event is emitted for each owner, including his fraction of the account in basis points (1% of 1%).
     */
    event JointAccountShareCreated(
        address indexed account,
        address indexed owner,
        uint256 fraction);

    /** Create an account such that multiple owners have a claim on their respective share.
     *
     * The size of a share is given as a fraction in basis points (1% of 1%). The sum of share fractions must equal 10,000.
     *
     * Anyone can create Joint Accounts including any owners.
     */
    function createJointAccount(address[] memory owners, uint256[] memory fractions)
    public returns (address) {
        require(owners.length == fractions.length, "Arrays of owners and fractions must have the same length");
        require(owners.length <= MAX_JOINT_ACCOUNT_SHARES, "Too many shares");

        address account = makeAddressOfJointAccount(owners, fractions);
        JointAccountShare[] storage newShares = jointAccounts[account];

        require(newShares.length == 0, "The account already exists");

        uint256 totalFraction = 0;
        for (uint256 i = 0; i < owners.length; i++) {
            address owner = owners[i];
            uint256 fraction = fractions[i];
            require(owner != address(0) && fraction != 0, "0 values are not permitted");

            newShares.push(JointAccountShare({owner : owner, fraction : fraction}));
            totalFraction += fraction;

            emit JointAccountShareCreated(account, owner, fraction);
        }
        require(totalFraction == BASIS_POINTS, "Total fractions must be 10,000");

        return account;
    }

    /** Distribute all tokens available to all owners of a Joint Account.
     *
     * The function createJointAccount must be called beforehand.
     *
     * Anyone can trigger the distribution.
     */
    function distributeJointAccount(address account)
    public {
        uint accountBalance = balanceOf(account, CURRENCY);
        JointAccountShare[] storage shares = jointAccounts[account];

        for (uint i = 0; i < shares.length; i++) {
            JointAccountShare storage share = shares[i];
            uint256 ownerBalance = accountBalance * share.fraction / BASIS_POINTS;
            sendShare(account, share.owner, ownerBalance);
        }
    }

    /** Generate a unique address identifying a list of owners and shares.
     *
     * It may be used to predict the address of a Joint Account and receive payments
     * even before calling the function createJointAccount.
     */
    function makeAddressOfJointAccount(address[] memory owners, uint256[] memory fractions)
    public pure returns (address) {
        bytes32 hash = keccak256(abi.encodePacked(owners, fractions));
        return address(bytes20(hash));
    }

    /** Return the fraction of an account owned by the given address, in basis points (1% of 1%).
     *
     * If the account does not exist, or if the given address is not an owner of it, this returns 0.
     * If the owner appears more than once in the account, this reports only the first share.
     */
    function fractionOfJAOwner(address account, address maybeOwner)
    public view returns (uint) {
        JointAccountShare[] storage shares = jointAccounts[account];

        for (uint256 i = 0; i < shares.length; i++) {
            JointAccountShare storage share = shares[i];
            if (share.owner == maybeOwner) {
                return share.fraction;
            }
        }
        return 0;
    }

    /** Calculate the amount of tokens that an owner of a Joint Account can withdraw right now.
     */
    function balanceOfJAOwner(address account, address owner)
    public view returns (uint256) {
        uint fraction = fractionOfJAOwner(account, owner);
        uint accountBalance = balanceOf(account, CURRENCY);
        uint256 ownerBalance = accountBalance * fraction / BASIS_POINTS;
        return ownerBalance;
    }

}