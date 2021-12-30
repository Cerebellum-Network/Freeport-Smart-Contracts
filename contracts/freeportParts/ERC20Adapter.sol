pragma solidity ^0.8.0;

import "./TransferOperator.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
  Contract that enables user to make deposits in ERC-20 based tokens to system. 
  Deposit is converted into internal currency token. 
  Underneath Freeport contract track for user balance, execute deposit and withdrawls.  
 */
contract ERC20Adapter is TransferOperator {
    /** 
      Event is emmited on ERC-20 token tranfer.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /** 
      The address of ERC-20 token's contract 
     */
    IERC20 public immutable tokenContract;

    /**
      Sets token's contract address. 
      This token is used to deposit and withdraw on chain adapter's contract is deployed.
     */
    constructor(address contractAddress) {
        tokenContract = IERC20(contractAddress);
    }

    /** 
      Deposit currency from ERC20 into the internal currency. 
      This requires payer to approve deposit.
     */
    function depositERC20(uint256 amount) external {
        address user = _msgSender();
        tokenContract.transferFrom(user, address(this), amount);
        _mint(user, CURRENCY, amount, "");
        emit Transfer(user, address(tokenContract), amount);
    }

    /** 
      Withdraw currency from internal to ERC20
     */
    function withdrawERC20(uint256 amount) external {
        address user = _msgSender();
        _burn(user, CURRENCY, amount);
        tokenContract.transfer(user, amount);
        emit Transfer(address(tokenContract), user, amount);
    }
}
