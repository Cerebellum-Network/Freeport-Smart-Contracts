pragma solidity ^0.8.0;

import "./Freeport.sol";

/** A test contract to test upgradeability
*/
contract TestFreeport2 is Freeport {
    function testIssue() public returns (uint256) {
        return issue(1, "");
    }
}
