import hre from "hardhat";

async function main() {
    const address = "0xbAA68a0F13a9dbb8Af20ba64C20b46BC03C24714".toLowerCase();

    // Attach FeeSplitter
    const FeeSplitter = await hre.ethers.getContractFactory("FeeSplitter");
    const feeSplitter = FeeSplitter.attach(address);

    console.log(`Checking ${address} on Base Sepolia...`);
    try {
        const role = await feeSplitter.DEFAULT_ADMIN_ROLE();
        console.log("DEFAULT_ADMIN_ROLE:", role);

        const tVault = await feeSplitter.treasuryVault();
        console.log("Treasury Vault:", tVault);
    } catch (e: any) {
        console.log("Error:", e.message);
    }
}

main().catch(console.error);
