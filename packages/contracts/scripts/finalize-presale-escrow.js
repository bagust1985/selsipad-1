/**
 * finalize-presale-escrow.js
 *
 * Two-step escrow finalization script:
 *   1. Release tokens from EscrowVault → PresaleRound
 *   2. Call PresaleRound.finalizeSuccessEscrow()
 *
 * Usage:
 *   npx hardhat run scripts/finalize-presale-escrow.js --network bscTestnet
 *
 * Environment variables (set in .env):
 *   ROUND_ADDRESS    – PresaleRound contract address
 *   ESCROW_ADDRESS   – EscrowVault contract address
 *   PROJECT_ID       – bytes32 project ID used when depositing to escrow
 *   MERKLE_ROOT      – bytes32 Merkle root for vesting claims
 *   VESTING_ALLOC    – Total vesting allocation in wei (e.g. "200000000000000000000000")
 *   UNSOLD_BURN      – Unsold tokens to burn in wei (default: "0")
 */

const { ethers } = require('hardhat');
require('dotenv').config();

async function main() {
  // ── Config ──────────────────────────────
  const ROUND_ADDRESS = process.env.ROUND_ADDRESS;
  const ESCROW_ADDRESS = process.env.ESCROW_ADDRESS;
  const PROJECT_ID = process.env.PROJECT_ID;
  const MERKLE_ROOT = process.env.MERKLE_ROOT;
  const VESTING_ALLOC = process.env.VESTING_ALLOC;
  const UNSOLD_BURN = process.env.UNSOLD_BURN || '0';

  // Validate
  if (!ROUND_ADDRESS || !ESCROW_ADDRESS || !PROJECT_ID || !MERKLE_ROOT || !VESTING_ALLOC) {
    console.error(
      '❌ Missing env vars. Required: ROUND_ADDRESS, ESCROW_ADDRESS, PROJECT_ID, MERKLE_ROOT, VESTING_ALLOC'
    );
    process.exit(1);
  }

  const [deployer] = await ethers.getSigners();
  console.log('═══════════════════════════════════════════');
  console.log('   Escrow Finalization Script');
  console.log('═══════════════════════════════════════════');
  console.log(`Deployer:     ${deployer.address}`);
  console.log(`Round:        ${ROUND_ADDRESS}`);
  console.log(`Escrow:       ${ESCROW_ADDRESS}`);
  console.log(`Project ID:   ${PROJECT_ID}`);
  console.log(`Merkle Root:  ${MERKLE_ROOT}`);
  console.log(`Vesting:      ${ethers.formatUnits(VESTING_ALLOC, 18)} tokens`);
  console.log(`Unsold Burn:  ${ethers.formatUnits(UNSOLD_BURN, 18)} tokens`);
  console.log('───────────────────────────────────────────');

  // ── Attach contracts ──
  const escrow = await ethers.getContractAt('EscrowVault', ESCROW_ADDRESS);
  const round = await ethers.getContractAt('PresaleRound', ROUND_ADDRESS);
  const projectToken = await ethers.getContractAt('IERC20', await round.projectToken());

  // ── Pre-flight checks ──
  const currentStatus = await round.status();
  console.log(`\n📊 Round status: ${currentStatus}`);

  if (currentStatus === 3n) {
    console.log('⚠️  Round already FINALIZED_SUCCESS. Checking if BNB was distributed...');
    const bnbDist = await round.bnbDistributed();
    if (bnbDist) {
      console.log('✅ Already fully finalized. Nothing to do.');
      return;
    }
    console.log('🔁 BNB not distributed yet — resuming finalization...');
  }

  // ── Step 1: Release from Escrow ──
  console.log('\n── Step 1: Release from Escrow ──');
  const roundBalance = await projectToken.balanceOf(ROUND_ADDRESS);
  console.log(`Round token balance: ${ethers.formatUnits(roundBalance, 18)}`);

  if (roundBalance === 0n) {
    console.log('Releasing tokens from escrow...');
    const tx1 = await escrow.release(PROJECT_ID, ROUND_ADDRESS);
    console.log(`TX: ${tx1.hash}`);
    await tx1.wait();
    const newBalance = await projectToken.balanceOf(ROUND_ADDRESS);
    console.log(`✅ Released. New balance: ${ethers.formatUnits(newBalance, 18)}`);
  } else {
    console.log(
      `✅ Round already holds ${ethers.formatUnits(roundBalance, 18)} tokens. Skipping release.`
    );
  }

  // ── Step 2: Finalize ──
  console.log('\n── Step 2: finalizeSuccessEscrow() ──');
  const roundBnb = await ethers.provider.getBalance(ROUND_ADDRESS);
  console.log(`Round BNB balance: ${ethers.formatEther(roundBnb)} BNB`);

  if (currentStatus !== 3n) {
    const tx2 = await round.finalizeSuccessEscrow(MERKLE_ROOT, VESTING_ALLOC, UNSOLD_BURN);
    console.log(`TX: ${tx2.hash}`);
    const receipt = await tx2.wait();
    console.log(`✅ Finalized in block ${receipt.blockNumber} (gas: ${receipt.gasUsed})`);
  }

  // ── Post-flight verification ──
  console.log('\n── Post-Flight Verification ──');
  const finalStatus = await round.status();
  const bnbDistributed = await round.bnbDistributed();
  const burnedAmt = await round.burnedAmount();
  const vestingVault = await round.vestingVault();
  const vaultBal = await projectToken.balanceOf(vestingVault);

  console.log(
    `Status:           ${finalStatus === 3n ? '✅ FINALIZED_SUCCESS' : `❌ ${finalStatus}`}`
  );
  console.log(`BNB Distributed:  ${bnbDistributed ? '✅' : '❌'}`);
  console.log(`Burned Amount:    ${ethers.formatUnits(burnedAmt, 18)} tokens`);
  console.log(`Vesting Vault:    ${ethers.formatUnits(vaultBal, 18)} tokens`);
  console.log(
    `Round BNB:        ${ethers.formatEther(await ethers.provider.getBalance(ROUND_ADDRESS))} BNB`
  );
  console.log('\n═══════════════════════════════════════════');
  console.log('   ✅ Escrow Finalization Complete');
  console.log('═══════════════════════════════════════════');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
