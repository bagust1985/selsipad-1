# UI Testing Checklist: Presale v2.3 Finalize Flow

**Date:** February 10, 2026  
**Page:** `/admin/presales/[id]/finalize`  
**Feature:** Escrow-based finalization with `finalizeSuccessEscrow()`

---

## Pre-Test Setup

### 1. Ensure Deployed Contracts (BSC Testnet)

- [ ] FeeSplitter v2.3 deployed: `0x9CE09C9e370a3974f4D0c55D6a15C4d9F186d161`
- [ ] PresaleFactory v2.3 deployed: `0xb0ee30606d4fA0446d596F1a6523E0cc75C361ff`
- [ ] `.env` updated with correct addresses
- [ ] Contracts verified on BSCScan

### 2. Create Test Presale

- [ ] Create presale via wizard UI
- [ ] Token created and approved
- [ ] Presale deployed via Factory v2.3
- [ ] Note presale ID and contract address

### 3. Simulate Contributions

- [ ] Wait for presale to start
- [ ] Make 2-3 test contributions
- [ ] **Full Sale (Hardcap):** Raise full hardcap amount
- [ ] **Partial Sale (Softcap):** Raise only softcap amount for burn test
- [ ] Wait for presale to end

---

## UI Component Verification

### Admin Finalize Page: `/admin/presales/[id]/finalize`

#### A. Page Load & Data Fetch

- [ ] Page loads without errors
- [ ] Admin wallet connected
- [ ] Contract address correctly identified
- [ ] Current status displayed (should be "ENDED" or status 1)
- [ ] Total raised amount displayed correctly

#### B. Generate Merkle Proof Button

- [ ] Button is visible and enabled
- [ ] Loading state shows during generation
- [ ] Success: Merkle root generated
- [ ] Success: Total allocation calculated correctly
- [ ] Success: Contributor list displayed

#### C. Unsold Tokens Input Field

**CRITICAL:** This is new in v2.3!

```tsx
// Expected UI element around line 38:
const [unsoldToBurn, setUnsoldToBurn] = useState('0');

// Input field should be visible in the form
<input
  type="number"
  value={unsoldToBurn}
  onChange={(e) => setUnsoldToBurn(e.target.value)}
  placeholder="0"
/>;
```

**Verification:**

- [ ] `unsoldToBurn` input field is visible
- [ ] Field accepts numeric input
- [ ] Default value is `'0'`
- [ ] Can input custom burn amount
- [ ] Validation: Cannot exceed available tokens

#### D. Finalize Button & Hook Integration

**Expected hook call around line 51-87:**

```tsx
const { finalize, hash, isPending, error } = useFinalizeSuccessEscrow();

// On button click:
await finalize({
  roundAddress: preview.calldata.target as `0x${string}`,
  merkleRoot: preview.merkleRoot as `0x${string}`,
  totalAllocation: BigInt(preview.totalAllocation),
  unsoldToBurn: parseEther(unsoldToBurn || '0'),
});
```

**Verification:**

- [ ] "Finalize" button visible after merkle generation
- [ ] Button shows loading state (`isPending`)
- [ ] Parameters passed correctly:
  - [ ] `roundAddress` = presale contract
  - [ ] `merkleRoot` = generated merkle root
  - [ ] `totalAllocation` = sum of vesting allocations
  - [ ] `unsoldToBurn` = input value (in wei)

#### E. Transaction Execution

**Before Transaction:**

- [ ] MetaMask popup appears
- [ ] Transaction details visible:
  - [ ] Target contract = PresaleRound address
  - [ ] Function = `finalizeSuccessEscrow`
  - [ ] Gas estimate reasonable (~300k gas)

**Transaction Confirmation:**

- [ ] Transaction submits successfully
- [ ] Hash displayed in UI
- [ ] Wait for confirmation (loading state)
- [ ] Success message on confirmation

**After Transaction:**

- [ ] Status updates to "FINALIZED" (status 3)
- [ ] Page shows finalization success
- [ ] Link to block explorer visible

---

## On-Chain Verification

### After Finalization, Verify Contract State:

#### 1. PresaleRound Contract

```solidity
// Read these values via BSCScan or ethers:
presaleRound.status() == 3 // FINALIZED
presaleRound.bnbDistributed() == true
presaleRound.merkleRoot() == <generated_root>
```

**Checklist:**

- [ ] Status = 3 (FINALIZED)
- [ ] `bnbDistributed` = true
- [ ] Merkle root set correctly
- [ ] Developer received BNB (95% of raised - fees)

#### 2. FeeSplitter Contract

```solidity
// Check events or treasury balance
```

**Checklist:**

- [ ] Treasury received 5% fee
- [ ] Fee distributed to vaults (50% Treasury, 25% Referral, 25% SBT)

#### 3. VestingVault Contract

```solidity
vestingVault.balanceOf(tokenAddress) == <totalAllocation>
```

**Checklist:**

- [ ] Vesting vault funded with correct token amount
- [ ] Vesting schedule configured

#### 4. Token Burn (if `unsoldToBurn > 0`)

```solidity
tokenContract.balanceOf(DEAD_ADDRESS) == <unsoldToBurn>
```

**Checklist:**

- [ ] Dead address (`0x...dEaD`) has burned tokens
- [ ] Burn amount matches input

---

## Test Scenarios

### Scenario 1: Hardcap (Full Sale, No Burn)

**Setup:**

- Raise: 10 BNB (100% of hardcap)
- Vesting Alloc: 80k tokens
- Unsold to Burn: `0`

**Expected Results:**

