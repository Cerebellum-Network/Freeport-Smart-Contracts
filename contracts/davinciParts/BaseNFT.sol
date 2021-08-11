pragma solidity ^0.8.0;

import "../token/ERC1155/ERC1155.sol";
import "../access/AccessControl.sol";

/** This contract implements NFTs.
 *
 * Integrate the implementation of ERC1155 and AccessControl from OpenZeppelin.
 */
abstract contract BaseNFT is ERC1155, AccessControl {

    /** Supports interfaces of AccessControl, ERC1155, and ERC1155 MetadataURI.
     */
    function supportsInterface(bytes4 interfaceId)
    public view virtual override(ERC1155, AccessControl) returns (bool) {
        return ERC1155.supportsInterface(interfaceId)
        || AccessControl.supportsInterface(interfaceId);
    }

    constructor()
    ERC1155("https://cere.network/nft/{id}.json") {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
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