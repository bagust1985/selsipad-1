import hre from "hardhat";

async function main() {
    const sepoliaProvider = new hre.ethers.JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com");
    const baseSepoliaProvider = new hre.ethers.JsonRpcProvider("https://sepolia.base.org");

    const sNet = await sepoliaProvider.getNetwork();
    const bNet = await baseSepoliaProvider.getNetwork();

    console.log("Sepolia RPC ChainId:", sNet.chainId);
    console.log("Base Sepolia RPC ChainId:", bNet.chainId);
}

main().catch(console.error);
