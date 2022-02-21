pragma solidity ^0.8.0;

import "./TransferOperator.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 */
abstract contract ERC20Adapter is TransferOperator {
    function __ERC20Adapter_init() internal {
        __TransferOperator_init();
    }

    /**
      The address of ERC-20 token's contract
     */
    IERC20 public currencyContract;

    /**
      Sets token's contract address.
      This token is used to deposit and withdraw on chain adapter's contract is deployed.
     */
    function setERC20(address _currencyContract) public {
        require(currencyContract == IERC20(address(0)));
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()));

        currencyContract = IERC20(_currencyContract);
    }

    /**
      Deposit currency from ERC20 into the internal currency.
      This requires payer to approve deposit.
     */
    function deposit(uint256 amount) public {
        address user = _msgSender();
        currencyContract.transferFrom(user, address(this), amount);
        _mint(user, CURRENCY, amount, "");
    }

    /**
      Withdraw currency from internal to ERC20
     */
    function withdraw(uint256 amount) external {
        address user = _msgSender();
        _burn(user, CURRENCY, amount);
        currencyContract.transfer(user, amount);
    }

    function sendShare(address beneficiar, uint256 amount) internal {
        _burn(beneficiar, CURRENCY, amount);
        currencyContract.transfer(beneficiar, amount);
    }

}
