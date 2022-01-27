pragma solidity ^0.8.0;

import "./Currency.sol";

/** The role TRANSFER_OPERATOR is allowed to make any transfer.
 * This is useful to connect a marketplace contract.
 */
abstract contract TransferOperator is Currency {
    function __TransferOperator_init() internal {
        __Currency_init();
    }

    bytes32 public constant TRANSFER_OPERATOR = keccak256("TRANSFER_OPERATOR");

    /** Return true for operators with the role TRANSFER_OPERATOR.
     *
     * Otherwise, apply the standard approval logic of ERC1155.
     * See {IERC1155-isApprovedForAll}.
     */
    function isApprovedForAll(address account, address operator)
    public view virtual override returns (bool) {

        if (hasRole(TRANSFER_OPERATOR, operator)) return true;

        return super.isApprovedForAll(account, operator);
    }
}