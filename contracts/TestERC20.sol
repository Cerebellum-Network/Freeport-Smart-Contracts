pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestERC20 is ERC20 {

    constructor() ERC20("TestERC20", "TEST") {}

    function mint(address account, uint256 amount) external payable {
      _mint(account, amount);
    }

}
