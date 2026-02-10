# Solana Bonding Curve Implementation Plan

**Date:** February 9, 2026  
**Version:** 1.0 - Final Implementation Plan  
**Status:** Implementation In Progress

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [Verification Strategy](#verification-strategy)
6. [Fee Split Model](#fee-split-model)
7. [DEX Migration Options](#dex-migration-options)
8. [Deployment & Setup](#deployment--setup)
9. [Testing & Verification](#testing--verification)

---

## Overview

This document outlines the complete implementation of a Solana bonding curve with permissionless token launch, automatic DEX graduation, and LP lock enforcement. The implementation follows a 6-step lifecycle:

```
DRAFT → DEPLOYING → LIVE → GRADUATING → GRADUATED → (or) FAILED
```

### Key Features

- **Constant-Product AMM**: Uses `x * y = k` formula with virtual reserves for controlled price discovery
- **Fee Split Model**: 1.5% swap fee split 50:50 between Treasury and Referral Pool
- **DEX Choice**: Developers can select between **Raydium** or **Orca** for graduation
- **Server-Side Verification**: All transactions verified via Solana RPC (no external indexer dependency)
- **LP Lock Integration**: FASE 5 liquidity locks enforced post-migration
- **Worker Automation**: Background job monitors pools and triggers graduation

---

## Architecture

### High-Level Flow

```
User (Web UI)
    ↓
[Create Pool] → POST /api/v1/bonding (status: DRAFT)
    ↓
[Pay Deploy Fee] → POST /api/v1/bonding/:pool_id/deploy/intent/confirm
    → Verify TX on-chain (Solana RPC)
    → Update status: DEPLOYING
    ↓
[Bonding Curve LIVE] → Status: LIVE
    ↓
[User Swaps] → POST /api/v1/bonding/:pool_id/swap/confirm
    → Verify TX & extract swap details
    → Update reserves, record in bonding_swaps
    → Fee split recorded in fee_splits table
    ↓
[Graduation Threshold Met] → Worker (bonding-graduation-detector.ts)
    → Update status: GRADUATING
    → Emit bonding_event
    ↓
[Pay Migration Fee] → POST /api/v1/bonding/:pool_id/migrate/intent/confirm
    → Verify TX (2.5 SOL to treasury)
    → Execute DEX pool creation (Raydium/Orca)
    → Create LP lock (FASE 5)
    → Update status: GRADUATED
```

### Component Locations

| Component               | Path                                                  | Purpose                                                              |
| ----------------------- | ----------------------------------------------------- | -------------------------------------------------------------------- |
| **Types**               | `packages/shared/src/types/fase7.ts`                  | Request/response types, DEXType enum                                 |
| **AMM Utils**           | `packages/shared/src/utils/bonding-curve.ts`          | `calculateAMMSwap()`, `checkGraduationThreshold()`                   |
| **Solana Verification** | `apps/web/lib/solana-verification.ts`                 | RPC transaction verification                                         |
| **Pool Creation API**   | `apps/web/app/api/v1/bonding/route.ts`                | POST/GET endpoints                                                   |
| **Deploy Flow**         | `apps/web/app/api/v1/bonding/[pool_id]/deploy/*`      | Intent/confirm handlers                                              |
| **Swap Flow**           | `apps/web/app/api/v1/bonding/[pool_id]/swap/*`        | Quote/confirm with fee split                                         |
| **Migration Flow**      | `apps/web/app/api/v1/bonding/[pool_id]/migrate/*`     | DEX choice & graduation                                              |
| **Worker**              | `services/worker/jobs/bonding-graduation-detector.ts` | Monitors LIVE→GRADUATING transition                                  |
| **UI Components**       | `apps/web/components/bonding/`                        | Forms, DEX selector, fee display                                     |
| **DB Schema**           | `supabase/migrations/010_fase7_bonding_curve.sql`     | Tables: bonding_pools, bonding_swaps, bonding_events, dex_migrations |

---

## Database Schema

### 1. `bonding_pools` Table

Tracks the complete lifecycle of each bonding curve pool.

```sql
CREATE TABLE bonding_pools (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  creator_id UUID REFERENCES profiles(user_id),

  -- Token Info
  token_mint TEXT NOT NULL UNIQUE,
  token_name TEXT (max 32 chars),
  token_symbol TEXT (max 8 chars),
  token_decimals INTEGER (0-18),
  total_supply BIGINT,

  -- Reserves
  virtual_sol_reserves BIGINT,
  virtual_token_reserves BIGINT,
  actual_sol_reserves BIGINT (tracks graduation progress),
  actual_token_reserves BIGINT,

  -- Configuration
  deploy_fee_sol BIGINT (500000000 = 0.5 SOL, fixed),
  swap_fee_bps INTEGER (150 = 1.5%, fixed),
  graduation_threshold_sol BIGINT (configurable),
  migration_fee_sol BIGINT (2500000000 = 2.5 SOL, fixed),

  -- Status & Verification
  status TEXT ('DRAFT' | 'DEPLOYING' | 'LIVE' | 'GRADUATING' | 'GRADUATED' | 'FAILED'),
  deploy_tx_hash TEXT,
  deploy_tx_verified BOOLEAN,
  migration_fee_tx_hash TEXT,
  migration_fee_verified BOOLEAN,

  -- DEX Migration
  target_dex TEXT ('RAYDIUM' | 'ORCA'),
  dex_pool_address TEXT,
  migration_tx_hash TEXT,

  -- FASE 5 Integration
  lp_lock_id UUID REFERENCES liquidity_locks(id),

  -- Timestamps
  created_at TIMESTAMPTZ,
  deployed_at TIMESTAMPTZ,
  graduated_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### 2. `bonding_swaps` Table

Records every buy/sell swap with detailed fee split.

```sql
CREATE TABLE bonding_swaps (
  id UUID PRIMARY KEY,
  pool_id UUID REFERENCES bonding_pools(id),
  user_id UUID REFERENCES profiles(user_id),

  -- Swap Details
  swap_type TEXT ('BUY' | 'SELL'),
  input_amount BIGINT,
  output_amount BIGINT,
  price_per_token BIGINT,

  -- Fees: 1.5% split 50/50
  swap_fee_amount BIGINT,
  treasury_fee BIGINT (50% of swap_fee_amount),
  referral_pool_fee BIGINT (50% of swap_fee_amount),

  -- Verification
  tx_hash TEXT NOT NULL UNIQUE,
  signature_verified BOOLEAN,

  -- Referral Attribution
  referrer_id UUID REFERENCES profiles(user_id),

  -- Reserve Snapshots
  sol_reserves_before BIGINT,
  token_reserves_before BIGINT,
  sol_reserves_after BIGINT,
  token_reserves_after BIGINT,

  created_at TIMESTAMPTZ
);
```

### 3. `bonding_events` Table

Comprehensive audit log of all lifecycle events.

```sql
CREATE TABLE bonding_events (
  id UUID PRIMARY KEY,
  pool_id UUID REFERENCES bonding_pools(id),
  event_type TEXT (one of 14 event types),
  event_data JSONB (flexible metadata),
  triggered_by UUID REFERENCES profiles(user_id), -- NULL for system events
  created_at TIMESTAMPTZ
);
```

Event types:

- `POOL_CREATED`, `DEPLOY_INTENT_GENERATED`, `DEPLOY_FEE_PAID`, `DEPLOY_STARTED`, `DEPLOY_CONFIRMED`, `DEPLOY_FAILED`
- `SWAP_EXECUTED`
- `GRADUATION_THRESHOLD_REACHED`, `GRADUATION_STARTED`
- `MIGRATION_INTENT_GENERATED`, `MIGRATION_FEE_PAID`, `MIGRATION_COMPLETED`, `MIGRATION_FAILED`
- `LP_LOCK_CREATED`, `STATUS_CHANGED`, `POOL_PAUSED`, `POOL_RESUMED`, `POOL_FAILED`

### 4. `dex_migrations` Table

Tracks the DEX migration process and LP lock creation.

```sql
CREATE TABLE dex_migrations (
  id UUID PRIMARY KEY,
  pool_id UUID REFERENCES bonding_pools(id),
  target_dex TEXT ('RAYDIUM' | 'ORCA'),
  sol_migrated BIGINT,
  tokens_migrated BIGINT,
  migration_fee_paid BIGINT,
  migration_fee_tx_hash TEXT,
  dex_pool_address TEXT,
  creation_tx_hash TEXT,
  lp_token_mint TEXT,
  lp_amount_locked BIGINT,
  lp_lock_id UUID REFERENCES liquidity_locks(id),
  lp_lock_duration_months INTEGER (minimum 12),
  status TEXT ('PENDING' | 'COMPLETED' | 'FAILED'),
  failure_reason TEXT,
  created_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);
```

---

## API Endpoints

### Pool Management

#### `POST /api/v1/bonding` - Create Pool

Create a new bonding curve pool in DRAFT status.

```typescript
Request: CreateBondingPoolRequest {
  project_id: string;
  token_name: string;
  token_symbol: string;
  token_decimals?: number; // default 9
  total_supply: string; // bigint as string
  virtual_sol_reserves: string;
  virtual_token_reserves: string;
  graduation_threshold_sol: string;
  target_dex?: 'RAYDIUM' | 'ORCA'; // default RAYDIUM
}

Response: BondingPool {
  id: string;
  status: 'DRAFT';
  // ... all pool fields
}

Status Codes:
  201: Created
  400: Invalid input (DEX choice, numeric validation)
  401: Unauthorized
  403: Not project member
  404: Project not found
  500: Server error
```

#### `GET /api/v1/bonding` - List Pools

List bonding pools with optional filters.

```typescript
Query Parameters:
  status?: 'DRAFT' | 'DEPLOYING' | 'LIVE' | 'GRADUATING' | 'GRADUATED' | 'FAILED'
  project_id?: string

Response: BondingPool[] {
  // Filtered by: (creator_id = user) OR (status IN LIVE/GRADUATING/GRADUATED)
}
```

### Deploy Flow

#### `POST /api/v1/bonding/:pool_id/deploy/intent` - Generate Intent

Generate deploy fee requirement and intent ID.

```typescript
Request: DeployIntentRequest {
  pool_id: string;
}

Response: DeployIntentResponse {
  intent_id: string;
  treasury_address: string;
  required_amount_lamports: '500000000'; // 0.5 SOL
  expires_at: string; // 10 minutes
}

Validation:
  - Pool exists
  - User is pool creator
  - Status = DRAFT
```

#### `POST /api/v1/bonding/:pool_id/deploy/confirm` - Confirm Fee

Verify deploy fee payment and transition to DEPLOYING.

```typescript
Request: DeployConfirmRequest {
  pool_id: string;
  intent_id: string;
  fee_tx_hash: string;
}

Response: DeployConfirmResponse {
  success: boolean;
  pool_status: 'DEPLOYING';
  deploy_tx_hash: string;
  message: string;
}

Logic:
  1. Verify tx exists on Solana RPC (verifyTransactionExists)
  2. Check confirmation status (isTransactionConfirmed)
  3. Verify recipient = treasury_address
  4. Verify amount >= 0.5 SOL
  5. Update pool: status = DEPLOYING, deploy_tx_verified = true
  6. Create bonding_events: DEPLOY_FEE_PAID, DEPLOY_STARTED
  7. TODO: Trigger worker to deploy pool on-chain
```

### Swap Flow

#### `POST /api/v1/bonding/:pool_id/swap/intent` - Quote

Get swap quote with fee breakdown.

```typescript
Request: SwapIntentRequest {
  pool_id: string;
  swap_type: 'BUY' | 'SELL';
  input_amount: string; // lamports (BUY) or tokens (SELL)
  slippage_tolerance_bps?: number; // default 100 (1%)
}

Response: SwapIntentResponse {
  intent_id: string;
  estimated_output: string;
  price_per_token: string;
  swap_fee: string; // 1.5% of input
  treasury_fee: string; // 50% of swap_fee
  referral_pool_fee: string; // 50% of swap_fee
  minimum_output: string; // after slippage
  expires_at: string; // 30 seconds
}

Calculation:
  - Uses calculateAMMSwap(swap_type, input, virtual_sol, virtual_tokens, 150)
  - Applies 1.5% fee to input
  - Splits fee 50/50 (treasury_fee = swap_fee / 2, referral_pool_fee = swap_fee - treasury_fee)
  - Applies constant-product formula: x * y = k
  - Returns price impact & minimum output with slippage
```

#### `POST /api/v1/bonding/:pool_id/swap/confirm` - Execute

Execute swap and record fee split.

```typescript
Request: SwapConfirmRequest {
  pool_id: string;
  intent_id: string;
  tx_hash: string;
}

Response: SwapConfirmResponse {
  success: boolean;
  swap_id: string;
  actual_output: string;
  message: string;
}

Logic:
  1. Verify pool status = LIVE
  2. Check idempotency (no duplicate tx_hash)
  3. Verify tx exists on Solana RPC (verifyTransactionExists)
  4. TODO: Extract swap_type & input_amount from tx
  5. Calculate AMM output & fees
  6. Insert bonding_swap record with verified = true
  7. Insert fee_split record (source_type = BONDING_SWAP)
  8. Update pool.actual_sol_reserves
  9. Check graduation threshold (worker will handle LIVE→GRADUATING)
  10. Create bonding_events: SWAP_EXECUTED

Fee Split Detail:
  swap_fee_amount = input_amount * 150 / 10000
  treasury_fee = swap_fee_amount / 2
  referral_pool_fee = swap_fee_amount - treasury_fee

  These are recorded in bonding_swaps AND fee_splits tables.
```

### Migration Flow

#### `POST /api/v1/bonding/:pool_id/migrate/intent` - Generate Intent

Generate migration fee requirement and intent ID.

```typescript
Request: MigrateIntentRequest {
  pool_id: string;
  target_dex: 'RAYDIUM' | 'ORCA';
}

Response: MigrateIntentResponse {
  intent_id: string;
  treasury_address: string;
  required_fee_lamports: '2500000000'; // 2.5 SOL
  expires_at: string; // 10 minutes
}

Validation:
  - Pool exists
  - User is pool creator
  - Status = GRADUATING
  - target_dex is valid enum
```

#### `POST /api/v1/bonding/:pool_id/migrate/confirm` - Confirm Migration

Verify migration fee, create DEX pool, and lock LP.

```typescript
Request: MigrateConfirmRequest {
  pool_id: string;
  intent_id: string;
  fee_tx_hash: string;
  target_dex: 'RAYDIUM' | 'ORCA';
}

Response: MigrateConfirmResponse {
  success: boolean;
  dex_pool_address: string;
  migration_tx_hash: string;
  lp_lock_id: string;
  message: string;
}

Logic:
  1. Verify pool status = GRADUATING
  2. Verify fee tx: verifyBondingOperation('MIGRATE', fee_tx_hash, treasury, 2.5 SOL)
  3. Call executeDEXMigration(pool) based on target_dex:
     - RAYDIUM: Use @raydium-io/raydium-sdk
     - ORCA: Use @orca-so/sdk
  4. Create LP lock in liquidity_locks (12 months minimum)
  5. Insert dex_migrations record (status = COMPLETED)
  6. Update pool: status = GRADUATED, dex_pool_address, lp_lock_id
  7. Create bonding_events: MIGRATION_FEE_PAID, MIGRATION_COMPLETED, LP_LOCK_CREATED
```

#### `GET /api/v1/bonding/:pool_id/graduation-gates` - Check Gates

Check if pool meets all graduation requirements.

```typescript
Request: (none)

Response: GraduationGatesResponse {
  pool_id: string;
  pool_status: string;
  gates: {
    sol_threshold_met: boolean;
    lp_lock_created: boolean;
    lp_lock_duration_met: boolean; // >= 12 months
    lp_lock_active: boolean;
    team_vesting_active: boolean;
  };
  can_graduate: boolean;
  graduation_progress_percent: number;
}
```

---

## Verification Strategy

### Server-Side Verification via Solana RPC

All transaction verifications happen **server-side** via Solana RPC, without dependency on an external indexer service.

#### Module: `apps/web/lib/solana-verification.ts`

**Key Functions:**

1. **`verifyTransactionExists(txHash)`** - Check if transaction is on-chain

   ```typescript
   const connection = new Connection(RPC_ENDPOINT, 'confirmed');
   const status = await connection.getSignatureStatus(txHash);
   // Returns: SignatureStatus | null
   ```

2. **`isTransactionConfirmed(txHash, minConfirmations)`** - Ensure confirmation

   ```typescript
   // Checks: status.confirmations >= minConfirmations or status.confirmationStatus === 'finalized'
   // Default: minConfirmations = 2
   ```

3. **`verifyTransferTransaction(txHash, recipient, amount)`** - Validate SOL transfer

   ```typescript
   const tx = await connection.getTransaction(txHash);
   // Parses account keys, checks balance change for recipient
   // Verifies amount >= expected
   ```

4. **`verifySPLTransferTransaction(...)`** - Validate token transfer

   ```typescript
   // Similar to SOL transfer, but checks token account balances
   // For future use (token-to-token migrations)
   ```

5. **`waitForTransactionConfirmation(txHash, maxRetries)`** - Poll for confirmation

   ```typescript
   // Retry up to maxRetries times with delayMs between
   // Default: 30 retries = ~30 seconds timeout
   ```

6. **`verifyBondingOperation(operation, txHash, recipient, amount)`** - Complete verification
   ```typescript
   // Calls all above functions in sequence
   // Returns comprehensive result with isConfirmed, amountValid, error details
   ```

#### RPC Endpoint Configuration

```typescript
const RPC_ENDPOINT = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
```

Set via environment variable:

```bash
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com  # Mainnet
SOLANA_RPC_URL=https://api.devnet.solana.com        # Devnet
SOLANA_RPC_URL=http://localhost:8899                # Localnet
```

#### Verification Flow in API Routes

**Deploy Confirm Example:**

```typescript
// In /api/v1/bonding/:pool_id/deploy/confirm
const isValid = await verifyDeploymentFee(
  fee_tx_hash,
  TREASURY_ADDRESS,
  DEPLOY_FEE_SOL  // 500000000 lamports
);

// Internally calls verifyBondingOperation('DEPLOY', ...)
// Returns: { success, isConfirmed, txExists, amountValid, error, details }

if (!isValid) return error response;
// Update pool status to DEPLOYING
```

#### Idempotency Guarantee

Each API confirm route checks for duplicate transactions:

```typescript
// Check if tx_hash already processed (exact match)
const { data: existingSwap } = await supabase
  .from('bonding_swaps')
  .select('id')
  .eq('tx_hash', tx_hash)
  .single();

if (existingSwap) {
  // Return success (already processed)
  return { success: true, swap_id: existingSwap.id };
}
```

---

## Fee Split Model

All swap fees follow a **fixed 1.5% rate** split **50:50** between Treasury and Referral Pool.

### Fee Calculation

```typescript
// In apps/web/lib/solana-verification.ts or packages/shared/src/utils/bonding-curve.ts

function calculateSwapFee(
  inputAmount: bigint,
  swapFeeBps: number = 150 // 150 basis points = 1.5%
) {
  const totalFee = (inputAmount * BigInt(swapFeeBps)) / 10000n;
  const treasuryFee = totalFee / 2n;
  const referralPoolFee = totalFee - treasuryFee; // Handles rounding

  return { total_fee: totalFee, treasury_fee: treasuryFee, referral_pool_fee: referralPoolFee };
}
```

### Fee Distribution Example

**Swap 10 SOL (10,000,000,000 lamports)**

```
Input: 10,000,000,000 lamports
Swap Fee (1.5%): 150,000,000 lamports
  ├─ Treasury Fee (50%): 75,000,000 lamports
  └─ Referral Pool Fee (50%): 75,000,000 lamports
```

### Storage & Processing

**Recorded in Two Tables:**

1. **`bonding_swaps`** (swap-level detail)

   ```sql
   INSERT INTO bonding_swaps (
     swap_fee_amount, treasury_fee, referral_pool_fee
   ) VALUES (150000000, 75000000, 75000000);
   ```

2. **`fee_splits`** (FASE 6 integration)
   ```sql
   INSERT INTO fee_splits (
     source_type, source_id, total_amount,
     treasury_amount, referral_pool_amount,
     treasury_percent, referral_pool_percent
   ) VALUES (
     'BONDING_SWAP', <swap_id>, 150000000,
     75000000, 75000000,
     50, 50
   );
   ```

The fee_splits table enables FASE 6 distribution workers to process all fees consistently.

### Fixed Fees

All fees are fixed at pool creation and cannot be changed:

| Fee Type          | Amount  | Fixed | Trigger                           |
| ----------------- | ------- | ----- | --------------------------------- |
| **Deploy Fee**    | 0.5 SOL | ✓     | Pool creation (DRAFT→DEPLOYING)   |
| **Swap Fee**      | 1.5%    | ✓     | Each swap (always applied)        |
| **Migration Fee** | 2.5 SOL | ✓     | Graduation (GRADUATING→GRADUATED) |

---

## DEX Migration Options

### Raydium vs Orca

Developers select their target DEX at pool creation time via `target_dex` parameter.

#### **Raydium**

- **Choice:** `target_dex = 'RAYDIUM'`
- **SDK:** `@raydium-io/raydium-sdk`
- **Features:**
  - Concentrated liquidity via Clmm
  - AcceleRaytor program for LaunchPad partnerships
  - Multiple fee tiers (0.01%, 0.05%, 0.25%, 1%)
  - High capital efficiency
- **Integration Points:**
  - Pool creation: `createClmmPool(tokenA, tokenB, fee, initPrice, ...)`
  - Liquidity provision: `addLiquidity(poolAddress, amountA, amountB, ...)`
  - LP token receipt: `lpTokenMint`, `lpAmount`

#### **Orca**

- **Choice:** `target_dex = 'ORCA'`
- **SDK:** `@orca-so/sdk`
- **Features:**
  - Whirlpools (concentrated liquidity)
  - Fair Price Indicator
  - Education-first design
  - User-friendly interface
- **Integration Points:**
  - Pool creation: `createWhirlpool(tokenMintA, tokenMintB, ...)`
  - Liquidity provision: `openPosition(whirlpoolKey, ...)`
  - LP token receipt: `positionMint`, `liquidity`

### Implementation: `executeDEXMigration(pool)`

Located in `/api/v1/bonding/:pool_id/migrate/confirm`

```typescript
async function executeDEXMigration(pool: BondingPool): Promise<{
  dex_pool_address: string;
  creation_tx_hash: string;
  lp_token_mint: string;
  lp_amount: string;
}> {
  const targetDex = pool.target_dex || 'RAYDIUM';

  if (targetDex === 'RAYDIUM') {
    return migrateToRaydium(pool);
  } else if (targetDex === 'ORCA') {
    return migrateToOrca(pool);
  }

  throw new Error(`Unsupported DEX: ${targetDex}`);
}

async function migrateToRaydium(pool: BondingPool) {
  // 1. Initialize Raydium SDK
  // 2. Create pool: createClmmPool(POOL_MINT, SOL, fee=500, ...)
  // 3. Add liquidity: addLiquidity with actual_sol_reserves + actual_token_reserves
  // 4. Broadcast transaction
  // 5. Extract LP token mint and amount from response
  // 6. Return { dex_pool_address, creation_tx_hash, lp_token_mint, lp_amount }
}

async function migrateToOrca(pool: BondingPool) {
  // 1. Initialize Orca SDK
  // 2. Create Whirlpool: createWhirlpool(POOL_MINT, SOL, ...)
  // 3. Open position: openPosition with actual reserves
  // 4. Broadcast transaction
  // 5. Extract position & LP token details
  // 6. Return { dex_pool_address, creation_tx_hash, lp_token_mint, lp_amount }
}
```

### LP Lock Integration (FASE 5)

Post-migration, LP tokens are locked for minimum **12 months**:

```typescript
// In migrate/confirm after executeDEXMigration()
const lockEndDate = new Date();
lockEndDate.setMonth(lockEndDate.getMonth() + 12);

const { data: lpLock } = await supabase.from('liquidity_locks').insert({
  manager_id: creator_id,
  project_id: pool.project_id,
  token_address: lp_token_mint,
  token_symbol: `${pool.token_symbol}-LP`,
  locked_amount: lp_amount,
  chain: 'solana',
  lock_start: new Date().toISOString(),
  lock_end: lockEndDate.toISOString(),
  status: 'ACTIVE',
});
```

---

## Deployment & Setup

### Environment Variables

```bash
# Solana RPC
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# Treasury Account (for fee collection)
TREASURY_ADDRESS=<solana_pubkey_here>

# Supabase
NEXT_PUBLIC_SUPABASE_URL=<your_supabase_url>
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>

# DEX SDK Configuration (optional)
RAYDIUM_CLUSTER=mainnet-beta
ORCA_CLUSTER=mainnet
```

### Database Setup

1. **Run Migration**

   ```bash
   npx supabase migration up
   # Applies 010_fase7_bonding_curve.sql
   ```

2. **Verify Tables**

   ```sql
   SELECT tablename FROM pg_tables WHERE schemaname = 'public';
   -- Should list: bonding_pools, bonding_swaps, bonding_events, dex_migrations
   ```

3. **Check RLS Policies**
   ```sql
   SELECT tablename, policyname FROM pg_policies
   WHERE schemaname = 'public' AND tablename LIKE 'bonding%';
   ```

### Worker Setup

1. **Configure Schedule**

   ```typescript
   // In services/worker/src/index.ts
   schedule('0 */5 * * * *', () => bonding - graduation - detector.ts);
   // Runs every 5 minutes to check LIVE pools for graduation
   ```

2. **Test Local**
   ```bash
   cd services/worker
   npm run dev
   # Manually trigger: npx ts-node jobs/bonding-graduation-detector.ts
   ```

### API Endpoint Testing

```bash
# Create pool
curl -X POST http://localhost:3000/api/v1/bonding \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "uuid-here",
    "token_name": "Test Token",
    "token_symbol": "TEST",
    "total_supply": "1000000000000000000",
    "virtual_sol_reserves": "10000000000",
    "virtual_token_reserves": "1000000000000000000",
    "graduation_threshold_sol": "50000000000",
    "target_dex": "RAYDIUM"
  }'

# Get deploy intent
curl -X POST http://localhost:3000/api/v1/bonding/{pool_id}/deploy/intent \
  -H "Content-Type: application/json" \
  -d '{"pool_id": "{pool_id}"}'

# Confirm deploy fee (requires real or testnet tx)
curl -X POST http://localhost:3000/api/v1/bonding/{pool_id}/deploy/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "intent_id": "deploy_...",
    "fee_tx_hash": "real_solana_tx_hash"
  }'
```

---

## Testing & Verification

### Unit Tests

```bash
# AMM calculations
npm test -- bonding-curve.test.ts

# Type validation
npm test -- types.test.ts

# Fee split logic
npm test -- fee-split.test.ts
```

### Integration Tests

```bash
# API endpoints
npm test -- integration/bonding-api.test.ts

# Database constraints
npm test -- integration/bonding-db.test.ts

# Worker graduation detector
npm test -- integration/bonding-worker.test.ts
```

### Manual Testing Checklist

- [ ] Create pool in DRAFT status
- [ ] Pay deploy fee (testnet tx), verify status → DEPLOYING
- [ ] Pool transitions to LIVE (via worker or manual update)
- [ ] Execute swaps, verify fee split (1.5% split 50/50)
- [ ] Check bonding_swaps and fee_splits records
- [ ] Reach graduation threshold
- [ ] Pool transitions to GRADUATING (via worker)
- [ ] Select target DEX (RAYDIUM or ORCA)
- [ ] Pay migration fee, verify TX
- [ ] Verify DEX pool creation (check Raydium/Orca UI)
- [ ] Verify LP lock created in liquidity_locks table
- [ ] Pool status → GRADUATED
- [ ] Check lp_lock_id links to FASE 5 lock

### Monitoring & Logging

**Key Metrics to Track:**

1. **Pool Lifecycle** - Count by status
2. **Swap Volume** - Total SOL and tokens swapped
3. **Fee Collection** - Treasury vs Referral fees
4. **Graduation Rate** - % of LIVE pools reaching threshold
5. **DEX Choice Distribution** - % choosing Raydium vs Orca
6. **LP Lock Duration** - Average & min lock periods
7. **TX Verification Success Rate** - RPC verification failures

**Log Locations:**

- API Routes: `console.log()` in `apps/web/app/api/v1/bonding/**`
- Worker: `services/worker/jobs/bonding-graduation-detector.ts`
- Supabase: Enable edge function logs & RLS audit

---

## Appendix: Related Documentation

- **FASE 5 (LP Locks):** `/docs/fase/FASE_5_PROGRESS.md`
- **FASE 6 (Fee Splits):** `/docs/fase/FASE_6_PROGRESS.md`
- **Database Schema:** `/docs/DATABASE_SCHEMA.md`
- **Solana Integration Guide:** [Solana Docs](https://solana.com)
- **Raydium SDK:** [@raydium-io/raydium-sdk](https://github.com/raydium-io/raydium-sdk)
- **Orca SDK:** [@orca-so/sdk](https://github.com/orca-so/sdk)

---

**Last Updated:** February 9, 2026  
**Implementation Status:** ✅ In Progress
