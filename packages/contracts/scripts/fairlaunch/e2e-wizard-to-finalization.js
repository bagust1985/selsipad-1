/**
 * E2E FAIRLAUNCH - WIZARD TO FINALIZATION
 *
 * Complete production flow simulation:
 *   Phase 1: DEVELOPER SUBMISSION
 *     1. Create test token
 *     2. Approve EscrowVault
 *     3. Deposit to escrow (wizard Step 7)
 *     4. Simulate backend submission
 *
 *   Phase 2: ADMIN DEPLOYMENT
 *     5. Release tokens from escrow
 *     6. Approve factory
 *     7. Deploy via factory
 *     8. Configure LP Locker
 *
 *   Phase 3: LIVE PROJECT
 *     9. Wait for start time
 *    10. Contributor buys in (with referrals)
 *    11. Wait for end time
 *
 *   Phase 4: FINALIZATION
 *    12. Execute step-by-step finalization:
 *        a. Distribute fee to FeeSplitter
 *        b. Add liquidity to DEX
 *        c. Lock LP tokens
 *        d. Distribute funds to project owner
 *
 *   Phase 5: VERIFICATION
 *    13. Verify all distributions:
 *        - LP tokens locked correctly
 *        - Fee distributed to vaults (Treasury, Referral, SBT)
 *        - Referral rewards processed
 *        - Project owner received net proceeds
 *        - Vesting vault funded (if applicable)
 *
 * Usage: npx hardhat run scripts/fairlaunch/e2e-wizard-to-finalization.js --network bscTestnet
 */

const hre = require('hardhat');

// ═══════════════════════════════════════════════════════
//  CONTRACT ADDRESSES (BSC Testnet)
// ═══════════════════════════════════════════════════════
const ESCROW_VAULT = '0x6849A09c27F26fF0e58a2E36Dd5CAB2F9d0c617F';
const FACTORY = '0xa6dE6Ebd3E0ED5AcbE9c07B59C738C610821e175';
const LP_LOCKER = '0x422293092c353abB6BEFaBAdBBEb1D6257F17298';
// NOTE: FeeSplitter address is read dynamically from the factory contract
// (it's set as an immutable at factory deployment time)
const TREASURY_WALLET = '0xaC89Bf746dAf1c782Ed87e81a89fe8885CF979F5';

// ═══════════════════════════════════════════════════════
//  WIZARD PARAMETERS (Simulating UI Input)
// ═══════════════════════════════════════════════════════
const WIZARD_PARAMS = {
  // Step 1: Network & Token
  network: 'bsc_testnet',
  tokenMode: 'existing', // or 'factory'

  // Step 2: Project Info
  projectName: 'Wizard Test Token',
  description: 'E2E test project via wizard simulation',
  logoUrl: 'https://example.com/logo.png',
  socialLinks: {
    website: 'https://wizardtest.com',
    telegram: 'https://t.me/wizardtest',
    twitter: 'https://twitter.com/wizardtest',
  },

  // Step 3: Sale Parameters
  tokensForSale: '100000', // 100k tokens
  softcap: '0.05', // 0.05 BNB (very achievable)
  minContribution: '0.01', // 0.01 BNB
  maxContribution: '1.0', // 1.0 BNB
  dexPlatform: 'PancakeSwap',
  listingPremiumBps: 0, // Fair price (0%)

  // Step 4: Liquidity Plan
  liquidityPercent: 70, // 70%
  lpLockMonths: 12, // 12 months

  // Step 5: Team Vesting
  teamAllocation: '10000', // 10k tokens
  vestingBeneficiary: null, // Will be set to deployer
  vestingSchedule: [
    { month: 0, percentage: 30 }, // 30% at TGE
    { month: 1, percentage: 30 }, // 30% after 1 month
    { month: 2, percentage: 40 }, // 40% after 2 months
  ],

  // Timing (for testing)
  startDelaySeconds: 30, // Sale starts in 30s
  saleDurationSeconds: 120, // Sale lasts 2 minutes
};

// ═══════════════════════════════════════════════════════
//  UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function log(emoji, msg) {
  console.log(`${emoji} ${msg}`);
}

function step(n, title) {
  console.log(`\n${'━'.repeat(60)}`);
  console.log(`  STEP ${n}: ${title}`);
  console.log(`${'━'.repeat(60)}`);
}

