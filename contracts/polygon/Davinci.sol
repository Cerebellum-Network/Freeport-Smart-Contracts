pragma solidity ^0.8.0;

import "./TransferFees.sol";

/** Main contract, including all components.

- Hold and transfer NFTs using ERC1155.
- Support atomic exchanges of NFTs for currency.
- Issuance of NFTs with fixed supply.
- Joint Accounts that distribute their funds over multiple owners.
- Capture royalties on primary and secondary transfers, configurable per NFT type.
*/
contract Davinci is /* MetaTxContext, BaseNFT, ChildERC20, Issuance, JointAccounts, */ TransferFees {

    /** Supports interfaces of AccessControl, ERC1155, and ERC1155 MetadataURI.
     */
    function supportsInterface(bytes4 interfaceId)
    public view virtual override(AccessControl, ERC1155) returns (bool) {
        return ERC1155.supportsInterface(interfaceId)
        || AccessControl.supportsInterface(interfaceId);
    }
}
