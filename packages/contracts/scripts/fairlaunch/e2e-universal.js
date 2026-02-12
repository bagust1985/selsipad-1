/**
 * Universal E2E Fairlaunch Finalization Test
 *
 * Works on any network: BSC Testnet, Sepolia, Base Sepolia
 * Usage:
 *   npx hardhat run scripts/fairlaunch/e2e-universal.js --network sepolia
 *   npx hardhat run scripts/fairlaunch/e2e-universal.js --network base_sepolia
 *   npx hardhat run scripts/fairlaunch/e2e-universal.js --network bscTestnet
 */
const hre = require('hardhat');

// ─── Network-specific contract addresses ───
const NETWORK_CONFIG = {
  // BSC Testnet (chainId 97)
  97: {
    name: 'BSC Testnet',
    token: 'BNB',
    factory: '0xa6dE6Ebd3E0ED5AcbE9c07B59C738C610821e175',
    feeSplitter: '0x3301b82B4559F1607DA83FA460DC9820CbE1344e',
    lpLocker: '0x905A81F09c8ED76e71e82933f9b4978E41ac1b9F',
    dexRouter: '0xD99D1c33F9fC3444f8101754aBC46c52416550D1',
    softcap: '0.01',
    contribution: '0.05',
  },
  // Sepolia (chainId 11155111)
  11155111: {
    name: 'Sepolia',
    token: 'ETH',
    factory: '0x53850a56397379Da8572A6a47003bca88bB52A24',
    feeSplitter: '0x5f3cf3D4fD540EFb2eEDA43921292fD08608518D',
    lpLocker: '0x151f010682D2991183E6235CA396c1c99cEF5A30',
    dexRouter: '0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3',
    softcap: '0.005',
    contribution: '0.02',
  },
  // Base Sepolia (chainId 84532)
  84532: {
    name: 'Base Sepolia',
    token: 'ETH',
    factory: '0xeEf8C1da1b94111237c419AB7C6cC30761f31572',
    feeSplitter: '0x069b5487A3CAbD868B498c34DA2d7cCfc2D3Dc4C',
    lpLocker: '0xaAbC564820edFc8A3Ce4Dd0547e6f4455731DB7a',
    dexRouter: '0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24',
    softcap: '0.001',
    contribution: '0.005',
  },
};

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const provider = deployer.provider;
  const chainId = Number((await provider.getNetwork()).chainId);

  const config = NETWORK_CONFIG[chainId];
  if (!config) {
    throw new Error(
      `No config for chainId ${chainId}. Supported: ${Object.keys(NETWORK_CONFIG).join(', ')}`
    );
  }

  console.log('═══════════════════════════════════════════════════');
  console.log(`  E2E FAIRLAUNCH TEST — ${config.name}`);
  console.log('═══════════════════════════════════════════════════');
  console.log('ChainId:', chainId);
  console.log('Deployer:', deployer.address);
  console.log(
    'Balance:',
    hre.ethers.formatEther(await provider.getBalance(deployer.address)),
    config.token
  );
  console.log('Factory:', config.factory);
  console.log('FeeSplitter:', config.feeSplitter);
  console.log('LPLocker:', config.lpLocker);
  console.log('DEX Router:', config.dexRouter, '\n');

  // ──────────────────────────────────────────────
  // Step 1: Deploy test ERC20 token
  // ──────────────────────────────────────────────
  console.log('━━━ STEP 1: Deploying test token ━━━');
  const TestToken = await hre.ethers.getContractFactory('SimpleToken');
  const totalSupply = hre.ethers.parseUnits('1000000', 18);
  const token = await TestToken.deploy(
    `E2E-${config.name}`,
    'E2ETEST',
    totalSupply,
    18,
    deployer.address
  );
  await token.waitForDeployment();
  const tokenAddr = await token.getAddress();
  console.log('✅ Token deployed:', tokenAddr);

  // ──────────────────────────────────────────────
  // Step 2: Create Fairlaunch via Factory
  // ──────────────────────────────────────────────
  console.log('\n━━━ STEP 2: Creating Fairlaunch ━━━');
  const factory = await hre.ethers.getContractAt('FairlaunchFactory', config.factory);

  const now = (await provider.getBlock('latest')).timestamp;
  const startTime = now + 30;
  const endTime = now + 120;

  const softcap = hre.ethers.parseEther(config.softcap);
  const tokensForSale = hre.ethers.parseUnits('100000', 18);
  const liquidityPercent = 7000;
  const liquidityTokens = (tokensForSale * BigInt(liquidityPercent)) / 10000n;
  const totalTokensNeeded = tokensForSale + liquidityTokens;

  console.log('Tokens for sale:', hre.ethers.formatUnits(tokensForSale, 18));
  console.log('Liquidity tokens:', hre.ethers.formatUnits(liquidityTokens, 18));

  // Approve factory
  const approveTx = await token.approve(config.factory, hre.ethers.MaxUint256);
  await approveTx.wait();
  console.log('✅ Factory approved');

  const createParams = {
    projectToken: tokenAddr,
    paymentToken: hre.ethers.ZeroAddress,
    softcap,
    tokensForSale,
    minContribution: hre.ethers.parseEther('0.001'),
    maxContribution: hre.ethers.parseEther('1.0'),
    startTime: BigInt(startTime),
    endTime: BigInt(endTime),
    projectOwner: deployer.address,
    listingPremiumBps: 0,
  };

  const vestingParams = {
    beneficiary: deployer.address,
    startTime: BigInt(endTime),
    durations: [],
    amounts: [],
  };

  const lpPlan = {
    lockMonths: 12n,
    liquidityPercent: BigInt(liquidityPercent),
    dexId: hre.ethers.id('UniswapV2'),
  };

  const deploymentFee = await factory.DEPLOYMENT_FEE();
  console.log('Deployment fee:', hre.ethers.formatEther(deploymentFee), config.token);

  console.log('Creating Fairlaunch...');
  const createTx = await factory.createFairlaunch(createParams, vestingParams, lpPlan, {
    value: deploymentFee,
    gasLimit: 8000000,
  });
  const createReceipt = await createTx.wait();

  // Extract fairlaunch address from event
  let fairlaunchAddr, vestingAddr;
  for (const log of createReceipt.logs) {
    try {
      const parsed = factory.interface.parseLog(log);
      if (parsed?.name === 'FairlaunchCreated') {
        fairlaunchAddr = parsed.args.fairlaunch;
        vestingAddr = parsed.args.vesting;
        break;
      }
    } catch {}
  }
  if (!fairlaunchAddr) throw new Error('FairlaunchCreated event not found!');
  console.log('✅ Fairlaunch:', fairlaunchAddr);
  console.log('   Vesting:', vestingAddr);

  const fairlaunch = await hre.ethers.getContractAt(
    'contracts/fairlaunch/Fairlaunch.sol:Fairlaunch',
    fairlaunchAddr
  );

  // Verify config
  const feeS = await fairlaunch.feeSplitter();
  const router = await fairlaunch.dexRouter();
  console.log(
    '   FeeSplitter:',
    feeS,
    feeS.toLowerCase() === config.feeSplitter.toLowerCase() ? '✅' : '❌'
  );
  console.log(
    '   DEX Router:',
    router,
    router.toLowerCase() === config.dexRouter.toLowerCase() ? '✅' : '❌'
  );

  // ──────────────────────────────────────────────
  // Step 2.5: Set LP Locker
  // ──────────────────────────────────────────────
  console.log('\n━━━ STEP 2.5: Set LP Locker ━━━');
  const setLPTx = await fairlaunch.setLPLocker(config.lpLocker);
  await setLPTx.wait();
  console.log('✅ LP Locker set:', await fairlaunch.lpLocker());

  // ──────────────────────────────────────────────
  // Step 3: Wait and Contribute
  // ──────────────────────────────────────────────
  console.log('\n━━━ STEP 3: Waiting for sale to start... ━━━');
  let currentBlock = await provider.getBlock('latest');
  let waitSecs = startTime - currentBlock.timestamp + 5;
  if (waitSecs > 0) {
    console.log(`Waiting ${waitSecs}s...`);
    await sleep(waitSecs * 1000);
  }

  const contributeAmount = hre.ethers.parseEther(config.contribution);
  console.log('Contributing', hre.ethers.formatEther(contributeAmount), config.token + '...');
  const contributeTx = await fairlaunch.contribute({ value: contributeAmount });
  await contributeTx.wait();

  const totalRaised = await fairlaunch.totalRaised();
  console.log('✅ Total raised:', hre.ethers.formatEther(totalRaised), config.token);
  console.log('   Softcap met?', totalRaised >= softcap ? '✅ YES' : '❌ NO');

  // ──────────────────────────────────────────────
  // Step 4: Wait for sale to end
  // ──────────────────────────────────────────────
  console.log('\n━━━ STEP 4: Waiting for sale to end... ━━━');
  currentBlock = await provider.getBlock('latest');
  waitSecs = endTime - currentBlock.timestamp + 5;
  if (waitSecs > 0) {
    console.log(`Waiting ${waitSecs}s...`);
    await sleep(waitSecs * 1000);
  }

  // ──────────────────────────────────────────────
  // Step 5: Finalization (4 steps)
  // ──────────────────────────────────────────────
  console.log('\n━━━ STEP 5: FINALIZATION ━━━\n');

  // 5a: Fee Distribution
  console.log('─── 5a: adminDistributeFee ───');
  try {
    const tx = await fairlaunch.adminDistributeFee({ gasLimit: 500000 });
    const r = await tx.wait();
    console.log('✅ Fee distributed! Gas:', r.gasUsed.toString());
  } catch (err) {
    console.error('❌ FAILED:', err.message);
    process.exit(1);
  }

  // 5b: Add Liquidity (needs high gas for pair creation)
  console.log('\n─── 5b: adminAddLiquidity ───');
  try {
    const tx = await fairlaunch.adminAddLiquidity({ gasLimit: 5000000 });
    const r = await tx.wait();
    const lpAddr = await fairlaunch.lpTokenAddress();
    console.log('✅ Liquidity added! Gas:', r.gasUsed.toString());
    console.log('   LP Token:', lpAddr);
  } catch (err) {
    console.error('❌ FAILED:', err.message);
    if (err.data) {
      try {
        const decoded = fairlaunch.interface.parseError(err.data);
        console.error('   Decoded:', decoded?.name, decoded?.args);
      } catch {}
    }
    process.exit(1);
  }

  // 5c: Lock LP
  console.log('\n─── 5c: adminLockLP ───');
  try {
    const tx = await fairlaunch.adminLockLP({ gasLimit: 500000 });
    const r = await tx.wait();
    console.log('✅ LP Locked! Gas:', r.gasUsed.toString());
  } catch (err) {
    console.error('❌ FAILED:', err.message);
    process.exit(1);
  }

  // 5d: Distribute Funds
  console.log('\n─── 5d: adminDistributeFunds ───');
  try {
    const tx = await fairlaunch.adminDistributeFunds({ gasLimit: 500000 });
    const r = await tx.wait();
    console.log('✅ Funds distributed! Gas:', r.gasUsed.toString());
  } catch (err) {
    console.error('❌ FAILED:', err.message);
    process.exit(1);
  }

  // ──────────────────────────────────────────────
  // Step 6: Final Verification
  // ──────────────────────────────────────────────
  console.log('\n━━━ STEP 6: FINAL VERIFICATION ━━━');
  const status = await fairlaunch.status();
  const finalized = await fairlaunch.isFinalized();
  const lpAddr = await fairlaunch.lpTokenAddress();

  console.log(
    'Status:',
    status,
    `(${['UPCOMING', 'LIVE', 'ENDED', 'SUCCESS', 'FAILED', 'CANCELLED'][Number(status)]})`
  );
  console.log('Finalized:', finalized);
  console.log('LP Token:', lpAddr);
  console.log(
    'Balance:',
    hre.ethers.formatEther(await provider.getBalance(deployer.address)),
    config.token
  );

  console.log('\n═══════════════════════════════════════════════════');
  if (finalized && Number(status) === 3) {
    console.log(`  🎉 E2E ${config.name} — PASSED! 🎉`);
  } else {
    console.log(`  ❌ E2E ${config.name} — FAILED`);
  }
  console.log('═══════════════════════════════════════════════════');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
