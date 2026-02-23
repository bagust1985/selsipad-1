import hre from "hardhat";

async function main() {
    const sepoliaFeeSplitter = "0xbAA68a0F13a9dbb8Af20ba64C20b46BC03C24714".toLowerCase();
    const baseSepoliaFeeSplitter = "0x199A6AE884baF4D596DCdFa5925A196fbde8cdbF".toLowerCase();

    const net = hre.network.name;

    const codeSepolia = await hre.ethers.provider.send("eth_getCode", [sepoliaFeeSplitter, "latest"]);
    const codeBaseSepolia = await hre.ethers.provider.send("eth_getCode", [baseSepoliaFeeSplitter, "latest"]);

    console.log(`Checking on ${net}:`);
    console.log(`- Address 0xbAA...:`, codeSepolia === "0x" ? "Empty" : "Exists");
    console.log(`- Address 0x199A...:`, codeBaseSepolia === "0x" ? "Empty" : "Exists");
}

main().catch(console.error);
