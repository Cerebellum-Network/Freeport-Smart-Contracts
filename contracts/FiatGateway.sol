pragma solidity ^0.8.0;

import "./access/AccessControl.sol";
import "./Freeport.sol";
import "./token/ERC1155/utils/ERC1155Holder.sol";

/** The FiatGateway contract allows buying NFTs from an external fiat payment.
  *
  * This contract connects to the Freeport contract.
  * It must hold a balance of CERE recognized by Freeport.
  *
  * This contract uses the SimpleExchange API to buy NFTs.
  *
  * This contract is operational only when the exchange rate is set to a non-zero value.
 */
contract FiatGateway is AccessControl, ERC1155Holder {

    /** Supports interfaces of AccessControl and ERC1155Receiver.
     */
    function supportsInterface(bytes4 interfaceId)
    public view virtual override(AccessControl, ERC1155Receiver) returns (bool) {
        return AccessControl.supportsInterface(interfaceId)
        || ERC1155Receiver.supportsInterface(interfaceId);
    }

    bytes32 public constant EXCHANGE_RATE_ORACLE = keccak256("EXCHANGE_RATE_ORACLE");
    bytes32 public constant PAYMENT_SERVICE = keccak256("PAYMENT_SERVICE");

    /** The token ID that represents the CERE currency for all payments in this contract. */
    uint256 public constant CURRENCY = 0;

    Freeport public freeport;
    uint cereUnitsPerPenny;

    /** How many USD cents were received so far, according to the payment service.
     */
    uint public totalPenniesReceived;

    /** How many CERE Units were sold so far.
     */
    uint public totalCereUnitsSent;

    /** An event emitted when the exchange rate was set to a new value.
     *
     * The rate is given as CERE Units (with 10 decimals) per USD cent (1 penny).
     */
    event SetExchangeRate(
        uint256 cereUnitsPerPenny);

    constructor(Freeport _freeport) {
        freeport = _freeport;

        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
    }

    /** Set the exchange rate between fiat (USD) and Freeport currency (CERE).
      *
      * The rate is given as number of CERE Units (with 10 decimals) per USD cent (1 penny).
      *
      * Only the rate service with the EXCHANGE_RATE_ORACLE role can change the rate.
     */
    function setExchangeRate(uint _cereUnitsPerPenny)
    public onlyRole(EXCHANGE_RATE_ORACLE) {

        cereUnitsPerPenny = _cereUnitsPerPenny;

        emit SetExchangeRate(_cereUnitsPerPenny);
    }

    /** Get the current exchange rate in CERE Units (with 10 decimals) per USD cent (1 penny).
     */
    function getExchangeRate()
    public view returns (uint) {
        return cereUnitsPerPenny;
    }

    /** Withdraw all CERE from this contract.
      *
      * Only accounts with DEFAULT_ADMIN_ROLE can withdraw.
     */
    function withdraw()
    public onlyRole(DEFAULT_ADMIN_ROLE)
    returns (uint) {

        address admin = _msgSender();

        uint amount = freeport.balanceOf(address(this), CURRENCY);

        freeport.safeTransferFrom(
            address(this),
            admin,
            CURRENCY,
            amount,
            "");

        return amount;
    }

    /** Obtain CERE based on a fiat payment.
      *
      * The amount of fiat is recorded, and exchanged for an amount of CERE.
      *
      * Only the gateway with PAYMENT_SERVICE role can report successful payments.
     */
    function buyCereFromUsd(
        uint penniesReceived,
        address buyer,
        uint nonce)
    public onlyRole(PAYMENT_SERVICE)
    returns (uint) {
        require(cereUnitsPerPenny != 0, "Exchange rate must be configured");

        uint cereToSend = penniesReceived * cereUnitsPerPenny;

        freeport.safeTransferFrom(
            address(this),
            buyer,
            CURRENCY,
            cereToSend,
            "");

        totalPenniesReceived += penniesReceived;
        totalCereUnitsSent += cereToSend;

        return cereToSend;
    }

    /** Obtain CERE and buy an NFT based on a fiat payment.
      *
      * CERE tokens are obtained in the same way as buyCereFromUsd.
      *
      * Then, the tokens are used to buy an NFT in the same transaction. The NFT must be available for sale from the seller in SimpleExchange.
      *
      * Only the gateway with PAYMENT_SERVICE role can report successful payments.
     *
     * The parameter expectedPriceOrZero can be used to validate the price that the buyer expects to pay. This prevents
     * a race condition with makeOffer or setExchangeRate. Pass 0 to disable this validation and accept any current price.
     */
    function buyNftFromUsd(
        uint penniesReceived,
        address buyer,
        address seller,
        uint nftId,
        uint expectedPriceOrZero,
        uint nonce)
    public onlyRole(PAYMENT_SERVICE) {

        uint boughtCere = buyCereFromUsd(penniesReceived, buyer, nonce);

        require(boughtCere >= expectedPriceOrZero, "Received fewer Cere than expected");

        uint amount = 1;
        freeport.takeOffer(buyer, seller, nftId, expectedPriceOrZero, amount);
    }

    /** Guarantee that a version of Solidity with safe math is used.
     */
    function _mathIsSafe() internal pure {
    unchecked {} // Use a keyword from Solidity 0.8.0.
    }
}