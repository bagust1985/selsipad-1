const { expect } = require('chai');
const { ethers, network } = require('hardhat');
const { MerkleTree } = require('merkletreejs');

// Use ethers keccak256 as hash function
function keccak256Fn(data) {
  const hex = ethers.keccak256(data);
  return Buffer.from(hex.slice(2), 'hex');
}

// ─── Inlined helpers ───

async function nowTs() {
  const block = await network.provider.send('eth_getBlockByNumber', ['latest', false]);
  return parseInt(block.timestamp, 16);
}

async function setNextTimestamp(ts) {
  await network.provider.send('evm_setNextBlockTimestamp', [ts]);
  await network.provider.send('evm_mine');
}

function leafFor(vestingAddress, chainId, scheduleSalt, beneficiary, totalAllocation) {
  const packed = ethers.solidityPacked(
    ['address', 'uint256', 'bytes32', 'address', 'uint256'],
    [vestingAddress, chainId, scheduleSalt, beneficiary, totalAllocation]
  );
  const hash = ethers.keccak256(packed);
  return Buffer.from(hash.slice(2), 'hex');
}

function buildMerkle(vestingAddress, chainId, scheduleSalt, entries) {
  const leaves = entries.map((e) =>
    leafFor(vestingAddress, chainId, scheduleSalt, e.beneficiary, e.totalAllocation)
  );
  const tree = new MerkleTree(leaves, keccak256Fn, { sortPairs: true });
  const root = '0x' + tree.getRoot().toString('hex');

  function proof(beneficiary, totalAllocation) {
    const leaf = leafFor(vestingAddress, chainId, scheduleSalt, beneficiary, totalAllocation);
    return tree.getProof(leaf).map((p) => '0x' + p.data.toString('hex'));
  }

  return { tree, root, proof };
}

