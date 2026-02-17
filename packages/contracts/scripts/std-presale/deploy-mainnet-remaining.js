const hre = require('hardhat');
const fs = require('fs');

/**
 * Deploy REMAINING Presale contracts (LPLocker + PresaleFactory) to BSC Mainnet
 * FeeSplitter already deployed at 0x2Bf655410Cf6d7A88dc0d4D1f815546C8Eb2Ab52
 */

const PANCAKE_ROUTER_V2_MAINNET = '0x10ED43C718714eb63d5aA57B78B54704E256024E';
const FEE_SPLITTER_MAINNET = '0x2Bf655410Cf6d7A88dc0d4D1f815546C8Eb2Ab52';

function log(msg) {
  console.log(msg);
}

async function main() {
  log('\n🚀 DEPLOYING LPLocker + PresaleFactory — BSC MAINNET\n');

  const [deployer] = await hre.ethers.getSigners();
  log(`👷 Deployer: ${deployer.address}`);
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  log(`💰 Balance:  ${hre.ethers.formatEther(balance)} BNB\n`);

  // ═══ LPLocker ═══
  log('1️⃣  Deploying LPLocker (contracts/shared/LPLocker.sol)...');
  const LPLocker = await hre.ethers.getContractFactory('contracts/shared/LPLocker.sol:LPLocker');
  const lpLocker = await LPLocker.deploy();
  await lpLocker.waitForDeployment();
  const lpLockerAddr = await lpLocker.getAddress();
  log(`   ✅ LPLocker: ${lpLockerAddr}`);
  const lpTx = lpLocker.deploymentTransaction();
  if (lpTx) {
    const receipt = await lpTx.wait(3);
    log(`   Confirmed (3 blocks) — block: ${receipt.blockNumber}\n`);
  }

  // ═══ PresaleFactory ═══
  log('2️⃣  Deploying PresaleFactory...');
  const Factory = await hre.ethers.getContractFactory('PresaleFactory');
  const factory = await Factory.deploy(
    FEE_SPLITTER_MAINNET,
    deployer.address, // timelock = deployer
    PANCAKE_ROUTER_V2_MAINNET,
    lpLockerAddr
  );
  await factory.waitForDeployment();
  const factoryAddr = await factory.getAddress();
  log(`   ✅ PresaleFactory: ${factoryAddr}`);
  const factoryTx = factory.deploymentTransaction();
  let deployBlock = 0;
  if (factoryTx) {
    const receipt = await factoryTx.wait(3);
    deployBlock = receipt.blockNumber;
    log(`   Confirmed (3 blocks) — block: ${deployBlock}\n`);
  }

  // ═══ Configure Roles ═══
  log('3️⃣  Configuring Roles...');

  // Grant Factory DEFAULT_ADMIN on FeeSplitter
  const FeeSplitter = await hre.ethers.getContractFactory('FeeSplitter');
  const feeSplitter = FeeSplitter.attach(FEE_SPLITTER_MAINNET);
  try {
    const tx = await feeSplitter
      .connect(deployer)
      .grantRole(await feeSplitter.DEFAULT_ADMIN_ROLE(), factoryAddr);
    await tx.wait();
    log('   ✅ Factory → FeeSplitter DEFAULT_ADMIN_ROLE');
  } catch (e) {
    log(`   ⚠️ FeeSplitter role: ${e.message?.substring(0, 100)}`);
  }

  // Grant deployer FACTORY_ADMIN_ROLE
  try {
    const tx = await factory.grantRole(await factory.FACTORY_ADMIN_ROLE(), deployer.address);
    await tx.wait();
    log('   ✅ Deployer → Factory FACTORY_ADMIN_ROLE\n');
  } catch (e) {
    log(`   ⚠️ Factory admin role: ${e.message?.substring(0, 100)}`);
  }

  // ═══ Save ═══
  const deployInfo = {
    network: 'BSC Mainnet',
    chainId: '56',
    timestamp: new Date().toISOString(),
    deployBlock,
    deployer: deployer.address,
    contracts: {
      feeSplitter: FEE_SPLITTER_MAINNET,
      lpLocker: lpLockerAddr,
      factory: factoryAddr,
      dexRouter: PANCAKE_ROUTER_V2_MAINNET,
    },
    transactions: { lpLocker: lpTx?.hash, factory: factoryTx?.hash },
  };
  fs.writeFileSync('./deployment-presale-mainnet.json', JSON.stringify(deployInfo, null, 2));

  log('═══════════════════════════════════════════');
  log('✅ ALL PRESALE CONTRACTS DEPLOYED!');
  log('═══════════════════════════════════════════');
  log(`FeeSplitter:    ${FEE_SPLITTER_MAINNET}`);
  log(`LPLocker:       ${lpLockerAddr}`);
  log(`PresaleFactory: ${factoryAddr}`);
  log(`Deploy Block:   ${deployBlock}\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Failed:', error.message || error);
    process.exit(1);
  });
