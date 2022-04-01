const { defender } = require("hardhat");
const log = console.log;

async function main() {
  const proxyAddress = '0xf9AC6022F786f6f64Fd8abf661190b8517D92396';
  const gnosisSafe = process.env.GNOSIS_SAFE_ADDRESS;
  const Freeport = await ethers.getContractFactory("Freeport");
  log("Preparing proposal...");
  const proposal = await defender.proposeUpgrade(proxyAddress, Freeport, {
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