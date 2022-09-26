import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const getButton = document.getElementById("getButton")
const withdrawButton = document.getElementById("withdrawButton")

connectButton.onclick = connect
fundButton.onclick = fund
getButton.onclick = getBalance
withdrawButton.onclick = withdrawBalance

async function connect() {
    if (typeof window.ethereum != "undefined") {
        await window.ethereum.request({ method: "eth_requestAccounts" })
        connectButton.innerHTML = "Connected"
        connectButton.style.backgroundColor = "#018749"
        connectButton.style.color = "white"
    } else {
        connectButton.innerHTML = "Fail connection"
        connectButton.style.backgroundColor = "red"
        alert("Please install MetaMask wallet.")
    }
}

async function fund() {
    const ethAmount = document.getElementById("ethAmount").value
    console.log(`Funding with ${ethAmount}`)
    if (typeof window.ethereum != "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })

            //hey,listen for this TX to finish
            await listenForTransactionMine(transactionResponse, provider)
            console.log("Done!")

            //listen for an event
        } catch (error) {
            alert("Minimum deposition amount is 50 USD.")
            console.log("Transaction rejected")
        }
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}...`)
    //return new Promise()
    //listen for this transaction to finish

    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(
                `Completed with ${transactionReceipt.confirmations}confirmations`
            )
            resolve(console.log("Happy"))
        })
    })
}

async function getBalance() {
    const balanceAmount = document.getElementById("balanceAmount")
    if (typeof window.ethereum != "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const balance = await provider.getBalance(contractAddress)
        console.log(ethers.utils.formatEther(balance))
        balanceAmount.value = ethers.utils.formatEther(balance)
    }
}

async function withdrawBalance() {
    if (typeof window.ethereum != "undefined") {
        console.log("Withdrawing...")
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)

        try {
            const transactionResponse = await contract.cheaperWithdraw()
            await listenForTransactionMine(transactionResponse, provider)
        } catch (error) {
            console.log("Withdrawal rejected")
        }
    }
}
