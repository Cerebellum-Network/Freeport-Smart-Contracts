## Contract `FiatGateway`

The FiatGateway contract allows buying NFTs from an external fiat payment.

This contract connects to the Davinci contract.
It must hold a balance of CERE recognized by Davinci.

This contract uses the SimpleExchange API to buy NFTs.

This contract is operational only when the exchange rate is set to a non-zero value.




#### `constructor(contract Davinci _davinci)` (public)





#### `setExchangeRate(uint256 _cereUnitsPerPenny)` (public)

Set the exchange rate between fiat (USD) and Davinci currency (CERE).

The rate is given as number of CERE Units (with 10 decimals) per USD cent (1 penny).

Only the rate service with the EXCHANGE_RATE_ORACLE role can change the rate.



#### `getExchangeRate() → uint256` (public)

Get the current exchange rate in CERE Units (with 10 decimals) per USD cent (1 penny).



#### `withdraw() → uint256` (public)

Withdraw all CERE from this contract.

Only accounts with DEFAULT_ADMIN_ROLE can withdraw.



#### `buyCereFromUsd(uint256 penniesReceived, address buyer, uint256 nonce) → uint256` (public)

Obtain CERE based on a fiat payment.

The amount of fiat is recorded, and exchanged for an amount of CERE.

Only the gateway with PAYMENT_SERVICE role can report successful payments.



#### `buyNftFromUsd(uint256 penniesReceived, address buyer, address seller, uint256 nftId, uint256 expectedPriceOrZero, uint256 nonce)` (public)

Obtain CERE and buy an NFT based on a fiat payment.

CERE tokens are obtained in the same way as buyCereFromUsd.

Then, the tokens are used to buy an NFT in the same transaction. The NFT must be available for sale from the seller in SimpleExchange.

Only the gateway with PAYMENT_SERVICE role can report successful payments.

The parameter expectedPriceOrZero can be used to validate the price that the buyer expects to pay. This prevents
a race condition with makeOffer or setExchangeRate. Pass 0 to disable this validation and accept any current price.



#### `_mathIsSafe()` (internal)

Guarantee that a version of Solidity with safe math is used.




#### `SetExchangeRate(uint256 cereUnitsPerPenny)` (event)

An event emitted when the exchange rate was set to a new value.

The rate is given as CERE Units (with 10 decimals) per USD cent (1 penny).



