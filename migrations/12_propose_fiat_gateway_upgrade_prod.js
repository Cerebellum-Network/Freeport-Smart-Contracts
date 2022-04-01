const { defender } = require("hardhat");
const log = console.log;

async function main() {
  const proxyAddress = '0x106Bf3D61952faE9279B08bdcB2e548316E0C1Ae';
  const gnosisSafe = process.env.GNOSIS_SAFE_ADDRESS;
  const FiatGateway = await ethers.getContractFactory("FiatGateway");
  log("Preparing proposal...");
  const proposal = await defender.proposeUpgrade(proxyAddress, FiatGateway, {
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