pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestERC20 is ERC20 {

    constructor() ERC20("TestERC20", "TEST") {}

    /** USD contracts usually have 6 decimals. */
    function decimals() public view virtual override returns (uint8) {
        return 6;
    }

    uint256 constant MAX_MINT = 10 * 1000 * 1000 * 1000000; // 10 million and 6 decimals.

    /** Mint some test tokens to an account. Max 10M per call. */
    function mint(address account, uint256 amount) external payable {
        require(amount <= MAX_MINT, "Can only mint up to 10M per call");
        _mint(account, amount);
    }

}
