pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "../token/ERC1155/ERC1155Upgradeable.sol";

/** The role TRANSFER_OPERATOR is allowed to make any transfer.
 * This is useful to connect a marketplace contract.
 */
abstract contract BaseTransferOperator is ERC1155Upgradeable, AccessControlUpgradeable {
    function __BaseTransferOperator_init() internal initializer {
        __ERC1155_init("https://api.freeport.cere.network/erc1155/{id}.json");
    }

    bytes32 public constant TRANSFER_OPERATOR = keccak256("TRANSFER_OPERATOR");

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC1155Upgradeable, AccessControlUpgradeable) returns (bool) {
        return interfaceId == type(BaseTransferOperator).interfaceId
        || super.supportsInterface(interfaceId);
    }

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
