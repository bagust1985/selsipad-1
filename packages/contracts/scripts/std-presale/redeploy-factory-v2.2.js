const hre = require('hardhat');
const fs = require('fs');
const path = require('path');

/**
 * Redeploy PresaleFactory v2.2 (with auto-burn)
 *
 * Deploys a NEW FeeSplitter + PresaleFactory pair so new PresaleRound
 * contracts include the updated `finalizeSuccess` with `totalTokensForSale`
 * auto-burn parameter.
 *
 * Usage:
 *   npx hardhat run scripts/std-presale/redeploy-factory-v2.2.js --network bscTestnet
 */

function log(msg) {
  console.log(msg);
}

async function main() {
  log('\n🚀 PRESALE FACTORY v2.2 REDEPLOYMENT (Auto-Burn)\n');

  const network = hre.network.name;
  log(`📡 Network: ${network}`);

  const [deployer, admin] = await hre.ethers.getSigners();
  log(`👷 Deployer: ${deployer.address}`);
  log(`👑 Admin: ${admin.address}\n`);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  log(`💰 Deployer Balance: ${hre.ethers.formatEther(balance)} tBNB\n`);

  if (balance === 0n) {
    log('❌ No balance! Fund your wallet first.');
    process.exit(1);
  }

  // Vault addresses from .env
  const treasuryVault = process.env.TREASURY_VAULT_ADDRESS;
  const referralPoolVault = process.env.REFERRAL_POOL_VAULT_ADDRESS;
  // SBT staking uses treasury as fallback
  const sbtStakingVault = process.env.SBT_STAKING_VAULT_ADDRESS || treasuryVault;
  const timelockAddress = process.env.TIMELOCK_ADDRESS;

  log('📋 Configuration:');
  log(`   Treasury: ${treasuryVault}`);
  log(`   Referral Pool: ${referralPoolVault}`);
  log(`   SBT Staking: ${sbtStakingVault}`);
  log(`   Timelock: ${timelockAddress}\n`);

  // ---- Deploy FeeSplitter ----
  log('1️⃣  Deploying FeeSplitter...');
  const FeeSplitter = await hre.ethers.getContractFactory('FeeSplitter');
  const feeSplitter = await FeeSplitter.deploy(
    treasuryVault,
    referralPoolVault,
    sbtStakingVault,
    admin.address
  );
  await feeSplitter.waitForDeployment();
  const feeSplitterAddr = await feeSplitter.getAddress();
  log(`✅ FeeSplitter: ${feeSplitterAddr}`);

  // Wait for confirmations
  await feeSplitter.deploymentTransaction().wait(3);
  log('   Confirmed (3 blocks)\n');

  // ---- Deploy PresaleFactory ----
  log('2️⃣  Deploying PresaleFactory v2.2...');
  const Factory = await hre.ethers.getContractFactory('PresaleFactory');
  const factory = await Factory.deploy(feeSplitterAddr, timelockAddress);
  await factory.waitForDeployment();
  const factoryAddr = await factory.getAddress();
  log(`✅ PresaleFactory: ${factoryAddr}`);

  await factory.deploymentTransaction().wait(3);
  log('   Confirmed (3 blocks)\n');

  // ---- Configure Roles ----
  log('3️⃣  Configuring Roles...');

  // Grant factory as admin on fee splitter
  const feeSplitterAdmin = feeSplitter.connect(admin);
  const tx1 = await feeSplitterAdmin.grantRole(await feeSplitter.DEFAULT_ADMIN_ROLE(), factoryAddr);
  await tx1.wait();
  log('   ✅ Factory → FeeSplitter admin');

  // Grant admin on factory
  const factoryDeployer = factory.connect(deployer);
  const tx2 = await factoryDeployer.grantRole(await factory.FACTORY_ADMIN_ROLE(), admin.address);
  await tx2.wait();
  log('   ✅ Admin → Factory admin\n');

  // ---- Verify on BSCScan ----
  if (network !== 'hardhat') {
    log('4️⃣  Verifying on BSCScan...');
    await new Promise((r) => setTimeout(r, 20000));

    try {
      await hre.run('verify:verify', {
        address: feeSplitterAddr,
        constructorArguments: [treasuryVault, referralPoolVault, sbtStakingVault, admin.address],
      });
      log('   ✅ FeeSplitter verified');
    } catch (e) {
      log(`   ⚠️ FeeSplitter verify: ${e.message}`);
    }

    try {
      await hre.run('verify:verify', {
        address: factoryAddr,
        constructorArguments: [feeSplitterAddr, timelockAddress],
      });
      log('   ✅ PresaleFactory verified');
    } catch (e) {
      log(`   ⚠️ Factory verify: ${e.message}`);
    }
    console.log('');
  }

  // ---- Save deployment info ----
  const deployInfo = {
    version: '2.2',
    network,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    admin: admin.address,
    contracts: {
      feeSplitter: feeSplitterAddr,
      factory: factoryAddr,
    },
    changes: [
      'PresaleRound.finalizeSuccess now has totalTokensForSale parameter',
      'Auto-burns unsold tokens to 0xdEaD when totalRaised < hardCap',
      'New event: UnsoldTokensBurned(uint256 amount)',
    ],
  };

  const outputDir = './deployments';
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  const filename = `presale-v2.2-${network}-${Date.now()}.json`;
  const filepath = path.join(outputDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(deployInfo, null, 2));

  log('========================================');
  log('✅ DEPLOYMENT COMPLETE!');
  log('========================================\n');
  log(`FeeSplitter: ${feeSplitterAddr}`);
  log(`PresaleFactory: ${factoryAddr}`);
  log(`\n🔗 Explorer:`);
  log(`   https://testnet.bscscan.com/address/${feeSplitterAddr}`);
  log(`   https://testnet.bscscan.com/address/${factoryAddr}`);
  log(`\n💾 Saved to: ${filepath}`);
  log(`\n⚠️  UPDATE deploy-presale.ts with new Factory address: ${factoryAddr}\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
