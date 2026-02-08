const { expect } = require('chai');
const { ethers } = require('hardhat');
const { MerkleTree } = require('merkletreejs');

// ──────────────────── Helpers ────────────────────

function parseEvent(rc, iface, name) {
  for (const log of rc.logs) {
    try {
      const p = iface.parseLog(log);
      if (p && p.name === name) return p;
    } catch {}
  }
  return null;
}

async function setNextTimestamp(ts) {
  await ethers.provider.send('evm_setNextBlockTimestamp', [ts]);
  await ethers.provider.send('evm_mine', []);
}

function buildLeaf(vestingAddr, chainId, salt, beneficiary, total) {
  const packed = ethers.solidityPacked(
    ['address', 'uint256', 'bytes32', 'address', 'uint256'],
    [vestingAddr, chainId, salt, beneficiary, total]
  );
  const h = ethers.keccak256(packed);
  return Buffer.from(h.slice(2), 'hex');
}

function buildMerkle(vestingAddr, chainId, salt, entries) {
  const leaves = entries.map((e) => buildLeaf(vestingAddr, chainId, salt, e.who, e.total));
  const hashFn = (data) => Buffer.from(ethers.keccak256(data).slice(2), 'hex');
  const tree = new MerkleTree(leaves, hashFn, { sortPairs: true });
  const root = '0x' + tree.getRoot().toString('hex');
  const proof = (who, total) =>
    tree
      .getProof(buildLeaf(vestingAddr, chainId, salt, who, total))
      .map((p) => '0x' + p.data.toString('hex'));
  return { root, proof };
}

const BURN_ADDRESS = '0x000000000000000000000000000000000000dEaD';

// ════════════════════════════════════════════════════════════════
//  FULL E2E PRESALE v2.2 – Mirrors Wizard UI Flow
//  Developer Submit → Escrow → Admin Deploy → Sale → Finalize
// ════════════════════════════════════════════════════════════════

