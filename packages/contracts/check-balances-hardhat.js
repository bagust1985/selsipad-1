const hre = require("hardhat");

async function main() {
    console.log("🔍 Checking Testnet Balances...");
    
    const [wallet] = await hre.ethers.getSigners();
    console.log(`💳 Address: ${wallet.address}\n`);

    const balance = await hre.ethers.provider.getBalance(wallet.address);
    console.log(`✅ ${hre.network.name}: ${hre.ethers.formatEther(balance)} ETH / BNB`);
}

main().catch(console.error);
