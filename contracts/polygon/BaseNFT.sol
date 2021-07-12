pragma solidity ^0.8.0;

import "./ERC1155.sol";

/** An implementation of ERC1155 from OpenZeppelin.

- Hold NFTs.
- Hold a currency for fees.
*/
contract BaseNFT is ERC1155 {
    /** The token ID that represents the CERE currency for all payments in this contract. */
    uint256 public constant CURRENCY = 0;

    /** The global supply of CERE tokens on all chains.
     * That is 10 billion tokens, with 10 decimals.
     */
    uint256 public constant CURRENCY_SUPPLY = 10e9 * 1e10;

    constructor() ERC1155("https://cere.network/nft/{id}.json") {}

    function _forceTransfer(
        address from,
        address to,
        uint256 id,
        uint256 amount)
    internal {
        uint256 fromBalance = _balances[id][from];
        require(fromBalance >= amount, "ERC1155: insufficient balance for transfer");
        _balances[id][from] = fromBalance - amount;
        _balances[id][to] += amount;

        address operator = _msgSender();
        emit TransferSingle(operator, from, to, id, amount);
    }
}