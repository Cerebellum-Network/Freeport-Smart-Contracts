pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "./Controller.sol";

/**
* Hold NFTs.
* Hold a currency for fees.
* Notifies a controller contract of transfers.
* Pays fees based on instructions from the controller.
*/
contract DavinciNFT is ERC1155, Controller {
    uint256 public constant WCERE = 0;

    address controller;

    constructor() ERC1155("https://cere.network/ntfc/{id}.json") {}

    function mint(address account, uint256 id, uint256 amount, bytes memory data) public {
        require(_msgSender() == controller);
        _mint(account, id, amount, data);
    }

    /**
     * @dev Hook that is called before any token transfer. This includes minting
     * and burning, as well as batched variants.
     *
     * The same hook is called on both single and batched variants. For single
     * transfers, the length of the `id` and `amount` arrays will be 1.
     *
     * Calling conditions (for each `id` and `amount` pair):
     *
     * - When `from` and `to` are both non-zero, `amount` of ``from``'s tokens
     * of token type `id` will be  transferred to `to`.
     * - When `from` is zero, `amount` tokens of token type `id` will be minted
     * for `to`.
     * - when `to` is zero, `amount` of ``from``'s tokens of token type `id`
     * will be burned.
     * - `from` and `to` are never both zero.
     * - `ids` and `amounts` have the same, non-zero length.
     *
     * To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks].
     */
    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    )
    internal
    virtual
    override
    {
        if (operator != controller && controller != address(0)) {
            controller._beforeTokenTransfer(
                operator,
                from,
                to,
                ids,
                amounts,
                data
            );
        }
    }

    /*
        // Do not apply on pure currency transfers.
        // This also prevents recursion.
        bool all_currency = true;
        for (uint256 i = 0; i < ids.length; ++i) {
            uint256 token_id = ids[i];
            if(token_id != WCERE) {
                all_currency = false;
                break;
            }
        }
        if(all_currency) return;
    */
}