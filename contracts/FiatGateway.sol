pragma solidity ^0.8.0;

import "./freeportParts/Upgradeable.sol";
import "./freeportParts/HasGlobalNftId.sol";
import "./Freeport.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/utils/ERC1155HolderUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./Marketplace.sol";

/** The FiatGateway contract allows buying NFTs from an external fiat payment.
  *
  * This contract connects to the Freeport contract.
  * It must hold a balance of CERE recognized by Freeport.
  *
  * This contract uses the SimpleExchange API to buy NFTs.
  *
  * This contract is operational only when the exchange rate is set to a non-zero value.
 */
contract FiatGateway is Upgradeable, ERC1155HolderUpgradeable, HasGlobalNftId {

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

    Marketplace public marketplace;

    /** The current exchange rate of ERC20 Units (with 6 decimals) per USD cent (1 penny).
     */
    uint cereUnitsPerPenny;

    /** How many USD cents were received so far, according to the payment service.
     */
    uint public totalPenniesReceived;

    /** Discontinued variable.
     */
    uint public totalCereUnitsSent;

    /** An event emitted when the exchange rate was set to a new value.
     *
     * The rate is given as ERC20 Units (with 6 decimals) per USD cent (1 penny).
     */
    event SetExchangeRate(
        uint256 cereUnitsPerPenny);

    function initialize(Freeport _freeport, Marketplace _marketplace) public initializer {
        __Upgradeable_init();
        __ERC1155Holder_init();

        freeport = _freeport;
        marketplace = _marketplace;
    }

    function initialize_update(Freeport _freeport, Marketplace _marketplace) external onlyRole(DEFAULT_ADMIN_ROLE) {
        freeport = _freeport;
        marketplace = _marketplace;
    }

    /** Initialize this contract after version 2.0.0.
     *
     * Allow deposit of USDC into Freeport.
     */
    function initialize_v2_0_0() public {
        IERC20 erc20 = freeport.currencyContract();

        bool init = erc20.allowance(address(this), address(freeport)) > 0;
        if (init) return;

        uint256 maxInt = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;
        erc20.approve(address(freeport), maxInt);
    }

    /** Set the exchange rate between fiat (USD) and Freeport currency (CERE).
      *
      * The rate is given as number of ERC20 Units (with 6 decimals) per USD cent (1 penny).
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

    /** Withdraw all ERC20 from this contract.
      *
      * Only accounts with DEFAULT_ADMIN_ROLE can withdraw.
     */
    function withdrawERC20()
    public onlyRole(DEFAULT_ADMIN_ROLE)
    returns (uint) {
        address admin = _msgSender();
        IERC20 erc20 = freeport.currencyContract();
        uint amount = erc20.balanceOf(address(this));

        erc20.transfer(admin, amount);

        return amount;
    }

    /** Deprecated. Only ERC20 is relevant.
      *
      * Withdraw all internal currency from this contract.
      *
      * Only accounts with DEFAULT_ADMIN_ROLE can withdraw.
     */
    function withdrawCurrency()
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
    function buyNftsFromUsd(
        uint penniesReceived,
        address buyer,
        address seller,
        uint nftId,
        uint quantity,
        uint expectedPriceOrZero,
        uint nonce)
    public onlyRole(PAYMENT_SERVICE) {
        // Keep track of the total off-chain payments reported.
        totalPenniesReceived += penniesReceived;

        uint boughtTokens = penniesReceived * cereUnitsPerPenny;
        require(boughtTokens >= expectedPriceOrZero * quantity, "Insufficient payment");

        (address collection, uint32 innerId, uint64 supply) = _parseNftId(nftId);
        /* Zero supply means that nftId is just a identifier of the NFT and does not have state.
         * This means that it's compatible with new version of Freeport.
         */
        if (supply == 0) {
            marketplace.takeOffer(buyer, seller, nftId, expectedPriceOrZero, quantity);
        } else {
            freeport.takeOffer(buyer, seller, nftId, expectedPriceOrZero, quantity);
        }
    }

    /** Backward-compatible variant with quantity=1.
     */
    function buyNftFromUsd(
        uint penniesReceived,
        address buyer,
        address seller,
        uint nftId,
        uint expectedPriceOrZero,
        uint nonce)
    public {
        uint quantity = 1;
        buyNftsFromUsd(penniesReceived, buyer, seller, nftId, quantity, expectedPriceOrZero, nonce);
    }

    /** Guarantee that a version of Solidity with safe math is used.
     */
    function _mathIsSafe() internal pure {
    unchecked {} // Use a keyword from Solidity 0.8.0.
    }
}
