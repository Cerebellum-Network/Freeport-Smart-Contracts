pragma solidity ^0.8.0;

import "../Freeport.sol";
import "../token/ERC1155/ERC1155Upgradeable.sol";
import "../freeportParts/MetaTxContext.sol";

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

abstract contract SaleBase is ERC1155Upgradeable, MetaTxContext {

    Freeport public freeport;
    IERC20 public token;

    function __SaleBase_init(Freeport _freeport, address _token) internal {
      freeport = _freeport;
      token = IERC20(_token);
      __ERC1155_init("https://api.freeport.cere.network/erc1155/{id}.json");
      __MetaTxContext_init();      
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

    function setURI(string memory newuri) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "only admin");
        _setURI(newuri);
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


}