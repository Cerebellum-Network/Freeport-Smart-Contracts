pragma solidity ^0.8.0;

import "./freeportParts/Upgradeable.sol";
import "./Freeport.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/utils/ERC1155HolderUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/** The FiatGateway contract allows buying NFTs from an external fiat payment.
  *
  * This contract connects to the Freeport contract.
  * It must hold a balance of CERE recognized by Freeport.
  *
  * This contract uses the SimpleExchange API to buy NFTs.
  *
  * This contract is operational only when the exchange rate is set to a non-zero value.
 */
contract FiatGateway is Upgradeable, ERC1155HolderUpgradeable {

    /** Supports interfaces of AccessControl and ERC1155Receiver.
     */
    function supportsInterface(bytes4 interfaceId)
    public view virtual override(AccessControlUpgradeable, ERC1155ReceiverUpgradeable) returns (bool) {
        return AccessControlUpgradeable.supportsInterface(interfaceId)
        || ERC1155ReceiverUpgradeable.supportsInterface(interfaceId);
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

    function initialize(Freeport _freeport) public initializer {
        __Upgradeable_init();
        __ERC1155Holder_init();

        freeport = _freeport;
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

    /** Discontinued function, return an error.
     */
    function buyCereFromUsd(
        uint penniesReceived,
        address buyer,
        uint nonce)
    public onlyRole(PAYMENT_SERVICE)
    returns (uint) {
        revert("Discontinued");
        return 0;
    }

    /** Buy an NFT based on an off-chain fiat payment.
      *
      * The amount of fiat received is validated against the NFT price, using the configured exchange rate.
      *
      * Then, the tokens are used to buy an NFT in the same transaction. The NFT must be available for sale from the seller in SimpleExchange.
      *
      * Only the gateway with PAYMENT_SERVICE role can report successful payments.
     *
     * The parameter expectedPriceOrZero can be used to validate the price that the buyer expects to pay. This prevents
     * a race condition with makeOffer or setExchangeRate. Pass 0 to disable this validation and accept any current price.
     *
     * The parameter nonce is ignored and accepted for compatibility.
     */
    function buyNftFromUsd(
        uint penniesReceived,
        address buyer,
        address seller,
        uint nftId,
        uint expectedPriceOrZero,
        uint nonce)
    public onlyRole(PAYMENT_SERVICE) {

        uint boughtTokens = penniesReceived * cereUnitsPerPenny;
        require(boughtTokens >= expectedPriceOrZero, "Insufficient payment");

        uint amount = 1;
        freeport.takeOffer(buyer, seller, nftId, expectedPriceOrZero, amount);
    }

    /** Guarantee that a version of Solidity with safe math is used.
     */
    function _mathIsSafe() internal pure {
    unchecked {} // Use a keyword from Solidity 0.8.0.
    }
}