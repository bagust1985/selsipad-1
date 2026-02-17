const hre = require('hardhat');
const fs = require('fs');

/**
 * Deploy ALL Presale Infrastructure to BSC MAINNET
 *
 * Order:
 *   1. FeeSplitter (no dependencies)
 *   2. LPLocker (no dependencies)
 *   3. PresaleFactory (depends on FeeSplitter + LPLocker)
 *   4. Configure roles
 *
 * Usage:
 *   DEPLOYER_PRIVATE_KEY=0x... npx hardhat run scripts/std-presale/deploy-mainnet-all.js --network bsc
 */

// ─── BSC Mainnet Config ───
const PANCAKE_ROUTER_V2_MAINNET = '0x10ED43C718714eb63d5aA57B78B54704E256024E';

// Mainnet Platform Wallets
const TREASURY_WALLET = '0x124D5b097838A2F15b08f83239961b5D5D825223';
const REFERRAL_POOL = '0x7A5812758Cad9585b84c292bFeaD5f7929E40339';
const SBT_STAKING_WALLET = '0x124D5b097838A2F15b08f83239961b5D5D825223'; // same as treasury for now

function log(msg) {
  console.log(msg);
}

async function main() {
  log('\n🚀 PRESALE INFRASTRUCTURE — BSC MAINNET DEPLOYMENT\n');
  log('═══════════════════════════════════════════════════\n');

  const network = hre.network.name;
  if (network !== 'bsc') {
    log(`❌ This script is for BSC Mainnet only! Got: ${network}`);
    process.exit(1);
  }

  const [deployer] = await hre.ethers.getSigners();
  log(`📡 Network:  BSC Mainnet (56)`);
  log(`👷 Deployer: ${deployer.address}`);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  log(`💰 Balance:  ${hre.ethers.formatEther(balance)} BNB\n`);

  if (balance < hre.ethers.parseEther('0.03')) {
    log('❌ Need at least 0.03 BNB for 3 contract deployments + role config');
    process.exit(1);
  }

  log('📋 Configuration:');
  log(`   Treasury:       ${TREASURY_WALLET}`);
  log(`   Referral Pool:  ${REFERRAL_POOL}`);
  log(`   SBT Staking:    ${SBT_STAKING_WALLET}`);
  log(`   DEX Router:     ${PANCAKE_ROUTER_V2_MAINNET}`);
  log(`   Timelock:       ${deployer.address} (deployer as admin)\n`);

  // ════════════════════════════════════════
  // STEP 1: Deploy FeeSplitter
  // ════════════════════════════════════════
  log('1️⃣  Deploying FeeSplitter...');
  const FeeSplitter = await hre.ethers.getContractFactory('FeeSplitter');
  const feeSplitter = await FeeSplitter.deploy(
    TREASURY_WALLET,
    REFERRAL_POOL,
    SBT_STAKING_WALLET,
    deployer.address // admin
  );
  await feeSplitter.waitForDeployment();
  const feeSplitterAddr = await feeSplitter.getAddress();
  log(`   ✅ FeeSplitter: ${feeSplitterAddr}`);

  const fsTx = feeSplitter.deploymentTransaction();
  if (fsTx) {
    const receipt = await fsTx.wait(3);
    log(`   Confirmed (3 blocks) — block: ${receipt.blockNumber}\n`);
  }

  // ════════════════════════════════════════
  // STEP 2: Deploy LPLocker
  // ════════════════════════════════════════
  log('2️⃣  Deploying LPLocker...');
  const LPLocker = await hre.ethers.getContractFactory('LPLocker');
  const lpLocker = await LPLocker.deploy();
  await lpLocker.waitForDeployment();
  const lpLockerAddr = await lpLocker.getAddress();
  log(`   ✅ LPLocker: ${lpLockerAddr}`);

  const lpTx = lpLocker.deploymentTransaction();
  if (lpTx) {
    const receipt = await lpTx.wait(3);
    log(`   Confirmed (3 blocks) — block: ${receipt.blockNumber}\n`);
  }

  // ════════════════════════════════════════
  // STEP 3: Deploy PresaleFactory
  // ════════════════════════════════════════
  log('3️⃣  Deploying PresaleFactory...');
  const Factory = await hre.ethers.getContractFactory('PresaleFactory');
  const factory = await Factory.deploy(
    feeSplitterAddr,
    deployer.address, // timelock = deployer as admin
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
    log(`   Confirmed (3 blocks) — deploy block: ${deployBlock}\n`);
  }

  // ════════════════════════════════════════
  // STEP 4: Configure Roles
  // ════════════════════════════════════════
  log('4️⃣  Configuring Roles...');

  // Grant Factory DEFAULT_ADMIN on FeeSplitter so it can grantPresaleRole
  try {
    const tx = await feeSplitter.grantRole(await feeSplitter.DEFAULT_ADMIN_ROLE(), factoryAddr);
    await tx.wait();
    log('   ✅ Factory → FeeSplitter DEFAULT_ADMIN_ROLE');
  } catch (e) {
    log(`   ⚠️ FeeSplitter role grant failed: ${e.message}`);
  }

  // Grant deployer FACTORY_ADMIN_ROLE on factory
  try {
    const tx = await factory.grantRole(await factory.FACTORY_ADMIN_ROLE(), deployer.address);
    await tx.wait();
    log('   ✅ Deployer → Factory FACTORY_ADMIN_ROLE');
  } catch (e) {
    log(`   ⚠️ Factory admin role grant failed: ${e.message}`);
  }

  log('');

  // ════════════════════════════════════════
  // STEP 5: Save Deployment Info
  // ════════════════════════════════════════
  const deployInfo = {
    version: '2.4',
    network: 'BSC Mainnet',
    chainId: '56',
    timestamp: new Date().toISOString(),
    deployBlock,
    deployer: deployer.address,
    contracts: {
      feeSplitter: feeSplitterAddr,
      lpLocker: lpLockerAddr,
      factory: factoryAddr,
      dexRouter: PANCAKE_ROUTER_V2_MAINNET,
    },
    wallets: {
      treasury: TREASURY_WALLET,
      referralPool: REFERRAL_POOL,
      sbtStaking: SBT_STAKING_WALLET,
    },
    transactions: {
      feeSplitter: fsTx?.hash,
      lpLocker: lpTx?.hash,
      factory: factoryTx?.hash,
    },
  };

  fs.writeFileSync('./deployment-presale-mainnet.json', JSON.stringify(deployInfo, null, 2));

  log('═══════════════════════════════════════════════════');
  log('✅ ALL PRESALE INFRASTRUCTURE DEPLOYED TO MAINNET!');
  log('═══════════════════════════════════════════════════\n');
  log(`FeeSplitter:      ${feeSplitterAddr}`);
  log(`LPLocker:         ${lpLockerAddr}`);
  log(`PresaleFactory:   ${factoryAddr}`);
  log(`DEX Router:       ${PANCAKE_ROUTER_V2_MAINNET}`);
  log(`Deploy Block:     ${deployBlock}`);
  log(`\n🔗 BscScan:`);
  log(`   https://bscscan.com/address/${feeSplitterAddr}`);
  log(`   https://bscscan.com/address/${lpLockerAddr}`);
  log(`   https://bscscan.com/address/${factoryAddr}`);
  log(`\n💾 Saved to: deployment-presale-mainnet.json`);
  log(`\n⚠️  UPDATE these in .env.local & code:`);
  log(`   NEXT_PUBLIC_PRESALE_FACTORY_BSC_MAINNET=${factoryAddr}`);
  log(`   NEXT_PUBLIC_LP_LOCKER_BSC_MAINNET=${lpLockerAddr}`);
  log(`   NEXT_PUBLIC_FEE_SPLITTER_BSC_MAINNET=${feeSplitterAddr}\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Deployment failed:');
    console.error(error);
    process.exit(1);
  });
