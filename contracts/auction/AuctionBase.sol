pragma solidity ^0.8.0;

import "../Freeport.sol";
import "../freeportParts/MetaTxContext.sol";
import "../token/ERC1155/ERC1155Upgradeable.sol";

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

abstract contract AuctionBase is ERC1155Upgradeable, MetaTxContext
{
    /** The token ID that represents the CERE currency for all payments in this contract. */
    uint256 public constant CURRENCY = 0;
    Freeport public freeport;
    IERC20 public token;

    /** Initialize this contract and its dependencies.
     */
    function __AuctionBase_init(Freeport _freeport, address _token) internal {
        token = IERC20(_token);
        freeport = freeport;
        __MetaTxContext_init();
        __ERC1155_init("https://api.freeport.cere.network/erc1155/{id}.json");                
    }

	/** Supports interfaces of AccessControl, ERC1155, and ERC1155 MetadataURI.
     */
    function supportsInterface(bytes4 interfaceId)
    public view virtual override(ERC1155Upgradeable, AccessControlUpgradeable) returns (bool) {
        return ERC1155Upgradeable.supportsInterface(interfaceId)
        || AccessControlUpgradeable.supportsInterface(interfaceId);
    }

    // Enable the implementation of meta transactions (ERC2771).
    function _msgSender() internal view virtual override(ContextUpgradeable, MetaTxContext) returns (address sender) {
        return MetaTxContext._msgSender();
    }

    // Enable the implementation of meta transactions (ERC2771).
    function _msgData() internal view virtual override(ContextUpgradeable, MetaTxContext) returns (bytes calldata) {
        return MetaTxContext._msgData();
    }
}
