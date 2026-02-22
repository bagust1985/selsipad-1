import hre from "hardhat";

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    let currentNonce = await hre.ethers.provider.getTransactionCount(deployer.address, "latest");
    console.log("Starting nonce:", currentNonce);

    const TREASURY = deployer.address;
    const ADMIN = deployer.address;
    const fsAddr = "0x199A6AE884baF4D596DCdFa5925A196fbde8cdbF".toLowerCase();
    const DEPLOYMENT_FEE = hre.ethers.parseEther('0.005');

    console.log("Deploying FairlaunchFactory, nonce", currentNonce);
    const FairlaunchFactory = await hre.ethers.getContractFactory('FairlaunchFactory');
    const flFactory = await FairlaunchFactory.deploy(DEPLOYMENT_FEE, fsAddr, TREASURY, ADMIN, { nonce: currentNonce++ });
    await flFactory.waitForDeployment();
    const address = await flFactory.getAddress();
    console.log("✅ FairlaunchFactory:", address);
}
main().catch(console.error);
