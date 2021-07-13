pragma solidity ^0.8.0;

import "./BaseNFT.sol";

/** An implementation of ChildERC20 used by the Polygon bridge.
 *
 * This contract contains a bridge account. The balance of the bridge represents all the tokens
 * that exist on other chains (Cere Chain and Cere ERC20 on Ethereum).
 *
 * See https://docs.matic.network/docs/develop/ethereum-matic/pos/mapping-assets
 */
contract ChildERC20 is BaseNFT {

    /** ERC20 Transfer event for bridging this ERC1155 contract to ERC20 on Ethereum.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /** The address of the bridge account in this contract. */
    address public constant BRIDGE = address(0);

    /** The address of the Polygon bridge contract that is allowed to deposit tokens. */
    address public childChainManagerProxy;

    /** Fill the bridge with the supply of CERE tokens on all chains.
     *
     * Sets the deployer account as ChainManager. To enable the bridge, change it to the actual ChainManager
     * using updateChildChainManager.
     */
    constructor() {
        // _mint(BRIDGE, CURRENCY, CURRENCY_SUPPLY, "");
        //     OR
        _balances[CURRENCY][BRIDGE] = CURRENCY_SUPPLY;

        childChainManagerProxy = _msgSender();
    }

    function currencyInBridge()
    external view returns (uint256) {
        return _balances[CURRENCY][BRIDGE];
    }

    /** Change the ChainManager, which can deposit currency into any account.
     *
     * Only the current ChainManager is allowed to change the ChainManager.
     */
    function updateChildChainManager(address newChildChainManagerProxy)
    external {
        require(newChildChainManagerProxy != address(0), "Bad ChildChainManagerProxy address");
        require(_msgSender() == childChainManagerProxy, "Only the current ChainManager is allowed to change the ChainManager.");

        childChainManagerProxy = newChildChainManagerProxy;
    }

    /** Deposit currency from Ethereum into a user account in this contract.
     *
     * This is implemented by moving tokens from the bridge account to the user account.
     *
     * Two events will be emitted: ERC20 Transfer for the relayers, and ERC1155 TransferSingle like all transfers.
     *
     * There is an extra encoding necessary for the amount. In JavaScript, add this:
     * `web3.eth.abi.encodeParameter('uint256', amount)`
     */
    function deposit(address user, bytes calldata depositData)
    external {
        require(_msgSender() == childChainManagerProxy, "Only the ChainManager is allowed to deposit");

        uint256 amount = abi.decode(depositData, (uint256));

        _forceTransfer(BRIDGE, user, CURRENCY, amount);

        emit Transfer(address(0), user, amount);
    }

    /** Withdraw currency from a user account in this contract to Ethereum.
     *
     * This is implemented by moving tokens from the user account to the bridge account.
     *
     * Two events will be emitted: ERC20 Transfer for the relayers, and ERC1155 TransferSingle like all transfers.
     */
    function withdraw(uint256 amount)
    external {
        address user = _msgSender();

        _forceTransfer(user, BRIDGE, CURRENCY, amount);

        emit Transfer(msg.sender, address(0), amount);
    }
}
