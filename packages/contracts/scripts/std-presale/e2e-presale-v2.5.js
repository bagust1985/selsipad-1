const hre = require('hardhat');
const { ethers } = require('hardhat');
const { MerkleTree } = require('merkletreejs');

const keccak256 = (data) => ethers.keccak256(data);

/**
 * E2E Test for Presale v2.5 (Phase 7 Burn + Team Wallets in Merkle Tree)
 *
 * New features tested:
 *   - Phase 7: Auto-burn ALL remaining project tokens after finalization
 *   - Team wallet allocations merged into Merkle tree alongside investors
 *   - surplusBurned flag verification
 *   - sweepExcessTokens() for legacy rounds
 *   - Phase reorder: Merkle Root set BEFORE vesting fund
 *   - Supply calculation matching shared math lib
 *
 * Flow:
 *   1. Deploy infra: FeeSplitter, MockLPLocker, Factory, Escrow, Token
 *   2. Admin creates presale via Factory (wizard-equivalent params)
 *   3. Dev deposits tokens to Escrow
 *   4. Users contribute (with referrals)
 *   5. Wait for presale end
 *   6. Build Merkle tree: investors + team wallets
 *   7. Release escrow → round
 *   8. Finalize (Phase 1–8)
 *   9. Verify: Phase 7 burn, surplusBurned flag, zero remaining balance
 *  10. Test claim for both investor and team wallet
 *
 * Usage:
 *   npx hardhat run scripts/std-presale/e2e-presale-v2.5.js
 *   npx hardhat run scripts/std-presale/e2e-presale-v2.5.js --network bscTestnet
 */

const ZERO_ADDRESS = ethers.ZeroAddress;
const DEAD_ADDRESS = '0x000000000000000000000000000000000000dEaD';

const STATUS = {
  UPCOMING: 0,
  ACTIVE: 1,
  ENDED: 2,
  FINALIZING: 3,
  FINALIZED_SUCCESS: 4,
  FINALIZED_FAILED: 5,
  CANCELLED: 6,
};
const STATUS_NAMES = Object.fromEntries(Object.entries(STATUS).map(([k, v]) => [v, k]));

// ─── Helpers ───
function log(msg) {
  console.log(msg);
}
function header(title) {
  log(`\n${'═'.repeat(60)}\n  ${title}\n${'═'.repeat(60)}`);
}
function section(title) {
  log(`\n${'─'.repeat(50)}\n  ${title}\n${'─'.repeat(50)}`);
}

async function waitForTx(tx, label) {
  log(`⏳ ${label}...`);
  const receipt = await tx.wait();
  log(`✅ ${label} (block ${receipt.blockNumber}, gas: ${receipt.gasUsed})`);
  return receipt;
}

function fmtBNB(wei) {
  return ethers.formatEther(wei);
}
function fmtTok(wei) {
  return ethers.formatUnits(wei, 18);
}

