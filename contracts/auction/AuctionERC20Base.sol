pragma solidity ^0.8.0;

import "../freeportParts/MetaTxContext.sol";
import "../Freeport.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/utils/ERC1155HolderUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

abstract contract AuctionERC20Base is MetaTxContext, ERC1155HolderUpgradeable
{
    Freeport public freeport;

    /** The token ID that represents the CERE currency for all payments in this contract. */
    uint256 public constant CURRENCY = 0;

    /** Initialize this contract and its dependencies.
     */
    function __AuctionERC20Base_init(Freeport _freeport) internal {
        __MetaTxContext_init();
        __ERC1155Holder_init();
        freeport = _freeport;

        IERC20 erc20 = freeport.currencyContract();
        bool init = erc20.allowance(address(this), address(freeport)) > 0;
        if (init) return;

        uint256 maxInt = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;
        erc20.approve(address(freeport), maxInt);
    }

	/** Supports interfaces of AccessControl and ERC1155Receiver.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(AccessControlUpgradeable, ERC1155ReceiverUpgradeable)
        returns (bool)
    {
        return AccessControlUpgradeable.supportsInterface(interfaceId) ||
        ERC1155ReceiverUpgradeable.supportsInterface(interfaceId);
    }
}