```
Treasury Fee: 0.5 BNB (5%)
Developer: 9.5 BNB (95%)
Vesting Funded: 80k tokens
Tokens Burned: 0
Status: FINALIZED
```

**UI Checklist:**

- [ ] Input `unsoldToBurn` = `0`
- [ ] Click "Finalize"
- [ ] Transaction succeeds
- [ ] Contract status = FINALIZED
- [ ] Treasury received 0.5 BNB
- [ ] Developer received 9.5 BNB
- [ ] Vesting vault has 80k tokens
- [ ] **No tokens burned** ✅

---

### Scenario 2: Softcap (Partial Sale, With Burn)

**Setup:**

- Raise: 4 BNB (40% of hardcap)
- Vesting Alloc: 50k tokens
- Tokens for Sale: 100k tokens
- Unsold tokens: 50k tokens
- Unsold to Burn: `50000` (50k)

**Expected Results:**

```
Treasury Fee: 0.2 BNB (5%)
Developer: 3.8 BNB (95%)
Vesting Funded: 50k tokens
Tokens Burned: 50k tokens 🔥
Status: FINALIZED
```

**UI Checklist:**

- [ ] Calculate unsold: `100k - 50k = 50k`
- [ ] Input `unsoldToBurn` = `50000`
- [ ] Click "Finalize"
- [ ] Transaction succeeds
- [ ] Contract status = FINALIZED
- [ ] Treasury received 0.2 BNB
- [ ] Developer received 3.8 BNB
- [ ] Vesting vault has 50k tokens
- [ ] **Dead address has 50k tokens** 🔥 ✅

---

## Common Issues to Monitor

### 1. TypeScript Errors

**Location:** `finalize/page.tsx:40-46`

Fixed issues:

```tsx
// ✅ Correct: Cast to `0x${string}`
const { data: status } = usePresaleStatus(
  (preview?.calldata.target || undefined) as `0x${string}` | undefined
);
```

- [ ] No TypeScript errors in console
- [ ] Type casts working correctly

### 2. ABI Mismatch

**Location:** `presale-contracts.ts`

**Verification:**

- [ ] `PRESALE_ROUND_ABI` includes `finalizeSuccessEscrow`
- [ ] Function signature matches contract:
  ```solidity
  function finalizeSuccessEscrow(
      bytes32 merkleRoot,
      uint256 totalAllocation,
      uint256 unsoldToBurn
  ) external onlyRole(ADMIN_ROLE)
  ```

### 3. Input Validation

- [ ] `unsoldToBurn` cannot be negative
- [ ] `unsoldToBurn` cannot exceed available tokens
- [ ] Proper error messages on invalid input

### 4. Transaction Failures

**Possible Errors:**

- `InsufficientTokenBalance()` - not enough tokens in contract
- `AccessDenied` - not admin
- `InvalidStatus` - presale not ended
- `AlreadyFinalized` - already finalized

**Checklist:**

- [ ] Error messages displayed in UI
- [ ] Transaction revert reason shown
- [ ] Can retry after fixing issue

---

## Network Configuration

### Environment Variables

```bash
# .env (apps/web)
NEXT_PUBLIC_PRESALE_FACTORY_ADDRESS=0xb0ee30606d4fA0446d596F1a6523E0cc75C361ff
NEXT_PUBLIC_FEE_SPLITTER_ADDRESS=0x9CE09C9e370a3974f4D0c55D6a15C4d9F186d161

# .env (packages/contracts)
FEE_SPLITTER_ADDRESS=0x9CE09C9e370a3974f4D0c55D6a15C4d9F186d161
PRESALE_FACTORY_ADDRESS=0xb0ee30606d4fA0446d596F1a6523E0cc75C361ff
```

**Checklist:**

- [ ] Both `.env` files updated
- [ ] Addresses match deployed contracts
- [ ] No typos in addresses

---

## Final Verification Steps

### After Both Test Scenarios Complete:

1. **Screenshots/Screen Recording:**
   - [ ] Record full finalize flow
   - [ ] Capture transaction confirmation
   - [ ] Screenshot final status

2. **BSCScan Verification:**
   - [ ] View finalized presale on BSCScan
   - [ ] Check event logs:
     - [ ] `BNBDistributed` event
     - [ ] `VestingFunded` event
     - [ ] `TokensBurned` event (scenario 2)
     - [ ] `MerkleRootSet` event

3. **Database Sync:**
   - [ ] Presale status updated in database
   - [ ] Finalization timestamp recorded
   - [ ] Merkle proofs stored for user claims

4. **User Claims (Optional Post-Finalize Test):**
   - [ ] Users can view their allocations
   - [ ] Claim page shows correct vesting schedule
   - [ ] Claims execute successfully

---

## Success Criteria

### ✅ UI Integration Complete When:

- [ ] All components render without errors
- [ ] `unsoldToBurn` input working correctly
- [ ] Transaction executes successfully
- [ ] Contract state updates correctly
- [ ] Fee distribution verified on-chain
- [ ] Token burns confirmed (if applicable)
- [ ] Vesting vault funded correctly
- [ ] Merkle root set for claims

---

## Notes & Observations

### During Testing, Document:

- Wallet used: `__________________`
- Presale ID tested: `__________________`
- Contract address: `__________________`
- Transaction hash: `__________________`
- Gas used: `__________________`
- Any errors encountered: `__________________`

---

## Next Actions After UI Test

- [ ] If all tests pass → Deploy to production
- [ ] If issues found → Document bugs and fix
- [ ] Update user documentation
- [ ] Train admin team on new finalize flow
- [ ] Monitor first production finalization
