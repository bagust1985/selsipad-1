import { ethers } from 'hardhat';

/**
 * Deployment Script for AMAPurchaseRegistry
 *
 * Deploys to BSC Testnet with Chainlink BNB/USD price feed
 */

async function main() {
  console.log('🚀 Deploying AMAPurchaseRegistry to BSC Testnet...\n');

  // Configuration
  const TREASURY_ADDRESS =
    process.env.TREASURY_VAULT_ADDRESS || '0x95D94D86CfC550897d2b80672a3c94c12429a90D';
  
  // Chainlink BNB/USD Price Feed
  const CHAINLINK_BNB_USD_TESTNET = '0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526';
  const CHAINLINK_BNB_USD_MAINNET = '0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE';
  
  // Use testnet by default
  const PRICE_FEED = CHAINLINK_BNB_USD_TESTNET;
  
  // Fallback manual price: $600 per BNB (18 decimals)
  const MANUAL_PRICE_BNB = ethers.parseEther('600');

  console.log('📋 Deployment Configuration:');
  console.log('  Treasury:', TREASURY_ADDRESS);
  console.log('  Price Feed (Chainlink):', PRICE_FEED);
  console.log('  Manual Price Fallback: $600 per BNB\n');

  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log('👤 Deploying with account:', deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log('💰 Account balance:', ethers.formatEther(balance), 'BNB\n');

  // Deploy contract
  console.log('📝 Deploying AMAPurchaseRegistry...');
  const AMAPurchaseRegistry = await ethers.getContractFactory('AMAPurchaseRegistry');

  const amaPurchaseRegistry = await AMAPurchaseRegistry.deploy(
    TREASURY_ADDRESS,
    PRICE_FEED,
    MANUAL_PRICE_BNB
  );

  await amaPurchaseRegistry.waitForDeployment();
  const contractAddress = await amaPurchaseRegistry.getAddress();

  console.log('✅ AMAPurchaseRegistry deployed to:', contractAddress);
  console.log('\n🔍 Verifying deployment...');

  // Verify deployment state
  const treasury = await amaPurchaseRegistry.treasury();
  const priceFeed = await amaPurchaseRegistry.priceFeed();
  const manualPrice = await amaPurchaseRegistry.manualPriceBNB();
  const useOracle = await amaPurchaseRegistry.useOracle();
  const feeUSD = await amaPurchaseRegistry.AMA_FEE_USD();
  
  // Get required BNB (will use oracle)
  let requiredBNB;
  try {
    requiredBNB = await amaPurchaseRegistry.getRequiredBNB();
    console.log('\n✓ Oracle Connection: SUCCESS');
  } catch (e) {
    console.log('\n⚠️ Oracle Connection: FAILED (will use manual price)');
    requiredBNB = (feeUSD * BigInt(1e18)) / manualPrice;
  }

  console.log('\n✓ Contract State:');
  console.log('  Treasury:', treasury);
  console.log('  Price Feed:', priceFeed);
  console.log('  Manual Price:', ethers.formatEther(manualPrice), 'USD/BNB');
  console.log('  Use Oracle:', useOracle);
  console.log('  AMA Fee:', ethers.formatEther(feeUSD), 'USD');
  console.log('  Required BNB:', ethers.formatEther(requiredBNB), 'BNB');

  // Try to get oracle price
  try {
    const oraclePrice = await amaPurchaseRegistry.getOraclePrice();
    console.log('  Oracle Price:', Number(oraclePrice) / 1e8, 'USD/BNB');
  } catch (e) {
    console.log('  Oracle Price: Not available');
  }

  // Save deployment info
  const deploymentInfo = {
    network: 'BSC Testnet',
    chainId: 97,
    contractAddress: contractAddress,
    treasury: treasury,
    priceFeed: priceFeed,
    manualPrice: ethers.formatEther(manualPrice),
    useOracle: useOracle,
    amaFeeUSD: ethers.formatEther(feeUSD),
    requiredBNB: ethers.formatEther(requiredBNB),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    transactionHash: amaPurchaseRegistry.deploymentTransaction()?.hash,
  };

  console.log('\n📄 Deployment Info:');
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Save to file
  const fs = require('fs');
  fs.writeFileSync(
    './deployments/ama-registry-testnet.json',
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log('\n💾 Deployment info saved to: deployments/ama-registry-testnet.json');

  console.log('\n🎯 Next Steps:');
  console.log('1. Verify contract on BSCScan:');
  console.log(
    `   npx hardhat verify --network bscTestnet ${contractAddress} "${TREASURY_ADDRESS}" "${PRICE_FEED}" "${MANUAL_PRICE_BNB}"`
  );
  console.log('\n2. Update frontend contract address in:');
  console.log('   - apps/web/src/hooks/useAMAPurchase.ts');
  console.log('   - apps/web/app/api/ama/verify-payment/route.ts');
  console.log('\n3. Test AMA request flow on testnet');

  console.log('\n✨ Deployment Complete!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Deployment failed:');
    console.error(error);
    process.exit(1);
  });
