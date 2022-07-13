pragma solidity ^0.8.0;

import "../delegators/FreeportDelegator.sol";
import "../access_control/WithCollectionManager.sol";

/** Royalties for Collection.
*/
abstract contract CollectionRoyalties is FreeportDelegator, WithCollectionManager {
    function __CollectionRoyalties_init(address _freeport) internal initializer {
        __FreeportDelegator_init(_freeport);
    }

    /** Configure the amounts and beneficiaries of royalties on primary and secondary transfers of this NFT.
     *  Delegating to Freeport implementation.
     */
    function setupRoyaltyConfiguration(
        address primaryRoyaltyAccount,
        uint256 primaryRoyaltyCut,
        uint256 primaryRoyaltyMinimum,
        address secondaryRoyaltyAccount,
        uint256 secondaryRoyaltyCut,
        uint256 secondaryRoyaltyMinimum)
    public onlyRole(COLLECTION_MANAGER_ROLE) {
        for (uint32 i = 1; i <= idCounter; i++) {
            freeport.configureRoyalties(
                getGlobalNftId(i),
                primaryRoyaltyAccount,
                primaryRoyaltyCut,
                primaryRoyaltyMinimum,
                secondaryRoyaltyAccount,
                secondaryRoyaltyCut,
                secondaryRoyaltyMinimum
            );
        }
    }

    /** Return the current configuration of royalties for all NFTs of the collection.
     */
    function getRoyalties()
    public view returns (
        address primaryRoyaltyAccount,
        uint256 primaryRoyaltyCut,
        uint256 primaryRoyaltyMinimum,
        address secondaryRoyaltyAccount,
        uint256 secondaryRoyaltyCut,
        uint256 secondaryRoyaltyMinimum
    ) {
        return freeport.getRoyalties(getGlobalNftId(1)); // we are checking only the first minted NFT because we do not have interface for collection to set up royalties of specific NFTs.
    }

    /** Return the amount of royalties earned by a beneficiary on each primary and secondary transfer of an NFT.
     *
     * This function supports Joint Accounts. If royalties are paid to a JA and beneficiary is an owner of the JA,
     * the shares of the royalties for this owner are returned.
     */
    function getRoyaltiesForBeneficiary(address beneficiary)
    public view returns (uint256 primaryCut, uint256 primaryMinimum, uint256 secondaryCut, uint256 secondaryMinimum) {
        return freeport.getRoyaltiesForBeneficiary(getGlobalNftId(1), beneficiary);
    }
}
