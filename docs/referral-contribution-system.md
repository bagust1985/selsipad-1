# Referral & Contribution System — Production Fix Report

> Date: 2026-02-14  
> Status: ✅ All 6 fixes applied and verified

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  FE Rewards Page (/rewards)                                     │
│  └─ src/lib/data/rewards.ts  →  API Routes                     │
│       getRewards()          →  GET /api/v1/referral/rewards      │
│       getReferralStats()    →  GET /api/v1/referral/stats        │
│       claimReward()         →  POST /api/v1/referral/claim       │
│       getClaimRequirements()→  GET /api/v1/referral/claim-reqs   │
├─────────────────────────────────────────────────────────────────┤
│  Server Actions (src/actions/referral/)                          │
│  ├─ referral-code.ts     → profiles.referral_code (CRUD)        │
│  ├─ record-contribution.ts → fee_splits + referral_ledger       │
│  └─ get-stats.ts         → aggregate stats from all tables      │
├─────────────────────────────────────────────────────────────────┤
│  API Routes (/api/v1/referral/)                                 │
│  ├─ /register   → Generate referral code in profile             │
│  ├─ /activate   → Create referral_relationship                  │
│  ├─ /claim      → Mark ledger entries CLAIMED (Blue Check gate) │
│  ├─ /rewards    → GET referral_ledger entries                   │
│  ├─ /stats      → Aggregated statistics + referral_code         │
│  ├─ /claims     → Claim history                                 │
│  ├─ /leaderboard→ Top referrers                                 │
│  ├─ /my-referrals→ Referee list                                 │
│  └─ /claim-requirements → Eligibility check                     │
├─────────────────────────────────────────────────────────────────┤
│  Admin Routes (/api/admin/referral/)                            │
│  ├─ /adjust     → Manual adjustments                            │
│  └─ /analytics  → Admin analytics                               │
├─────────────────────────────────────────────────────────────────┤
│  Database Tables                                                │
│  ├─ profiles           → referral_code, active_referral_count   │
│  ├─ referral_relationships → referrer ↔ referee links           │
│  ├─ referral_ledger    → individual reward entries (CLAIMABLE)  │
│  ├─ fee_splits         → fee breakdown per contribution         │
│  └─ contributions      → on-chain contribution records          │
└─────────────────────────────────────────────────────────────────┘
```

## Database Schema

### Table: `referral_relationships`

| Column       | Type        | Nullable | Description                        |
| ------------ | ----------- | -------- | ---------------------------------- |
| id           | uuid        | NO       | PK                                 |
| referrer_id  | uuid        | NO       | User who shared code               |
| referee_id   | uuid        | NO       | User who used code                 |
| code         | text        | NO       | Referral code used (e.g. "MASTER") |
| activated_at | timestamptz | YES      | Set on first qualifying event      |
| created_at   | timestamptz | NO       | When relationship was created      |
| updated_at   | timestamptz | NO       | Last update                        |

### Table: `referral_ledger`

| Column        | Type        | Nullable | Description                                |
| ------------- | ----------- | -------- | ------------------------------------------ |
| id            | uuid        | NO       | PK                                         |
| referrer_id   | uuid        | NO       | Reward recipient                           |
| referee_id    | uuid        | YES      | Contribution source user                   |
| source_type   | text        | NO       | FAIRLAUNCH / PRESALE / BONDING / BLUECHECK |
| source_id     | uuid        | NO       | Round/project ID                           |
| amount        | numeric     | NO       | Reward amount (wei)                        |
| asset         | text        | NO       | Token (NATIVE, BNB, etc.)                  |
| chain         | text        | NO       | Chain ID (97, 56, etc.)                    |
| status        | text        | NO       | CLAIMABLE / CLAIMED                        |
| claimed_at    | timestamptz | YES      | When claimed                               |
| claim_tx_hash | text        | YES      | On-chain claim tx                          |
| created_at    | timestamptz | NO       | Record creation                            |
| updated_at    | timestamptz | NO       | Last update                                |

### Table: `fee_splits`

| Column               | Type        | Nullable | Description                                |
| -------------------- | ----------- | -------- | ------------------------------------------ |
| id                   | uuid        | NO       | PK                                         |
| source_type          | text        | NO       | FAIRLAUNCH / PRESALE / BONDING / BLUECHECK |
| source_id            | uuid        | NO       | Round/project ID                           |
| total_amount         | numeric     | NO       | Total fee amount (wei)                     |
| treasury_amount      | numeric     | NO       | Treasury share                             |
| referral_pool_amount | numeric     | NO       | Referral pool share                        |
| staking_pool_amount  | numeric     | YES      | SBT staking share                          |
| asset                | text        | NO       | Token                                      |
| chain                | text        | NO       | Chain ID                                   |
| processed            | boolean     | NO       | Whether distributed                        |
| processed_at         | timestamptz | YES      | When processed                             |
| created_at           | timestamptz | NO       | Record creation                            |

### Table: `contributions`

| Column         | Type        | Nullable | Description                  |
| -------------- | ----------- | -------- | ---------------------------- |
| id             | uuid        | NO       | PK                           |
| round_id       | uuid        | NO       | Launch round FK              |
| user_id        | uuid        | YES      | Contributor user             |
| wallet_address | text        | NO       | EVM address                  |
| amount         | numeric     | NO       | Amount (in ether)            |
| chain          | text        | NO       | Chain ID                     |
| tx_hash        | text        | NO       | On-chain tx hash             |
| tx_id          | uuid        | YES      | Internal tx tracker          |
| status         | text        | YES      | PENDING / CONFIRMED / FAILED |
| created_at     | timestamptz | YES      | Record creation              |
| confirmed_at   | timestamptz | YES      | Confirmation time            |
| claimed_at     | timestamptz | YES      | Token claim time             |
| claim_tx_hash  | text        | YES      | Token claim tx               |

## Fee Distribution (Modul 15)

| Source Type        | Fee %              | Treasury    | Referral    | SBT Staking |
| ------------------ | ------------------ | ----------- | ----------- | ----------- |
| Presale/Fairlaunch | 5% of contribution | 50% (2.5%)  | 40% (2%)    | 10% (0.5%)  |
| Bonding Curve      | 1.5% of swap       | 50% (0.75%) | 50% (0.75%) | 0%          |
| Blue Check         | 100% ($10)         | 70% ($7)    | 30% ($3)    | 0%          |

## Claim Requirements

1. **Blue Check ACTIVE** — user must have active KYC verification
2. **≥1 Active Referral** — at least one referee has made a qualifying event
3. Claims are grouped by `chain + asset` pair
4. Idempotency key prevents double-claims within 5 minutes

## Master Referral

The "MASTER" code is a special hardcoded referral code used by the platform admin account (`6da99609-21dc-4b2f-8605-f8af2c0ee404`). All users who sign up with `?ref=MASTER` are linked to this admin as their referrer.

## RLS Policies

| Table                  | RLS | Policies                                                                  |
| ---------------------- | --- | ------------------------------------------------------------------------- |
| contributions          | ✅  | Public SELECT, Insert own (user_id = auth.uid())                          |
| fee_splits             | ✅  | Service role ALL only                                                     |
| referral_ledger        | ✅  | Service role ALL, Read own (referrer_id = auth.uid())                     |
| referral_relationships | ✅  | Service role ALL, Insert own (referee_id), Read own (referrer or referee) |
| launch_rounds          | ✅  | Public SELECT, Service role ALL                                           |

## DB Functions (RPCs)

| Function                            | Purpose                                   |
| ----------------------------------- | ----------------------------------------- |
| `generate_referral_code()`          | Generate unique 8-char referral code      |
| `auto_generate_referral_code()`     | Trigger on profile creation               |
| `increment_active_referral_count()` | Increment referrer's active count         |
| `increment_round_totals()`          | Update round total_raised on contribution |

---

## Fixes Applied (2026-02-14)

### Fix 1: FE Data Layer Rewired

**File:** `src/lib/data/rewards.ts`  
**Before:** All functions (`getRewards`, `claimReward`, `claimAllRewards`, `getReferralStats`) were stubbed with `TODO: Implement` comments, returning empty data.  
**After:** Connected to real API routes (`/api/v1/referral/rewards`, `/stats`, `/claim`). Added wei-to-ether conversion and chain-based currency detection.

### Fix 2: Referral Ledger Entries Now Include referee_id

**File:** `src/actions/referral/record-contribution.ts`  
**Before:** `recordContribution()` only created `fee_splits` records. No `referral_ledger` entry was created, and when they were created elsewhere, `referee_id` was always NULL.  
**After:** After fee_split insert, if the contributor has a referrer, a `referral_ledger` entry is created with `referee_id` populated. Fee splits are auto-marked as processed.

### Fix 3: Currency Display Fixed (SOL → BNB)

**File:** `src/app/rewards/page.tsx`  
**Before:** Hardcoded "SOL" everywhere.  
**After:** Dynamic currency from reward data, defaulting to "BNB" (matching BSC chain).

### Fix 4: Referral Benefits Text Updated

**File:** `src/app/rewards/page.tsx`  
**Before:** Incorrect "0.1 SOL for KYC" and "5% of first contribution".  
**After:** Matches Modul 15: "2% of contribution (40% of 5% fee)", "0.75% of swap", "$3 per Blue Check".

### Fix 5: Dead Code Removed

**File:** `src/lib/data/contribution-recording.ts`  
**Action:** Deleted. This file had duplicate `recordContribution()` and `createReferralReward()` functions that were never imported anywhere.

### Fix 6: launch_rounds RLS Enabled

**Migration:** `enable_launch_rounds_rls`  
**Before:** RLS disabled — all data publicly writable.  
**After:** RLS enabled with public SELECT (transparency) and service_role-only writes.

### DB Backfill

- Backfilled `referee_id` on all 3 existing `referral_ledger` entries that had NULL values.
- Stats API route updated to include `referral_code` field from profiles.
