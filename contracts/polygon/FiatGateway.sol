pragma solidity ^0.8.0;

import "./access/AccessControl.sol";
import "./Davinci.sol";

/** The FiatGateway contract allows buying NFTs from an external fiat payment.
  *
  * This contract connects to the Davinci contract.
  * It must hold a balance of CERE recognized by Davinci.
  *
  * This contract uses the SimpleExchange API to buy NFTs.
 */
contract FiatGateway is AccessControl {

    bytes32 public constant EXCHANGE_RATE_ORACLE = keccak256("EXCHANGE_RATE_ORACLE");
    bytes32 public constant PAYMENT_SERVICE = keccak256("PAYMENT_SERVICE");

    /** The token ID that represents the CERE currency for all payments in this contract. */
    uint256 public constant CURRENCY = 0;

    Davinci davinci;
    uint cerePerPenny;
    uint totalPennies;

    constructor(Davinci _davinci) {
        davinci = _davinci;

        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
    }

    /** Set the exchange rate between fiat (USD) and Davinci currency (CERE).
      *
      * The rate is given as number of CERE (with 10 decimals) per USD cent (1 penny).
      *
      * Only the rate service with the EXCHANGE_RATE_ORACLE role can change the rate.
     */
    function setExchangeRate(uint _cerePerPenny)
    public onlyRole(EXCHANGE_RATE_ORACLE) {

        cerePerPenny = _cerePerPenny;
    }

    /** Withdraw all CERE from this contract.
      *
      * Only accounts with DEFAULT_ADMIN_ROLE can withdraw.
     */
    function withdrawCere()
    public onlyRole(DEFAULT_ADMIN_ROLE) {

        address admin = _msgSender();

        uint amount = davinci.balanceOf(admin, CURRENCY);

        davinci.safeTransferFrom(
            address(this),
            admin,
            CURRENCY,
            amount,
            "");
    }

    /** Execute a buy of an NFT based on a fiat payment.
      *
      * Only the gateway with PAYMENT_SERVICE role can report successful payments.
      *
      * The amount of fiat is recorded, and exchanged for an amount of Davinci currency.
      *
      * The currency is used to buy an NFT in the same transaction. The NFT must be available for sale from the seller in SimpleExchange.
     */
    function buyFromUsd(
        uint paidPennies,
        address buyer,
        address seller,
        uint nftId,
        uint nftPrice,
        uint nonce)
    public onlyRole(PAYMENT_SERVICE) {
        require(cerePerPenny != 0, "Exchange rate must be configured");

        totalPennies += paidPennies;

        uint cere = paidPennies * cerePerPenny;

        davinci.safeTransferFrom(
            address(this),
            buyer,
            CURRENCY,
            cere,
            "");

        uint amount = 1;
        davinci.takeOffer(seller, nftId, nftPrice, amount);
    }

    /** Guarantee that a version of Solidity with safe math is used.
     */
    function _mathIsSafe() internal pure {
    unchecked {} // Use a keyword from Solidity 0.8.0.
    }
}