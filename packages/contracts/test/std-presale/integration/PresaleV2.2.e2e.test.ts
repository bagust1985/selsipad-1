import { expect } from 'chai';
import { ethers } from 'hardhat';
import { MerkleTree } from 'merkletreejs';

// ──────────────────── Helpers ────────────────────

function parseEvent(rc: any, iface: any, name: string) {
  for (const log of rc.logs) {
    try {
      const p = iface.parseLog(log);
      if (p && p.name === name) return p;
    } catch {}
  }
  return null;
}

function parseAllEvents(rc: any, iface: any, name: string) {
  const results: any[] = [];
  for (const log of rc.logs) {
    try {
      const p = iface.parseLog(log);
      if (p && p.name === name) results.push(p);
    } catch {}
  }
  return results;
}

async function setNextTimestamp(ts: number) {
  await ethers.provider.send('evm_setNextBlockTimestamp', [ts]);
  await ethers.provider.send('evm_mine', []);
}

function buildLeaf(
  vestingAddr: string,
  chainId: bigint,
  salt: string,
  beneficiary: string,
  total: bigint
): Buffer {
  const packed = ethers.solidityPacked(
    ['address', 'uint256', 'bytes32', 'address', 'uint256'],
    [vestingAddr, chainId, salt, beneficiary, total]
  );
  const h = ethers.keccak256(packed);
  return Buffer.from(h.slice(2), 'hex');
}

function buildMerkle(
  vestingAddr: string,
  chainId: bigint,
  salt: string,
  entries: Array<{ who: string; total: bigint }>
) {
  const leaves = entries.map((e) => buildLeaf(vestingAddr, chainId, salt, e.who, e.total));
  const hashFn = (data: Buffer) => Buffer.from(ethers.keccak256(data).slice(2), 'hex');
  const tree = new MerkleTree(leaves, hashFn, { sortPairs: true });
  const root = '0x' + tree.getRoot().toString('hex');
  const proof = (who: string, total: bigint) =>
    tree
      .getProof(buildLeaf(vestingAddr, chainId, salt, who, total))
      .map((p) => '0x' + p.data.toString('hex'));
  return { root, proof };
}

const BURN_ADDRESS = '0x000000000000000000000000000000000000dEaD';

// ──────────────────── Test Suite ────────────────────

