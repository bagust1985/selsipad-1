import { ethers } from 'hardhat';
import fs from 'fs';

/**
 * Deployment Script for BlueCheckRegistry — BSC MAINNET
 *
 * Uses mainnet treasury and referral pool addresses
 */

async function main() {
  console.log('🚀 Deploying BlueCheckRegistry to BSC MAINNET (Chain 56)...\n');

  // Mainnet Configuration from .env.local
  const TREASURY_ADDRESS = '0x124D5b097838A2F15b08f83239961b5D5D825223';
  const REFERRAL_POOL_ADDRESS = '0x7A5812758Cad9585b84c292bFeaD5f7929E40339'; // MASTER_REFERRER_MAINNET

  // Current BNB price ~$600 (manual fallback price)
  const INITIAL_BNB_PRICE = ethers.parseEther('600');

  console.log('📋 Deployment Configuration:');
  console.log('  Network: BSC Mainnet (56)');
  console.log('  Treasury:', TREASURY_ADDRESS);
  console.log('  Referral Pool:', REFERRAL_POOL_ADDRESS);
  console.log('  Initial BNB Price: $600\n');

  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log('👤 Deploying with account:', deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log('💰 Account balance:', ethers.formatEther(balance), 'BNB');

  if (balance < ethers.parseEther('0.01')) {
    console.error('❌ Insufficient BNB for deployment! Need at least 0.01 BNB');
    process.exit(1);
  }

  console.log('\n📝 Deploying BlueCheckRegistry...');
  const BlueCheckRegistry = await ethers.getContractFactory('BlueCheckRegistry');

  const blueCheckRegistry = await BlueCheckRegistry.deploy(
    TREASURY_ADDRESS,
    REFERRAL_POOL_ADDRESS,
    INITIAL_BNB_PRICE
  );

  await blueCheckRegistry.waitForDeployment();
  const contractAddress = await blueCheckRegistry.getAddress();

  console.log('✅ BlueCheckRegistry deployed to:', contractAddress);
  console.log('\n🔍 Verifying deployment...');

  // Verify deployment
  const treasury = await blueCheckRegistry.treasury();
  const referralPool = await blueCheckRegistry.referralPool();
  const manualPrice = await blueCheckRegistry.manualPriceBNB();
  const priceUSD = await blueCheckRegistry.PRICE_USD();
  const requiredBNB = await blueCheckRegistry.getRequiredBNB();

  console.log('\n✓ Contract State:');
  console.log('  Treasury:', treasury);
  console.log('  Referral Pool:', referralPool);
  console.log('  Manual BNB Price:', ethers.formatEther(manualPrice), 'USD');
  console.log('  Blue Check Price:', ethers.formatEther(priceUSD), 'USD');
  console.log('  Required BNB:', ethers.formatEther(requiredBNB), 'BNB');

  // Save deployment info
  const deploymentInfo = {
    network: 'BSC Mainnet',
    chainId: 56,
    contractAddress: contractAddress,
    treasury: treasury,
    referralPool: referralPool,
    initialBNBPrice: ethers.formatEther(manualPrice),
    blueCheckPrice: ethers.formatEther(priceUSD),
    requiredBNB: ethers.formatEther(requiredBNB),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    transactionHash: blueCheckRegistry.deploymentTransaction()?.hash,
  };

  console.log('\n📄 Deployment Info:');
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Save to file
  fs.writeFileSync('./deployment-bluecheck-mainnet.json', JSON.stringify(deploymentInfo, null, 2));

  console.log('\n💾 Deployment info saved to: deployment-bluecheck-mainnet.json');

  console.log('\n🎯 Next Steps:');
  console.log('1. Update contract address in:');
  console.log('   - apps/web/.env.local (NEXT_PUBLIC_BLUECHECK_REGISTRY_BSC_MAINNET)');
  console.log('   - apps/web/src/hooks/useBlueCheckPurchase.ts');
  console.log('   - apps/web/src/app/api/bluecheck/verify-purchase/route.ts');
  console.log('\n2. Rebuild and restart the app');
  console.log('\n✨ Deployment Complete!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Deployment failed:');
    console.error(error);
    process.exit(1);
  });
