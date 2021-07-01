## Contract `JointAccounts`

A Joint Account (JA) is an account such that multiple owners have a claim on their respective share of the funds.

Joint Accounts support the contract currency only. They cannot be used for NFTs.

An owner may be another Joint Account, or a smart contract.
It is possible to withdraw funds through nested JAs,
because anyone can trigger a withdrawal from a JA to its owners,
including if that owner is itself a JA.

[An implementation that distributes to all owners at once.]




#### `createJointAccount(address[] owners, uint256[] fractions) → address` (public)

Create an account such that multiple owners have a claim on their respective share.

The size of a share is given as a fraction in basis points (1% of 1%). The sum of share fractions must equal 10,000.

Anyone can create Joint Accounts including any owners.



#### `distributeJointAccount(address account)` (public)

Distribute all tokens available to all owners of a Joint Account.

The function createJointAccount must be called beforehand.

Anyone can trigger the distribution.



#### `makeAddressOfJointAccount(address[] owners, uint256[] fractions) → address` (public)

Generate a unique address identifying a list of owners and shares.

It may be used to predict the address of a Joint Account and receive payments
even before calling the function createJointAccount.



#### `fractionOfJAOwner(address account, address maybeOwner) → uint256` (public)

Return the fraction of an account owned by the given address, in basis points (1% of 1%).

If the account does not exist, or if the given address is not an owner of it, this returns 0.
If the owner appears more than once in the account, this reports only the first share.



#### `balanceOfJAOwner(address account, address owner) → uint256` (public)

Calculate the amount of tokens that an owner of a Joint Account can withdraw right now.




#### `JointAccountShareCreated(address account, address owner, uint256 fraction)` (event)

Notify that a Joint Account was created at the address `account`.

One such event is emitted for each owner, including his fraction of the account in basis points (1% of 1%).



