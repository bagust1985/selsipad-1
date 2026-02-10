# Bonding Curve Solana - Quick Reference Guide

**Document Type:** Developer Quick Start  
**Version:** 1.0  
**Last Updated:** February 9, 2026

---

## 📋 Key Files at a Glance

| Feature             | Files                                                 |
| ------------------- | ----------------------------------------------------- |
| **Types**           | `packages/shared/src/types/fase7.ts`                  |
| **AMM Math**        | `packages/shared/src/utils/bonding-curve.ts`          |
| **TX Verification** | `apps/web/lib/solana-verification.ts`                 |
| **API Endpoints**   | `apps/web/app/api/v1/bonding/**/*.ts`                 |
| **DB Schema**       | `supabase/migrations/010_fase7_bonding_curve.sql`     |
| **Worker**          | `services/worker/jobs/bonding-graduation-detector.ts` |
| **UI Components**   | `apps/web/components/bonding/`                        |
| **Full Docs**       | `docs/BONDING_CURVE_SOLANA_IMPLEMENTATION.md`         |

---

## 🔄 Pool Lifecycle

```
┌─────────┐
│ DRAFT   │ ← Pool created via POST /api/v1/bonding
└────┬────┘
     ↓ (pay 0.5 SOL deploy fee)
┌────────────┐
│ DEPLOYING  │ ← verify deploy fee tx, transition via deploy/confirm
└────┬───────┘
     ↓ (worker updates on confirmation)
┌──────────┐
│ LIVE     │ ← swaps enabled, monitor graduation threshold
└────┬─────┘
     ↓ (actual_sol_reserves >= graduation_threshold_sol)
┌──────────────┐
│ GRADUATING   │ ← worker auto-transitions via bonding-graduation-detector
└────┬─────────┘
     ↓ (pay 2.5 SOL migration fee, select DEX)
┌──────────────┐
│ GRADUATED    │ ← DEX pool created, LP locked for 12+ months
└──────────────┘
```

---

## 🌀 Three Main Flows

### 1️⃣ Deploy Flow

```
User Creates Pool → POST /api/v1/bonding (DRAFT)
User Gets Intent  → POST /api/v1/bonding/:id/deploy/intent
User Pays Fee     → Send 0.5 SOL to TREASURY_ADDRESS
User Confirms     → POST /api/v1/bonding/:id/deploy/confirm (tx_hash)
                 → RPC verifies transaction
                 → Status: DEPLOYING (or LIVE after worker)
```

**Verification:** Solana RPC checks tx exists, is confirmed, recipient is treasury, amount >= 0.5 SOL.

### 2️⃣ Swap Flow

```
User Gets Quote   → POST /api/v1/bonding/:id/swap/intent
                  ← Returns estimated_output, swap_fee (50:50 split)
User Executes     → User signs & submits swap transaction
User Confirms     → POST /api/v1/bonding/:id/swap/confirm (tx_hash)
                  ← RPC verifies tx exists & is confirmed
                  → Insert bonding_swaps record
                  → Insert fee_splits record (50% treasury, 50% referral)
                  → Update pool.actual_sol_reserves
                  → Check graduation threshold
```

**Fee Calculation (example: 10 SOL input):**

```
Input: 10 SOL = 10,000,000,000 lamports
Swap Fee: 1.5% = 150,000,000 lamports
  ├─ Treasury (50%): 75,000,000 lamports
  └─ Referral Pool (50%): 75,000,000 lamports
Net Input to AMM: 9,850,000,000 lamports
Output: Calculated via x*y=k formula
```

### 3️⃣ Migration Flow