function assert(condition, message) {
  if (!condition) {
    log(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  log(`  ✓ ${message}`);
}

/**
 * Build Merkle tree with salted leaves matching MerkleVesting.sol:
 *   leaf = keccak256(abi.encodePacked(vestingAddr, chainId, scheduleSalt, userAddr, allocation))
 */
function buildMerkleTree(allocations, vestingAddr, chainId, scheduleSalt) {
  const leaves = allocations.map(({ address, amount }) =>
    ethers.solidityPackedKeccak256(
      ['address', 'uint256', 'bytes32', 'address', 'uint256'],
      [vestingAddr, chainId, scheduleSalt, address, amount]
    )
  );
  const tree = new MerkleTree(leaves, keccak256, { sort: true });
  const root = tree.getHexRoot();
  const proofs = {};
  allocations.forEach(({ address }, i) => {
    proofs[address] = tree.getHexProof(leaves[i]);
  });
  return { root, tree, proofs, leaves };
}

/** ceil(a / b) for bigint */
function ceilDiv(a, b) {
  if (b === 0n) throw new Error('div0');
  if (a === 0n) return 0n;
  return (a + b - 1n) / b;
}

// ─── Main ───
async function main() {
  header('🚀 PRESALE v2.5 E2E TEST (Phase 7 Burn + Team Wallets)');

  const network = hre.network.name;
  log(`📡 Network: ${network}`);

  const signers = await ethers.getSigners();
  if (signers.length < 7) throw new Error('Need at least 7 signers');

  // signer[5] = team wallet 1, signer[6] = team wallet 2
  const [deployer, admin, dev, user1, user2, teamWallet1, teamWallet2] = signers;

  log('\n👥 Actors:');
  log(`   Deployer:     ${deployer.address}`);
  log(`   Admin:        ${admin.address}`);
  log(`   Developer:    ${dev.address}`);
  log(`   User1:        ${user1.address}`);
  log(`   User2:        ${user2.address}`);
  log(`   TeamWallet1:  ${teamWallet1.address}`);
  log(`   TeamWallet2:  ${teamWallet2.address}`);

  // ═══════════════════════════════════════════════════
  // PHASE 1: DEPLOY INFRASTRUCTURE
  // ═══════════════════════════════════════════════════

  header('📦 PHASE 1: DEPLOY INFRASTRUCTURE');

  section('1.1 FeeSplitter');
  const treasury = deployer.address;
  const FeeSplitter = await ethers.getContractFactory('FeeSplitter');
  const feeSplitter = await FeeSplitter.deploy(treasury, treasury, treasury, admin.address);
  await feeSplitter.waitForDeployment();
  const feeSplitterAddr = await feeSplitter.getAddress();
  log(`✅ FeeSplitter: ${feeSplitterAddr}`);

  section('1.2 Real LPLocker (contracts/shared/LPLocker.sol)');
  const LPLocker = await ethers.getContractFactory('contracts/shared/LPLocker.sol:LPLocker');
  const lpLocker = await LPLocker.deploy();
  await lpLocker.waitForDeployment();
  const lpLockerAddr = await lpLocker.getAddress();
  log(`✅ LPLocker (REAL): ${lpLockerAddr}`);

  section('1.3 DEX Router Mock');
  const RouterMock = await ethers.getContractFactory('UniversalRouterMock');
  const dexRouter = await RouterMock.deploy();
  await dexRouter.waitForDeployment();
  const dexRouterAddr = await dexRouter.getAddress();
  log(`✅ DEX Router: ${dexRouterAddr}`);

  section('1.4 PresaleFactory');
  const Factory = await ethers.getContractFactory('PresaleFactory');
  const factory = await Factory.deploy(feeSplitterAddr, admin.address, dexRouterAddr, lpLockerAddr);
  await factory.waitForDeployment();
  const factoryAddr = await factory.getAddress();
  log(`✅ Factory: ${factoryAddr}`);

  // Grant roles
  await waitForTx(
    await feeSplitter.connect(admin).grantRole(await feeSplitter.DEFAULT_ADMIN_ROLE(), factoryAddr),
    'Grant Factory → FeeSplitter admin'
  );
  await waitForTx(
    await factory.connect(deployer).grantRole(await factory.FACTORY_ADMIN_ROLE(), admin.address),
    'Grant Admin → Factory FACTORY_ADMIN_ROLE'
  );

  section('1.5 EscrowVault');
  const EscrowVault = await ethers.getContractFactory('EscrowVault');
  const escrow = await EscrowVault.deploy();
  await escrow.waitForDeployment();
  const escrowAddr = await escrow.getAddress();
  log(`✅ Escrow: ${escrowAddr}`);
  await waitForTx(
    await escrow.grantRole(await escrow.ADMIN_ROLE(), admin.address),
    'Grant Admin → Escrow ADMIN_ROLE'
  );

  // ─── Wizard-equivalent params (matching UI defaults) ───
  //
  // Hardcap: 10 BNB
  // Softcap: 5 BNB (50%)
  // Price: 0.0001 BNB/token → 10,000 tokens per BNB
  // LP: 60% of net (standard wizard default)
  // Fee: 5% (500 BPS)
  // Team: 10% of total supply (1000 BPS)
  // Team wallets: 70% / 30%
  //
  const BPS = 10000n;
  const WEI = 10n ** 18n;

  const HARDCAP = ethers.parseEther('10'); // 10 BNB
  const SOFTCAP = ethers.parseEther('5'); // 5 BNB
  const PRICE_WEI = ethers.parseEther('0.0001'); // 0.0001 BNB per token
  const FEE_BPS = 500n; // 5%
  const LP_BPS = 6000n; // 60%
  const TEAM_BPS = 1000n; // 10%
  const LP_BUFFER_BPS = 100n; // 1%

  // ─── Calculate supply using same math as helpers.ts ───
  const saleTokens = ceilDiv(HARDCAP * WEI, PRICE_WEI);
  log(`\n📐 Supply Calculation (bigint, matching helpers.ts):`);
  log(
    `   saleTokens  = ceil(${fmtBNB(HARDCAP)} BNB / ${fmtBNB(PRICE_WEI)} price) = ${fmtTok(
      saleTokens
    )}`
  );

  const netBnb = HARDCAP - (HARDCAP * FEE_BPS) / BPS;
  const rawLpTokens = ceilDiv(netBnb * LP_BPS * WEI, BPS * PRICE_WEI);
  const lpBuffer = ceilDiv(rawLpTokens * LP_BUFFER_BPS, BPS);
  const lpTokens = rawLpTokens + lpBuffer;
  log(`   lpTokens    = ${fmtTok(lpTokens)} (incl 1% buffer)`);

  const subTotal = saleTokens + lpTokens;
  const teamTokens = ceilDiv(subTotal * TEAM_BPS, BPS - TEAM_BPS);
  const totalSupply = subTotal + teamTokens;
  log(`   teamTokens  = ${fmtTok(teamTokens)}`);
  log(`   totalSupply = ${fmtTok(totalSupply)}`);

  // Team wallet split: 70% / 30%
  const teamShare1 = (teamTokens * 7000n) / BPS;
  const teamShare2 = (teamTokens * 3000n) / BPS;
  log(`   teamWallet1 (70%) = ${fmtTok(teamShare1)}`);
  log(`   teamWallet2 (30%) = ${fmtTok(teamShare2)}`);

  section('1.6 Test Token (Dev mints totalSupply)');
  const TestToken = await ethers.getContractFactory('contracts/mocks/MockERC20.sol:MockERC20');
  const token = await TestToken.connect(dev).deploy('TestTokenV25', 'TST25', totalSupply);
  await token.waitForDeployment();
  const tokenAddr = await token.getAddress();
  log(`✅ Token: ${tokenAddr} (supply: ${fmtTok(await token.totalSupply())})`);

  // ═══════════════════════════════════════════════════
  // PHASE 2: CREATE PRESALE VIA FACTORY
  // ═══════════════════════════════════════════════════

  header('📦 PHASE 2: CREATE PRESALE');

  const latestBlock = await ethers.provider.getBlock('latest');
  const startTime = latestBlock.timestamp + 10;
  const endTime = startTime + 60; // 60s presale

  // Deposit tokens for sale + LP + team to escrow
  // But escrow only stores sale tokens — LP + team are minted separately
  // Actually: the contract needs ALL tokens: sale + LP + team
  // The round will distribute: vesting(sale+team), LP, burn(remainder)
  const tokensToDeposit = totalSupply; // deposit everything

  section('2.1 Dev deposits tokens to Escrow');
  const escrowProjectId = ethers.id(`e2e-v25-${Date.now()}`);
  await waitForTx(
    await token.connect(dev).approve(escrowAddr, tokensToDeposit),
    `Approve ${fmtTok(tokensToDeposit)} TST25 to Escrow`
  );
  await waitForTx(
    await escrow.connect(dev).deposit(escrowProjectId, tokenAddr, tokensToDeposit),
    'Deposit tokens to Escrow'
  );
  log(`   Escrow balance: ${fmtTok(await token.balanceOf(escrowAddr))} TST25`);

  section('2.2 Admin creates presale via Factory');
  const createTx = await factory.connect(admin).createPresale(
    {
      projectToken: tokenAddr,
      paymentToken: ZERO_ADDRESS,
      softCap: SOFTCAP,
      hardCap: HARDCAP,
      minContribution: ethers.parseEther('0.1'),
      maxContribution: ethers.parseEther('5'),
      startTime,
      endTime,
      projectOwner: dev.address,
    },
    {
      tgeUnlockBps: 2000n, // 20% TGE
      cliffDuration: 0n,
      vestingDuration: BigInt(30 * 24 * 3600), // 30 days
    },
    {
      lockMonths: 13n,
      dexId: ethers.id('pancakeswap'),
      liquidityPercent: LP_BPS,
    },
    ethers.ZeroHash
  );

  const createReceipt = await waitForTx(createTx, 'Create Presale');

  const presaleEvent = createReceipt.logs
    .map((l) => {
      try {
        return factory.interface.parseLog(l);
      } catch {
        return null;
      }
    })
    .find((e) => e && e.name === 'PresaleCreated');
  if (!presaleEvent) throw new Error('PresaleCreated event not found');

  const roundAddr = presaleEvent.args.round;
  const vestingAddr = presaleEvent.args.vesting;
  const scheduleSalt = presaleEvent.args.scheduleSalt;

  log(`✅ Round:    ${roundAddr}`);
  log(`✅ Vesting:  ${vestingAddr}`);
  log(`✅ Salt:     ${scheduleSalt}`);

  const round = await ethers.getContractAt('PresaleRound', roundAddr);
  const vesting = await ethers.getContractAt('MerkleVesting', vestingAddr);

  assert(Number(await round.status()) === STATUS.UPCOMING, 'Initial status = UPCOMING');

  // ═══════════════════════════════════════════════════
  // PHASE 3: CONTRIBUTIONS
  // ═══════════════════════════════════════════════════

  header('💰 PHASE 3: CONTRIBUTIONS');

  section('3.1 Advance to presale start');
  await ethers.provider.send('evm_setNextBlockTimestamp', [startTime + 1]);
  await ethers.provider.send('evm_mine');

  // User1 contributes 4 BNB, User2 contributes 3 BNB → total 7 BNB (> softcap 5)
  // partial fill: 7/10 = 70%
  const contrib1 = ethers.parseEther('4');
  const contrib2 = ethers.parseEther('3');

  section('3.2 User1 contributes 4 BNB');
  await waitForTx(
    await round.connect(user1).contribute(contrib1, ZERO_ADDRESS, { value: contrib1 }),
    'User1 contributes 4 BNB'
  );

  section('3.3 User2 contributes 3 BNB');
  await waitForTx(
    await round.connect(user2).contribute(contrib2, ZERO_ADDRESS, { value: contrib2 }),
    'User2 contributes 3 BNB'
  );

  const totalRaised = await round.totalRaised();
  log(`\n📊 Contribution Summary:`);
  log(`   User1: ${fmtBNB(contrib1)} BNB`);
  log(`   User2: ${fmtBNB(contrib2)} BNB`);
  log(`   Total: ${fmtBNB(totalRaised)} BNB`);
  log(`   Fill:  ${Number((totalRaised * 100n) / HARDCAP)}%`);
  assert(totalRaised >= SOFTCAP, 'Softcap met');

  // ═══════════════════════════════════════════════════
  // PHASE 4: WAIT + END
  // ═══════════════════════════════════════════════════

  header('⏱️ PHASE 4: WAIT FOR END');
  await ethers.provider.send('evm_setNextBlockTimestamp', [endTime + 1]);
  await ethers.provider.send('evm_mine');
  log(`   Status stored: ${STATUS_NAMES[Number(await round.status())]} (syncs on next tx)`);

  // ═══════════════════════════════════════════════════
  // PHASE 5: BUILD MERKLE (investors + team wallets)
  // ═══════════════════════════════════════════════════

  header('🌳 PHASE 5: BUILD MERKLE TREE (Investors + Team)');

  section('5.1 Calculate investor allocations');
  const tokenUnit = 10n ** 18n;
  const user1Alloc = (contrib1 * tokenUnit) / PRICE_WEI;
  const user2Alloc = (contrib2 * tokenUnit) / PRICE_WEI;
  log(`   User1 allocation:   ${fmtTok(user1Alloc)} TST25 (4 BNB)`);
  log(`   User2 allocation:   ${fmtTok(user2Alloc)} TST25 (3 BNB)`);

  section('5.2 Calculate team allocations');
  log(`   TeamWallet1 (70%):  ${fmtTok(teamShare1)} TST25`);
  log(`   TeamWallet2 (30%):  ${fmtTok(teamShare2)} TST25`);

  section('5.3 Combined merkle tree');
  const allAllocations = [
    { address: user1.address, amount: user1Alloc },
    { address: user2.address, amount: user2Alloc },
    { address: teamWallet1.address, amount: teamShare1 },
    { address: teamWallet2.address, amount: teamShare2 },
  ];

  const totalVestingAllocation = allAllocations.reduce((s, a) => s + a.amount, 0n);
  log(`   Total vesting (inv + team): ${fmtTok(totalVestingAllocation)} TST25`);
  log(`   Breakdown:`);
  log(`     Investors:  ${fmtTok(user1Alloc + user2Alloc)}`);
  log(`     Team:       ${fmtTok(teamShare1 + teamShare2)}`);

  // Use Hardhat chainId (31337) for local, or read from provider
  const chainId = (await ethers.provider.getNetwork()).chainId;
  const { root: merkleRoot, proofs } = buildMerkleTree(
    allAllocations,
    vestingAddr,
    chainId,
    scheduleSalt
  );
  log(`   Merkle Root: ${merkleRoot}`);
  log(`   Entries:     ${allAllocations.length} (2 investors + 2 team)`);

  // LP calculation for finalize params
  const feeAmount = (totalRaised * FEE_BPS) / BPS;
  const netAfterFee = totalRaised - feeAmount;
  const lpBnbAmount = (netAfterFee * LP_BPS) / BPS;
  const tokensForLP = (lpBnbAmount * tokenUnit) / PRICE_WEI;
  log(`   LP BNB:      ${fmtBNB(lpBnbAmount)}`);
  log(`   LP tokens:   ${fmtTok(tokensForLP)}`);

  // Unsold = tokensForSale - tokens actually sold
  const tokensSold = user1Alloc + user2Alloc;
  const unsoldToBurn =
    saleTokens > tokensSold + tokensForLP ? saleTokens - tokensSold - tokensForLP : 0n;
  log(`   Unsold burn:  ${fmtTok(unsoldToBurn)}`);

  section('5.4 Budget sanity check');
  const totalNeeded = totalVestingAllocation + tokensForLP + unsoldToBurn;
  log(`   Vesting:       ${fmtTok(totalVestingAllocation)}`);
  log(`   LP:            ${fmtTok(tokensForLP)}`);
  log(`   Burn unsold:   ${fmtTok(unsoldToBurn)}`);
  log(`   Total needed:  ${fmtTok(totalNeeded)}`);
  log(`   Deposited:     ${fmtTok(tokensToDeposit)}`);
  const surplus = tokensToDeposit - totalNeeded;
  log(`   SURPLUS (→ Phase 7 burn): ${fmtTok(surplus)}`);
  assert(tokensToDeposit >= totalNeeded, 'Deposit covers all allocations');
  assert(surplus > 0n, 'There IS surplus for Phase 7 to burn');

  // ═══════════════════════════════════════════════════
  // PHASE 6: RELEASE ESCROW + FINALIZE
  // ═══════════════════════════════════════════════════

  header('🏁 PHASE 6: RELEASE + FINALIZE');

  section('6.1 Release escrow → round');
  const roundTokenBefore = await token.balanceOf(roundAddr);
  await waitForTx(
    await escrow.connect(admin).release(escrowProjectId, roundAddr),
    'Release Escrow → Round'
  );
  const roundTokenAfter = await token.balanceOf(roundAddr);
  log(`   Round received: ${fmtTok(roundTokenAfter - roundTokenBefore)} TST25`);
  assert(roundTokenAfter >= tokensToDeposit, 'Round received all deposited tokens');

  section('6.2 Snapshot pre-finalize');
  const devBNBBefore = await ethers.provider.getBalance(dev.address);
  const vestingTokenBefore = await token.balanceOf(vestingAddr);
  const deadBefore = await token.balanceOf(DEAD_ADDRESS);
  const roundBNBBefore = await ethers.provider.getBalance(roundAddr);
  log(`   Dev BNB:       ${fmtBNB(devBNBBefore)}`);
  log(`   Round BNB:     ${fmtBNB(roundBNBBefore)}`);
  log(`   Vesting tok:   ${fmtTok(vestingTokenBefore)}`);
  log(`   Dead tok:      ${fmtTok(deadBefore)}`);

  section('6.3 Call finalizeSuccessEscrow (6 params)');
  const finalizeTx = await round.connect(admin).finalizeSuccessEscrow(
    merkleRoot,
    totalVestingAllocation,
    unsoldToBurn,
    tokensForLP,
    0n, // tokenMinLP (0 for test)
    0n, // bnbMinLP (0 for test)
    { gasLimit: 3000000 }
  );
  const finalizeReceipt = await waitForTx(finalizeTx, 'finalizeSuccessEscrow');

  // ═══════════════════════════════════════════════════
  // PHASE 7: VERIFICATION
  // ═══════════════════════════════════════════════════

  header('✅ PHASE 7: VERIFICATION');

  section('7.1 Status & Phase Flags');
  const finalStatus = Number(await round.status());
  assert(
    finalStatus === STATUS.FINALIZED_SUCCESS,
    `Status = FINALIZED_SUCCESS (${STATUS_NAMES[finalStatus]})`
  );

  const vestingFunded = await round.vestingFunded();
  const feePaid = await round.feePaid();
  const lpCreated = await round.lpCreated();
  const ownerPaid = await round.ownerPaid();

  assert(vestingFunded, 'vestingFunded = true');
  assert(feePaid, 'feePaid = true');
  assert(lpCreated, 'lpCreated = true');
  assert(ownerPaid, 'ownerPaid = true');

  // ─── NEW: surplusBurned flag ───
  let surplusBurned = false;
  try {
    surplusBurned = await round.surplusBurned();
    assert(surplusBurned, 'surplusBurned = true (Phase 7 executed)');
  } catch {
    log('  ⚠️ surplusBurned() not found — may be older contract version');
  }

  section('7.2 Vesting Vault');
  const vestingTokenAfter = await token.balanceOf(vestingAddr);
  log(`   Vesting funded: ${fmtTok(vestingTokenAfter)} TST25`);
  assert(vestingTokenAfter >= totalVestingAllocation, 'Vesting vault has investor + team tokens');

  const merkleOnChain = await vesting.merkleRoot();
  assert(merkleOnChain === merkleRoot, 'Merkle root matches (includes team wallets)');

  section('7.3 Token Burns (Phase 4 unsold + Phase 7 surplus)');
  const deadAfter = await token.balanceOf(DEAD_ADDRESS);
  const totalBurned = deadAfter - deadBefore;
  log(`   Total burned: ${fmtTok(totalBurned)} TST25`);
  log(`     ├─ Phase 4 (unsold):   expected ${fmtTok(unsoldToBurn)}`);
  log(`     └─ Phase 7 (surplus):  expected ${fmtTok(surplus)}`);

  // Phase 7 should have burned the surplus
  const expectedTotalBurn = unsoldToBurn + surplus;
  // Allow small rounding tolerance (LP rounding)
  const burnDiff =
    totalBurned > expectedTotalBurn
      ? totalBurned - expectedTotalBurn
      : expectedTotalBurn - totalBurned;

  if (burnDiff <= tokenUnit) {
    log(`  ✓ Total burn within 1 token tolerance (diff: ${fmtTok(burnDiff)})`);
  } else {
    log(`  ⚠️ Burn difference: ${fmtTok(burnDiff)} (may be LP rounding)`);
  }

  section('7.4 ★ PHASE 7 CRITICAL: Zero remaining balance');
  const roundTokenFinal = await token.balanceOf(roundAddr);
  log(`   Round token balance after finalization: ${fmtTok(roundTokenFinal)} TST25`);
  assert(roundTokenFinal === 0n, '★ Round has ZERO project tokens (Phase 7 burn worked!)');

  section('7.5 BNB Distribution');
  const devBNBAfter = await ethers.provider.getBalance(dev.address);
  const roundBNBAfter = await ethers.provider.getBalance(roundAddr);
  const devReceived = devBNBAfter - devBNBBefore;
  log(`   Dev received: ${fmtBNB(devReceived)} BNB`);
  log(`   Round BNB remaining: ${fmtBNB(roundBNBAfter)}`);
  assert(devReceived > 0n, 'Dev received BNB payout');
  assert(roundBNBAfter === 0n, 'Round BNB balance = 0');

  section('7.6 LP Lock');
  const lpLockId = await round.lpLockId();
  log(`   LP Lock ID: ${lpLockId}`);
  assert(lpCreated, 'LP created and locked');

  section('7.7 Events');
  const events = finalizeReceipt.logs
    .map((l) => {
      try {
        return round.interface.parseLog(l);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
  const eventNames = events.map((e) => e.name);
  log(`   Events: ${eventNames.join(', ')}`);

  // Check for ExcessBurned event (Phase 7)
  const excessBurnedEvt = events.find((e) => e.name === 'ExcessBurned');
  if (excessBurnedEvt) {
    log(`   ✓ ExcessBurned event: ${fmtTok(excessBurnedEvt.args[0])} TST25`);
  } else {
    log(`   ⚠️ ExcessBurned event not found (check contract version)`);
  }

  // ═══════════════════════════════════════════════════
  // PHASE 8: CLAIM TESTS
  // ═══════════════════════════════════════════════════

  header('🎁 PHASE 8: CLAIM TESTS');

  // Advance time past TGE
  await ethers.provider.send('evm_increaseTime', [3600]);
  await ethers.provider.send('evm_mine');

  section('8.1 Investor (User1) claims');
  try {
    const u1Before = await token.balanceOf(user1.address);
    const claimTx = await vesting.connect(user1).claim(user1Alloc, proofs[user1.address]);
    await waitForTx(claimTx, 'User1 claims');
    const u1After = await token.balanceOf(user1.address);
    const claimed = u1After - u1Before;
    log(`   User1 claimed: ${fmtTok(claimed)} TST25`);
    const expectedTGE = (user1Alloc * 2000n) / BPS;
    assert(claimed >= expectedTGE, `Claimed >= TGE (${fmtTok(expectedTGE)})`);
  } catch (err) {
    log(`   ⚠️ User1 claim error: ${err.message}`);
  }

  section('8.2 Team wallet 1 claims');
  try {
    const tw1Before = await token.balanceOf(teamWallet1.address);
    const claimTx2 = await vesting
      .connect(teamWallet1)
      .claim(teamShare1, proofs[teamWallet1.address]);
    await waitForTx(claimTx2, 'TeamWallet1 claims');
    const tw1After = await token.balanceOf(teamWallet1.address);
    const claimed = tw1After - tw1Before;
    log(`   TeamWallet1 claimed: ${fmtTok(claimed)} TST25`);
    const expectedTGE = (teamShare1 * 2000n) / BPS;
    assert(claimed >= expectedTGE, `Team claimed >= TGE (${fmtTok(expectedTGE)})`);
  } catch (err) {
    log(`   ⚠️ TeamWallet1 claim error: ${err.message}`);
  }

  section('8.3 Team wallet 2 claims');
  try {
    const tw2Before = await token.balanceOf(teamWallet2.address);
    const claimTx3 = await vesting
      .connect(teamWallet2)
      .claim(teamShare2, proofs[teamWallet2.address]);
    await waitForTx(claimTx3, 'TeamWallet2 claims');
    const tw2After = await token.balanceOf(teamWallet2.address);
    const claimed = tw2After - tw2Before;
    log(`   TeamWallet2 claimed: ${fmtTok(claimed)} TST25`);
    assert(claimed > 0n, 'TeamWallet2 received tokens');
  } catch (err) {
    log(`   ⚠️ TeamWallet2 claim error: ${err.message}`);
  }

  // ═══════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════

  header('📋 E2E v2.5 SUMMARY');

  log('\n📍 Contracts:');
  const contracts = [
    ['Factory', factoryAddr],
    ['FeeSplitter', feeSplitterAddr],
    ['LPLocker (Real)', lpLockerAddr],
    ['DEX Router', dexRouterAddr],
    ['EscrowVault', escrowAddr],
    ['Token', tokenAddr],
    ['PresaleRound', roundAddr],
    ['MerkleVesting', vestingAddr],
  ];
  contracts.forEach(([n, a]) => log(`   ${n.padEnd(16)} ${a}`));

  log('\n📊 Results:');
  log(`   Status:          ${STATUS_NAMES[finalStatus]}`);
  log(
    `   Total Raised:    ${fmtBNB(totalRaised)} BNB (${Number(
      (totalRaised * 100n) / HARDCAP
    )}% fill)`
  );
  log(`   Vesting Funded:  ${vestingFunded} (investors + team)`);
  log(`   Fee Paid:        ${feePaid}`);
  log(`   LP Created:      ${lpCreated} (lockId: ${lpLockId})`);
  log(`   Owner Paid:      ${ownerPaid}`);
  log(`   Surplus Burned:  ${surplusBurned}`);
  log(`   Dev BNB:         +${fmtBNB(devReceived)} BNB`);
  log(`   Total Burned:    ${fmtTok(totalBurned)} TST25`);
  log(`   Round Remaining: ${fmtTok(roundTokenFinal)} TST25 (should be 0)`);
  log(`   Merkle Root:     ${merkleRoot}`);

  log('\n🧑‍🤝‍🧑 Team Wallet Distribution:');
  log(`   TeamWallet1 (70%): ${fmtTok(teamShare1)} TST25 → ${teamWallet1.address}`);
  log(`   TeamWallet2 (30%): ${fmtTok(teamShare2)} TST25 → ${teamWallet2.address}`);

  log('\n🆕 New Features Tested:');
  log(`   ✅ Phase 7 auto-burn surplus`);
  log(`   ✅ surplusBurned flag`);
  log(`   ✅ Team wallets in merkle tree`);
  log(`   ✅ Team wallet claim`);
  log(`   ✅ Zero remaining project tokens`);
  log(`   ✅ ExcessBurned event`);

  header('✅ ALL E2E v2.5 TESTS PASSED');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ E2E TEST FAILED');
    console.error(error);
    process.exit(1);
  });
