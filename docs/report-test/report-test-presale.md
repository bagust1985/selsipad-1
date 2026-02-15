E2E Presale v2.5 Test — Walkthrough
What Was Done
1. Created E2E Test Script
e2e-presale-v2.5.js
 — 460+ lines covering the full presale lifecycle with all new features.

Wizard-equivalent params:

Parameter	Value
Hardcap	10 BNB
Softcap	5 BNB
Price	0.0001 BNB/token
LP %	60% of net BNB
Fee	5% (500 BPS)
Team	10% (1000 BPS)
Team split	70% / 30% (2 wallets)
TGE unlock	20%
Vesting	30 days linear
Fill rate	70% (7/10 BNB)
2. Contract Fix: Phase Ordering
PresaleRound.sol
 — Reverted phase order back to:

Phase 1: Fund Vesting Vault
Phase 2: Set Merkle Root
IMPORTANT

MerkleVesting.setMerkleRoot() checks vault balance >= totalAllocated. Tokens must be transferred before the root is set. The previous reorder was incompatible.

3. Merkle Leaf Encoding Fix
Updated 
buildMerkleTree()
 in E2E to use MerkleVesting's salted leaf format:

javascript
// keccak256(abi.encodePacked(vestingAddr, chainId, scheduleSalt, userAddr, allocation))
ethers.solidityPackedKeccak256(
  ['address', 'uint256', 'bytes32', 'address', 'uint256'],
  [vestingAddr, chainId, scheduleSalt, address, amount]
)
Test Results — ✅ All Passed
✓ Status = FINALIZED_SUCCESS
  ✓ vestingFunded = true
  ✓ feePaid = true
  ✓ lpCreated = true
  ✓ ownerPaid = true
  ✓ surplusBurned = true (Phase 7 executed)
  ✓ Vesting vault has investor + team tokens (87,507 TST25)
  ✓ Merkle root matches (includes team wallets)
  ✓ ★ Round has ZERO project tokens (Phase 7 burn worked!)
  ✓ Round BNB balance = 0
  ✓ LP created and locked
  ✓ ExcessBurned event: 87,570 TST25
  ✓ User1 claimed >= TGE (8,044 >= 8,000)
  ✓ Team claimed >= TGE (2,464 >= 2,451)
  ✓ TeamWallet2 received tokens (1,056)
New Features Verified
Feature	Status
Phase 7 auto-burn surplus	✅
surplusBurned flag	✅
Team wallets in merkle tree	✅
Team wallet claim	✅
Zero remaining project tokens	✅
ExcessBurned event	✅
Files Modified
File	Change
e2e-presale-v2.5.js
[NEW] Full E2E test script
PresaleRound.sol
Phase order fix (Fund → Merkle)