pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Tether is ERC20 {

    constructor(uint256 initialSupply) ERC20("Tether", "USDT") {
        _mint(msg.sender, initialSupply);
    }

    function buy(address buyer) external payable {
      require(msg.value > 0, "Value must be > 0");
      _mint(buyer, msg.value);
    }

}
