const { ethers } = require("ethers");
require("dotenv").config({ path: "../../apps/web/.env" });

async function main() {
    console.log("🔍 Checking Testnet Balances...");
    
    // Testnet Deployer Wallet
    const privateKey = process.env.DEPLOYER_PRIVATE_KEY_TESTNET || process.env.DEPLOYER_PRIVATE_KEY;
    if (!privateKey) {
        console.error("❌ No Deployer Private Key found in .env");
        return;
    }
    
    const wallet = new ethers.Wallet(privateKey);
    console.log(`💳 Address: ${wallet.address}\n`);

    // RPCs from config or public fallbacks
    const networks = [
        { name: "Sepolia (ETH)", rpc: process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org" },
        { name: "Base Sepolia", rpc: process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org" },
        { name: "BSC Testnet", rpc: process.env.BSC_TESTNET_RPC_URL || "https://data-seed-prebsc-1-s1.binance.org:8545" }
    ];

    for (const net of networks) {
        try {
            const provider = new ethers.JsonRpcProvider(net.rpc);
            const balance = await provider.getBalance(wallet.address);
            console.log(`✅ ${net.name}: ${ethers.formatEther(balance)} ETH / BNB`);
        } catch (e) {
            console.log(`❌ ${net.name}: Failed to connect (${e.message.split('(')[0].trim()})`);
        }
    }
}

main();