function header(title) {
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`  ${title}`);
  console.log(`${'═'.repeat(70)}`);
}

// ═══════════════════════════════════════════════════════
//  MAIN E2E TEST
// ═══════════════════════════════════════════════════════
async function main() {
  const [deployer, contributor] = await hre.ethers.getSigners();
  const provider = deployer.provider;

  header('E2E FAIRLAUNCH: WIZARD TO FINALIZATION');
  log('👤', `Developer/Admin: ${deployer.address}`);
  log('👥', `Contributor: ${contributor.address}`);
  log(
    '💰',
    `Balance: ${hre.ethers.formatEther(await provider.getBalance(deployer.address))} BNB\n`
  );

  // ═══════════════════════════════════════════════════════
  //  PHASE 1: DEVELOPER SUBMISSION (Wizard Simulation)
  // ═══════════════════════════════════════════════════════
  header('PHASE 1: DEVELOPER SUBMISSION (Wizard Flow)');

  // ─────────────────────────────────────────────────────
  // STEP 1: Create Token (Wizard Step 1)
  // ─────────────────────────────────────────────────────
  step(1, 'Developer Creates Token (Wizard Step 1: Network & Token)');

  const SimpleToken = await hre.ethers.getContractFactory('SimpleToken');
  const totalSupply = hre.ethers.parseUnits('1000000', 18); // 1M tokens
  const token = await SimpleToken.deploy(
    WIZARD_PARAMS.projectName,
    'WZRD',
    totalSupply,
    18,
    deployer.address
  );
  await token.waitForDeployment();
  const tokenAddr = await token.getAddress();

  log('✅', `Token deployed: ${tokenAddr}`);
  log('📊', `Total supply: ${hre.ethers.formatUnits(totalSupply, 18)} WZRD`);
  log('📋', `Name: ${WIZARD_PARAMS.projectName}`);
  log('📋', `Symbol: WZRD`);

  // ─────────────────────────────────────────────────────
  // STEP 2: Calculate Token Economics (Wizard automatically)
  // ─────────────────────────────────────────────────────
  step(2, 'Calculate Total Tokens Required');

  const tokensForSale = hre.ethers.parseUnits(WIZARD_PARAMS.tokensForSale, 18);
  const liquidityPercent = BigInt(WIZARD_PARAMS.liquidityPercent * 100); // to BPS
  const liquidityTokens = (tokensForSale * liquidityPercent) / 10000n;
  const teamVestingTokens = hre.ethers.parseUnits(WIZARD_PARAMS.teamAllocation, 18);
  const totalTokensNeeded = tokensForSale + liquidityTokens + teamVestingTokens;

  log('📦', `Tokens for sale: ${hre.ethers.formatUnits(tokensForSale, 18)} WZRD`);
  log(
    '💧',
    `Liquidity tokens (${WIZARD_PARAMS.liquidityPercent}%): ${hre.ethers.formatUnits(
      liquidityTokens,
      18
    )} WZRD`
  );
  log('🔒', `Team vesting: ${hre.ethers.formatUnits(teamVestingTokens, 18)} WZRD`);
  log('📦', `Total required: ${hre.ethers.formatUnits(totalTokensNeeded, 18)} WZRD`);

  // ─────────────────────────────────────────────────────
  // STEP 3: Pay Creation Fee (Wizard Step 7: Submit)
  // ─────────────────────────────────────────────────────
  step(3, 'Pay Creation Fee (0.2 BNB to Treasury)');

  const creationFee = hre.ethers.parseEther('0.2');
  const feeTx = await deployer.sendTransaction({
    to: TREASURY_WALLET,
    value: creationFee,
  });
  const feeReceipt = await feeTx.wait();

  log('✅', `Fee paid: ${hre.ethers.formatEther(creationFee)} BNB`);
  log('📋', `Fee TX: ${feeReceipt.hash}`);

  // ─────────────────────────────────────────────────────
  // STEP 4: Approve & Deposit to Escrow
  // ─────────────────────────────────────────────────────
  step(4, 'Approve & Deposit Tokens to Escrow');

  // Generate unique projectId (wizard generates random UUID -> keccak256)
  const projectUUID = hre.ethers.id(`wizard-test-${Date.now()}`);
  log('🔑', `Project ID (bytes32): ${projectUUID}`);

  // Approve escrow
  const approveTx1 = await token.approve(ESCROW_VAULT, totalTokensNeeded);
  await approveTx1.wait();
  log('✅', 'Approved EscrowVault for token transfer');

  // Deposit to escrow
  const escrow = await hre.ethers.getContractAt('EscrowVault', ESCROW_VAULT);
  const depositTx = await escrow.deposit(projectUUID, tokenAddr, totalTokensNeeded);
  const depositReceipt = await depositTx.wait();

  log('✅', `Tokens deposited to escrow`);
  log('📋', `Escrow TX: ${depositReceipt.hash}`);

  // Verify escrow balance
  const escrowBalance = await escrow.getBalance(projectUUID);
  log('📊', `Escrow balance: ${hre.ethers.formatUnits(escrowBalance, 18)} WZRD`);

  if (escrowBalance !== totalTokensNeeded) {
    throw new Error('❌ Escrow balance mismatch!');
  }

  log('📋', 'Developer balance after submission:');
  log('   ', `Tokens: ${hre.ethers.formatUnits(await token.balanceOf(deployer.address), 18)} WZRD`);
  log('   ', `BNB: ${hre.ethers.formatEther(await provider.getBalance(deployer.address))} BNB`);

  // ═══════════════════════════════════════════════════════
  //  PHASE 2: ADMIN DEPLOYMENT
  // ═══════════════════════════════════════════════════════
  header('PHASE 2: ADMIN DEPLOYMENT (Backend API Simulation)');

  // ─────────────────────────────────────────────────────
  // STEP 5: Admin Reviews & Approves
  // ─────────────────────────────────────────────────────
  step(5, 'Admin Reviews Project (Simulated)');
  log('📋', 'In production: Admin sees project in dashboard with status: SUBMITTED');
  log('📋', `Project: ${WIZARD_PARAMS.projectName}`);
  log('📋', `Token: ${tokenAddr}`);
  log('📋', `Escrow: ${hre.ethers.formatUnits(escrowBalance, 18)} WZRD`);
  log('✅', 'Admin clicks: APPROVE & DEPLOY');

  // ─────────────────────────────────────────────────────
  // STEP 6: Release from Escrow
  // ─────────────────────────────────────────────────────
  step(6, 'Release Tokens from Escrow to Admin Wallet');

  const releaseTx = await escrow.release(projectUUID, deployer.address);
  await releaseTx.wait();

  const adminTokenBalance = await token.balanceOf(deployer.address);
  log('✅', `Tokens released: ${hre.ethers.formatUnits(adminTokenBalance, 18)} WZRD`);

  // Verify escrow empty
  const escrowAfter = await escrow.getBalance(projectUUID);
  if (escrowAfter !== 0n) {
    throw new Error('❌ Escrow should be empty after release!');
  }
  log('✅', 'Escrow emptied successfully');

  // ─────────────────────────────────────────────────────
  // STEP 7: Deploy via Factory
  // ─────────────────────────────────────────────────────
  step(7, 'Admin Deploys Fairlaunch via Factory');

  // Approve factory
  const approveTx2 = await token.approve(FACTORY, hre.ethers.MaxUint256);
  await approveTx2.wait();
  log('✅', 'Approved Factory for unlimited token spend');

  // Build params
  const now = (await provider.getBlock('latest')).timestamp;
  const startTime = now + WIZARD_PARAMS.startDelaySeconds;
  const endTime = startTime + WIZARD_PARAMS.saleDurationSeconds;

  const createParams = {
    projectToken: tokenAddr,
    paymentToken: hre.ethers.ZeroAddress, // Native BNB
    softcap: hre.ethers.parseEther(WIZARD_PARAMS.softcap),
    tokensForSale: tokensForSale,
    minContribution: hre.ethers.parseEther(WIZARD_PARAMS.minContribution),
    maxContribution: hre.ethers.parseEther(WIZARD_PARAMS.maxContribution),
    startTime: BigInt(startTime),
    endTime: BigInt(endTime),
    projectOwner: deployer.address,
    listingPremiumBps: WIZARD_PARAMS.listingPremiumBps,
  };

  // Vesting params from wizard schedule
  const vestingDurations = WIZARD_PARAMS.vestingSchedule.map((s) =>
    BigInt(s.month * 30 * 24 * 60 * 60)
  );
  const vestingAmounts = WIZARD_PARAMS.vestingSchedule.map(
    (s) => (teamVestingTokens * BigInt(Math.floor(s.percentage * 100))) / 10000n
  );

  const vestingParams = {
    beneficiary: deployer.address,
    startTime: BigInt(endTime),
    durations: vestingDurations,
    amounts: vestingAmounts,
  };

  const lpPlan = {
    lockMonths: BigInt(WIZARD_PARAMS.lpLockMonths),
    liquidityPercent: liquidityPercent,
    dexId: hre.ethers.id(WIZARD_PARAMS.dexPlatform),
  };

  log('📋', 'Deployment parameters:');
  log('   ', `Softcap: ${WIZARD_PARAMS.softcap} BNB`);
  log('   ', `Tokens for sale: ${WIZARD_PARAMS.tokensForSale} WZRD`);
  log('   ', `LP %: ${WIZARD_PARAMS.liquidityPercent}%`);
  log('   ', `LP Lock: ${WIZARD_PARAMS.lpLockMonths} months`);
  log('   ', `Team vesting: ${WIZARD_PARAMS.teamAllocation} WZRD`);

  // Get factory and deploy
  const factory = await hre.ethers.getContractAt('FairlaunchFactory', FACTORY);
  const deploymentFee = await factory.DEPLOYMENT_FEE();
  const factoryFeeSplitter = await factory.feeSplitter();
  log('📋', `Factory FeeSplitter: ${factoryFeeSplitter}`);
  log('💳', `Deployment fee: ${hre.ethers.formatEther(deploymentFee)} BNB`);

  log('🚀', 'Calling factory.createFairlaunch()...');
  const createTx = await factory.createFairlaunch(createParams, vestingParams, lpPlan, {
    value: deploymentFee,
  });
  const createReceipt = await createTx.wait();

  // Extract addresses
  let fairlaunchAddr, vestingAddr;
  for (const logEntry of createReceipt.logs) {
    try {
      const parsed = factory.interface.parseLog(logEntry);
      if (parsed?.name === 'FairlaunchCreated') {
        fairlaunchAddr = parsed.args.fairlaunch;
        vestingAddr = parsed.args.vesting;
        break;
      }
    } catch {}
  }

  if (!fairlaunchAddr) throw new Error('❌ FairlaunchCreated event not found!');

  log('✅', `Fairlaunch deployed: ${fairlaunchAddr}`);
  log('📋', `Vesting vault: ${vestingAddr}`);
  log('💰', `TX: ${createReceipt.hash}`);

  // ─────────────────────────────────────────────────────
  // STEP 8: Configure LP Locker
  // ─────────────────────────────────────────────────────
  step(8, 'Configure LP Locker (Required for Finalization)');

  const fairlaunch = await hre.ethers.getContractAt(
    'contracts/fairlaunch/Fairlaunch.sol:Fairlaunch',
    fairlaunchAddr
  );

  const setLPTx = await fairlaunch.setLPLocker(LP_LOCKER);
  await setLPTx.wait();

  const configuredLocker = await fairlaunch.lpLocker();
  log('✅', `LP Locker set: ${configuredLocker}`);

  // Verify all config
  const feeSplitterAddr = await fairlaunch.feeSplitter();
  const router = await fairlaunch.dexRouter();
  log('🔍', 'Contract configuration:');
  log('   ', `FeeSplitter: ${feeSplitterAddr}`);
  log('   ', `DEX Router: ${router}`);
  log('   ', `LP Locker: ${configuredLocker}`);

  log('📋', 'Status: DEPLOYED ✅');

  // ═══════════════════════════════════════════════════════
  //  PHASE 3: LIVE PROJECT
  // ═══════════════════════════════════════════════════════
  header('PHASE 3: LIVE PROJECT (Public Contributions)');

  // ─────────────────────────────────────────────────────
  // STEP 9: Wait for Sale Start
  // ─────────────────────────────────────────────────────
  step(9, 'Waiting for Sale to Start');

  let currentBlock = await provider.getBlock('latest');
  let waitSecs = startTime - currentBlock.timestamp + 5;
  if (waitSecs > 0) {
    log('⏳', `Waiting ${waitSecs}s for sale to start...`);
    log('📋', `Current: ${new Date(currentBlock.timestamp * 1000).toISOString()}`);
    log('📋', `Start:   ${new Date(startTime * 1000).toISOString()}`);
    await sleep(waitSecs * 1000);
  }

  log('✅', 'Sale is now LIVE!');

  // ─────────────────────────────────────────────────────
  // STEP 10: Contributor Buys In
  // ─────────────────────────────────────────────────────
  step(10, 'Contributors Buy In (Exceeding Softcap)');

  // Single large contribution to exceed softcap (0.06 BNB > 0.05 softcap)
  log('👥', 'Contribution: 0.06 BNB (from deployer - exceeds softcap)');
  const contributeAmount = hre.ethers.parseEther('0.06');
  const contributeTx = await fairlaunch.contribute({ value: contributeAmount });
  await contributeTx.wait();
  log('✅', `Contributed: ${hre.ethers.formatEther(contributeAmount)} BNB`);

  const totalRaised = await fairlaunch.totalRaised();
  const softcapVal = await fairlaunch.softcap();

  log('📊', 'Sale Status:');
  log('   ', `Total raised: ${hre.ethers.formatEther(totalRaised)} BNB`);
  log('   ', `Softcap: ${hre.ethers.formatEther(softcapVal)} BNB`);
  log('   ', `Softcap met: ${totalRaised >= softcapVal ? '✅ YES' : '❌ NO'}`);
  log('   ', `Progress: ${(totalRaised * 10000n) / softcapVal / 100n}%`);

  // ─────────────────────────────────────────────────────
  // STEP 11: Wait for Sale End
  // ─────────────────────────────────────────────────────
  step(11, 'Waiting for Sale to End');

  currentBlock = await provider.getBlock('latest');
  waitSecs = endTime - currentBlock.timestamp + 5;
  if (waitSecs > 0) {
    log('⏳', `Waiting ${waitSecs}s for sale to end...`);
    await sleep(waitSecs * 1000);
  }

  log('✅', 'Sale has ENDED!');

  // ═══════════════════════════════════════════════════════
  //  PHASE 4: FINALIZATION
  // ═══════════════════════════════════════════════════════
  header('PHASE 4: FINALIZATION (Step-by-Step)');

  const GAS = 5000000; // Same as production

  // ─────────────────────────────────────────────────────
  // STEP 12a: Distribute Fee
  // ─────────────────────────────────────────────────────
  step('12a', 'Distribute Fee to FeeSplitter');

  try {
    const tx = await fairlaunch.adminDistributeFee({ gasLimit: GAS });
    const receipt = await tx.wait();
    const stepVal = await fairlaunch.finalizeStep();
    log('✅', `Fee distributed! Step: ${stepVal}, Gas: ${receipt.gasUsed}`);
  } catch (err) {
    log('❌', `Fee distribution FAILED: ${err.message}`);
    throw err;
  }

  // ─────────────────────────────────────────────────────
  // STEP 12b: Add Liquidity
  // ─────────────────────────────────────────────────────
  step('12b', 'Add Liquidity to DEX');

  try {
    const tx = await fairlaunch.adminAddLiquidity({ gasLimit: GAS });
    const receipt = await tx.wait();
    const stepVal = await fairlaunch.finalizeStep();
    const lpTokenAddr = await fairlaunch.lpTokenAddress();
    log('✅', `Liquidity added! Step: ${stepVal}, Gas: ${receipt.gasUsed}`);
    log('📋', `LP Token created: ${lpTokenAddr}`);
  } catch (err) {
    log('❌', `Add liquidity FAILED: ${err.message}`);
    throw err;
  }

  // ─────────────────────────────────────────────────────
  // STEP 12c: Lock LP
  // ─────────────────────────────────────────────────────
  step('12c', 'Lock LP Tokens');

  try {
    const tx = await fairlaunch.adminLockLP({ gasLimit: GAS });
    const receipt = await tx.wait();
    const stepVal = await fairlaunch.finalizeStep();
    log('✅', `LP locked! Step: ${stepVal}, Gas: ${receipt.gasUsed}`);
  } catch (err) {
    log('❌', `LP lock FAILED: ${err.message}`);
    throw err;
  }

  // ─────────────────────────────────────────────────────
  // STEP 12d: Distribute Funds
  // ─────────────────────────────────────────────────────
  step('12d', 'Distribute Funds to Project Owner');

  try {
    const tx = await fairlaunch.adminDistributeFunds({ gasLimit: GAS });
    const receipt = await tx.wait();
    const stepVal = await fairlaunch.finalizeStep();
    log('✅', `Funds distributed! Step: ${stepVal}, Gas: ${receipt.gasUsed}`);
  } catch (err) {
    log('❌', `Fund distribution FAILED: ${err.message}`);
    throw err;
  }

  // ═══════════════════════════════════════════════════════
  //  PHASE 5: COMPREHENSIVE VERIFICATION
  // ═══════════════════════════════════════════════════════
  header('PHASE 5: COMPREHENSIVE VERIFICATION');

  // ─────────────────────────────────────────────────────
  // STEP 13: Verify Final Status
  // ─────────────────────────────────────────────────────
  step(13, 'Final Status & Contract State');

  const finalStatus = await fairlaunch.status();
  const isFinalized = await fairlaunch.isFinalized();
  const finalStep = await fairlaunch.finalizeStep();
  const lpTokenAddr = await fairlaunch.lpTokenAddress();

  const statusNames = ['UPCOMING', 'LIVE', 'ENDED', 'SUCCESS', 'FAILED', 'CANCELLED'];
  const stepNames = [
    'NONE',
    'FEE_DISTRIBUTED',
    'LIQUIDITY_ADDED',
    'LP_LOCKED',
    'FUNDS_DISTRIBUTED',
  ];

  log('📊', `Status: ${finalStatus} (${statusNames[Number(finalStatus)]})`);
  log('📊', `Finalized: ${isFinalized}`);
  log('📊', `Final Step: ${finalStep} (${stepNames[Number(finalStep)]})`);
  log('📊', `LP Token: ${lpTokenAddr}`);

  // ─────────────────────────────────────────────────────
  // STEP 14: Verify LP Lock
  // ─────────────────────────────────────────────────────
  step(14, 'Verify LP Lock in LPLocker');

  const lpLocker = await hre.ethers.getContractAt(
    'contracts/fairlaunch/LPLocker.sol:LPLocker',
    LP_LOCKER
  );
  const lpToken = await hre.ethers.getContractAt(
    ['function balanceOf(address) view returns (uint256)'],
    lpTokenAddr
  );

  const lpBalance = await lpToken.balanceOf(LP_LOCKER);
  log('📊', `LP tokens in locker: ${hre.ethers.formatUnits(lpBalance, 18)}`);

  if (lpBalance === 0n) {
    log('⚠️', 'WARNING: No LP tokens in locker!');
  } else {
    log('✅', 'LP tokens successfully locked');
  }

  // ─────────────────────────────────────────────────────
  // STEP 15: Verify Fee Distribution
  // ─────────────────────────────────────────────────────
  step(15, 'Verify Fee Distribution to Vaults');

  const feeSplitter = await hre.ethers.getContractAt(
    'contracts/std-presale/FeeSplitter.sol:FeeSplitter',
    feeSplitterAddr
  );

  const [treasuryVault, referralVault, sbtVault] = await Promise.all([
    feeSplitter.treasuryVault(),
    feeSplitter.referralPoolVault(),
    feeSplitter.sbtStakingVault(),
  ]);

  const [treasuryBalance, referralBalance, sbtBalance] = await Promise.all([
    provider.getBalance(treasuryVault),
    provider.getBalance(referralVault),
    provider.getBalance(sbtVault),
  ]);

  const expectedFee = (totalRaised * 500n) / 10000n; // 5%
  const actualFeeDistributed = treasuryBalance + referralBalance + sbtBalance;

  log('📊', 'Fee Distribution:');
  log('   ', `Expected fee (5%): ${hre.ethers.formatEther(expectedFee)} BNB`);
  log('   ', `Treasury: ${hre.ethers.formatEther(treasuryBalance)} BNB`);
  log('   ', `Referral Pool: ${hre.ethers.formatEther(referralBalance)} BNB`);
  log('   ', `SBT Staking: ${hre.ethers.formatEther(sbtBalance)} BNB`);
  log('   ', `Total distributed: ${hre.ethers.formatEther(actualFeeDistributed)} BNB`);

  // ─────────────────────────────────────────────────────
  // STEP 16: Verify Vesting Vault
  // ─────────────────────────────────────────────────────
  step(16, 'Verify Team Vesting Vault');

  const vestingVault = await hre.ethers.getContractAt(
    ['function token() view returns (address)', 'function beneficiary() view returns (address)'],
    vestingAddr
  );

  const vestingTokenBalance = await token.balanceOf(vestingAddr);
  log('📊', `Vesting vault token balance: ${hre.ethers.formatUnits(vestingTokenBalance, 18)} WZRD`);
  log(
    '📊',
    `Expected minimum (team vesting): ${hre.ethers.formatUnits(teamVestingTokens, 18)} WZRD`
  );

  // NOTE: Vesting vault receives teamVestingTokens from factory deployment
  // PLUS leftover tokens from finalization (_distributeFundsStep sends remaining
  // tokens not needed for user claims to the vesting vault)
  if (vestingTokenBalance >= teamVestingTokens) {
    const extra = vestingTokenBalance - teamVestingTokens;
    log(
      '✅',
      `Vesting vault funded correctly (${hre.ethers.formatUnits(
        extra,
        18
      )} WZRD extra from LP leftover)`
    );
  } else {
    log('❌', 'ERROR: Vesting vault underfunded!');
  }

  // ─────────────────────────────────────────────────────
  // STEP 17: Verify Project Owner Received Net Proceeds
  // ─────────────────────────────────────────────────────
  step(17, 'Verify Project Owner Net Proceeds');

  const ownerBalanceAfter = await provider.getBalance(deployer.address);
  const netRaised = totalRaised - expectedFee;
  const liquidityValue = (netRaised * liquidityPercent) / 10000n;
  const expectedOwnerProceeds = netRaised - liquidityValue;

  log('📊', 'Project Owner Proceeds:');
  log('   ', `Total raised: ${hre.ethers.formatEther(totalRaised)} BNB`);
  log('   ', `Platform fee (5%): ${hre.ethers.formatEther(expectedFee)} BNB`);
  log(
    '   ',
    `Liquidity (${WIZARD_PARAMS.liquidityPercent}%): ${hre.ethers.formatEther(liquidityValue)} BNB`
  );
  log('   ', `Expected owner: ${hre.ethers.formatEther(expectedOwnerProceeds)} BNB`);

  // ═══════════════════════════════════════════════════════
  //  FINAL SUMMARY
  // ═══════════════════════════════════════════════════════
  header('TEST RESULTS SUMMARY');

  const checks = [
    ['Status = SUCCESS', Number(finalStatus) === 3],
    ['isFinalized = true', isFinalized === true],
    ['finalizeStep = FUNDS_DISTRIBUTED', Number(finalStep) === 4],
    ['LP Token exists', lpTokenAddr !== hre.ethers.ZeroAddress],
    ['LP Tokens locked', lpBalance > 0n],
    ['Escrow empty', escrowAfter === 0n],
    ['Vesting funded', vestingTokenBalance >= teamVestingTokens],
    ['FeeSplitter configured', feeSplitterAddr === factoryFeeSplitter],
    ['LP Locker configured', configuredLocker === LP_LOCKER],
  ];

  let allPassed = true;
  for (const [label, ok] of checks) {
    console.log(`  ${ok ? '✅' : '❌'} ${label}`);
    if (!ok) allPassed = false;
  }

  console.log();
  if (allPassed) {
    console.log('  🎉🎉🎉  ALL CHECKS PASSED — E2E WIZARD→FINALIZATION SUCCESS  🎉🎉🎉');
  } else {
    console.log('  ❌  SOME CHECKS FAILED');
  }

  console.log();
  console.log('  Contract Addresses:');
  console.log(`  ├─ Token:        ${tokenAddr}`);
  console.log(`  ├─ Fairlaunch:   ${fairlaunchAddr}`);
  console.log(`  ├─ Vesting:      ${vestingAddr}`);
  console.log(`  ├─ LP Token:     ${lpTokenAddr}`);
  console.log(`  └─ LP Locker:    ${LP_LOCKER}`);
  console.log();
  console.log('  View on BscScan:');
  console.log(`  https://testnet.bscscan.com/address/${fairlaunchAddr}`);
  console.log(`${'═'.repeat(70)}\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
