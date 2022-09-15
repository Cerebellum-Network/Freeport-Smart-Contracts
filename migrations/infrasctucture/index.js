function getBiconomyForwarder(network) {
    let biconomyForwarder;
    if (network === "polygon_mainnet" || network === "polygon_infura_mainnet") biconomyForwarder = "0x86C80a8aa58e0A4fa09A69624c31Ab2a6CAD56b8";
    if (network === "polygon_testnet" || network === "polygon_infura_testnet" || network === "development") biconomyForwarder = "0x9399BB24DBB5C4b782C70c2969F58716Ebbd6a3b";
    return biconomyForwarder
}

module.exports ={
    getBiconomyForwarder
}
