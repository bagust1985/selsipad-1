import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  let currentNonce = await hre.ethers.provider.getTransactionCount(deployer.address, "latest");
  console.log("Starting nonce:", currentNonce);

  const TREASURY = deployer.address;
  const ADMIN = deployer.address;
  
  // Deploy FeeSplitter
  console.log("Deploying FeeSplitter, nonce", currentNonce);
  const FeeSplitter = await hre.ethers.getContractFactory('FeeSplitter');
  const feeSplitter = await FeeSplitter.deploy(TREASURY, TREASURY, TREASURY, ADMIN, { nonce: currentNonce++ });
  await feeSplitter.waitForDeployment();
  const fsAddr = await feeSplitter.getAddress();
  console.log("✅ FeeSplitter:", fsAddr);

  // Deploy LPLocker
  console.log("Deploying LPLocker, nonce", currentNonce);
  const LPLocker = await hre.ethers.getContractFactory('contracts/fairlaunch/LPLocker.sol:LPLocker');
  const lpLocker = await LPLocker.deploy({ nonce: currentNonce++ });
  await lpLocker.waitForDeployment();
  const lpAddr = await lpLocker.getAddress();
  console.log("✅ LPLocker:", lpAddr);

  // Deploy PresaleFactory
  console.log("Deploying PresaleFactory, nonce", currentNonce);
  const PresaleFactory = await hre.ethers.getContractFactory('PresaleFactory');
  const router = '0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24';
  const presaleFactory = await PresaleFactory.deploy(fsAddr, ADMIN, router, lpAddr, { nonce: currentNonce++ });
  await presaleFactory.waitForDeployment();
  const pfAddr = await presaleFactory.getAddress();
  console.log("✅ PresaleFactory:", pfAddr);

  console.log("Done!");
}
main().catch(console.error);
