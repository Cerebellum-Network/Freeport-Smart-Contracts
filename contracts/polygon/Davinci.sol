pragma solidity ^0.8.0;

import "./BaseNFT.sol";
import "./Issuance.sol";
import "./AtomicExchange.sol";
import "./DistributionAccounts.sol";
import "./TransferFees.sol";

/**
- Hold and transfer NFTs using ERC1155.
- Support atomic exchanges of NFTs for currency.
- Issuance of NFTs with fixed supply.
- Accounts that distribute their funds over multiple owners.
- Capture royalties on primary and secondary transfers, configurable per NFT type.
*/
contract Davinci is /* BaseNFT, AtomicExchange, Issuance, DistributionAccounts, */ TransferFees {}
