const hre = require('hardhat');
const fs = require('fs');
const path = require('path');

/**
 * Redeploy PresaleFactory v2.3 (with finalizeSuccessEscrow)
 *
 * Deploys a NEW FeeSplitter + PresaleFactory pair so new PresaleRound
 * contracts include `finalizeSuccessEscrow(bytes32, uint256, uint256)`.
 *
 * Changes from v2.2:
 *   - PresaleRound now has `finalizeSuccessEscrow()` for escrow-based finalization
 *   - CEI pattern: status set before external BNB calls
 *   - `uint256 burnedAmount` instead of `bool unsoldBurned`
 *   - FeeSplitter try/catch with `FeeDistributionFailed` error
 *   - `InvalidMerkleRoot` validation
 *
 * Usage:
 *   npx hardhat run scripts/std-presale/redeploy-factory-v2.3.js --network bscTestnet
 */

function log(msg) {
  console.log(msg);
}

async function main() {
  log('\n🚀 PRESALE FACTORY v2.3 REDEPLOYMENT (finalizeSuccessEscrow)\n');

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
  const sbtStakingVault = process.env.SBT_STAKING_VAULT_ADDRESS || treasuryVault;
  const timelockAddress = process.env.TIMELOCK_ADDRESS;

  if (!treasuryVault || !referralPoolVault || !timelockAddress) {
    log(
      '❌ Missing env vars: TREASURY_VAULT_ADDRESS, REFERRAL_POOL_VAULT_ADDRESS, TIMELOCK_ADDRESS'
    );
    process.exit(1);
  }

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

  await feeSplitter.deploymentTransaction().wait(3);
  log('   Confirmed (3 blocks)\n');

  // ---- Deploy PresaleFactory ----
  log('2️⃣  Deploying PresaleFactory v2.3...');
  const Factory = await hre.ethers.getContractFactory('PresaleFactory');
  const factory = await Factory.deploy(feeSplitterAddr, timelockAddress);
  await factory.waitForDeployment();
  const factoryAddr = await factory.getAddress();
  log(`✅ PresaleFactory: ${factoryAddr}`);

  await factory.deploymentTransaction().wait(3);
  log('   Confirmed (3 blocks)\n');

  // ---- Configure Roles ----
  log('3️⃣  Configuring Roles...');

  // Grant factory as admin on fee splitter (so factory can call grantPresaleRole)
  const feeSplitterAdmin = feeSplitter.connect(admin);
  const tx1 = await feeSplitterAdmin.grantRole(await feeSplitter.DEFAULT_ADMIN_ROLE(), factoryAddr);
  await tx1.wait();
  log('   ✅ Factory → FeeSplitter DEFAULT_ADMIN_ROLE');

  // Grant admin on factory
  const factoryDeployer = factory.connect(deployer);
  const tx2 = await factoryDeployer.grantRole(await factory.FACTORY_ADMIN_ROLE(), admin.address);
  await tx2.wait();
  log('   ✅ Admin → Factory FACTORY_ADMIN_ROLE\n');

  // ---- Verify on BSCScan ----
  if (network !== 'hardhat' && network !== 'localhost') {
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
    version: '2.3',
    network,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    admin: admin.address,
    contracts: {
      feeSplitter: feeSplitterAddr,
      factory: factoryAddr,
    },
    previousVersion: {
      version: '2.2',
      feeSplitter: '0xa91e51F043Bc455dAae1f74Ad1991Df4C711b5ED',
      factory: '0xf3935d541A4F8fBED26c39f7E43625CE7b4d11E6',
    },
    changes: [
      'PresaleRound now has finalizeSuccessEscrow(bytes32, uint256, uint256)',
      'CEI pattern: status set before external BNB calls',
      'uint256 burnedAmount replaces bool unsoldBurned (resume-safe)',
      'FeeSplitter try/catch with FeeDistributionFailed error',
      'InvalidMerkleRoot validation added',
      'VestingFundingFailed kept for legacy functions',
    ],
  };

  const outputDir = './deployments';
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  const filename = `presale-v2.3-${network}-${Date.now()}.json`;
  const filepath = path.join(outputDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(deployInfo, null, 2));

  log('========================================');
  log('✅ DEPLOYMENT COMPLETE!');
  log('========================================\n');
  log(`FeeSplitter:    ${feeSplitterAddr}`);
  log(`PresaleFactory: ${factoryAddr}`);
  log(`\n🔗 Explorer:`);
  log(`   https://testnet.bscscan.com/address/${feeSplitterAddr}`);
  log(`   https://testnet.bscscan.com/address/${factoryAddr}`);
  log(`\n💾 Saved to: ${filepath}`);
  log(`\n⚠️  UPDATE these addresses:`);
  log(`   1. apps/web/src/lib/web3/presale-contracts.ts → CONTRACTS.bsc_testnet`);
  log(`   2. apps/web/src/actions/admin/finalize-presale.ts → ESCROW_VAULTS if needed`);
  log(`   3. packages/contracts/.env → FEE_SPLITTER_ADDRESS\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
