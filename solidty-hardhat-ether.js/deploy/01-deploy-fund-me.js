//import
//main function
//calling of main function

const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { network } = require("hardhat")
const { verify } = require("../utils/verify")
const { verifyTypedData } = require("ethers/lib/utils")
const { providers } = require("ethers")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    let ethUsdPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
        log(ethUsdPriceFeedAddress)
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    //since the price converter using only goerli network for ETH-USD price under V3interface (as we hardcoded the address), how can we change the chainlink?
    //when going for localhost or hardhat network we want to use a mock, cause for price converter we get the price of ETH-USD only for goerli network

    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: [ethUsdPriceFeedAddress], //put price feed for constructor
        log: true,
        waitConfirmation: network.config.blockConfirmation || 1,
    })

    const args = [ethUsdPriceFeedAddress]

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, args)
    }

    log("--------------------------------------")
}

module.exports.tags = ["all", "fundme"]
