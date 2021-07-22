pragma solidity ^0.8.0;

import "./TransferFees.sol";
import "./MetaTxContext.sol";

/** Main contract, including all components.

- Hold and transfer NFTs using ERC1155.
- Support atomic exchanges of NFTs for currency.
- Issuance of NFTs with fixed supply.
- Joint Accounts that distribute their funds over multiple owners.
- Capture royalties on primary and secondary transfers, configurable per NFT type.
*/
contract Davinci is /*
    ERC1155,
    AccessControl,
    BaseNFT,
    MetaTxContext,
    ChildERC20,
    Issuance,
    JointAccounts,
    */ TransferFees {

}
