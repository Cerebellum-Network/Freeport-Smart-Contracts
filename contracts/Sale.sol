pragma solidity ^0.8.0;

import "./sale/SaleBase.sol";
import "./Freeport.sol";

contract Sale is SaleBase {

  	function initialize(Freeport freeport, address token) public initializer {
  	  __SaleBase_init(freeport, token);
  	}

    /**
     * Stores nft id and its quantity of offered nft. 
     */
    struct Offer {
        uint256 price;
        uint256 quantity;
    }

  	/**
  	 * Mapping represents relation such as 
     * seller address => (nft ID => structure containing price, quantity) 
  	 */
  	mapping(address => mapping(uint256 => Offer)) nftOffer;

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
  	    uint256 price,
        uint256 quantity);
  
	/** An offer of `seller` was taken by `buyer`.
  	 * The transfers of `amount` NFTs of type `nftId`
  	 * against `amount * price` of CERE Units were executed.
  	 */
  	event TakeOffer(
  	    address indexed buyer,
  	    address indexed seller,
  	    uint256 indexed nftId,
  	    uint256 price,
  	    uint256 quantity);

		/** Create an offer to sell a type of NFTs for a price per unit.
     * All the NFTs of this type owned by the caller will be for sale.
     *
     * To cancel, call again with a price and quantity params 0.
     */
    function makeOffer(uint256 _nftId, uint256 _price, uint256 _quantity)
    public {
        address seller = _msgSender();
        nftOffer[seller][_nftId] = Offer({price: _price, quantity: _quantity});
        emit MakeOffer(seller, _nftId, _price, _quantity);
    }

    /** Return the price offered by the given seller for the given NFT type.
     */
    function getOffer(address seller, uint256 nftId)
    public view returns (uint256, uint256) {
        Offer storage nft = nftOffer[seller][nftId];
        return (nft.price, nft.quantity);
    }

    /** Accept an offer, paying the price per unit for an amount of NFTs.
     *
     * The offer must have been created beforehand by makeOffer.
     *
     * The sender pays internal currency. The sender is not necessarily the same as buyer, see FiatGateway.
     *
     * The seller receives internal currency.
     *
     * The buyer receives the NFT.
     *
     * The parameter expectedPriceOrZero can be used to validate the price that the buyer expects to pay. This prevents
     * a race condition with makeOffer or setExchangeRate. Pass 0 to disable this validation and accept any current price.
     */
    function takeOffer(address buyer, address seller, uint256 nftId, uint256 expectedPriceOrZero, uint256 amount)
    public {
        Offer storage nft = nftOffer[seller][nftId];
        uint256 price = nft.price;
        address payer = _msgSender();
        require(price != 0, "Not for sale");
        require(expectedPriceOrZero == 0 || expectedPriceOrZero == price, "Unexpected price");
        require(nft.quantity - amount >= 0, "Remaining quantity exceeded");

        uint totalCost = price * amount;
        nft.quantity = nft.quantity - amount;
        token.transferFrom(payer, seller, totalCost);
        _forceTransfer(seller, buyer, nftId, amount);
        
        (uint256 totalFee, address royaltyAccount) = freeport.calculateTotalRoyalties(seller, nftId, price, amount);
        require(totalFee > 0, "Zero fees");
        token.transferFrom(seller, royaltyAccount, totalFee);
        
        emit TakeOffer(buyer, seller, nftId, price, amount);
    }

    /** Guarantee that a version of Solidity with safe math is used.
     */
    function _mathIsSafe() internal pure {
    unchecked {} // Use a keyword from Solidity 0.8.0.
    }

}