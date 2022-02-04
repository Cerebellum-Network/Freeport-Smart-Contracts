pragma solidity ^0.8.0;

import "../token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "./MetaTxContext.sol";

/** This contract implements NFTs.
 *
 * Integrate the implementation of ERC1155 and AccessControl from OpenZeppelin.
 */
abstract contract BaseNFT is ERC1155Upgradeable, MetaTxContext {
    function __BaseNFT_init() internal {
        __ERC1155_init("https://api.freeport.cere.network/erc1155/{id}.json");
        __MetaTxContext_init();
    }

    // Enable the implementation of meta transactions (ERC2771).
    function _msgSender() internal view virtual override(ContextUpgradeable, MetaTxContext) returns (address sender) {
        return MetaTxContext._msgSender();
    }

    // Enable the implementation of meta transactions (ERC2771).
    function _msgData() internal view virtual override(ContextUpgradeable, MetaTxContext) returns (bytes calldata) {
        return MetaTxContext._msgData();
    }

    /** Supports interfaces of AccessControl, ERC1155, and ERC1155 MetadataURI.
     */
    function supportsInterface(bytes4 interfaceId)
    public view virtual override(ERC1155Upgradeable, AccessControlUpgradeable) returns (bool) {
        return ERC1155Upgradeable.supportsInterface(interfaceId)
        || AccessControlUpgradeable.supportsInterface(interfaceId);
    }

    /** transferFrom performs a simple transfer, without calling the hooks
     *  (no _beforeTokenTransfer and no onERC1155Received).
     */
    function transferFrom(
        address from,
        address to,
        uint id,
        uint amount
    )
    public
    {
        require(to != address(0), "ERC1155: transfer to the zero address");
        require(
            from == _msgSender() || isApprovedForAll(from, _msgSender()),
            "ERC1155: caller is not owner nor approved"
        );
        _forceTransfer(from, to, id, amount);
    }

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