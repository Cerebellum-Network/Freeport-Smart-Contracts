## Contract `NFTAttachment`

The contract NFTAttachment allows users to attach objects to NFTs.
Some application can listen for the events and interpret the objects in some way.

Anyone can attach objects to any NFT. It is the responsibility of the app to
interpret who the sender is and what the object means.

An object is identified by CID, a.k.a. Content Identifier or IPFS file, of maximum 32 bytes.
The content may be retrieved from Cere DDC or some other store.




#### `constructor(address _nftContract)` (public)

Set which NFT contract to refer to.



#### `attachToNFT(uint256 nftId, bytes32 cid)` (public)

Attach an object identified by `cid` to the NFT type `nftId`.

There is absolutely no validation. It is the responsibility of the reader of this event to decide
who the sender is and what the object means.




#### `AttachToNFT(address sender, uint256 nftId, bytes32 cid)` (event)

The account `sender` wished to attach an object identified by `cid` to the NFT type `nftId`.

There is absolutely no validation. It is the responsibility of the reader of this event to decide
who the sender is and what the object means.



