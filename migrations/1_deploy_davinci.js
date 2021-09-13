const Davinci = artifacts.require("Davinci");

module.exports = async function (deployer) {
  await deployer.deploy(Davinci);
};
