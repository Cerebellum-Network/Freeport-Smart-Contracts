pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

/** An implementation of ERC1155 from OpenZeppelin.

- Hold NFTs.
- Hold a currency for fees.
*/
contract BaseNFT is Context, ERC1155 {
    uint256 public constant CURRENCY = 0;

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