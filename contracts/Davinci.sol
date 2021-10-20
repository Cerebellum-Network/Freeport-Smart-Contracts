pragma solidity ^0.8.0;

import "./davinciParts/SimpleAuction.sol";

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
    Currency,
    TransferOperator,
    MetaTxContext,
    PolygonChildERC20,
    Issuance,
    JointAccounts,
    TransferFees,
    SimpleExchange,
    */ SimpleAuction {

}