```
Worker Detects   → bonding-graduation-detector.ts polls LIVE pools
Graduation       → If actual_sol >= threshold, status: LIVE → GRADUATING

User Gets Intent → POST /api/v1/bonding/:id/migrate/intent
                 ← Returns DEX choice requirement, required_fee_lamports
User Selects DEX → RAYDIUM or ORCA
User Pays Fee    → Send 2.5 SOL to TREASURY_ADDRESS
User Confirms    → POST /api/v1/bonding/:id/migrate/confirm
                 → RPC verifies fee transaction
                 → Call executeDEXMigration() → creates DEX pool
                 → Create LP lock (12 months min) via FASE 5
                 → Status: GRADUATING → GRADUATED
```

**DEX Options:**

- **RAYDIUM** (default): Higher capital efficiency, concentrated liquidity
- **ORCA**: More user-friendly, Fair Price Indicator

---

## 📊 Fee Structure (Fixed)

| Fee       | Amount        | When                         | To                              |
| --------- | ------------- | ---------------------------- | ------------------------------- |
| Deploy    | 0.5 SOL       | Once at DRAFT→DEPLOYING      | Treasury                        |
| Swap      | 1.5% of input | Each trade                   | 50% Treasury, 50% Referral Pool |
| Migration | 2.5 SOL       | Once at GRADUATING→GRADUATED | Treasury                        |

---

## 🔐 Server-Side TX Verification

**Module:** `apps/web/lib/solana-verification.ts`

All transactions verified on-chain via Solana RPC (no external indexer):

1. ✅ **Check existence** → `verifyTransactionExists(txHash)`
2. ✅ **Check confirmation** → `isTransactionConfirmed(txHash)`
3. ✅ **Verify amount** → `verifyTransferTransaction(txHash, recipient, amount)`
4. ✅ **Complete check** → `verifyBondingOperation(operation, txHash, recipient, amount)`

**RPC Endpoint:**

```bash
# Set via env var
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

---

## 🗄️ Database Tables

### bonding_pools

```
id, project_id, creator_id,
token_mint, token_name, token_symbol, token_decimals, total_supply,
virtual_sol_reserves, virtual_token_reserves, actual_sol_reserves, actual_token_reserves,
deploy_fee_sol, deploy_tx_hash, deploy_tx_verified,
swap_fee_bps (always 150 = 1.5%),
graduation_threshold_sol,
migration_fee_sol, migration_fee_tx_hash, migration_fee_verified,
status (DRAFT|DEPLOYING|LIVE|GRADUATING|GRADUATED|FAILED),
target_dex (RAYDIUM|ORCA),
dex_pool_address, migration_tx_hash,
lp_lock_id (FASE 5 integration),
created_at, deployed_at, graduated_at, failed_at, updated_at
```

### bonding_swaps

```
id, pool_id, user_id,
swap_type (BUY|SELL),
input_amount, output_amount, price_per_token,
swap_fee_amount, treasury_fee (50%), referral_pool_fee (50%),
tx_hash (unique), signature_verified,
referrer_id, sol_reserves_before/after, token_reserves_before/after,
created_at
```

### bonding_events

```
id, pool_id, event_type, event_data (JSONB), triggered_by, created_at
```

### dex_migrations

```
id, pool_id, target_dex, sol_migrated, tokens_migrated,
migration_fee_paid, dex_pool_address, creation_tx_hash,
lp_token_mint, lp_amount_locked, lp_lock_id (FASE 5),
status (PENDING|COMPLETED|FAILED), failure_reason,
created_at, completed_at
```

---

## 🛠️ Common API Patterns

### Create Pool

```bash
POST /api/v1/bonding
{
  "project_id": "uuid",
  "token_name": "MyToken",
  "token_symbol": "MYT",
  "total_supply": "1000000000000000000",
  "virtual_sol_reserves": "10000000000",
  "virtual_token_reserves": "1000000000000000000",
  "graduation_threshold_sol": "50000000000",
  "target_dex": "RAYDIUM"  // or ORCA
}
```

### Deploy Intent & Confirm

```bash
# 1. Get intent
POST /api/v1/bonding/:pool_id/deploy/intent

