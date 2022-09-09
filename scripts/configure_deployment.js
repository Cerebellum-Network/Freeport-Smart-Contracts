/* This scripts copies the configuration from the SDK into the build/*.json files,
 * which are then used by other scripts .deployed() functions.
 */

const fs = require("fs/promises");
const assert = require("assert/strict");
const log = console.log;

// Take the config from https://github.com/Cerebellum-Network/Freeport-Smart-Contracts-SDK
const CONFIG_PATH = "../Freeport-Smart-Contracts-SDK/src/config.json";
const DEPLOYMENT = "dev";
const NETWORK_ID = "80001";
const BUILD_PATH = "build/contracts/";


module.exports = async function (done) {
    try {
        // Load the deployment configuration.
        log("Network ID:", NETWORK_ID);
        log("Deployment name:", DEPLOYMENT);
        log("Config file:", CONFIG_PATH);
        let allConfig = JSON.parse(await fs.readFile(CONFIG_PATH));
        let config = allConfig[DEPLOYMENT][NETWORK_ID];
        assert(config, "Config not found");
        log("Config:", config);

        for (let contractName in config) {
            let address = config[contractName];

            if (contractName === "ERC20") contractName = "TestERC20";

            log();
            log("Operating on", contractName, address);

            let path = BUILD_PATH + contractName + ".json";
            let artif = JSON.parse(await fs.readFile(path));

            // Support fresh artifacts that do not have any deployment yet.
            if (!artif["networks"]) artif["networks"] = {};
            if (!artif["networks"][NETWORK_ID]) {
                artif["networks"][NETWORK_ID] = {
                    "events": {},
                    "links": {},
                    "transactionHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
                };
            }

            // Set the address for this deployment.
            artif["networks"][NETWORK_ID].address = address;

            await fs.writeFile(path, JSON.stringify(artif, null, 2));
            log("Configured", path);
        }

        done();
    } catch (e) {
        done(e);
    }
};
