const log = console.log;

async function main () {
  const gnosisSafe = process.env.GNOSIS_SAFE_ADDRESS;
  log('Transferring ownership of ProxyAdmin...');
  await upgrades.admin.transferProxyAdminOwnership(gnosisSafe);
  log('Transferred ownership of ProxyAdmin to:', gnosisSafe);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    log(error);
    process.exit(1);
  });
