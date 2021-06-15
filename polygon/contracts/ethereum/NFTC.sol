pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract NFTC is ERC1155 {
    uint256 public constant WCERE = 0;

    address public serviceProvider;
    uint256 public serviceFee;

    // Token ID to fee beneficiary.
    mapping (uint256 => address) public beneficiaries;
    mapping (uint256 => uint256) public beneficiaryFees;

    constructor() ERC1155("https://cere.network/ntfc/{id}.json") {
        serviceProvider = _msgSender();
        serviceFee = 10;
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

        // Pay a fee per transfer to a beneficiary, if any.
        for (uint256 i = 0; i < ids.length; ++i) {
            uint256 token_id = ids[i];
            address beneficiary = beneficiaries[token_id];
            uint256 beneficiaryFee = beneficiaryFees[token_id];

            if(beneficiary != address(0) && beneficiaryFee != 0) {
                safeTransferFrom(
                    from,
                    beneficiary,
                    WCERE,
                    beneficiaryFee,
                    ""
                );
            }
        }

        // Pay a fee per transfer to the service provider.
        safeTransferFrom(
            from,
            serviceProvider,
            WCERE,
            serviceFee * ids.length,
            ""
        );
    }
}