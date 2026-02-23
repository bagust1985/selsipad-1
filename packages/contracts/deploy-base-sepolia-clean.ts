import hre from "hardhat";

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    let currentNonce = await hre.ethers.provider.getTransactionCount(deployer.address, "latest");
    console.log("Starting nonce:", currentNonce);

    const TREASURY = deployer.address;
    const ADMIN = deployer.address;

    // 1. Deploy FeeSplitter
    console.log("1. Deploying FeeSplitter...");
    const FeeSplitter = await hre.ethers.getContractFactory('FeeSplitter');
    const feeSplitter = await FeeSplitter.deploy(TREASURY, TREASURY, TREASURY, ADMIN, { nonce: currentNonce++ });
    await feeSplitter.waitForDeployment();
    const fsAddr = await feeSplitter.getAddress();
    console.log("✅ FeeSplitter deployed at:", fsAddr);

    // Wait a bit for block propagation on Base Sepolia
    await new Promise(r => setTimeout(r, 5000));

    // 2. Deploy LPLocker
    console.log("2. Deploying LPLocker...");
    const LPLocker = await hre.ethers.getContractFactory('contracts/fairlaunch/LPLocker.sol:LPLocker');
    const lpLocker = await LPLocker.deploy({ nonce: currentNonce++ });
    await lpLocker.waitForDeployment();
    const lpAddr = await lpLocker.getAddress();
    console.log("✅ LPLocker deployed at:", lpAddr);

    await new Promise(r => setTimeout(r, 5000));

    // 3. Deploy PresaleFactory
    console.log("3. Deploying PresaleFactory...");
    const PresaleFactory = await hre.ethers.getContractFactory('PresaleFactory');
    const router = '0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24'; // Pre-existing Uniswap V2 router for Basescan testing
    const presaleFactory = await PresaleFactory.deploy(fsAddr, ADMIN, router, lpAddr, { nonce: currentNonce++ });
    await presaleFactory.waitForDeployment();
    const pfAddr = await presaleFactory.getAddress();
    console.log("✅ PresaleFactory deployed at:", pfAddr);

    await new Promise(r => setTimeout(r, 5000));

    // 4. Deploy FairlaunchFactory
    console.log("4. Deploying FairlaunchFactory...");
    const FairlaunchFactory = await hre.ethers.getContractFactory('FairlaunchFactory');
    const fairlaunchFactory = await FairlaunchFactory.deploy(fsAddr, ADMIN, router, lpAddr, { nonce: currentNonce++ });
    await fairlaunchFactory.waitForDeployment();
    const ffAddr = await fairlaunchFactory.getAddress();
    console.log("✅ FairlaunchFactory deployed at:", ffAddr);

    await new Promise(r => setTimeout(r, 5000));

    // 5. Grant DEFAULT_ADMIN_ROLE to both factories on FeeSplitter
    console.log("5. Granting DEFAULT_ADMIN_ROLE on FeeSplitter to both factories...");
    const DEFAULT_ADMIN_ROLE = await feeSplitter.DEFAULT_ADMIN_ROLE();

    const tx1 = await feeSplitter.grantRole(DEFAULT_ADMIN_ROLE, pfAddr, { nonce: currentNonce++ });
    await tx1.wait();
    console.log("✅ Granted admin role to PresaleFactory");

    const tx2 = await feeSplitter.grantRole(DEFAULT_ADMIN_ROLE, ffAddr, { nonce: currentNonce++ });
    await tx2.wait();
    console.log("✅ Granted admin role to FairlaunchFactory");

    console.log("------------------------------------------");
    console.log("Base Sepolia Deployment Complete!");
    console.log("NEXT_PUBLIC_FEE_SPLITTER_BASE_SEPOLIA=" + fsAddr);
    console.log("NEXT_PUBLIC_LP_LOCKER_BASE_SEPOLIA=" + lpAddr);
    console.log("NEXT_PUBLIC_PRESALE_FACTORY_BASE_SEPOLIA=" + pfAddr);
    console.log("NEXT_PUBLIC_FAIRLAUNCH_FACTORY_BASE_SEPOLIA=" + ffAddr);
}
main().catch(console.error);
