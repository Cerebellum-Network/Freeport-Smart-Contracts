pragma solidity ^0.8.0;

import "./freeportParts/BaseERC20Adapter.sol";
import "./freeportParts/delegators/FreeportDelegator.sol";
import "./freeportParts/HasGlobalNftId.sol";
import "./Collection.sol";

/**
- Make offers to sell NFTs.
- Accept offer.
- Capture variable royalties.
 */
contract Marketplace is BaseERC20Adapter, FreeportDelegator, HasGlobalNftId {
    function initialize(address _freeport) public initializer {
        __BaseERC20Adapter_init();
        __FreeportDelegator_init(Freeport(_freeport));
    }

    /** Seller => NFT ID => Price.
     */
    mapping(address => mapping(uint256 => uint256)) sellerNftPriceOffers;

    /** An event emitted when an account `seller` has offered to sell a type of NFT
     * at a given price.
     *
     * This replaces previous offers by the same seller on the same NFT ID, if any.
     * A price of 0 means "no offer" and the previous offer is cancelled.
     *
     * An offer does not imply that the seller owns any amount of this NFT.
     * An offer remains valid until cancelled, for the entire balance at a given time,
     * regardless of incoming and outgoing transfers on the seller account.
     */
    event MakeOffer(
        address indexed seller,
        uint256 indexed nftId,
        uint256 price);

    /** An offer of `seller` was taken by `buyer`.
     * The transfers of `amount` NFTs of type `nftId`
     * against `amount * price` of CERE Units were executed.
     */
    event TakeOffer(
        address indexed buyer,
        address indexed seller,
        uint256 indexed nftId,
        uint256 price,
        uint256 amount);

    /** Create an offer to sell a type of NFTs for a price per unit.
     * All the NFTs of this type owned by the caller will be for sale.
     *
     * To cancel, call again with a price of 0.
     */
    function makeOffer(uint256 nftId, uint256 price)
    public {
        address seller = _msgSender();
        sellerNftPriceOffers[seller][nftId] = price;

        emit MakeOffer(seller, nftId, price);
    }

    /** Return the price offered by the given seller for the given NFT type.
     */
    function getOffer(address seller, uint256 nftId)
    public view returns (uint256) {
        uint price = sellerNftPriceOffers[seller][nftId];
        return price;
    }

    /** Accept an offer, paying the price per unit for an amount of NFTs.
     *
     * The offer must have been created beforehand by makeOffer.
     *
     * The sender pays ERC20. The sender is not necessarily the same as buyer, see FiatGateway.
     *
     * The seller receives internal currency (equivalent to the ERC20 payment, see the function withdraw).
     *
     * The buyer receives the NFT.
     *
     * The parameter expectedPriceOrZero can be used to validate the price that the buyer expects to pay. This prevents
     * a race condition with makeOffer or setExchangeRate. Pass 0 to disable this validation and accept any current price.
     */
    function takeOffer(address buyer, address seller, uint256 nftId, uint256 expectedPriceOrZero, uint256 amount)
    public {
        address payer = _msgSender();

        // Check and update the amount offered.
        uint256 price = getOffer(seller, nftId);
        require(price != 0, "Not for sale");
        require(expectedPriceOrZero == 0 || expectedPriceOrZero == price, "Unexpected price");

        uint totalPrice = price * amount;
        // Deposit ERC20 from payer. This verifies the intent of the payer.
        currencyContract.transferFrom(payer, address(this), totalPrice);

        // Take a fee from the seller (really a cut of the above payment).
        uint (totalFee, feeDestination) = freeport.calculateFee(seller, nftId, price, amount);
        require(totalFee <= totalPrice, "Cannot take more fees than the price.");
        //currencyContract.transferFrom(address(this), feeDestination, totalFee);
        freeport.transferToJA(address(this), feeDestination, totalFee);

        // Pay the seller. This verifies the intent of the payer.
        currencyContract.transferFrom(address(this), seller, totalPrice - totalFee);

        // Move the NFTs to the buyer.
        //todo add supportInterface to collection SC
        (address issuer, uint32 innerId, uint64 supply) = _parseNftId(nftId);
        Collection(issuer).transferFrom(seller, payer, nftId, amount);

        emit TakeOffer(buyer, seller, nftId, price, amount);
    }

    /** Guarantee that a version of Solidity with safe math is used.
     */
    function _mathIsSafe() internal pure {
    unchecked {} // Use a keyword from Solidity 0.8.0.
    }
}
