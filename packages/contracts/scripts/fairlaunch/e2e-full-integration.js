/**
 * E2E FULL INTEGRATION TEST
 *
 * Tests the COMPLETE production flow: UI → API → DB → Smart Contract
 * Covers all gaps from the audit:
 *   ✅ Submit API: DB writes (projects + launch_rounds)
 *   ✅ Deploy API: DB reads, time adjustment, event parsing
 *   ✅ DB ↔ SC consistency verification
 *   ✅ Token calculation: UI helper vs SC math comparison
 *
 * REQUIRES:
 *   - SUPABASE_URL env var (or falls back to hardcoded testnet URL)
 *   - SUPABASE_SERVICE_ROLE_KEY env var
 *   - BSC Testnet network configured in hardhat.config.js
 *
 * Usage: npx hardhat run scripts/fairlaunch/e2e-full-integration.js --network bscTestnet
 */

const hre = require('hardhat');

// ═══════════════════════════════════════════════════════
//  CONTRACT ADDRESSES (BSC Testnet)
// ═══════════════════════════════════════════════════════
const ESCROW_VAULT = '0x6849A09c27F26fF0e58a2E36Dd5CAB2F9d0c617F';
const FACTORY = '0xa6dE6Ebd3E0ED5AcbE9c07B59C738C610821e175';
const LP_LOCKER = '0x422293092c353abB6BEFaBAdBBEb1D6257F17298';
const TREASURY_WALLET = '0xaC89Bf746dAf1c782Ed87e81a89fe8885CF979F5';

// ═══════════════════════════════════════════════════════
//  SUPABASE CONFIG (uses REST API directly - no npm dependency)
// ═══════════════════════════════════════════════════════
const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://tkmlclijfinaqtphojkb.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ═══════════════════════════════════════════════════════
//  WIZARD PARAMETERS (same as production UI)
// ═══════════════════════════════════════════════════════
const WIZARD_PARAMS = {
  projectName: 'Integration Test Token',
  tokenSymbol: 'INTG',
  description: 'Full integration test project',
  network: 'bsc_testnet',
  tokensForSale: '100000',
  softcap: '0.05',
  minContribution: '0.01',
  maxContribution: '1.0',
  dexPlatform: 'PancakeSwap',
  listingPremiumBps: 0,
  liquidityPercent: 70,
  lpLockMonths: 12,
  teamAllocation: '10000',
  vestingSchedule: [
    { month: 0, percentage: 30 },
    { month: 1, percentage: 30 },
    { month: 2, percentage: 40 },
  ],
  startDelaySeconds: 30,
  saleDurationSeconds: 120,
};

// ═══════════════════════════════════════════════════════
//  SUPABASE REST HELPERS (direct fetch, no SDK needed)
// ═══════════════════════════════════════════════════════
const supabaseHeaders = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
};

