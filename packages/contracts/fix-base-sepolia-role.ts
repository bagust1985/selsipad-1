import hre from "hardhat";

async function main() {
    const admin = "0x95D94D86CfC550897d2b80672a3c94c12429a90D";
    const factory = "0xD75C41be5e55e4bf1e74deA3Dce7a229aEdDb6E5".toLowerCase(); // Base Sepolia Factory
    const feeSplitterAddr = "0x199A6AE884baF4D596DCdFa5925A196fbde8cdbF".toLowerCase();

    console.log("Granting DEFAULT_ADMIN_ROLE to Factory on Base Sepolia FeeSplitter...");

    // Attach FeeSplitter
    const FeeSplitter = await hre.ethers.getContractFactory("FeeSplitter");
    const feeSplitter = FeeSplitter.attach(feeSplitterAddr);

    const DEFAULT_ADMIN_ROLE = await feeSplitter.DEFAULT_ADMIN_ROLE();

    const hasRole = await feeSplitter.hasRole(DEFAULT_ADMIN_ROLE, factory);
    console.log("Factory has rule currently?", hasRole);

    if (!hasRole) {
        console.log("Sending tx to grant role...");
        const tx = await feeSplitter.grantRole(DEFAULT_ADMIN_ROLE, factory);
        await tx.wait();
        console.log("✅ Role granted! Tx:", tx.hash);
    } else {
        console.log("Role already granted.");
    }
}

main().catch(console.error);
