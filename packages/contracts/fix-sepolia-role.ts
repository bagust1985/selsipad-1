import hre from "hardhat";

async function main() {
    const admin = "0x95D94D86CfC550897d2b80672a3c94c12429a90D";
    const factory = "0xfeF5DaD7f3eDACC16373C1991152D7F297a1Ed1A";
    const feeSplitterAddr = "0xbAA68a0F13a9dbb8Af20ba64C20b46BC03C24714";

    console.log("Granting DEFAULT_ADMIN_ROLE to Factory on FeeSplitter...");

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
