pragma solidity ^0.8.0;

import "./Auction.sol";

/** A test contract to test upgradeability
*/
contract TestAuction2 is Auction {
    function testForceSettle(address seller, uint256 nftId) public {
        Bid storage bid = sellerNftBids[seller][nftId];
        bid.closeTimeSec = 1;
        settleAuction(seller, nftId);
    }
}
