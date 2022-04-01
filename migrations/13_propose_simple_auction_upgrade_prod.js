const { defender } = require("hardhat");
const log = console.log;

async function main() {
  const proxyAddress = '0xf6a530242B233B1b4208c449D6C72FB7c6133cC0';
  const gnosisSafe = process.env.GNOSIS_SAFE_ADDRESS;
  const SimpleAuction = await ethers.getContractFactory("SimpleAuction");
  log("Preparing proposal...");
  const proposal = await defender.proposeUpgrade(proxyAddress, SimpleAuction, {
    proxyAdmin: gnosisSafe,
    multisigType: 'Gnosis Safe'
  });
  log("Upgrade proposal created at:", proposal.url);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  })