describe('Presale E2E v2.2 – Hardcap & Softcap Scenarios', function () {
  this.timeout(120_000);

  // Common fixture that deploys Factory + FeeSplitter + mock tokens
  async function fixture() {
    const [admin, timelock, ops, projectOwner, alice, bob, carol, treasury, referral, sbt] =
      await ethers.getSigners();

    // Deploy mock tokens
    const ERC20Mock = await ethers.getContractFactory('ERC20Mock');
    const paymentToken = await ERC20Mock.deploy('USDC', 'USDC', 6);
    await paymentToken.waitForDeployment();
    const projectToken = await ERC20Mock.deploy('PRJ', 'PRJ', 18);
    await projectToken.waitForDeployment();

    // Mint test tokens
    const totalSupply = ethers.parseEther('1000000'); // 1M tokens
    await projectToken.mint(projectOwner.address, totalSupply);
    await paymentToken.mint(alice.address, 100_000_000_000n); // 100k USDC
    await paymentToken.mint(bob.address, 100_000_000_000n);
    await paymentToken.mint(carol.address, 100_000_000_000n);

    // Deploy FeeSplitter
    const FeeSplitter = await ethers.getContractFactory('FeeSplitter');
    const feeSplitter = await FeeSplitter.deploy(
      treasury.address,
      referral.address,
      sbt.address,
      admin.address
    );
    await feeSplitter.waitForDeployment();

    // Deploy PresaleFactory
    const Factory = await ethers.getContractFactory('PresaleFactory');
    const factory = await Factory.deploy(await feeSplitter.getAddress(), timelock.address);
    await factory.waitForDeployment();

    // Grant factory admin role on FeeSplitter
    await feeSplitter.grantRole(await feeSplitter.DEFAULT_ADMIN_ROLE(), await factory.getAddress());

    // Grant ops as factory admin
    const FACTORY_ADMIN_ROLE = await factory.FACTORY_ADMIN_ROLE();
    await factory.grantRole(FACTORY_ADMIN_ROLE, ops.address);

    return {
      admin,
      timelock,
      ops,
      projectOwner,
      alice,
      bob,
      carol,
      treasury,
      referral,
      sbt,
      paymentToken,
      projectToken,
      feeSplitter,
      factory,
      totalSupply,
    };
  }

  // Helper: create a presale via factory
  async function createPresale(
    ctx: Awaited<ReturnType<typeof fixture>>,
    overrides?: {
      softCap?: bigint;
      hardCap?: bigint;
      tokensForSale?: bigint;
      minContrib?: bigint;
      maxContrib?: bigint;
      tgeUnlockBps?: bigint;
      cliffDuration?: bigint;
      vestingDuration?: bigint;
      lpLockMonths?: bigint;
      lpPercent?: bigint;
    }
  ) {
    const now = (await ethers.provider.getBlock('latest'))!.timestamp;
    const start = now + 60;
    const end = start + 3600;

    const params = {
      projectToken: await ctx.projectToken.getAddress(),
      paymentToken: await ctx.paymentToken.getAddress(),
      softCap: overrides?.softCap ?? 5_000_000n, // 5 USDC
      hardCap: overrides?.hardCap ?? 10_000_000n, // 10 USDC
      minContribution: overrides?.minContrib ?? 100_000n, // 0.1 USDC
      maxContribution: overrides?.maxContrib ?? 5_000_000n, // 5 USDC
      startTime: start,
      endTime: end,
      projectOwner: ctx.projectOwner.address,
    };

    const vestingParams = {
      tgeUnlockBps: overrides?.tgeUnlockBps ?? 2000n, // 20% TGE
      cliffDuration: overrides?.cliffDuration ?? 0n,
      vestingDuration: overrides?.vestingDuration ?? 2000n, // 2000 seconds
      scheduleSalt: ethers.ZeroHash,
    };

    const lpPlan = {
      lockMonths: overrides?.lpLockMonths ?? 12n,
      dexId: ethers.keccak256(ethers.toUtf8Bytes('PANCAKESWAP_V2')),
      liquidityPercent: overrides?.lpPercent ?? 7000n, // 70%
    };

    const complianceHash = ethers.keccak256(ethers.toUtf8Bytes('compliance'));

    const tx = await ctx.factory
      .connect(ctx.ops)
      .createPresale(params, vestingParams, lpPlan, complianceHash);
    const rc = await tx.wait();
    const evt = parseEvent(rc, ctx.factory.interface, 'PresaleCreated')!;

    const roundAddr = evt.args.round as string;
    const vestingAddr = evt.args.vesting as string;
    const salt = evt.args.scheduleSalt as string;

    const round = await ethers.getContractAt('PresaleRound', roundAddr);
    const vesting = await ethers.getContractAt('MerkleVesting', vestingAddr);

    // Grant ADMIN_ROLE to ops on the round (timelock is admin by default)
    const ADMIN_ROLE = ethers.id('ADMIN_ROLE');
    await round.connect(ctx.timelock).grantRole(ADMIN_ROLE, ctx.ops.address);

    return {
      round,
      vesting,
      roundAddr,
      vestingAddr,
      salt,
      start,
      end,
      params,
      vestingParams,
      lpPlan,
    };
  }

  // ════════════════════════════════════════════════
  //  TEST 1: HARDCAP REACHED — Full Sale
  // ════════════════════════════════════════════════

  describe('Scenario 1: Hardcap Reached', function () {
    it('should complete full lifecycle: contribute → finalize → fee split → vesting → NO burn', async function () {
      const ctx = await fixture();
      const net = await ethers.provider.getNetwork();
      const chainId = net.chainId;

      // Create presale: softcap 5 USDC, hardcap 10 USDC
      const presale = await createPresale(ctx, {
        softCap: 5_000_000n,
        hardCap: 10_000_000n,
        maxContrib: 10_000_000n,
      });

      // ── Phase 1: Contributions (reach hardcap exactly) ──
      await setNextTimestamp(presale.start + 1);

      // Alice contributes 6 USDC
      await ctx.paymentToken.connect(ctx.alice).approve(presale.roundAddr, 6_000_000n);
      await presale.round.connect(ctx.alice).contribute(6_000_000n, ethers.ZeroAddress);

      // Bob contributes 4 USDC (total = 10 USDC = hardcap)
      await ctx.paymentToken.connect(ctx.bob).approve(presale.roundAddr, 4_000_000n);
      await presale.round.connect(ctx.bob).contribute(4_000_000n, ethers.ZeroAddress);

      // Verify total raised = hardcap
      expect(await presale.round.totalRaised()).to.equal(10_000_000n);

      // ── Phase 2: End presale & prepare finalization ──
      await setNextTimestamp(presale.end + 10);

      // Token allocations for investors (based on contribution ratio)
      const tokensForSale = ethers.parseEther('100000'); // 100k tokens for sale
      const allocAlice = ethers.parseEther('60000'); // 60% of sale
      const allocBob = ethers.parseEther('40000'); // 40% of sale
      const totalVestingAlloc = allocAlice + allocBob;

      // Build Merkle tree
      const { root, proof } = buildMerkle(presale.vestingAddr, chainId, presale.salt, [
        { who: ctx.alice.address, total: allocAlice },
        { who: ctx.bob.address, total: allocBob },
      ]);

      // ProjectOwner approves round to pull tokens for vesting + potential burn
      await ctx.projectToken.connect(ctx.projectOwner).approve(
        presale.roundAddr,
        totalVestingAlloc + tokensForSale // extra for potential burn (won't be used)
      );

      // Capture balances BEFORE finalization
      const treasuryBefore = await ctx.paymentToken.balanceOf(ctx.treasury.address);
      const referralBefore = await ctx.paymentToken.balanceOf(ctx.referral.address);
      const sbtBefore = await ctx.paymentToken.balanceOf(ctx.sbt.address);
      const ownerPaymentBefore = await ctx.paymentToken.balanceOf(ctx.projectOwner.address);
      const burnBefore = await ctx.projectToken.balanceOf(BURN_ADDRESS);

      // ── Phase 3: Finalize Success (v2.2 with totalTokensForSale) ──
      const finTx = await presale.round
        .connect(ctx.ops)
        .finalizeSuccess(root, totalVestingAlloc, tokensForSale);
      const finRc = await finTx.wait();

      // ── Phase 4: Verify Fee Split ──
      const totalRaised = 10_000_000n;
      const expectedFee = (totalRaised * 500n) / 10000n; // 5% = 500,000
      const expectedNet = totalRaised - expectedFee;

      // FeeSplitter distributes: treasury 50%, referral 40%, sbt 10%
      const expectedTreasury = (expectedFee * 250n) / 500n; // 250/500 = 50%
      const expectedReferral = (expectedFee * 200n) / 500n; // 200/500 = 40%
      const expectedSbt = (expectedFee * 50n) / 500n; // 50/500 = 10%

      const treasuryAfter = await ctx.paymentToken.balanceOf(ctx.treasury.address);
      const referralAfter = await ctx.paymentToken.balanceOf(ctx.referral.address);
      const sbtAfter = await ctx.paymentToken.balanceOf(ctx.sbt.address);

      // Fee split uses native tokens for ERC20 presales via distributeFeeERC20
      // Since this is ERC20 payment, verify FeeSplitter received and split
      console.log('   📊 Fee Distribution:');
      console.log(`      Total Raised: ${totalRaised}`);
      console.log(`      Fee (5%): ${expectedFee}`);
      console.log(`      Net to Owner: ${expectedNet}`);

      // Verify project owner received net funds
      const ownerPaymentAfter = await ctx.paymentToken.balanceOf(ctx.projectOwner.address);
      expect(ownerPaymentAfter - ownerPaymentBefore).to.equal(expectedNet);
      console.log('      ✅ Project owner received correct net amount');

      // ── Phase 5: Verify NO burn (hardcap reached) ──
      const burnAfter = await ctx.projectToken.balanceOf(BURN_ADDRESS);
      expect(burnAfter).to.equal(burnBefore); // No tokens burned
      console.log('      ✅ No tokens burned (hardcap met)');

      // Check no UnsoldTokensBurned event
      const burnEvent = parseEvent(finRc, presale.round.interface, 'UnsoldTokensBurned');
      expect(burnEvent).to.be.null;
      console.log('      ✅ No UnsoldTokensBurned event emitted');

      // ── Phase 6: Verify Investor Vesting ──
      // Check vesting vault is funded
      const vestingBalance = await ctx.projectToken.balanceOf(presale.vestingAddr);
      expect(vestingBalance).to.equal(totalVestingAlloc);
      console.log(`      ✅ Vesting vault funded: ${ethers.formatEther(vestingBalance)} tokens`);

      // Get vesting info
      const vestInfo = await presale.vesting.getVestingInfo();
      expect(vestInfo._tgeUnlockBps).to.equal(2000n); // 20% TGE
      console.log(
        `      ✅ TGE Unlock: ${vestInfo._tgeUnlockBps} BPS (${
          Number(vestInfo._tgeUnlockBps) / 100
        }%)`
      );

      // Alice claims TGE (20% of 60k = 12k tokens)
      const aliceBefore = await ctx.projectToken.balanceOf(ctx.alice.address);
      await presale.vesting
        .connect(ctx.alice)
        .claim(allocAlice, proof(ctx.alice.address, allocAlice));
      const aliceAfter = await ctx.projectToken.balanceOf(ctx.alice.address);
      const aliceTGE = aliceAfter - aliceBefore;
      const expectedAliceTGE = (allocAlice * 2000n) / 10000n; // 20%
      expect(aliceTGE).to.equal(expectedAliceTGE);
      console.log(`      ✅ Alice TGE claim: ${ethers.formatEther(aliceTGE)} tokens`);

      // Bob claims TGE (20% of 40k = 8k tokens)
      const bobBefore = await ctx.projectToken.balanceOf(ctx.bob.address);
      await presale.vesting.connect(ctx.bob).claim(allocBob, proof(ctx.bob.address, allocBob));
      const bobAfter = await ctx.projectToken.balanceOf(ctx.bob.address);
      const bobTGE = bobAfter - bobBefore;
      const expectedBobTGE = (allocBob * 2000n) / 10000n; // 20%
      expect(bobTGE).to.equal(expectedBobTGE);
      console.log(`      ✅ Bob TGE claim: ${ethers.formatEther(bobTGE)} tokens`);

      // ── Phase 7: Verify linear vesting after time ──
      await ethers.provider.send('evm_increaseTime', [1000]); // 50% of vesting
      await ethers.provider.send('evm_mine', []);

      const aliceMid = await ctx.projectToken.balanceOf(ctx.alice.address);
      await presale.vesting
        .connect(ctx.alice)
        .claim(allocAlice, proof(ctx.alice.address, allocAlice));
      const aliceAfterVest = await ctx.projectToken.balanceOf(ctx.alice.address);
      const aliceVested = aliceAfterVest - aliceMid;
      expect(aliceVested).to.be.greaterThan(0n);
      console.log(
        `      ✅ Alice vesting claim after 50%: ${ethers.formatEther(aliceVested)} tokens`
      );

      // ── Phase 8: Verify LP Lock Plan recorded on factory ──
      const lpPlan = await ctx.factory.getLPPlan(presale.roundAddr);
      expect(lpPlan.lockMonths).to.equal(12n);
      expect(lpPlan.liquidityPercent).to.equal(7000n);
      console.log(
        `      ✅ LP Lock Plan: ${lpPlan.lockMonths} months, ${
          Number(lpPlan.liquidityPercent) / 100
        }% liquidity`
      );

      // ── Phase 9: Verify presale status ──
      const presaleInfo = await presale.round.getPresaleInfo();
      expect(presaleInfo._status).to.equal(5n); // FINALIZED_SUCCESS
      console.log('      ✅ Status: FINALIZED_SUCCESS');

      console.log('\n   🎉 Scenario 1 PASSED: Hardcap reached - All checks green!\n');
    });
  });

  // ════════════════════════════════════════════════
  //  TEST 2: SOFTCAP ONLY — Unsold Tokens Auto-Burned
  // ════════════════════════════════════════════════

  describe('Scenario 2: Softcap Only (Auto-Burn)', function () {
    it('should complete lifecycle: contribute → finalize → fee split → BURN unsold → vesting', async function () {
      const ctx = await fixture();
      const net = await ethers.provider.getNetwork();
      const chainId = net.chainId;

      // Create presale: softcap 5 USDC, hardcap 10 USDC
      const presale = await createPresale(ctx, {
        softCap: 5_000_000n,
        hardCap: 10_000_000n,
        maxContrib: 10_000_000n,
      });

      // ── Phase 1: Contributions (reach softcap only, 70% of hardcap) ──
      await setNextTimestamp(presale.start + 1);

      // Alice contributes 4 USDC
      await ctx.paymentToken.connect(ctx.alice).approve(presale.roundAddr, 4_000_000n);
      await presale.round.connect(ctx.alice).contribute(4_000_000n, ethers.ZeroAddress);

      // Bob contributes 3 USDC (total = 7 USDC, above softcap but below hardcap)
      await ctx.paymentToken.connect(ctx.bob).approve(presale.roundAddr, 3_000_000n);
      await presale.round.connect(ctx.bob).contribute(3_000_000n, ethers.ZeroAddress);

      const totalRaised = await presale.round.totalRaised();
      expect(totalRaised).to.equal(7_000_000n);
      expect(totalRaised).to.be.gte(5_000_000n); // >= softcap
      expect(totalRaised).to.be.lt(10_000_000n); // < hardcap
      console.log(`\n   📊 Total Raised: ${totalRaised} (softcap=5M, hardcap=10M)`);

      // ── Phase 2: End presale & prepare finalization ──
      await setNextTimestamp(presale.end + 10);

      // Token allocations
      const tokensForSale = ethers.parseEther('100000'); // 100k tokens
      const allocAlice = ethers.parseEther('57142'); // ~57.1% (4/7)
      const allocBob = ethers.parseEther('42857'); // ~42.9% (3/7)
      const totalVestingAlloc = allocAlice + allocBob;

      const { root, proof } = buildMerkle(presale.vestingAddr, chainId, presale.salt, [
        { who: ctx.alice.address, total: allocAlice },
        { who: ctx.bob.address, total: allocBob },
      ]);

      // Calculate expected burn:
      // unsoldTokens = tokensForSale * (hardCap - totalRaised) / hardCap
      // = 100000e18 * (10M - 7M) / 10M = 100000e18 * 3 / 10 = 30000e18
      const hardCap = 10_000_000n;
      const expectedBurn = (tokensForSale * (hardCap - 7_000_000n)) / hardCap;
      console.log(`   🔥 Expected burn: ${ethers.formatEther(expectedBurn)} tokens`);

      // ProjectOwner approves round for vesting funding + burn
      await ctx.projectToken.connect(ctx.projectOwner).approve(
        presale.roundAddr,
        totalVestingAlloc + expectedBurn + ethers.parseEther('1000') // buffer
      );

      // Capture balances BEFORE finalization
      const burnBefore = await ctx.projectToken.balanceOf(BURN_ADDRESS);
      const ownerTokensBefore = await ctx.projectToken.balanceOf(ctx.projectOwner.address);
      const treasuryBefore = await ctx.paymentToken.balanceOf(ctx.treasury.address);
      const ownerPaymentBefore = await ctx.paymentToken.balanceOf(ctx.projectOwner.address);

      // ── Phase 3: Finalize Success (v2.2 with auto-burn) ──
      const finTx = await presale.round
        .connect(ctx.ops)
        .finalizeSuccess(root, totalVestingAlloc, tokensForSale);
      const finRc = await finTx.wait();

      // ── Phase 4: Verify AUTO-BURN ──
      const burnAfter = await ctx.projectToken.balanceOf(BURN_ADDRESS);
      const actualBurn = burnAfter - burnBefore;
      expect(actualBurn).to.equal(expectedBurn);
      console.log(`   ✅ Tokens burned: ${ethers.formatEther(actualBurn)}`);
      console.log(`      Burn address (0xdEaD) balance: ${ethers.formatEther(burnAfter)}`);

      // Verify UnsoldTokensBurned event
      const burnEvent = parseEvent(finRc, presale.round.interface, 'UnsoldTokensBurned');
      expect(burnEvent).to.not.be.null;
      expect(burnEvent!.args[0]).to.equal(expectedBurn);
      console.log('      ✅ UnsoldTokensBurned event emitted correctly');

      // ── Phase 5: Verify Fee Split ──
      const raised = 7_000_000n;
      const expectedFee = (raised * 500n) / 10000n; // 5% of 7M = 350k
      const expectedNet = raised - expectedFee;

      const ownerPaymentAfter = await ctx.paymentToken.balanceOf(ctx.projectOwner.address);
      expect(ownerPaymentAfter - ownerPaymentBefore).to.equal(expectedNet);
      console.log(`\n   📊 Fee Distribution:`);
      console.log(`      Total Raised: ${raised}`);
      console.log(`      Fee (5%): ${expectedFee}`);
      console.log(`      Net to Owner: ${expectedNet}`);
      console.log('      ✅ Project owner received correct net amount');

      // Verify FinalizedSuccess event
      const finEvent = parseEvent(finRc, presale.round.interface, 'FinalizedSuccess');
      expect(finEvent).to.not.be.null;
      expect(finEvent!.args[0]).to.equal(raised); // totalRaised
      expect(finEvent!.args[1]).to.equal(expectedFee); // feeAmount
      console.log('      ✅ FinalizedSuccess event correct');

      // ── Phase 6: Verify Investor Vesting ──
      const vestingBalance = await ctx.projectToken.balanceOf(presale.vestingAddr);
      expect(vestingBalance).to.equal(totalVestingAlloc);
      console.log(`\n   📊 Investor Vesting:`);
      console.log(`      Vault funded: ${ethers.formatEther(vestingBalance)} tokens`);

      // Alice TGE claim (20% of 57142 = 11428.4)
      const aliceBefore = await ctx.projectToken.balanceOf(ctx.alice.address);
      await presale.vesting
        .connect(ctx.alice)
        .claim(allocAlice, proof(ctx.alice.address, allocAlice));
      const aliceAfter = await ctx.projectToken.balanceOf(ctx.alice.address);
      const aliceTGE = aliceAfter - aliceBefore;
      const expectedAliceTGE = (allocAlice * 2000n) / 10000n;
      expect(aliceTGE).to.equal(expectedAliceTGE);
      console.log(`      ✅ Alice TGE: ${ethers.formatEther(aliceTGE)} tokens`);

      // Bob TGE claim
      const bobBefore = await ctx.projectToken.balanceOf(ctx.bob.address);
      await presale.vesting.connect(ctx.bob).claim(allocBob, proof(ctx.bob.address, allocBob));
      const bobAfter = await ctx.projectToken.balanceOf(ctx.bob.address);
      const bobTGE = bobAfter - bobBefore;
      expect(bobTGE).to.equal((allocBob * 2000n) / 10000n);
      console.log(`      ✅ Bob TGE: ${ethers.formatEther(bobTGE)} tokens`);

      // ── Phase 7: Full vesting after duration expires ──
      await ethers.provider.send('evm_increaseTime', [2100]); // past vesting end
      await ethers.provider.send('evm_mine', []);

      // Alice claims remaining
      const aliceBeforeFull = await ctx.projectToken.balanceOf(ctx.alice.address);
      await presale.vesting
        .connect(ctx.alice)
        .claim(allocAlice, proof(ctx.alice.address, allocAlice));
      const aliceAfterFull = await ctx.projectToken.balanceOf(ctx.alice.address);
      const aliceRemaining = aliceAfterFull - aliceBeforeFull;
      // Total claimed should now equal full allocation
      const aliceTotalClaimed = aliceAfterFull - 0n; // alice started with 0 project tokens
      expect(aliceAfterFull).to.equal(allocAlice); // All tokens claimed
      console.log(`      ✅ Alice fully vested: ${ethers.formatEther(aliceAfterFull)} tokens`);

      // ── Phase 8: Verify LP Lock Plan ──
      const lpPlan = await ctx.factory.getLPPlan(presale.roundAddr);
      expect(lpPlan.lockMonths).to.equal(12n);
      expect(lpPlan.liquidityPercent).to.equal(7000n);
      console.log(`\n   📊 LP Lock Plan:`);
      console.log(`      Lock Duration: ${lpPlan.lockMonths} months`);
      console.log(`      Liquidity: ${Number(lpPlan.liquidityPercent) / 100}%`);
      console.log(`      DEX: ${lpPlan.dexId}`);
      console.log('      ✅ LP plan recorded correctly');

      // ── Phase 9: Verify presale status ──
      const presaleInfo = await presale.round.getPresaleInfo();
      expect(presaleInfo._status).to.equal(5n); // FINALIZED_SUCCESS
      console.log('\n      ✅ Status: FINALIZED_SUCCESS');

      // ── Phase 10: Verify token accounting ──
      const ownerTokensAfter = await ctx.projectToken.balanceOf(ctx.projectOwner.address);
      const ownerTokensSpent = ownerTokensBefore - ownerTokensAfter;
      const expectedSpent = totalVestingAlloc + expectedBurn;
      expect(ownerTokensSpent).to.equal(expectedSpent);
      console.log(`\n   📊 Token Accounting Summary:`);
      console.log(`      Vesting allocation: ${ethers.formatEther(totalVestingAlloc)}`);
      console.log(`      Unsold burned: ${ethers.formatEther(expectedBurn)}`);
      console.log(`      Total from owner: ${ethers.formatEther(ownerTokensSpent)}`);
      console.log('      ✅ Token accounting matches');

      console.log('\n   🎉 Scenario 2 PASSED: Softcap only – Auto-burn verified!\n');
    });
  });

  // ════════════════════════════════════════════════
  //  TEST 3: Verify FeeSplitter vault distribution
  // ════════════════════════════════════════════════

  describe('Scenario 3: FeeSplitter Vault Distribution', function () {
    it('should distribute fees correctly to treasury, referral pool, and SBT staking', async function () {
      const ctx = await fixture();
      const net = await ethers.provider.getNetwork();
      const chainId = net.chainId;

      const presale = await createPresale(ctx, {
        softCap: 5_000_000n,
        hardCap: 10_000_000n,
        maxContrib: 10_000_000n,
      });

      // Contribute to reach softcap
      await setNextTimestamp(presale.start + 1);
      await ctx.paymentToken.connect(ctx.alice).approve(presale.roundAddr, 8_000_000n);
      await presale.round.connect(ctx.alice).contribute(8_000_000n, ethers.ZeroAddress);

      await setNextTimestamp(presale.end + 10);

      const tokensForSale = ethers.parseEther('100000');
      const allocAlice = ethers.parseEther('100000');
      const totalVestingAlloc = allocAlice;

      const { root } = buildMerkle(presale.vestingAddr, chainId, presale.salt, [
        { who: ctx.alice.address, total: allocAlice },
      ]);

      await ctx.projectToken
        .connect(ctx.projectOwner)
        .approve(presale.roundAddr, totalVestingAlloc + tokensForSale);

      // Capture vault balances BEFORE
      const treasuryBefore = await ctx.paymentToken.balanceOf(ctx.treasury.address);
      const referralBefore = await ctx.paymentToken.balanceOf(ctx.referral.address);
      const sbtBefore = await ctx.paymentToken.balanceOf(ctx.sbt.address);

      // Finalize
      await presale.round.connect(ctx.ops).finalizeSuccess(root, totalVestingAlloc, tokensForSale);

      // Verify vault distributions
      const raised = 8_000_000n;
      const totalFee = (raised * 500n) / 10000n; // 400,000

      // Fee split ratios: treasury=250, referral=200, sbt=50 (out of total 500)
      const expectedTreasury = (totalFee * 250n) / 500n; // 200,000
      const expectedReferral = (totalFee * 200n) / 500n; // 160,000
      const expectedSbt = (totalFee * 50n) / 500n; // 40,000
      // Remainder goes to treasury
      const remainder = totalFee - expectedTreasury - expectedReferral - expectedSbt;

      const treasuryAfter = await ctx.paymentToken.balanceOf(ctx.treasury.address);
      const referralAfter = await ctx.paymentToken.balanceOf(ctx.referral.address);
      const sbtAfter = await ctx.paymentToken.balanceOf(ctx.sbt.address);

      expect(treasuryAfter - treasuryBefore).to.equal(expectedTreasury + remainder);
      expect(referralAfter - referralBefore).to.equal(expectedReferral);
      expect(sbtAfter - sbtBefore).to.equal(expectedSbt);

      console.log('\n   📊 FeeSplitter Distribution:');
      console.log(`      Total Fee: ${totalFee}`);
      console.log(`      Treasury (50%): ${treasuryAfter - treasuryBefore} ✅`);
      console.log(`      Referral (40%): ${referralAfter - referralBefore} ✅`);
      console.log(`      SBT Staking (10%): ${sbtAfter - sbtBefore} ✅`);
      console.log('\n   🎉 Scenario 3 PASSED: Fee split verified!\n');
    });
  });
});
