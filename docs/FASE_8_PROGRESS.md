# FASE 8: SBT Staking v2 - Implementation Progress

## Goal

Implement a Proof-of-Human staking system using external Soulbound Tokens (SBT) from Solana and EVM chains. Users stake SBTs to earn rewards from the `NFT_STAKING` fee bucket, with a $10 fee for claiming rewards.

## Status Overview

- **Status:** In Progress
- **Completion:** ~85%
- **Pending:** Integration Testing & Documentation

## Implementation Details

### 1. Database & Foundation (Complete)

- **Tables Created:**
  - `sbt_rules`: Configuration for eligible collections.
  - `sbt_stakes`: Active stakes (Unique user+rule).
  - `sbt_rewards_ledger`: User reward balances.
  - `sbt_claims`: Claim history (Fee payment tracking).
- **Security:** RLS policies enforced (Users manage own stakes/claims).

### 2. API Endpoints (Complete)

- **Staking:**
  - `GET /api/v1/sbt/eligibility`: Checks wallet against configured rules.
  - `POST /api/v1/sbt/stake`: Idempotent staking.
  - `POST /api/v1/sbt/unstake`: Instant unstaking (no cooldown).
- **Claims:**
  - `POST /api/v1/sbt/claim/intent`: Generates intent with $10 fee (0.1 SOL).
  - `POST /api/v1/sbt/claim/confirm`: Verifies fee tx and records claim.
- **Admin:**
  - `GET/POST /api/admin/sbt/rules`: Manage staking rules.

### 3. Reward Engine (Complete)

- **Worker:** `services/worker/jobs/sbt-reward-distributor.ts`
  - Extracts fees from `NFT_STAKING` source.
  - Splits equally among active stakers.
  - Updates ledegers idempotently.

### 4. Shared Utilities (Complete)

- **Verification:** `verifySbtOwnership` implemented with mock RPC support.
- **Caching:** In-memory caching for validation efficiency.

### 5. Hardening & Security (Complete)

- **Payout Processor:** `jobs/sbt-payout-processor.ts` developed.
- **Admin Security:** Two-Man Rule enforced on `PUT /admin/sbt/rules/[id]`.
- **Audit Logging:** Handled via `admin_actions` table.

## Verification Status

### Unit Tests

- [ ] Reward math validation.
- [ ] Type safety checks.

### Integration Tests

- [ ] Stake flow (Idempotency check).
- [ ] Unstake flow.
- [ ] Reward accrual simulation.
- [ ] Claim flow (Fee verification).

## Next Steps

1.  Verify database migration success.
2.  Implement Integration Tests (`fase8.test.ts`).
3.  Finalize documentation.