# 2. User pays 0.5 SOL to treasury (wallet UI)
# 3. Confirm with tx hash
POST /api/v1/bonding/:pool_id/deploy/confirm
{
  "intent_id": "deploy_...",
  "fee_tx_hash": "tx_hash_here"
}
```

### Get Swap Quote

```bash
POST /api/v1/bonding/:pool_id/swap/intent
{
  "swap_type": "BUY",
  "input_amount": "1000000000",  // 1 SOL
  "slippage_tolerance_bps": 100   // 1%
}

Response includes:
- estimated_output
- swap_fee, treasury_fee, referral_pool_fee (breakdown!)
- minimum_output (after slippage)
```

### Confirm Swap

```bash
POST /api/v1/bonding/:pool_id/swap/confirm
{
  "intent_id": "...",
  "tx_hash": "..."
}
```

### Migration Intent & Confirm

```bash
# 1. Get intent (with DEX choice)
POST /api/v1/bonding/:pool_id/migrate/intent
{
  "target_dex": "RAYDIUM"  // or ORCA
}

# 2. User pays 2.5 SOL to treasury
# 3. Confirm
POST /api/v1/bonding/:pool_id/migrate/confirm
{
  "intent_id": "...",
  "fee_tx_hash": "...",
  "target_dex": "RAYDIUM"
}
```

---

## 🧮 AMM Formula

**Constant Product:** `x * y = k`

Where:

- `x` = SOL reserves
- `y` = Token reserves
- `k` = constant (invariant)

**Buy Swap (SOL → Token):**

```
input_after_fee = input - (input * 150 / 10000)  // Deduct 1.5%
new_x = x + input_after_fee
new_y = k / new_x
output = y - new_y
price = output / input * 1e9  // Price per token
```

**Sell Swap (Token → SOL):**

```
input_after_fee = input - (input * 150 / 10000)
new_y = y + input_after_fee
new_x = k / new_y
output = x - new_x
price = output / input * 1e9
```

---

## 🚀 Deployment Checklist

- [ ] Set `SOLANA_RPC_URL` environment variable
- [ ] Set `TREASURY_ADDRESS` (Solana pubkey)
- [ ] Run DB migration: `supabase migration up`
- [ ] Configure worker schedule (every 5 minutes)
- [ ] Test pool creation on devnet
- [ ] Test deploy fee verification (use devnet tx)
- [ ] Test swap execution and fee split
- [ ] Test graduation threshold check
- [ ] Test migration fee verification
- [ ] Test DEX migration (mock for now, real SDKs later)
- [ ] Verify LP lock created in FASE 5 table
- [ ] Monitor logs for RPC errors or timeouts

---

## ⚠️ Important Notes

1. **No External Indexer** - All TX verification uses Solana RPC directly
2. **Fixed Fees** - Cannot be changed after pool creation
3. **50:50 Fee Split** - Treasury and Referral Pool always equal
4. **Idempotency** - All confirm endpoints use tx_hash deduplication
5. **DEX Selection** - Made at pool creation (target_dex field)
6. **LP Lock Required** - All graduated pools must have 12+ month LP lock
7. **RPC Timeout** - Default 30 seconds for confirmation polling

---

## 📞 Support & Troubleshooting

**Issue: "Transaction not found on Solana blockchain"**

- Solution: Verify tx_hash is correct, wait a few seconds, retry

**Issue: "Insufficient transfer amount"**

- Solution: Ensure fee amount is sent correctly (lamports, not SOL)

**Issue: "Pool not found"**

- Solution: Verify pool_id is correct UUID, pool exists in DB

**Issue: "Cannot migrate - status not GRADUATING"**

- Solution: Wait for worker to detect graduation, or check threshold was met

**Issue: Worker not running**

- Solution: Verify worker is scheduled, check services/worker/src/index.ts

---

**For full documentation, see:** `/docs/BONDING_CURVE_SOLANA_IMPLEMENTATION.md`
