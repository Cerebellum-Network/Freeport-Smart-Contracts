## Contract `PolygonChildERC20`

An implementation of ChildERC20 used by the Polygon bridge.

This contract contains a bridge account. The balance of the bridge represents all the tokens
that exist on other chains (Cere Chain and Cere ERC20 on Ethereum).

See https://docs.matic.network/docs/develop/ethereum-matic/pos/mapping-assets




#### `constructor()` (internal)

Fill the bridge with the supply of CERE tokens on all chains.

Sets the deployer account as ChainManager. To enable the bridge, change it to the actual ChainManager
using updateChildChainManager.



#### `currencyInBridge() → uint256` (external)

Return the total amount of currency available in the bridge, which can be deposited into this contract.



#### `updateChildChainManager(address newChildChainManagerProxy)` (external)

Change the ChainManager, which can deposit currency into any account.

Only the current ChainManager is allowed to change the ChainManager.



#### `deposit(address user, bytes depositData)` (external)

Deposit currency from Ethereum into a user account in this contract.

This is implemented by moving tokens from the bridge account to the user account.

Two events will be emitted: ERC20 Transfer for the relayers, and ERC1155 TransferSingle like all transfers.

There is an extra encoding necessary for the amount. In JavaScript, add this:
`web3.eth.abi.encodeParameter('uint256', amount)`



#### `withdraw(uint256 amount)` (external)

Withdraw currency from a user account in this contract to Ethereum.

This is implemented by moving tokens from the user account to the bridge account.

Two events will be emitted: ERC20 Transfer for the relayers, and ERC1155 TransferSingle like all transfers.




#### `Transfer(address from, address to, uint256 value)` (event)

ERC20 Transfer event for bridging this ERC1155 contract to ERC20 on Ethereum.