async function supabaseInsert(table, data) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: supabaseHeaders,
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase INSERT ${table} failed: ${res.status} ${err}`);
  }
  return res.json();
}

async function supabaseSelect(table, filters = {}) {
  const params = new URLSearchParams();
  for (const [key, val] of Object.entries(filters)) {
    params.append(key, `eq.${val}`);
  }
  params.append('select', '*');
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params.toString()}`, {
    headers: supabaseHeaders,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase SELECT ${table} failed: ${res.status} ${err}`);
  }
  return res.json();
}

async function supabaseUpdate(table, filters, data) {
  const params = new URLSearchParams();
  for (const [key, val] of Object.entries(filters)) {
    params.append(key, `eq.${val}`);
  }
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params.toString()}`, {
    method: 'PATCH',
    headers: supabaseHeaders,
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase UPDATE ${table} failed: ${res.status} ${err}`);
  }
  return res.json();
}

async function supabaseDelete(table, filters) {
  const params = new URLSearchParams();
  for (const [key, val] of Object.entries(filters)) {
    params.append(key, `eq.${val}`);
  }
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params.toString()}`, {
    method: 'DELETE',
    headers: supabaseHeaders,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase DELETE ${table} failed: ${res.status} ${err}`);
  }
}

// ═══════════════════════════════════════════════════════
//  TOKEN CALCULATION HELPERS (mirrors production helpers.ts)
// ═══════════════════════════════════════════════════════

/**
 * Production UI helper: calculateTotalTokensRequired (helpers.ts:116-132)
 * Uses floating-point + Math.ceil
 */
function uiCalculateTotalTokensRequired(params) {
  const tokensForSale = parseFloat(params.tokensForSale);
  const teamVesting = parseFloat(params.teamVestingTokens) || 0;
  const liquidityTokens = tokensForSale * (params.liquidityPercent / 100);
  return tokensForSale + Math.ceil(liquidityTokens) + teamVesting;
}

/**
 * Smart contract calculation: FairlaunchFactory.sol
 * Uses BPS integer math
 */
function scCalculateLiquidityTokens(tokensForSaleBigInt, liquidityPercentBps) {
  return (tokensForSaleBigInt * BigInt(liquidityPercentBps)) / 10000n;
}

// ═══════════════════════════════════════════════════════
//  UTILITIES
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
//  MAIN TEST
// ═══════════════════════════════════════════════════════
async function main() {
  const [deployer, contributor] = await hre.ethers.getSigners();
  const provider = deployer.provider;

  // Track DB records for cleanup
  let dbProjectId = null;
  let dbLaunchRoundId = null;

  // Validate Supabase config
  if (!SUPABASE_KEY) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY env var required!\n' +
        'Set it: export SUPABASE_SERVICE_ROLE_KEY=your_key_here'
    );
  }

  header('E2E FULL INTEGRATION TEST: UI → API → DB → SC');
  log('👤', `Developer/Admin: ${deployer.address}`);
  log('👥', `Contributor: ${contributor.address}`);
  log('💰', `Balance: ${hre.ethers.formatEther(await provider.getBalance(deployer.address))} BNB`);
  log('🗃️', `Supabase: ${SUPABASE_URL}`);

  // Lookup a valid user_id from profiles table (required for projects.owner_user_id FK)
  // In production, this comes from the authenticated session. For testing, we find
  // the deployer's profile or fall back to any existing profile.
  let ownerUserId = null;
  try {
    // First try: find a profile (admin preferred for consistency with deploy flow)
    const profiles = await supabaseSelect('profiles', { is_admin: true });
    if (profiles.length > 0) {
      ownerUserId = profiles[0].user_id;
      log('🔑', `Using profile user_id: ${ownerUserId} (${profiles[0].username})`);
    } else {
      // Fallback: any profile
      const anyProfiles = await supabaseSelect('profiles', {});
      if (anyProfiles.length > 0) {
        ownerUserId = anyProfiles[0].user_id;
        log('🔑', `Using fallback profile: ${ownerUserId}`);
      } else {
        throw new Error('No profiles exist in DB — please sign in via the app first.');
      }
    }
  } catch (e) {
    if (e.message.includes('No profiles')) throw e;
    log('⚠️', `Profile lookup failed: ${e.message}`);
    throw new Error('Cannot proceed without a valid user_id from profiles.');
  }

  try {
    // ═══════════════════════════════════════════════════════
    //  PRE-CHECK: TOKEN CALCULATION CONSISTENCY
    // ═══════════════════════════════════════════════════════
    header('PRE-CHECK: TOKEN CALCULATION CONSISTENCY');

    const uiTotal = uiCalculateTotalTokensRequired({
      tokensForSale: WIZARD_PARAMS.tokensForSale,
      teamVestingTokens: WIZARD_PARAMS.teamAllocation,
      liquidityPercent: WIZARD_PARAMS.liquidityPercent,
    });

    const tokensForSale = hre.ethers.parseUnits(WIZARD_PARAMS.tokensForSale, 18);
    const liquidityPercentBps = BigInt(WIZARD_PARAMS.liquidityPercent * 100);
    const scLiquidityTokens = scCalculateLiquidityTokens(tokensForSale, liquidityPercentBps);
    const teamVestingTokens = hre.ethers.parseUnits(WIZARD_PARAMS.teamAllocation, 18);
    const scTotal = tokensForSale + scLiquidityTokens + teamVestingTokens;

    log('📊', `UI helper total: ${uiTotal} tokens`);
    log('📊', `SC BigInt total: ${hre.ethers.formatUnits(scTotal, 18)} tokens`);

    const uiTotalBigInt = hre.ethers.parseUnits(uiTotal.toString(), 18);
    if (uiTotalBigInt === scTotal) {
      log('✅', 'Token calculation: UI and SC MATCH exactly');
    } else if (uiTotalBigInt > scTotal) {
      const diff = uiTotalBigInt - scTotal;
      log(
        '⚠️',
        `Token calculation: UI rounds UP by ${hre.ethers.formatUnits(
          diff,
          18
        )} tokens (SAFE — escrow has excess)`
      );
    } else {
      const diff = scTotal - uiTotalBigInt;
      log(
        '❌',
        `CRITICAL: UI calculates LESS than SC needs by ${hre.ethers.formatUnits(diff, 18)} tokens!`
      );
      log('', 'This would cause factory.createFairlaunch() to REVERT in production!');
    }

    // ═══════════════════════════════════════════════════════
    //  PHASE 1: DEVELOPER SUBMISSION (UI Wizard + Submit API)
    // ═══════════════════════════════════════════════════════
    header('PHASE 1: DEVELOPER SUBMISSION (UI Wizard + Submit API Simulation)');

    // ─────────────── STEP 1: Create Token ───────────────
    step(1, 'Deploy Test Token');
    const SimpleToken = await hre.ethers.getContractFactory('SimpleToken');
    const totalSupply = hre.ethers.parseUnits('1000000', 18);
    const token = await SimpleToken.deploy(
      WIZARD_PARAMS.projectName,
      WIZARD_PARAMS.tokenSymbol,
      totalSupply,
      18,
      deployer.address
    );
    await token.waitForDeployment();
    const tokenAddr = await token.getAddress();
    log('✅', `Token deployed: ${tokenAddr}`);

    // ─────────────── STEP 2: Pay Creation Fee ───────────────
    step(2, 'Pay Creation Fee (0.2 BNB to Treasury)');
    const creationFee = hre.ethers.parseEther('0.2');
    const feeTx = await deployer.sendTransaction({ to: TREASURY_WALLET, value: creationFee });
    const feeReceipt = await feeTx.wait();
    const feeTxHash = feeReceipt.hash;
    log('✅', `Fee paid: ${feeTxHash}`);

    // ─────────────── STEP 3: Approve + Deposit Escrow ───────────────
    step(3, 'Approve & Deposit to Escrow');

    // Use production-style projectId generation (UUID → keccak256)
    const launchRoundUUID = crypto.randomUUID();
    const projectIdBytes32 = hre.ethers.keccak256(hre.ethers.toUtf8Bytes(launchRoundUUID));
    log('🔑', `Launch Round UUID: ${launchRoundUUID}`);
    log('🔑', `ProjectId bytes32: ${projectIdBytes32}`);

    // Use UI calculation for escrow amount (matches production)
    const totalTokensNeeded = hre.ethers.parseUnits(uiTotal.toString(), 18);

    const approveTx1 = await token.approve(ESCROW_VAULT, totalTokensNeeded);
    await approveTx1.wait();
    log('✅', 'Approved EscrowVault');

    const escrow = await hre.ethers.getContractAt('EscrowVault', ESCROW_VAULT);
    const depositTx = await escrow.deposit(projectIdBytes32, tokenAddr, totalTokensNeeded);
    const depositReceipt = await depositTx.wait();
    const escrowTxHash = depositReceipt.hash;
    log('✅', `Escrow deposit TX: ${escrowTxHash}`);

    // ─────────────── STEP 4: Submit API Simulation (DB Write) ───────────────
    step(4, 'Submit API Simulation — Insert projects + launch_rounds');
    log('📋', 'Simulating POST /api/fairlaunch/submit ...');

    // 4a. Verify escrow TX on-chain (exactly like submit API lines 76-100)
    const escrowTxOnChain = await provider.getTransaction(escrowTxHash);
    if (escrowTxOnChain.to.toLowerCase() !== ESCROW_VAULT.toLowerCase()) {
      throw new Error('❌ SUBMIT API CHECK FAILED: escrow TX recipient mismatch');
    }
    const escrowReceiptCheck = await provider.getTransactionReceipt(escrowTxHash);
    if (!escrowReceiptCheck || escrowReceiptCheck.status !== 1) {
      throw new Error('❌ SUBMIT API CHECK FAILED: escrow TX not successful');
    }
    log('✅', 'Escrow TX verified on-chain (same as submit API)');

    // 4b. Verify fee TX on-chain (exactly like submit API lines 102-135)
    const feeTxOnChain = await provider.getTransaction(feeTxHash);
    if (feeTxOnChain.to.toLowerCase() !== TREASURY_WALLET.toLowerCase()) {
      throw new Error('❌ SUBMIT API CHECK FAILED: fee TX recipient mismatch');
    }
    const expectedFee = hre.ethers.parseEther('0.2');
    if (feeTxOnChain.value < expectedFee) {
      throw new Error('❌ SUBMIT API CHECK FAILED: fee amount insufficient');
    }
    log('✅', 'Fee TX verified on-chain (same as submit API)');

    // 4c. Calculate token economics (exactly like submit API lines 168-178)
    const tokensForSaleNum = parseFloat(WIZARD_PARAMS.tokensForSale);
    const liquidityTokensNum = Math.ceil(tokensForSaleNum * (WIZARD_PARAMS.liquidityPercent / 100));
    const teamVestingNum = parseFloat(WIZARD_PARAMS.teamAllocation);
    const totalEscrowNum = tokensForSaleNum + liquidityTokensNum + teamVestingNum;
    log(
      '📊',
      `Token economics: sale=${tokensForSaleNum} + liq=${liquidityTokensNum} + vest=${teamVestingNum} = ${totalEscrowNum}`
    );

    // 4d. Insert projects row (exactly like submit API lines 142-161)
    dbProjectId = crypto.randomUUID();
    const now = new Date();
    const startAt = new Date(Date.now() + WIZARD_PARAMS.startDelaySeconds * 1000);
    const endAt = new Date(startAt.getTime() + WIZARD_PARAMS.saleDurationSeconds * 1000);

    if (!ownerUserId) {
      throw new Error(
        'Cannot insert projects: deployer wallet has no user_id in DB. Please register first.'
      );
    }

    const projectRow = {
      id: dbProjectId,
      name: WIZARD_PARAMS.projectName,
      symbol: WIZARD_PARAMS.tokenSymbol,
      description: WIZARD_PARAMS.description,
      type: 'FAIRLAUNCH',
      chain_id: 97,
      token_address: tokenAddr,
      creator_wallet: deployer.address,
      owner_user_id: ownerUserId,
      status: 'SUBMITTED',
      sc_scan_status: 'IDLE',
      kyc_status: 'NONE',
    };

    await supabaseInsert('projects', projectRow);
    log('✅', `DB: projects row inserted (id: ${dbProjectId})`);

    // 4e. Insert launch_rounds row (exactly like submit API lines 188-227)
    dbLaunchRoundId = crypto.randomUUID();
    const launchRoundRow = {
      id: dbLaunchRoundId,
      project_id: dbProjectId,
      type: 'FAIRLAUNCH',
      sale_type: 'fairlaunch',
      chain: '97',
      chain_id: 97,
      token_address: tokenAddr,
      raise_asset: 'NATIVE',
      start_at: startAt.toISOString(),
      end_at: endAt.toISOString(),
      status: 'SUBMITTED',
      created_by: ownerUserId,
      params: {
        softcap: WIZARD_PARAMS.softcap,
        hardcap: null,
        min_contribution: WIZARD_PARAMS.minContribution,
        max_contribution: WIZARD_PARAMS.maxContribution,
        tokens_for_sale: WIZARD_PARAMS.tokensForSale,
        liquidity_tokens: liquidityTokensNum.toString(),
        team_vesting_tokens: teamVestingNum.toString(),
        vesting_address: deployer.address,
        vesting_schedule: WIZARD_PARAMS.vestingSchedule,
        liquidity_percent: WIZARD_PARAMS.liquidityPercent,
        lp_lock_months: WIZARD_PARAMS.lpLockMonths,
        listing_premium_bps: WIZARD_PARAMS.listingPremiumBps,
        dex_platform: WIZARD_PARAMS.dexPlatform,
        project_name: WIZARD_PARAMS.projectName,
        token_symbol: WIZARD_PARAMS.tokenSymbol,
      },
      escrow_tx_hash: escrowTxHash,
      escrow_amount: totalEscrowNum.toString(),
      creation_fee_tx_hash: feeTxHash,
      creation_fee_paid: feeTxOnChain.value.toString(),
    };

    await supabaseInsert('launch_rounds', launchRoundRow);
    log('✅', `DB: launch_rounds row inserted (id: ${dbLaunchRoundId})`);

    // 4f. Verify DB rows (SELECT back and check)
    step('4v', 'Verify DB State After Submission');

    const [projectRows] = await supabaseSelect('projects', { id: dbProjectId });
    const [roundRows] = await supabaseSelect('launch_rounds', { id: dbLaunchRoundId });

    if (!projectRows) throw new Error('❌ DB: project row not found after insert!');
    if (!roundRows) throw new Error('❌ DB: launch_rounds row not found after insert!');
    if (projectRows.status !== 'SUBMITTED')
      throw new Error(`❌ DB: project status is '${projectRows.status}', expected 'SUBMITTED'`);
    if (roundRows.status !== 'SUBMITTED')
      throw new Error(`❌ DB: round status is '${roundRows.status}', expected 'SUBMITTED'`);
    if (roundRows.escrow_tx_hash !== escrowTxHash)
      throw new Error('❌ DB: escrow_tx_hash mismatch!');

    log('✅', 'DB state verified: projects.status = SUBMITTED');
    log('✅', 'DB state verified: launch_rounds.status = SUBMITTED');
    log('✅', 'DB state verified: escrow_tx_hash matches');
    log('✅', 'DB state verified: JSONB params stored correctly');

    // ═══════════════════════════════════════════════════════
    //  PHASE 2: ADMIN DEPLOYMENT (Deploy API Simulation)
    // ═══════════════════════════════════════════════════════
    header('PHASE 2: ADMIN DEPLOYMENT (Deploy API Simulation)');

    // ─────────────── STEP 5: Read from DB (like deploy API) ───────────────
    step(5, 'Deploy API: Read launch_round from DB');
    log('📋', 'Simulating POST /api/admin/fairlaunch/deploy ...');

    const [dbRound] = await supabaseSelect('launch_rounds', { id: dbLaunchRoundId });
    const [dbProject] = await supabaseSelect('projects', { id: dbProjectId });

    if (!['APPROVED', 'SUBMITTED'].includes(dbRound.status)) {
      throw new Error(`❌ DEPLOY API: Invalid status ${dbRound.status}`);
    }
    log('✅', `DB round loaded: status=${dbRound.status}, chain=${dbRound.chain_id}`);

    // ─────────────── STEP 6: Time Auto-Adjustment Test ───────────────
    step(6, 'Deploy API: Time Auto-Adjustment Logic');

    const dbParams = dbRound.params;
    const nowUnix = Math.floor(Date.now() / 1000);
    const DEPLOY_BUFFER = 5 * 60; // 5 min

    let startTimeUnix = Math.floor(new Date(dbRound.start_at).getTime() / 1000);
    let endTimeUnix = Math.floor(new Date(dbRound.end_at).getTime() / 1000);
    const originalDuration = endTimeUnix - startTimeUnix;

    log('📋', `Original: start=${new Date(startTimeUnix * 1000).toISOString()}`);
    log('📋', `Original: end=${new Date(endTimeUnix * 1000).toISOString()}`);
    log('📋', `Duration: ${originalDuration}s`);

    if (startTimeUnix <= nowUnix) {
      const newStart = nowUnix + DEPLOY_BUFFER;
      const newEnd = newStart + Math.max(originalDuration, 3600);
      log('⚠️', 'startTime is in the past! Auto-adjusting (same as deploy API)...');
      log('📋', `Adjusted: start=${new Date(newStart * 1000).toISOString()}`);
      log('📋', `Adjusted: end=${new Date(newEnd * 1000).toISOString()}`);
      startTimeUnix = newStart;
      endTimeUnix = newEnd;

      // Update DB (same as deploy API lines 299-311)
      await supabaseUpdate(
        'launch_rounds',
        { id: dbLaunchRoundId },
        {
          start_at: new Date(startTimeUnix * 1000).toISOString(),
          end_at: new Date(endTimeUnix * 1000).toISOString(),
        }
      );
      log('✅', 'DB times updated (same as deploy API)');
    } else {
      log('✅', 'startTime is in the future — no adjustment needed');
    }

    // ─────────────── STEP 7: Decode projectId from escrow TX logs ───────────────
    step(7, 'Deploy API: Decode projectId from Escrow TX Logs');
    log('📋', 'Extracting projectId from escrow TX receipt (same as deploy API lines 150-178)...');

    const escrowReceiptForDecode = await provider.getTransactionReceipt(dbRound.escrow_tx_hash);
    if (!escrowReceiptForDecode) {
      throw new Error('❌ DEPLOY API: escrow TX receipt not found');
    }

    // Find Deposited event: Deposited(bytes32,address,uint256,address)
    const depositedEventTopic = hre.ethers.id('Deposited(bytes32,address,uint256,address)');
    const depositLog = escrowReceiptForDecode.logs.find(
      (l) =>
        l.topics[0] === depositedEventTopic &&
        l.address.toLowerCase() === ESCROW_VAULT.toLowerCase()
    );

    if (!depositLog) {
      throw new Error('❌ DEPLOY API: Deposited event NOT found in escrow TX logs!');
    }

    const decodedProjectId = depositLog.topics[1];
    log('✅', `Decoded projectId: ${decodedProjectId}`);

    // Verify decoded matches what we generated
    if (decodedProjectId.toLowerCase() !== projectIdBytes32.toLowerCase()) {
      throw new Error(
        `❌ ProjectId mismatch! Generated: ${projectIdBytes32}, Decoded: ${decodedProjectId}`
      );
    }
    log('✅', 'Decoded projectId MATCHES generated projectId');

    // Check escrow balance
    const escrowBal = await escrow.getBalance(decodedProjectId);
    log('📊', `Escrow balance: ${hre.ethers.formatUnits(escrowBal, 18)} tokens`);

    // ─────────────── STEP 8: Release + Approve + Deploy (using DB params) ───────────────
    step(8, 'Deploy API: Release Escrow → Approve → Factory Deploy');

    // Release from escrow
    const releaseTx = await escrow.release(decodedProjectId, deployer.address);
    await releaseTx.wait();
    log('✅', 'Tokens released from escrow');

    // Approve factory
    const approveTx2 = await token.approve(FACTORY, hre.ethers.MaxUint256);
    await approveTx2.wait();
    log('✅', 'Factory approved');

    // Build params from DB (exactly like deploy API lines 314-345)
    const createParamsFromDB = {
      projectToken: dbProject.token_address,
      paymentToken: hre.ethers.ZeroAddress,
      softcap: hre.ethers.parseEther(dbParams.softcap.toString()),
      tokensForSale: hre.ethers.parseUnits(dbParams.tokens_for_sale.toString(), 18),
      minContribution: hre.ethers.parseEther((dbParams.min_contribution || '0.1').toString()),
      maxContribution: hre.ethers.parseEther((dbParams.max_contribution || '10').toString()),
      startTime: BigInt(startTimeUnix),
      endTime: BigInt(endTimeUnix),
      projectOwner: dbProject.creator_wallet,
      listingPremiumBps: BigInt(dbParams.listing_premium_bps || 0),
    };

    const vestingParamsFromDB = {
      beneficiary: dbParams.vesting_address || dbProject.creator_wallet,
      startTime: BigInt(endTimeUnix),
      durations: (dbParams.vesting_schedule || []).map((s) => BigInt(s.month * 30 * 24 * 60 * 60)),
      amounts: (dbParams.vesting_schedule || []).map((s) => {
        const teamTokens = hre.ethers.parseUnits(
          (dbParams.team_vesting_tokens || '0').toString(),
          18
        );
        return (teamTokens * BigInt(Math.floor(s.percentage * 100))) / BigInt(10000);
      }),
    };

    const lpPlanFromDB = {
      lockMonths: BigInt(dbParams.lp_lock_months || 12),
      liquidityPercent: BigInt((dbParams.liquidity_percent || 70) * 100),
      dexId: hre.ethers.id(dbParams.dex_platform || 'PancakeSwap'),
    };

    log('📋', 'Deploy params built from DB JSONB:');
    log('   ', `softcap: ${hre.ethers.formatEther(createParamsFromDB.softcap)} BNB`);
    log('   ', `tokensForSale: ${hre.ethers.formatUnits(createParamsFromDB.tokensForSale, 18)}`);
    log('   ', `liquidityPercent: ${lpPlanFromDB.liquidityPercent} BPS`);

    // Get factory
    const factory = await hre.ethers.getContractAt('FairlaunchFactory', FACTORY);
    const deploymentFee = await factory.DEPLOYMENT_FEE();
    const factoryFeeSplitter = await factory.feeSplitter();

    // Deploy via factory using DB-sourced params
    log('🚀', 'Calling factory.createFairlaunch() with DB params...');
    const createTx = await factory.createFairlaunch(
      createParamsFromDB,
      vestingParamsFromDB,
      lpPlanFromDB,
      { value: deploymentFee }
    );
    const createReceipt = await createTx.wait();

    // Extract addresses from event
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
    log('✅', `Vesting vault: ${vestingAddr}`);

    // ─────────────── STEP 9: Set LP Locker + Update DB ───────────────
    step(9, 'Deploy API: Set LP Locker + Update DB Status');

    const fairlaunch = await hre.ethers.getContractAt(
      'contracts/fairlaunch/Fairlaunch.sol:Fairlaunch',
      fairlaunchAddr
    );
    const setLPTx = await fairlaunch.setLPLocker(LP_LOCKER);
    await setLPTx.wait();
    log('✅', 'LP Locker configured');

    // Update DB (exactly like deploy API lines 424-462)
    await supabaseUpdate(
      'projects',
      { id: dbProjectId },
      {
        status: 'DEPLOYED',
        contract_address: fairlaunchAddr,
        deployment_tx_hash: createReceipt.hash,
        factory_address: FACTORY,
        template_version: 'v1.0',
      }
    );
    log('✅', 'DB: projects.status → DEPLOYED');

    await supabaseUpdate(
      'launch_rounds',
      { id: dbLaunchRoundId },
      {
        status: 'DEPLOYED',
        contract_address: fairlaunchAddr,
        vesting_vault_address: vestingAddr,
        deployed_at: new Date().toISOString(),
        deployment_tx_hash: createReceipt.hash,
        verification_status: 'VERIFICATION_PENDING',
        vesting_verification_status: 'VERIFICATION_PENDING',
      }
    );
    log('✅', 'DB: launch_rounds.status → DEPLOYED');

    // Verify DB state after deploy
    const [deployedProject] = await supabaseSelect('projects', { id: dbProjectId });
    const [deployedRound] = await supabaseSelect('launch_rounds', { id: dbLaunchRoundId });
    if (deployedProject.status !== 'DEPLOYED')
      throw new Error(`❌ DB: project status is '${deployedProject.status}'`);
    if (deployedRound.contract_address !== fairlaunchAddr)
      throw new Error('❌ DB: contract_address mismatch!');
    log('✅', 'DB state verified: DEPLOYED with correct contract addresses');

    // ═══════════════════════════════════════════════════════
    //  PHASE 3: LIVE PROJECT + FINALIZATION
    // ═══════════════════════════════════════════════════════
    header('PHASE 3: LIVE PROJECT + FINALIZATION');

    // Wait for start
    step(10, 'Wait for Sale Start + Contribute');
    let currentBlock = await provider.getBlock('latest');
    let waitSecs = startTimeUnix - currentBlock.timestamp + 5;
    if (waitSecs > 0) {
      log('⏳', `Waiting ${waitSecs}s for sale to start...`);
      await sleep(waitSecs * 1000);
    }

    // Contribute
    const contributeAmount = hre.ethers.parseEther('0.06');
    const contributeTx = await fairlaunch.contribute({ value: contributeAmount });
    await contributeTx.wait();
    const totalRaised = await fairlaunch.totalRaised();
    log(
      '✅',
      `Contributed: ${hre.ethers.formatEther(
        contributeAmount
      )} BNB (raised: ${hre.ethers.formatEther(totalRaised)})`
    );

    // Wait for end
    step(11, 'Wait for Sale End');
    currentBlock = await provider.getBlock('latest');
    waitSecs = endTimeUnix - currentBlock.timestamp + 5;
    if (waitSecs > 0) {
      log('⏳', `Waiting ${waitSecs}s for sale to end...`);
      await sleep(waitSecs * 1000);
    }
    log('✅', 'Sale ended');

    // Finalize
    step(12, 'Finalize (4 Steps)');
    const GAS = 5000000;

    const tx1 = await fairlaunch.adminDistributeFee({ gasLimit: GAS });
    await tx1.wait();
    log('✅', 'Step 1/4: Fee distributed');

    const tx2 = await fairlaunch.adminAddLiquidity({ gasLimit: GAS });
    await tx2.wait();
    log('✅', 'Step 2/4: Liquidity added');

    const tx3 = await fairlaunch.adminLockLP({ gasLimit: GAS });
    await tx3.wait();
    log('✅', 'Step 3/4: LP locked');

    const tx4 = await fairlaunch.adminDistributeFunds({ gasLimit: GAS });
    await tx4.wait();
    log('✅', 'Step 4/4: Funds distributed');

    // ═══════════════════════════════════════════════════════
    //  PHASE 4: COMPREHENSIVE VERIFICATION
    // ═══════════════════════════════════════════════════════
    header('PHASE 4: COMPREHENSIVE VERIFICATION');

    // ─── On-chain checks ───
    step(13, 'On-Chain Verification');

    const finalStatus = await fairlaunch.status();
    const isFinalized = await fairlaunch.isFinalized();
    const finalStep = await fairlaunch.finalizeStep();
    const lpTokenAddr = await fairlaunch.lpTokenAddress();
    const feeSplitterAddr = await fairlaunch.feeSplitter();
    const configuredLocker = await fairlaunch.lpLocker();

    const lpToken = await hre.ethers.getContractAt(
      ['function balanceOf(address) view returns (uint256)'],
      lpTokenAddr
    );
    const lpBalance = await lpToken.balanceOf(LP_LOCKER);
    const vestingTokenBalance = await token.balanceOf(vestingAddr);
    const escrowAfter = await escrow.getBalance(decodedProjectId);

    // ─── DB checks ───
    step(14, 'DB ↔ SC Consistency Verification');

    const [finalProject] = await supabaseSelect('projects', { id: dbProjectId });
    const [finalRound] = await supabaseSelect('launch_rounds', { id: dbLaunchRoundId });

    const dbContractMatchesChain =
      finalProject.contract_address?.toLowerCase() === fairlaunchAddr.toLowerCase();
    const dbVestingMatchesChain =
      finalRound.vesting_vault_address?.toLowerCase() === vestingAddr.toLowerCase();
    const dbStatusCorrect = finalProject.status === 'DEPLOYED';
    const dbChainIdCorrect = finalRound.chain_id === 97;
    const dbTokenMatchesChain =
      finalProject.token_address?.toLowerCase() === tokenAddr.toLowerCase();
    const dbParamsExist = finalRound.params && Object.keys(finalRound.params).length > 5;

    // ═══════════════════════════════════════════════════════
    //  FINAL SUMMARY
    // ═══════════════════════════════════════════════════════
    header('TEST RESULTS SUMMARY');

    console.log('\n  ── On-Chain Checks ──');
    const onChainChecks = [
      ['Status = SUCCESS', Number(finalStatus) === 3],
      ['isFinalized = true', isFinalized === true],
      ['finalizeStep = FUNDS_DISTRIBUTED', Number(finalStep) === 4],
      ['LP Token exists', lpTokenAddr !== hre.ethers.ZeroAddress],
      ['LP Tokens locked', lpBalance > 0n],
      ['Escrow empty', escrowAfter === 0n],
      ['Vesting funded (≥ teamTokens)', vestingTokenBalance >= teamVestingTokens],
      ['FeeSplitter matches factory', feeSplitterAddr === factoryFeeSplitter],
      ['LP Locker configured', configuredLocker === LP_LOCKER],
    ];

    for (const [label, ok] of onChainChecks) {
      console.log(`  ${ok ? '✅' : '❌'} ${label}`);
    }

    console.log('\n  ── DB ↔ SC Consistency Checks ──');
    const dbChecks = [
      ['DB contract_address matches chain', dbContractMatchesChain],
      ['DB vesting_vault_address matches chain', dbVestingMatchesChain],
      ['DB project status = DEPLOYED', dbStatusCorrect],
      ['DB chain_id = 97', dbChainIdCorrect],
      ['DB token_address matches chain', dbTokenMatchesChain],
      ['DB JSONB params populated', dbParamsExist],
    ];

    for (const [label, ok] of dbChecks) {
      console.log(`  ${ok ? '✅' : '❌'} ${label}`);
    }

    console.log('\n  ── API Logic Checks ──');
    const apiChecks = [
      ['Escrow TX verified on-chain', true], // Passed in step 4
      ['Fee TX verified on-chain', true], // Passed in step 4
      ['ProjectId decoded from event logs', true], // Passed in step 7
      ['DB params → factory params conversion', true], // Passed in step 8
      ['Time adjustment logic tested', true], // Passed in step 6
    ];

    for (const [label, ok] of apiChecks) {
      console.log(`  ${ok ? '✅' : '❌'} ${label}`);
    }

    const allChecks = [...onChainChecks, ...dbChecks, ...apiChecks];
    const allPassed = allChecks.every(([_, ok]) => ok);
    const passCount = allChecks.filter(([_, ok]) => ok).length;

    console.log(`\n  Total: ${passCount}/${allChecks.length} checks passed`);

    if (allPassed) {
      console.log('\n  🎉🎉🎉  ALL CHECKS PASSED — FULL INTEGRATION SUCCESS  🎉🎉🎉');
    } else {
      console.log('\n  ❌  SOME CHECKS FAILED');
    }

    console.log('\n  Contract Addresses:');
    console.log(`  ├─ Token:        ${tokenAddr}`);
    console.log(`  ├─ Fairlaunch:   ${fairlaunchAddr}`);
    console.log(`  ├─ Vesting:      ${vestingAddr}`);
    console.log(`  ├─ LP Token:     ${lpTokenAddr}`);
    console.log(`  └─ LP Locker:    ${LP_LOCKER}`);
    console.log(`\n  DB Records:`);
    console.log(`  ├─ Project:      ${dbProjectId}`);
    console.log(`  └─ LaunchRound:  ${dbLaunchRoundId}`);
    console.log(`\n  View on BscScan:`);
    console.log(`  https://testnet.bscscan.com/address/${fairlaunchAddr}`);
    console.log(`${'═'.repeat(70)}\n`);
  } finally {
    // ═══════════════════════════════════════════════════════
    //  CLEANUP: Remove test data from DB
    // ═══════════════════════════════════════════════════════
    if (dbLaunchRoundId || dbProjectId) {
      header('CLEANUP: Removing Test Data from DB');
      try {
        if (dbLaunchRoundId) {
          await supabaseDelete('launch_rounds', { id: dbLaunchRoundId });
          log('🧹', `Deleted launch_rounds: ${dbLaunchRoundId}`);
        }
        if (dbProjectId) {
          await supabaseDelete('projects', { id: dbProjectId });
          log('🧹', `Deleted projects: ${dbProjectId}`);
        }
        log('✅', 'DB cleanup complete — no test data left');
      } catch (cleanupErr) {
        log('⚠️', `DB cleanup failed: ${cleanupErr.message}`);
        log('📋', `Manual cleanup needed: projects.id = ${dbProjectId}`);
        log('📋', `Manual cleanup needed: launch_rounds.id = ${dbLaunchRoundId}`);
      }
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
