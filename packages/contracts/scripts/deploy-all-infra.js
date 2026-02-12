/**
 * Deploy ALL infrastructure contracts to any testnet
 * Usage:
 *   npx hardhat run scripts/deploy-all-infra.js --network sepolia
 *   npx hardhat run scripts/deploy-all-infra.js --network base_sepolia
 *   npx hardhat run scripts/deploy-all-infra.js --network bscTestnet
 */
const hre = require('hardhat');

async function main() {
  const network = hre.network.name;
  const chainId = (await hre.ethers.provider.getNetwork()).chainId;
  console.log(`\n🚀 Deploying ALL infrastructure to ${network} (chainId: ${chainId})...\n`);

  const [deployer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log('Deployer:', deployer.address);
  console.log('Balance:', hre.ethers.formatEther(balance), 'ETH/BNB\n');

  // ─── Config (same treasury/admin for all testnets) ───
  const TREASURY = deployer.address;
  const ADMIN_EXECUTOR = deployer.address;

  // Deployment fee per network
  const DEPLOYMENT_FEE =
    chainId === 97n
      ? hre.ethers.parseEther('0.2') // BSC: 0.2 BNB
      : chainId === 11155111n
      ? hre.ethers.parseEther('0.01') // Sepolia: 0.01 ETH
      : hre.ethers.parseEther('0.005'); // Base Sepolia: 0.005 ETH

  const TOKEN_CREATION_FEE =
    chainId === 97n
      ? hre.ethers.parseEther('0.2')
      : chainId === 11155111n
      ? hre.ethers.parseEther('0.01')
      : hre.ethers.parseEther('0.005');

  // DEX Router per chain (V2-compatible routers)
  // Must match routers in Fairlaunch.sol constructor
  const DEX_ROUTERS = {
    97n: '0xD99D1c33F9fC3444f8101754aBC46c52416550D1', // PancakeSwap V2 BSC Testnet
    56n: '0x10ED43C718714eb63d5aA57B78B54704E256024E', // PancakeSwap V2 BSC Mainnet
    11155111n: '0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3', // Uniswap V2 Sepolia (official)
    1n: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', // Uniswap V2 ETH Mainnet
    84532n: '0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24', // Uniswap V2 Base Sepolia
    8453n: '0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24', // Uniswap V2 Base Mainnet
  };
  const dexRouter = DEX_ROUTERS[chainId];
  if (!dexRouter) {
    throw new Error(`No DEX router configured for chainId ${chainId}`);
  }

  const results = {};

  // ─── 1. Deploy FeeSplitter ───
  console.log('📝 [1/6] Deploying FeeSplitter...');
  const FeeSplitter = await hre.ethers.getContractFactory('FeeSplitter');
  const feeSplitter = await FeeSplitter.deploy(
    TREASURY, // _treasury
    TREASURY, // _referralPool (same wallet for testnet)
    TREASURY, // _sbtStaking (same wallet for testnet)
    ADMIN_EXECUTOR // _admin
  );
  await feeSplitter.waitForDeployment();
  results.feeSplitter = await feeSplitter.getAddress();
  console.log('   ✅ FeeSplitter:', results.feeSplitter);

  // ─── 2. Deploy LPLocker ───
  console.log('📝 [2/6] Deploying LPLocker...');
  const LPLocker = await hre.ethers.getContractFactory(
    'contracts/fairlaunch/LPLocker.sol:LPLocker'
  );
  const lpLocker = await LPLocker.deploy();
  await lpLocker.waitForDeployment();
  results.lpLocker = await lpLocker.getAddress();
  console.log('   ✅ LPLocker:', results.lpLocker);

  // ─── 3. Deploy EscrowVault ───
  console.log('📝 [3/6] Deploying EscrowVault...');
  const EscrowVault = await hre.ethers.getContractFactory('EscrowVault');
  const escrowVault = await EscrowVault.deploy();
  await escrowVault.waitForDeployment();
  results.escrowVault = await escrowVault.getAddress();
  console.log('   ✅ EscrowVault:', results.escrowVault);

  // ─── 4. Deploy SimpleTokenFactory ───
  console.log('📝 [4/6] Deploying SimpleTokenFactory...');
  const SimpleTokenFactory = await hre.ethers.getContractFactory('SimpleTokenFactory');
  const tokenFactory = await SimpleTokenFactory.deploy(TREASURY, TOKEN_CREATION_FEE);
  await tokenFactory.waitForDeployment();
  results.tokenFactory = await tokenFactory.getAddress();
  console.log('   ✅ SimpleTokenFactory:', results.tokenFactory);

  // ─── 5. Deploy FairlaunchFactory ───
  console.log('📝 [5/6] Deploying FairlaunchFactory...');
  const FairlaunchFactory = await hre.ethers.getContractFactory('FairlaunchFactory');
  const flFactory = await FairlaunchFactory.deploy(
    DEPLOYMENT_FEE,
    results.feeSplitter,
    TREASURY,
    ADMIN_EXECUTOR
  );
  await flFactory.waitForDeployment();
  results.fairlaunchFactory = await flFactory.getAddress();
  console.log('   ✅ FairlaunchFactory:', results.fairlaunchFactory);

  // ─── 6. Deploy PresaleFactory ───
  console.log('📝 [6/6] Deploying PresaleFactory...');
  const PresaleFactory = await hre.ethers.getContractFactory('PresaleFactory');
  const presaleFactory = await PresaleFactory.deploy(
    results.feeSplitter, // _feeSplitter
    ADMIN_EXECUTOR, // _timelockExecutor
    dexRouter, // _dexRouter
    results.lpLocker // _lpLocker
  );
  await presaleFactory.waitForDeployment();
  results.presaleFactory = await presaleFactory.getAddress();
  console.log('   ✅ PresaleFactory:', results.presaleFactory);

  // ─── Summary ───
  const finalBalance = await hre.ethers.provider.getBalance(deployer.address);
  const gasUsed = balance - finalBalance;

  console.log('\n' + '━'.repeat(50));
  console.log(`📊 DEPLOYMENT SUMMARY — ${network} (chainId: ${chainId})`);
  console.log('━'.repeat(50));
  console.log('FeeSplitter:        ', results.feeSplitter);
  console.log('LPLocker:           ', results.lpLocker);
  console.log('EscrowVault:        ', results.escrowVault);
  console.log('SimpleTokenFactory: ', results.tokenFactory);
  console.log('FairlaunchFactory:  ', results.fairlaunchFactory);
  console.log('PresaleFactory:     ', results.presaleFactory);
  console.log('━'.repeat(50));
  console.log('Treasury:           ', TREASURY);
  console.log('Admin Executor:     ', ADMIN_EXECUTOR);
  console.log('Deployment Fee:     ', hre.ethers.formatEther(DEPLOYMENT_FEE));
  console.log('Token Create Fee:   ', hre.ethers.formatEther(TOKEN_CREATION_FEE));
  console.log('Total Gas Cost:     ', hre.ethers.formatEther(gasUsed));
  console.log('Remaining Balance:  ', hre.ethers.formatEther(finalBalance));
  console.log('━'.repeat(50));

  // Save to JSON
  const fs = require('fs');
  const deploymentData = {
    network,
    chainId: chainId.toString(),
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: results,
    config: {
      treasury: TREASURY,
      adminExecutor: ADMIN_EXECUTOR,
      deploymentFee: hre.ethers.formatEther(DEPLOYMENT_FEE),
      tokenCreationFee: hre.ethers.formatEther(TOKEN_CREATION_FEE),
    },
    gasCost: hre.ethers.formatEther(gasUsed),
  };

  const filename = `deployments/all-infra-${network}-${Date.now()}.json`;
  fs.writeFileSync(filename, JSON.stringify(deploymentData, null, 2));
  console.log(`\n💾 Saved to ${filename}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  });
