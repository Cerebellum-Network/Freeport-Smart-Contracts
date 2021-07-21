pragma solidity ^0.8.0;

import "./access/AccessControl.sol";
import "./token/ERC1155/ERC1155.sol";

/** An implementation of ERC1155 from OpenZeppelin.

- Hold NFTs.
- Hold a currency for fees.
*/
contract BaseNFT is AccessControl, ERC1155 {
    /** The token ID that represents the CERE currency for all payments in this contract. */
    uint256 public constant CURRENCY = 0;

    /** The global supply of CERE tokens on all chains.
     * That is 10 billion tokens, with 10 decimals.
     */
    uint256 public constant CURRENCY_SUPPLY = 10e9 * 1e10;

    bytes32 public constant TRANSFER_OPERATOR = keccak256("TRANSFER_OPERATOR");

    constructor()
    ERC1155("https://cere.network/nft/{id}.json") {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
    }

    /** Supports interfaces of AccessControl, ERC1155, and ERC1155 MetadataURI.
     */
    function supportsInterface(bytes4 interfaceId)
    public view virtual override(AccessControl, ERC1155) returns (bool) {
        return ERC1155.supportsInterface(interfaceId)
        || AccessControl.supportsInterface(interfaceId);
    }

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

    /** The role TRANSFER_OPERATOR is allowed to make any transfer.
     * This is useful to connect a marketplace contract.
     *
     * @dev See {IERC1155-isApprovedForAll}.
     */
    function isApprovedForAll(address account, address operator)
    public view virtual override returns (bool) {

        if (hasRole(TRANSFER_OPERATOR, operator)) return true;

        return super.isApprovedForAll(account, operator);
    }
}