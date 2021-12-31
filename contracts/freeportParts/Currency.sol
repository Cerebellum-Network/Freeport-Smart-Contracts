pragma solidity ^0.8.0;

import "./BaseNFT.sol";

/** Define a currency for fees.
*/
abstract contract Currency is BaseNFT {

    /** The token ID that represents the internal currency for all payments in this contract. */
    uint256 public constant CURRENCY = 0;

    function _forceTransferCurrency(
        address from,
        address to,
        uint256 amount)
    internal {
        uint256 fromBalance = _balances[CURRENCY][from];
        require(fromBalance >= amount, "ERC1155: insufficient balance for transfer");
        _balances[CURRENCY][from] = fromBalance - amount;
        _balances[CURRENCY][to] += amount;

        address operator = _msgSender();
        emit TransferSingle(operator, from, to, CURRENCY, amount);
    }
}