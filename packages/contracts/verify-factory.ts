import hre from "hardhat";

async function main() {
    const factory = "0xD75C41be5e55e4bf1e74deA3Dce7a229aEdDb6E5".toLowerCase();

    const PresaleFactory = await hre.ethers.getContractFactory("PresaleFactory");
    const pf = PresaleFactory.attach(factory);

    console.log(`Checking ${factory} on Base Sepolia...`);
    try {
        const fs = await pf.feeSplitter();
        console.log("FeeSplitter configured in Factory:", fs);

        const code = await hre.ethers.provider.send("eth_getCode", [fs, "latest"]);
        console.log("Code at configured FeeSplitter:", code === "0x" ? "Empty" : "Exists");
    } catch (e: any) {
        console.log("Error:", e.message);
    }
}

main().catch(console.error);