describe('Presale E2E v2.2 – Full Wizard Flow with Escrow', function () {
  this.timeout(120_000);

  // ──────────────────── Common Fixture ────────────────────
  async function fixture() {
    const [admin, timelock, ops, projectOwner, alice, bob, carol, treasury, referral, sbt] =
      await ethers.getSigners();

    // Phase 0: Token Creation (simulates TokenFactory in wizard Step 0)
    console.log('\n   ── Phase 0: Token Creation ──');
    const ERC20Mock = await ethers.getContractFactory('ERC20Mock');
    const paymentToken = await ERC20Mock.deploy('USDC', 'USDC', 6);
    await paymentToken.waitForDeployment();
    const projectToken = await ERC20Mock.deploy('PRJ', 'PRJ', 18);
    await projectToken.waitForDeployment();

    const totalSupply = ethers.parseEther('1000000'); // 1M tokens
    await projectToken.mint(projectOwner.address, totalSupply);
    await paymentToken.mint(alice.address, 100_000_000_000n);
    await paymentToken.mint(bob.address, 100_000_000_000n);
    await paymentToken.mint(carol.address, 100_000_000_000n);
    console.log(`      ✅ Project token deployed: ${await projectToken.getAddress()}`);
    console.log(`      ✅ Developer minted ${ethers.formatEther(totalSupply)} tokens`);

    // Deploy infrastructure (FeeSplitter + Factory + EscrowVault)
    const FeeSplitter = await ethers.getContractFactory('FeeSplitter');
    const feeSplitter = await FeeSplitter.deploy(
      treasury.address,
      referral.address,
      sbt.address,
      admin.address
    );
    await feeSplitter.waitForDeployment();

    const Factory = await ethers.getContractFactory('PresaleFactory');
    const factory = await Factory.deploy(await feeSplitter.getAddress(), timelock.address);
    await factory.waitForDeployment();

    const EscrowVault = await ethers.getContractFactory('EscrowVault');
    const escrow = await EscrowVault.deploy();
    await escrow.waitForDeployment();

    // Grant admin roles
    await feeSplitter.grantRole(await feeSplitter.DEFAULT_ADMIN_ROLE(), await factory.getAddress());
    const FACTORY_ADMIN_ROLE = await factory.FACTORY_ADMIN_ROLE();
    await factory.grantRole(FACTORY_ADMIN_ROLE, ops.address);
    // Grant ADMIN_ROLE on escrow to ops (admin executor)
    const ESCROW_ADMIN_ROLE = await escrow.ADMIN_ROLE();
    await escrow.grantRole(ESCROW_ADMIN_ROLE, ops.address);

    console.log(`      ✅ EscrowVault deployed: ${await escrow.getAddress()}`);
    console.log(`      ✅ FeeSplitter deployed: ${await feeSplitter.getAddress()}`);
    console.log(`      ✅ PresaleFactory deployed: ${await factory.getAddress()}`);

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
      escrow,
      totalSupply,
    };
  }

  // ──────────────────── Helper: Escrow Deposit (Wizard Step 7) ────────────────────
  async function escrowDeposit(ctx, escrowAmount) {
    console.log('\n   ── Phase 1: Escrow Deposit (Developer Wizard Step 7) ──');
    const escrowAddr = await ctx.escrow.getAddress();
    const projectId = ethers.keccak256(
      ethers.solidityPacked(
        ['address', 'address', 'uint256'],
        [ctx.projectOwner.address, await ctx.projectToken.getAddress(), escrowAmount]
      )
    );

    // Developer approves escrow to pull tokens
    await ctx.projectToken.connect(ctx.projectOwner).approve(escrowAddr, escrowAmount);

    // Developer deposits tokens to escrow
    const depositTx = await ctx.escrow
      .connect(ctx.projectOwner)
      .deposit(projectId, await ctx.projectToken.getAddress(), escrowAmount);
    const depositRc = await depositTx.wait();

    // Verify escrow state
    const depositEvt = parseEvent(depositRc, ctx.escrow.interface, 'Deposited');
    expect(depositEvt).to.not.be.null;
    expect(await ctx.escrow.isPending(projectId)).to.be.true;
    const depositInfo = await ctx.escrow.getDeposit(projectId);
    expect(depositInfo.amount).to.equal(escrowAmount);
    expect(depositInfo.depositor).to.equal(ctx.projectOwner.address);
    expect(depositInfo.released).to.be.false;
    expect(depositInfo.refunded).to.be.false;

    console.log(`      ✅ Deposited event emitted (projectId: ${projectId.slice(0, 10)}...)`);
    console.log(`      ✅ Escrow holds ${ethers.formatEther(escrowAmount)} tokens`);
    console.log(`      ✅ isPending = true, released = false, refunded = false`);

    return { projectId };
  }

  // ──────────────────── Helper: Admin Deploy (Phases 2-3) ────────────────────
  async function adminDeployPresale(ctx, projectId, escrowAmount, overrides = {}) {
    console.log('\n   ── Phase 2: Admin Review & Approve (off-chain) ──');
    console.log('      ✅ Admin reviews project in Command Center...');
    console.log('      ✅ Admin approves project → status: APPROVED_TO_DEPLOY');

    console.log('\n   ── Phase 3: Admin Deploy (release → approve → createPresale) ──');

    // Step 3a: Admin releases tokens from escrow to ops (admin executor)
    const releaseTx = await ctx.escrow.connect(ctx.ops).release(projectId, ctx.ops.address);
    const releaseRc = await releaseTx.wait();
    const releaseEvt = parseEvent(releaseRc, ctx.escrow.interface, 'Released');
    expect(releaseEvt).to.not.be.null;
    expect(await ctx.escrow.isPending(projectId)).to.be.false;
    const depositAfter = await ctx.escrow.getDeposit(projectId);
    expect(depositAfter.released).to.be.true;

    // Verify tokens arrived at ops wallet
    const opsTokenBal = await ctx.projectToken.balanceOf(ctx.ops.address);
    expect(opsTokenBal >= escrowAmount).to.be.true;

    console.log(`      ✅ Escrow released → tokens transferred to admin executor`);
    console.log(`      ✅ isPending = false, released = true`);

    // Step 3b: Build presale params (mirrors wizard data)
    const now = (await ethers.provider.getBlock('latest')).timestamp;
    const start = now + 60;
    const end = start + 3600;

    const params = {
      projectToken: await ctx.projectToken.getAddress(),
      paymentToken: await ctx.paymentToken.getAddress(),
      softCap: overrides.softCap ?? 5_000_000n,
      hardCap: overrides.hardCap ?? 10_000_000n,
      minContribution: overrides.minContrib ?? 100_000n,
      maxContribution: overrides.maxContrib ?? 5_000_000n,
      startTime: start,
      endTime: end,
      projectOwner: ctx.projectOwner.address,
    };

    const vestingParams = {
      tgeUnlockBps: overrides.tgeUnlockBps ?? 2000n, // 20% TGE
      cliffDuration: overrides.cliffDuration ?? 0n,
      vestingDuration: overrides.vestingDuration ?? 2000n,
      scheduleSalt: ethers.ZeroHash,
    };

    const lpPlan = {
      lockMonths: overrides.lpLockMonths ?? 12n,
      dexId: ethers.keccak256(ethers.toUtf8Bytes('PANCAKESWAP_V2')),
      liquidityPercent: overrides.lpPercent ?? 7000n, // 70%
    };

    const complianceHash = ethers.keccak256(ethers.toUtf8Bytes('compliance'));

    // Step 3c: Deploy via factory
    const tx = await ctx.factory
      .connect(ctx.ops)
      .createPresale(params, vestingParams, lpPlan, complianceHash);
    const rc = await tx.wait();
    const evt = parseEvent(rc, ctx.factory.interface, 'PresaleCreated');
    expect(evt).to.not.be.null;

    const roundAddr = evt.args.round;
    const vestingAddr = evt.args.vesting;
    const salt = evt.args.scheduleSalt;

    const round = await ethers.getContractAt('PresaleRound', roundAddr);
    const vesting = await ethers.getContractAt('MerkleVesting', vestingAddr);

    // Grant ops ADMIN_ROLE on round (via timelock, as factory grants to timelock)
    const ADMIN_ROLE = ethers.id('ADMIN_ROLE');
    await round.connect(ctx.timelock).grantRole(ADMIN_ROLE, ctx.ops.address);

    console.log(`      ✅ PresaleRound deployed: ${roundAddr}`);
    console.log(`      ✅ MerkleVesting deployed: ${vestingAddr}`);
    console.log(
      `      ✅ LP Plan: ${lpPlan.lockMonths} months, ${
        Number(lpPlan.liquidityPercent) / 100
      }% liquidity`
    );

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

  // ════════════════════════════════════════════════════════════════
  //  SCENARIO 1: HARDCAP REACHED — Full wizard flow, no burn
  // ════════════════════════════════════════════════════════════════

  describe('Scenario 1: Hardcap Reached – Full Wizard Flow', function () {
    it('should complete: escrow → deploy → contribute → finalize → vesting → NO burn', async function () {
      const ctx = await fixture();
      const net = await ethers.provider.getNetwork();
      const chainId = net.chainId;

      const tokensForSale = ethers.parseEther('100000');
      const vestingTokens = ethers.parseEther('100000');
      const escrowAmount = tokensForSale + vestingTokens; // tokens developer deposits

      // ── Phase 1: Developer deposits tokens to escrow ──
      const { projectId } = await escrowDeposit(ctx, escrowAmount);

      // ── Phases 2-3: Admin deploy ──
      const presale = await adminDeployPresale(ctx, projectId, escrowAmount, {
        softCap: 5_000_000n,
        hardCap: 10_000_000n,
        maxContrib: 10_000_000n,
      });

      // ── Phase 4: Sale goes LIVE ──
      console.log('\n   ── Phase 4: Sale Goes Live ──');
      await setNextTimestamp(presale.start + 1);
      console.log('      ✅ Time advanced past startTime → ACTIVE');

      // ── Phase 5: User Contributions (reach hardcap exactly) ──
      console.log('\n   ── Phase 5: User Contributions ──');
      await ctx.paymentToken.connect(ctx.alice).approve(presale.roundAddr, 6_000_000n);
      await presale.round.connect(ctx.alice).contribute(6_000_000n, ethers.ZeroAddress);

      await ctx.paymentToken.connect(ctx.bob).approve(presale.roundAddr, 4_000_000n);
      await presale.round.connect(ctx.bob).contribute(4_000_000n, ethers.ZeroAddress);

      expect(await presale.round.totalRaised()).to.equal(10_000_000n);
      console.log('      ✅ Alice contributed: 6,000,000');
      console.log('      ✅ Bob contributed: 4,000,000');
      console.log('      ✅ Total raised: 10,000,000 (hardcap reached!)');

      // ── Phase 6: Sale Ends ──
      console.log('\n   ── Phase 6: Sale Ends ──');
      await setNextTimestamp(presale.end + 10);
      console.log('      ✅ Time advanced past endTime → ENDED');

      // ── Phase 7: Admin Finalize ──
      console.log('\n   ── Phase 7: Admin Finalize ──');
      const allocAlice = ethers.parseEther('60000');
      const allocBob = ethers.parseEther('40000');
      const totalVestingAlloc = allocAlice + allocBob;

      const { root, proof } = buildMerkle(presale.vestingAddr, chainId, presale.salt, [
        { who: ctx.alice.address, total: allocAlice },
        { who: ctx.bob.address, total: allocBob },
      ]);

      // ProjectOwner must approve PresaleRound to pull vesting tokens
      await ctx.projectToken
        .connect(ctx.projectOwner)
        .approve(presale.roundAddr, totalVestingAlloc + tokensForSale);

      const ownerPaymentBefore = await ctx.paymentToken.balanceOf(ctx.projectOwner.address);
      const burnBefore = await ctx.projectToken.balanceOf(BURN_ADDRESS);

      const finTx = await presale.round
        .connect(ctx.ops)
        .finalizeSuccess(root, totalVestingAlloc, tokensForSale);
      const finRc = await finTx.wait();

      // Verify fee split
      const totalFee = (10_000_000n * 500n) / 10000n; // 5% = 500,000
      const netAmount = 10_000_000n - totalFee;
      const ownerPaymentAfter = await ctx.paymentToken.balanceOf(ctx.projectOwner.address);
      expect(ownerPaymentAfter - ownerPaymentBefore).to.equal(netAmount);
      console.log(`      ✅ Developer received net payment: ${netAmount} USDC`);

      // Verify NO burn (hardcap met)
      const burnAfter = await ctx.projectToken.balanceOf(BURN_ADDRESS);
      expect(burnAfter - burnBefore).to.equal(0n);
      const burnEvt = parseEvent(finRc, presale.round.interface, 'UnsoldTokensBurned');
      expect(burnEvt).to.be.null;
      console.log('      ✅ No tokens burned (hardcap met)');

      // Verify vesting vault funded
      const vestingBal = await ctx.projectToken.balanceOf(presale.vestingAddr);
      expect(vestingBal).to.equal(totalVestingAlloc);
      console.log(`      ✅ Vesting vault funded: ${ethers.formatEther(vestingBal)} tokens`);

      // Verify status
      const presaleInfo = await presale.round.getPresaleInfo();
      expect(presaleInfo._status).to.equal(3n); // FINALIZED_SUCCESS
      console.log('      ✅ Status: FINALIZED_SUCCESS');

      // ── Phase 8: Investor TGE Claims ──
      console.log('\n   ── Phase 8: Investor TGE Claims ──');
      const aliceBefore = await ctx.projectToken.balanceOf(ctx.alice.address);
      await presale.vesting
        .connect(ctx.alice)
        .claim(allocAlice, proof(ctx.alice.address, allocAlice));
      const aliceAfter = await ctx.projectToken.balanceOf(ctx.alice.address);
      const aliceTGE = aliceAfter - aliceBefore;
      const expectedAliceTGE = (allocAlice * 2000n) / 10000n; // 20% TGE
      expect(aliceTGE >= expectedAliceTGE).to.be.true;
      expect(aliceTGE <= expectedAliceTGE + expectedAliceTGE / 100n).to.be.true;
      console.log(
        `      ✅ Alice TGE claim: ${ethers.formatEther(
          aliceTGE
        )} tokens (expected ≥${ethers.formatEther(expectedAliceTGE)})`
      );

      const bobBefore = await ctx.projectToken.balanceOf(ctx.bob.address);
      await presale.vesting.connect(ctx.bob).claim(allocBob, proof(ctx.bob.address, allocBob));
      const bobAfter = await ctx.projectToken.balanceOf(ctx.bob.address);
      const bobTGE = bobAfter - bobBefore;
      const expectedBobTGE = (allocBob * 2000n) / 10000n;
      expect(bobTGE >= expectedBobTGE).to.be.true;
      expect(bobTGE <= expectedBobTGE + expectedBobTGE / 100n).to.be.true;
      console.log(
        `      ✅ Bob TGE claim: ${ethers.formatEther(
          bobTGE
        )} tokens (expected ≥${ethers.formatEther(expectedBobTGE)})`
      );

      // ── Phase 9: Full Vesting Claims ──
      console.log('\n   ── Phase 9: Full Vesting Claims ──');
      const vestingInfo = await presale.vesting.getVestingInfo();
      const tge = Number(vestingInfo._tgeTimestamp);
      const cliff = Number(vestingInfo._cliffDuration);
      const dur = Number(vestingInfo._vestingDuration);
      await setNextTimestamp(tge + cliff + dur + 100);

      const aliceMid = await ctx.projectToken.balanceOf(ctx.alice.address);
      await presale.vesting
        .connect(ctx.alice)
        .claim(allocAlice, proof(ctx.alice.address, allocAlice));
      const aliceAfterVest = await ctx.projectToken.balanceOf(ctx.alice.address);
      expect(aliceAfterVest - aliceMid > 0n).to.be.true;
      console.log(
        `      ✅ Alice full vesting claim: ${ethers.formatEther(
          aliceAfterVest - aliceMid
        )} more tokens`
      );

      // ── Phase 10: Developer Payment Verification ──
      console.log('\n   ── Phase 10: Developer Payment Verification ──');
      const devPayment = ownerPaymentAfter - ownerPaymentBefore;
      expect(devPayment).to.equal(netAmount);
      console.log(`      ✅ Developer total payment: ${devPayment} USDC (95% of ${10_000_000n})`);

      // LP Lock Plan
      const lpPlan = await ctx.factory.roundToLPPlan(presale.roundAddr);
      expect(lpPlan.lockMonths).to.equal(12n);
      expect(lpPlan.liquidityPercent).to.equal(7000n);
      console.log('      ✅ LP Lock Plan: 12 months, 70% liquidity');

      console.log('\n   🎉 Scenario 1 PASSED: Full wizard flow – Hardcap reached!\n');
    });
  });

  // ════════════════════════════════════════════════════════════════
  //  SCENARIO 2: SOFTCAP ONLY — Auto-burn unsold tokens
  // ════════════════════════════════════════════════════════════════

  describe('Scenario 2: Softcap Only – Auto-Burn', function () {
    it('should complete: escrow → deploy → contribute → finalize → BURN unsold → vesting', async function () {
      const ctx = await fixture();
      const net = await ethers.provider.getNetwork();
      const chainId = net.chainId;

      const tokensForSale = ethers.parseEther('100000');
      const vestingTokens = ethers.parseEther('100000');
      const burnReserve = ethers.parseEther('30000'); // 30% unsold will burn
      const escrowAmount = tokensForSale + vestingTokens + burnReserve;

      // ── Phase 1: Developer deposits tokens to escrow ──
      const { projectId } = await escrowDeposit(ctx, escrowAmount);

      // ── Phases 2-3: Admin deploy (softcap scenario) ──
      const presale = await adminDeployPresale(ctx, projectId, escrowAmount, {
        softCap: 5_000_000n,
        hardCap: 10_000_000n,
        maxContrib: 10_000_000n,
      });

      // ── Phase 4: Sale goes LIVE ──
      console.log('\n   ── Phase 4: Sale Goes Live ──');
      await setNextTimestamp(presale.start + 1);
      console.log('      ✅ Time advanced past startTime → ACTIVE');

      // ── Phase 5: User Contributions (only 70% of hardcap) ──
      console.log('\n   ── Phase 5: User Contributions (70% of hardcap) ──');
      await ctx.paymentToken.connect(ctx.alice).approve(presale.roundAddr, 4_000_000n);
      await presale.round.connect(ctx.alice).contribute(4_000_000n, ethers.ZeroAddress);

      await ctx.paymentToken.connect(ctx.bob).approve(presale.roundAddr, 3_000_000n);
      await presale.round.connect(ctx.bob).contribute(3_000_000n, ethers.ZeroAddress);

      expect(await presale.round.totalRaised()).to.equal(7_000_000n);
      console.log('      ✅ Alice contributed: 4,000,000');
      console.log('      ✅ Bob contributed: 3,000,000');
      console.log('      ✅ Total raised: 7,000,000 (70% – softcap met, hardcap NOT reached)');

      // ── Phase 6: Sale Ends ──
      console.log('\n   ── Phase 6: Sale Ends ──');
      await setNextTimestamp(presale.end + 10);
      console.log('      ✅ Time advanced past endTime → ENDED');

      // ── Phase 7: Admin Finalize (with auto-burn) ──
      console.log('\n   ── Phase 7: Admin Finalize (Auto-Burn) ──');

      // Proportional allocation based on contributions
      const allocAlice = (tokensForSale * 4_000_000n) / 7_000_000n;
      const allocBob = (tokensForSale * 3_000_000n) / 7_000_000n;
      const totalVestingAlloc = allocAlice + allocBob;

      const { root, proof } = buildMerkle(presale.vestingAddr, chainId, presale.salt, [
        { who: ctx.alice.address, total: allocAlice },
        { who: ctx.bob.address, total: allocBob },
      ]);

      // ProjectOwner approves for vesting + potential burn
      await ctx.projectToken
        .connect(ctx.projectOwner)
        .approve(presale.roundAddr, totalVestingAlloc + tokensForSale);

      const burnBefore = await ctx.projectToken.balanceOf(BURN_ADDRESS);
      const ownerPaymentBefore = await ctx.paymentToken.balanceOf(ctx.projectOwner.address);

      const finTx = await presale.round
        .connect(ctx.ops)
        .finalizeSuccess(root, totalVestingAlloc, tokensForSale);
      const finRc = await finTx.wait();

      // Verify AUTO-BURN
      const expectedBurn = (tokensForSale * (10_000_000n - 7_000_000n)) / 10_000_000n;
      const burnAfter = await ctx.projectToken.balanceOf(BURN_ADDRESS);
      expect(burnAfter - burnBefore).to.equal(expectedBurn);
      console.log(`      ✅ Tokens burned: ${ethers.formatEther(expectedBurn)} (30% unsold)`);

      const burnEvt = parseEvent(finRc, presale.round.interface, 'UnsoldTokensBurned');
      expect(burnEvt).to.not.be.null;
      expect(burnEvt.args.amount).to.equal(expectedBurn);
      console.log('      ✅ UnsoldTokensBurned event emitted correctly');

      // Verify fee split
      const totalFee = (7_000_000n * 500n) / 10000n;
      const netAmount = 7_000_000n - totalFee;
      const ownerPaymentAfter = await ctx.paymentToken.balanceOf(ctx.projectOwner.address);
      expect(ownerPaymentAfter - ownerPaymentBefore).to.equal(netAmount);
      console.log(`      ✅ Developer received net payment: ${netAmount} USDC`);

      // Verify finalized
      const finEvt = parseEvent(finRc, presale.round.interface, 'FinalizedSuccess');
      expect(finEvt).to.not.be.null;
      console.log('      ✅ FinalizedSuccess event emitted');

      const presaleInfo = await presale.round.getPresaleInfo();
      expect(presaleInfo._status).to.equal(3n); // FINALIZED_SUCCESS

      // ── Phase 8: Investor TGE Claims ──
      console.log('\n   ── Phase 8: Investor TGE Claims ──');
      const aliceBefore = await ctx.projectToken.balanceOf(ctx.alice.address);
      await presale.vesting
        .connect(ctx.alice)
        .claim(allocAlice, proof(ctx.alice.address, allocAlice));
      const aliceAfter = await ctx.projectToken.balanceOf(ctx.alice.address);
      const aliceTGE = aliceAfter - aliceBefore;
      const expectedAliceTGE = (allocAlice * 2000n) / 10000n;
      expect(aliceTGE >= expectedAliceTGE).to.be.true;
      expect(aliceTGE <= expectedAliceTGE + expectedAliceTGE / 100n).to.be.true;
      console.log(`      ✅ Alice TGE: ${ethers.formatEther(aliceTGE)} tokens`);

      const bobBefore = await ctx.projectToken.balanceOf(ctx.bob.address);
      await presale.vesting.connect(ctx.bob).claim(allocBob, proof(ctx.bob.address, allocBob));
      const bobAfter = await ctx.projectToken.balanceOf(ctx.bob.address);
      const bobTGE = bobAfter - bobBefore;
      const expectedBobTGE = (allocBob * 2000n) / 10000n;
      expect(bobTGE >= expectedBobTGE).to.be.true;
      expect(bobTGE <= expectedBobTGE + expectedBobTGE / 100n).to.be.true;
      console.log(`      ✅ Bob TGE: ${ethers.formatEther(bobTGE)} tokens`);

      // ── Phase 9: Full Vesting Claims ──
      console.log('\n   ── Phase 9: Full Vesting Claims ──');
      const vestingInfo = await presale.vesting.getVestingInfo();
      const tge = Number(vestingInfo._tgeTimestamp);
      const cliff = Number(vestingInfo._cliffDuration);
      const dur = Number(vestingInfo._vestingDuration);
      await setNextTimestamp(tge + cliff + dur + 100);

      const aliceFull = await ctx.projectToken.balanceOf(ctx.alice.address);
      await presale.vesting
        .connect(ctx.alice)
        .claim(allocAlice, proof(ctx.alice.address, allocAlice));
      const aliceAfterFull = await ctx.projectToken.balanceOf(ctx.alice.address);
      expect(aliceAfterFull - aliceFull > 0n).to.be.true;
      console.log(
        `      ✅ Alice fully vested: ${ethers.formatEther(aliceAfterFull)} tokens total`
      );

      // ── Phase 10: Token Accounting ──
      console.log('\n   ── Phase 10: Token Accounting ──');
      const lpPlan = await ctx.factory.roundToLPPlan(presale.roundAddr);
      expect(lpPlan.lockMonths).to.equal(12n);
      expect(lpPlan.liquidityPercent).to.equal(7000n);
      console.log(
        `      ✅ Vesting funded: ${ethers.formatEther(
          totalVestingAlloc
        )}, Burn: ${ethers.formatEther(expectedBurn)}`
      );
      console.log('      ✅ LP plan recorded correctly');

      console.log(
        '\n   🎉 Scenario 2 PASSED: Full wizard flow – Softcap only, auto-burn verified!\n'
      );
    });
  });

  // ════════════════════════════════════════════════════════════════
  //  SCENARIO 3: FeeSplitter Vault Distribution
  // ════════════════════════════════════════════════════════════════

  describe('Scenario 3: FeeSplitter Vault Distribution', function () {
    it('should distribute fees correctly to treasury, referral pool, and SBT staking', async function () {
      const ctx = await fixture();

      const escrowAmount = ethers.parseEther('160000'); // tokens for vesting + sale
      const { projectId } = await escrowDeposit(ctx, escrowAmount);

      const presale = await adminDeployPresale(ctx, projectId, escrowAmount, {
        softCap: 2_000_000n,
        hardCap: 8_000_000n,
        maxContrib: 8_000_000n,
      });

      // Contribute 8M to reach hardcap
      await setNextTimestamp(presale.start + 1);
      await ctx.paymentToken.connect(ctx.alice).approve(presale.roundAddr, 8_000_000n);
      await presale.round.connect(ctx.alice).contribute(8_000_000n, ethers.ZeroAddress);

      // End + finalize
      await setNextTimestamp(presale.end + 10);

      const tokensForSale = ethers.parseEther('80000');
      const allocAlice = ethers.parseEther('80000');

      const net = await ethers.provider.getNetwork();
      const { root } = buildMerkle(presale.vestingAddr, net.chainId, presale.salt, [
        { who: ctx.alice.address, total: allocAlice },
      ]);

      await ctx.projectToken
        .connect(ctx.projectOwner)
        .approve(presale.roundAddr, allocAlice + tokensForSale);
      await presale.round.connect(ctx.ops).finalizeSuccess(root, allocAlice, tokensForSale);

      // Verify fee distribution (5% of 8M = 400,000)
      const totalFee = (8_000_000n * 500n) / 10000n;
      const treasuryBal = await ctx.paymentToken.balanceOf(ctx.treasury.address);
      const referralBal = await ctx.paymentToken.balanceOf(ctx.referral.address);
      const sbtBal = await ctx.paymentToken.balanceOf(ctx.sbt.address);

      const expectedTreasury = (totalFee * 5000n) / 10000n; // 50%
      const expectedReferral = (totalFee * 4000n) / 10000n; // 40%
      const expectedSBT = (totalFee * 1000n) / 10000n; // 10%

      expect(treasuryBal).to.equal(expectedTreasury);
      expect(referralBal).to.equal(expectedReferral);
      expect(sbtBal).to.equal(expectedSBT);

      console.log(
        `      ✅ Treasury: ${treasuryBal} (${Number((expectedTreasury * 100n) / totalFee)}%)`
      );
      console.log(
        `      ✅ Referral: ${referralBal} (${Number((expectedReferral * 100n) / totalFee)}%)`
      );
      console.log(`      ✅ SBT Staking: ${sbtBal} (${Number((expectedSBT * 100n) / totalFee)}%)`);
      console.log('\n   🎉 Scenario 3 PASSED: Fee split verified!\n');
    });
  });

  // ════════════════════════════════════════════════════════════════
  //  SCENARIO 4: Failed Presale — Escrow Refund
  // ════════════════════════════════════════════════════════════════

  describe('Scenario 4: Failed Presale – Escrow Refund', function () {
    it('should: escrow → deploy → contribute below softcap → finalizeFailed → user refund', async function () {
      const ctx = await fixture();
      const tokensForSale = ethers.parseEther('100000');
      const escrowAmount = tokensForSale;

      // Use a different projectId for this scenario
      const projectId = ethers.keccak256(
        ethers.solidityPacked(
          ['address', 'address', 'uint256'],
          [ctx.projectOwner.address, await ctx.projectToken.getAddress(), escrowAmount]
        )
      );

      // ── Phase 1: Escrow deposit ──
      console.log('\n   ── Phase 1: Escrow Deposit ──');
      const escrowAddr = await ctx.escrow.getAddress();
      await ctx.projectToken.connect(ctx.projectOwner).approve(escrowAddr, escrowAmount);
      await ctx.escrow
        .connect(ctx.projectOwner)
        .deposit(projectId, await ctx.projectToken.getAddress(), escrowAmount);
      console.log(
        `      ✅ Developer deposited ${ethers.formatEther(escrowAmount)} tokens to escrow`
      );

      // ── Phases 2-3: Admin deploy ──
      const presale = await adminDeployPresale(ctx, projectId, escrowAmount, {
        softCap: 5_000_000n,
        hardCap: 10_000_000n,
        maxContrib: 10_000_000n,
      });

      // ── Phase 4-5: Sale with insufficient contributions ──
      console.log('\n   ── Phase 4-5: Sale with Insufficient Contributions ──');
      await setNextTimestamp(presale.start + 1);

      // Alice contributes below softcap
      await ctx.paymentToken.connect(ctx.alice).approve(presale.roundAddr, 2_000_000n);
      await presale.round.connect(ctx.alice).contribute(2_000_000n, ethers.ZeroAddress);
      console.log('      ✅ Alice contributed: 2,000,000 (below 5M softcap)');

      expect(await presale.round.totalRaised()).to.equal(2_000_000n);

      // ── Phase 6: Sale Ends ──
      console.log('\n   ── Phase 6: Sale Ends ──');
      await setNextTimestamp(presale.end + 10);

      // ── Phase 7: Admin Finalize as FAILED ──
      console.log('\n   ── Phase 7: Admin Finalize FAILED ──');
      const failTx = await presale.round.connect(ctx.ops).finalizeFailed('Softcap not reached');
      const failRc = await failTx.wait();

      const failEvt = parseEvent(failRc, presale.round.interface, 'FinalizedFailed');
      expect(failEvt).to.not.be.null;
      expect(failEvt.args.reason).to.equal('Softcap not reached');

      const presaleInfo = await presale.round.getPresaleInfo();
      expect(presaleInfo._status).to.equal(4n); // FINALIZED_FAILED
      console.log('      ✅ Status: FINALIZED_FAILED');
      console.log('      ✅ FinalizedFailed event emitted');

      // ── Phase 8: User Refund ──
      console.log('\n   ── Phase 8: User Refund ──');
      const alicePaymentBefore = await ctx.paymentToken.balanceOf(ctx.alice.address);
      await presale.round.connect(ctx.alice).claimRefund();
      const alicePaymentAfter = await ctx.paymentToken.balanceOf(ctx.alice.address);
      expect(alicePaymentAfter - alicePaymentBefore).to.equal(2_000_000n);
      console.log('      ✅ Alice refunded: 2,000,000 USDC (100%, no fee deduction)');

      // Verify contribution zeroed
      const contribInfo = await presale.round.getContributionInfo(ctx.alice.address);
      expect(contribInfo.contribution).to.equal(0n);
      console.log('      ✅ Alice contribution record zeroed');

      console.log('\n   🎉 Scenario 4 PASSED: Failed presale – full refund verified!\n');
    });
  });
});
