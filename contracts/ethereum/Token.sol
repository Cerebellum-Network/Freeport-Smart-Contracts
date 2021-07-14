// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ERC20.sol";

contract Token is ERC20 {
    uint8 private customDecimals;
    uint256 public cap;

    constructor()
    ERC20("CERETEST", "CERETEST")
    {
        customDecimals = 10;
        cap = 10e9 * 1e10;
        _mint(_msgSender(), cap);
    }

    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    function decimals() public view override returns (uint8) {
        return customDecimals;
    }
}
