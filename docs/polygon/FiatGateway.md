## Contract `FiatGateway`

The FiatGateway contract allows buying NFTs from an external fiat payment.

This contract connects to the Davinci contract.
It must hold a balance of CERE recognized by Davinci.

This contract uses the SimpleExchange API to buy NFTs.




#### `constructor(contract Davinci _davinci)` (public)





#### `setExchangeRate(uint256 _cerePerPenny)` (public)

Set the exchange rate between fiat (USD) and Davinci currency (CERE).

The rate is given as number of CERE (with 10 decimals) per USD cent (1 penny).

Only the rate service with the EXCHANGE_RATE_ORACLE role can change the rate.



#### `withdrawCere()` (public)

Withdraw all CERE from this contract.

Only accounts with DEFAULT_ADMIN_ROLE can withdraw.



#### `buyFromUsd(uint256 paidPennies, address buyer, address seller, uint256 nftId, uint256 nftPrice, uint256 nonce)` (public)

Execute a buy of an NFT based on a fiat payment.

Only the gateway with PAYMENT_SERVICE role can report successful payments.

The amount of fiat is recorded, and exchanged for an amount of Davinci currency.

The currency is used to buy an NFT in the same transaction. The NFT must be available for sale from the seller in SimpleExchange.



#### `_mathIsSafe()` (internal)

Guarantee that a version of Solidity with safe math is used.