// ═══════════════════════════════════════════════════════════════
describe('PresaleRound – Escrow Finalization (v2.3)', function () {
  async function deployFixture() {
    const [admin, projectOwner, alice, bob, treasury, referral, sbt] = await ethers.getSigners();

    const ERC20Mock = await ethers.getContractFactory('ERC20Mock');
    const projectToken = await ERC20Mock.deploy('KopiToken', 'KOPI', 18);
    await projectToken.waitForDeployment();
    await projectToken.mint(projectOwner.address, ethers.parseUnits('1000000', 18));

    const EscrowVault = await ethers.getContractFactory('EscrowVault');
    const escrow = await EscrowVault.deploy();
    await escrow.waitForDeployment();

    const FeeSplitter = await ethers.getContractFactory('FeeSplitter');
    const feeSplitter = await FeeSplitter.deploy(
      treasury.address,
      referral.address,
      sbt.address,
      admin.address
    );
    await feeSplitter.waitForDeployment();

    const salt = ethers.id('presale-escrow-test-1');
    const MerkleVesting = await ethers.getContractFactory('MerkleVesting');
    const vestingVault = await MerkleVesting.deploy(
      await projectToken.getAddress(),
      1000n,
      0n,
      180n * 24n * 3600n,
      salt,
      admin.address
    );
    await vestingVault.waitForDeployment();

    const t = await nowTs();
    const start = t + 60;
    const end = start + 3600;

    const PresaleRound = await ethers.getContractFactory('PresaleRound');
    const round = await PresaleRound.deploy(
      await projectToken.getAddress(),
      ethers.ZeroAddress,
      ethers.parseEther('1'), // softCap
      ethers.parseEther('5'), // hardCap
      ethers.parseEther('0.1'), // min
      ethers.parseEther('3'), // max
      start,
      end,
      await feeSplitter.getAddress(),
      await vestingVault.getAddress(),
      projectOwner.address,
      admin.address
    );
    await round.waitForDeployment();

    await feeSplitter.connect(admin).grantPresaleRole(await round.getAddress());
    const ADMIN_ROLE = ethers.id('ADMIN_ROLE');
    await vestingVault.connect(admin).grantRole(ADMIN_ROLE, await round.getAddress());
    await round.connect(admin).setFeeConfig({
      totalBps: 500,
      treasuryBps: 250,
      referralPoolBps: 200,
      sbtStakingBps: 50,
    });

    return {
      admin,
      projectOwner,
      alice,
      bob,
      treasury,
      referral,
      sbt,
      projectToken,
      escrow,
      feeSplitter,
      vestingVault,
      round,
      start,
      end,
      salt,
    };
  }

  async function setupForFinalization(fix) {
    const {
      admin,
      projectOwner,
      alice,
      bob,
      projectToken,
      escrow,
      round,
      start,
      end,
      salt,
      vestingVault,
    } = fix;

    const tokensForSale = ethers.parseUnits('200000', 18);
    const projectId = ethers.id('test-project-1');

    await projectToken.connect(projectOwner).approve(await escrow.getAddress(), tokensForSale);
    await escrow
      .connect(projectOwner)
      .deposit(projectId, await projectToken.getAddress(), tokensForSale);

    await setNextTimestamp(start + 1);
    const aliceAmt = ethers.parseEther('1.5');
    const bobAmt = ethers.parseEther('1');
    await round.connect(alice).contribute(aliceAmt, ethers.ZeroAddress, { value: aliceAmt });
    await round.connect(bob).contribute(bobAmt, ethers.ZeroAddress, { value: bobAmt });

    await setNextTimestamp(end + 10);

    const net = await ethers.provider.getNetwork();
    const aliceAlloc = ethers.parseUnits('120000', 18);
    const bobAlloc = ethers.parseUnits('80000', 18);
    const totalVestingAllocation = aliceAlloc + bobAlloc;

    const { root, proof } = buildMerkle(await vestingVault.getAddress(), net.chainId, salt, [
      { beneficiary: alice.address, totalAllocation: aliceAlloc },
      { beneficiary: bob.address, totalAllocation: bobAlloc },
    ]);

    return { projectId, tokensForSale, totalVestingAllocation, root, proof, aliceAlloc, bobAlloc };
  }

  // ══ TEST 1: Happy path ══
  it('should finalize via escrow (happy path)', async function () {
    const fix = await deployFixture();
    const { admin, projectOwner, escrow, projectToken, round, vestingVault } = fix;
    const setup = await setupForFinalization(fix);

    await escrow.connect(admin).release(setup.projectId, await round.getAddress());
    expect(await projectToken.balanceOf(await round.getAddress())).to.equal(setup.tokensForSale);

    const ownerBefore = await ethers.provider.getBalance(projectOwner.address);
    const roundBnb = await ethers.provider.getBalance(await round.getAddress());

    const tx = await round
      .connect(admin)
      .finalizeSuccessEscrow(setup.root, setup.totalVestingAllocation, 0n);

    // Status = FINALIZED_SUCCESS (3)
    expect(await round.status()).to.equal(3n);

    // Vesting funded
    const vaultBal = await projectToken.balanceOf(await vestingVault.getAddress());
    expect(vaultBal >= setup.totalVestingAllocation).to.be.true;

    // Merkle root set
    expect(await vestingVault.merkleRoot()).to.equal(setup.root);

    // Round BNB drained
    expect(await ethers.provider.getBalance(await round.getAddress())).to.equal(0n);

    // Owner got net (95% of 2.5 BNB)
    const expectedFee = (roundBnb * 500n) / 10000n;
    const expectedNet = roundBnb - expectedFee;
    const ownerAfter = await ethers.provider.getBalance(projectOwner.address);
    expect(ownerAfter - ownerBefore).to.equal(expectedNet);

    // Flags
    expect(await round.bnbDistributed()).to.be.true;
  });

  // ══ TEST 2: Idempotent — vesting already funded ══
  it('should skip vesting topup when vault already funded', async function () {
    const fix = await deployFixture();
    const { admin, projectOwner, escrow, projectToken, round, vestingVault } = fix;
    const setup = await setupForFinalization(fix);

    await escrow.connect(admin).release(setup.projectId, await round.getAddress());

    // Manually fund vesting
    await projectToken
      .connect(projectOwner)
      .transfer(await vestingVault.getAddress(), setup.totalVestingAllocation);
    const vaultBefore = await projectToken.balanceOf(await vestingVault.getAddress());
    expect(vaultBefore >= setup.totalVestingAllocation).to.be.true;

    await round.connect(admin).finalizeSuccessEscrow(setup.root, setup.totalVestingAllocation, 0n);

    // Vault not double-funded
    expect(await projectToken.balanceOf(await vestingVault.getAddress())).to.equal(vaultBefore);
    expect(await round.status()).to.equal(3n);
  });

  // ══ TEST 3: Idempotent — merkle root already set ══
  it('should skip setMerkleRoot when already set', async function () {
    const fix = await deployFixture();
    const { admin, projectOwner, escrow, projectToken, round, vestingVault } = fix;
    const setup = await setupForFinalization(fix);

    await escrow.connect(admin).release(setup.projectId, await round.getAddress());

    // Manually fund vesting AND set merkle root
    await projectToken
      .connect(projectOwner)
      .transfer(await vestingVault.getAddress(), setup.totalVestingAllocation);
    await vestingVault.connect(admin).setMerkleRoot(setup.root, setup.totalVestingAllocation);
    expect(await vestingVault.merkleRoot()).to.equal(setup.root);

    // Finalize should NOT revert (skips setMerkleRoot)
    await round.connect(admin).finalizeSuccessEscrow(setup.root, setup.totalVestingAllocation, 0n);
    expect(await round.status()).to.equal(3n);
  });

  // ══ TEST 4: Revert if not ended ══
  it('should revert if presale not ended', async function () {
    const fix = await deployFixture();
    const { admin, alice, escrow, projectToken, projectOwner, round, start } = fix;

    const tokensForSale = ethers.parseUnits('200000', 18);
    const projectId = ethers.id('test-not-ended');
    await projectToken.connect(projectOwner).approve(await escrow.getAddress(), tokensForSale);
    await escrow
      .connect(projectOwner)
      .deposit(projectId, await projectToken.getAddress(), tokensForSale);
    await escrow.connect(admin).release(projectId, await round.getAddress());

    await setNextTimestamp(start + 1);
    const amt = ethers.parseEther('2');
    await round.connect(alice).contribute(amt, ethers.ZeroAddress, { value: amt });

    // Should fail — still ACTIVE
    let failed = false;
    try {
      await round.connect(admin).finalizeSuccessEscrow(ethers.id('dummy'), tokensForSale, 0n);
    } catch (err) {
      failed = true;
      expect(err.message).to.include('InvalidStatus');
    }
    expect(failed).to.be.true;
  });

  // ══ TEST 5: Revert if insufficient tokens ══
  it('should revert if round has insufficient tokens', async function () {
    const fix = await deployFixture();
    const {
      admin,
      alice,
      bob,
      projectToken,
      projectOwner,
      escrow,
      round,
      start,
      end,
      salt,
      vestingVault,
    } = fix;

    // Only deposit 100k (need 200k)
    const tokensDeposited = ethers.parseUnits('100000', 18);
    const projectId = ethers.id('test-insufficient');
    await projectToken.connect(projectOwner).approve(await escrow.getAddress(), tokensDeposited);
    await escrow
      .connect(projectOwner)
      .deposit(projectId, await projectToken.getAddress(), tokensDeposited);
    await escrow.connect(admin).release(projectId, await round.getAddress());

    await setNextTimestamp(start + 1);
    const a = ethers.parseEther('1.5');
    const b = ethers.parseEther('1');
    await round.connect(alice).contribute(a, ethers.ZeroAddress, { value: a });
    await round.connect(bob).contribute(b, ethers.ZeroAddress, { value: b });
    await setNextTimestamp(end + 10);

    const totalVesting = ethers.parseUnits('200000', 18);
    const net = await ethers.provider.getNetwork();
    const { root } = buildMerkle(await vestingVault.getAddress(), net.chainId, salt, [
      { beneficiary: alice.address, totalAllocation: ethers.parseUnits('120000', 18) },
      { beneficiary: bob.address, totalAllocation: ethers.parseUnits('80000', 18) },
    ]);

    let failed = false;
    try {
      await round.connect(admin).finalizeSuccessEscrow(root, totalVesting, 0n);
    } catch (err) {
      failed = true;
      expect(err.message).to.include('InsufficientTokenBalance');
    }
    expect(failed).to.be.true;
  });

  // ══ TEST 6: Double finalize reverts ══
  it('should revert on double finalize (AlreadyFinalized)', async function () {
    const fix = await deployFixture();
    const { admin, escrow, round } = fix;
    const setup = await setupForFinalization(fix);

    await escrow.connect(admin).release(setup.projectId, await round.getAddress());
    await round.connect(admin).finalizeSuccessEscrow(setup.root, setup.totalVestingAllocation, 0n);

    let failed = false;
    try {
      await round
        .connect(admin)
        .finalizeSuccessEscrow(setup.root, setup.totalVestingAllocation, 0n);
    } catch (err) {
      failed = true;
      expect(err.message).to.include('AlreadyFinalized');
    }
    expect(failed).to.be.true;
  });

  // ══ TEST 7: Legacy finalizeSuccess reverts ══
  it('legacy finalizeSuccess reverts (no approval)', async function () {
    const fix = await deployFixture();
    const { admin, round } = fix;
    const setup = await setupForFinalization(fix);

    let failed = false;
    try {
      await round
        .connect(admin)
        .finalizeSuccess(setup.root, setup.totalVestingAllocation, setup.tokensForSale);
    } catch {
      failed = true;
    }
    expect(failed).to.be.true;
  });

  // ══ TEST 8: Unsold token burn ══
  it('should burn unsold tokens and set flag', async function () {
    const fix = await deployFixture();
    const {
      admin,
      projectOwner,
      alice,
      bob,
      escrow,
      projectToken,
      round,
      start,
      end,
      salt,
      vestingVault,
    } = fix;

    // Need 200k vesting + 50k burn = 250k tokens total
    const tokensForSale = ethers.parseUnits('250000', 18);
    const projectId = ethers.id('test-burn');
    await projectToken.connect(projectOwner).approve(await escrow.getAddress(), tokensForSale);
    await escrow
      .connect(projectOwner)
      .deposit(projectId, await projectToken.getAddress(), tokensForSale);
    await escrow.connect(admin).release(projectId, await round.getAddress());

    // Contribute
    await setNextTimestamp(start + 1);
    const aliceAmt = ethers.parseEther('1.5');
    const bobAmt = ethers.parseEther('1');
    await round.connect(alice).contribute(aliceAmt, ethers.ZeroAddress, { value: aliceAmt });
    await round.connect(bob).contribute(bobAmt, ethers.ZeroAddress, { value: bobAmt });
    await setNextTimestamp(end + 10);

    // Build merkle
    const net = await ethers.provider.getNetwork();
    const aliceAlloc = ethers.parseUnits('120000', 18);
    const bobAlloc = ethers.parseUnits('80000', 18);
    const totalVesting = aliceAlloc + bobAlloc;
    const { root } = buildMerkle(await vestingVault.getAddress(), net.chainId, salt, [
      { beneficiary: alice.address, totalAllocation: aliceAlloc },
      { beneficiary: bob.address, totalAllocation: bobAlloc },
    ]);

    const unsoldToBurn = ethers.parseUnits('50000', 18);
    const burnAddr = '0x000000000000000000000000000000000000dEaD';
    const burnBefore = await projectToken.balanceOf(burnAddr);

    await round.connect(admin).finalizeSuccessEscrow(root, totalVesting, unsoldToBurn);

    const burnAfter = await projectToken.balanceOf(burnAddr);
    expect(burnAfter - burnBefore).to.equal(unsoldToBurn);
    expect(await round.burnedAmount()).to.equal(unsoldToBurn);
    expect(await round.status()).to.equal(3n);
  });
});
