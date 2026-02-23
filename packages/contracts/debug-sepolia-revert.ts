import hre from "hardhat";

async function main() {
    const admin = "0x95D94D86CfC550897d2b80672a3c94c12429a90D";
    const factory = "0xfeF5DaD7f3eDACC16373C1991152D7F297a1Ed1A";
    const blockNum = 10316687;

    const block = await hre.ethers.provider.getBlock(blockNum, true);
    if (!block) return;

    const tx = block.prefetchedTransactions.find(t =>
        t.to && t.to.toLowerCase() === factory.toLowerCase() &&
        t.from.toLowerCase() === admin.toLowerCase()
    );
    if (!tx) return;

    try {
        await hre.ethers.provider.call({
            to: tx.to,
            from: tx.from,
            data: tx.data,
            value: tx.value
        }, blockNum - 1);
    } catch (err: any) {
        if (err.data) {
            console.log("Error data:", err.data);

            // Decode AccessControlUnauthorizedAccount(address account, bytes32 neededRole)
            const iface = new hre.ethers.Interface([
                "error AccessControlUnauthorizedAccount(address account, bytes32 neededRole)"
            ]);
            try {
                const decoded = iface.parseError(err.data);
                console.log("Decoded AccessControl error:");
                console.log("Account:", decoded?.args.account);
                console.log("Needed Role:", decoded?.args.neededRole);
            } catch (e) {
                console.log("Could not decode as AccessControl error.");
            }
        }
    }
}

main().catch(console.error);
