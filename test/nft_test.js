const Davinci = artifacts.require("./Davinci.sol");
const log = console.log;

contract("Davinci", accounts => {
  const from = accounts[0];

  it("issues an NFT.", async () => {
    const instance = await Davinci.deployed();

    let nftId = await instance.getNftId.call(from, 0, 10);
    log("NFT", nftId.toString(16));

    let tx = await instance.issue(0, 10, "0x", { from });
    log("Issue events:", tx.logs);

    const balance = await instance.balanceOf.call(accounts[0], nftId);

    assert.equal(balance, 10, "NFTs should be minted to the issuer");
  });
});
