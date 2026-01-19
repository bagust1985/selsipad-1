Implementation Plan: Vesting, Liquidity Lock & SBT Staking Modules
Executive Summary
Analysis Date: 2026-01-18

This document provides a comprehensive analysis of three anti-rug modules (Vesting, Liquidity Lock, SBT Staking) and proposes implementation plans for missing features.

Current Status
Module Database Backend API Frontend UI Status
Vesting ✅ Complete ⚠️ Partial ✅ Complete 85% Ready
Liquidity Lock ✅ Complete ✅ Complete ❌ Missing 60% Ready
SBT Staking ❌ Missing ❌ Missing ❌ Missing 0% Ready
Part 1: Existing Implementation Analysis
1.1 Vesting Module ✅ (85% Complete)
Database Schema ✅
File:
supabase/migrations/008_fase5_vesting_lock.sql

Tables:

vesting_schedules - Round-level vesting config (TGE, cliff, linear)
vesting_allocations - User token allocations
vesting_claims - Claim history with idempotency
Key Features:

✅ TGE percentage (0-100%)
✅ Cliff period (0+ months)
✅ Linear vesting (daily/monthly)
✅ Idempotency protection via unique constraints
✅ RLS policies for user/admin access
Frontend UI Components ✅
Components Found:

VestingScheduleBuilder

File:
src/components/presale/VestingScheduleBuilder.tsx
Purpose: Create vesting schedule UI
Features: Add/edit/remove vesting entries, visual timeline
Step4InvestorVesting

File:
src/components/presale/wizard/Step4InvestorVesting.tsx
Purpose: Investor vesting configuration in presale wizard
Step5TeamVesting

File:
src/components/presale/wizard/Step5TeamVesting.tsx
Purpose: Team allocation vesting configuration
VestingClaimPanel

File:
src/components/vesting/VestingClaimPanel.tsx
Purpose: User claim interface
VestingScheduleDisplay

File:
src/components/vesting/VestingScheduleDisplay.tsx
Purpose: Read-only vesting schedule visualization
Backend API ⚠️ (Partial)
Missing:

❌ /vesting/claim POST endpoint (mentioned in modul spec)
❌ Claim calculation server-side logic
❌ Transaction manager for VESTING_CLAIM
Needed:

Implement claim calculation based on TGE timestamp
Idempotency key format: VESTING_CLAIM:{allocationId}:{hourBucket}
Status flow: CREATED → PENDING → CONFIRMED/FAILED
1.2 Liquidity Lock Module ✅ (60% Complete)
Database Schema ✅
Tables:

liquidity_locks - Lock records with 12-month minimum
round_post_finalize - Orchestration progress tracker
Key Features:

✅ Hard constraint: Minimum 12 months (lock_duration_months >= 12)
✅ DEX support: UniswapV2, Pancake, Raydium, Orca
✅ Status tracking: PENDING → LOCKED → UNLOCKED
✅ Success gating: Round cannot be final without lock_status = 'LOCKED'
Backend API ✅
Endpoints Found:

/api/rounds/[id]/lock - Lock status
/api/admin/rounds/[id]/lock/setup - Admin lock setup
/api/admin/rounds/[id]/lock/confirm - Confirm lock
/api/admin/rounds/[id]/lock/unlock - Emergency unlock
/api/admin/rounds/[id]/lock/status - Query status
Features:

✅ Admin-only lock execution
✅ Multi-chain support (EVM & Solana)
✅ Locker provider integration ready
Frontend UI ❌ (Missing)
Missing Components:

❌ Admin dashboard for lock execution
❌ Public lock status display on presale page
❌ LP lock plan configuration in wizard (Step 6)
1.3 SBT Staking Module ❌ (0% Complete)
Status: Not implemented

Requirements (from Modul 9):

SBT ownership ver(external mint, not launchpad)
Stake/unstake without cooldown
Claim reward with $10 flat fee
No Blue Check requirement
Reward from NFT_STAKING fee splits
Missing:

❌ Database schema
❌ Backend APIs
❌ Frontend UI
❌ SBT verification logic
Part 2: UI/UX Design Proposals
2.1 Vesting Claim Dashboard
Location: /portfolio or /dashboard/vesting

UI Structure:

┌─────────────────────────────────────────────────────┐
│ My Vesting Allocations │
│ │
│ ┌──────────────────────────────────────────────┐ │
│ │ Project Alpha (Presale Round) │ │
│ │ │ │
│ │ Total Allocation: 10,000 ALPHA │ │
│ │ Claimed: 2,500 (25%) │ │
│ │ Available Now: 1,500 ALPHA │ │
│ │ │ │
│ │ ███████████░░░░░░░░░░░░░ 45% Unlocked │ │
│ │ │ │
│ │ Next Unlock: 500 ALPHA in 15 days │ │
│ │ │ │
│ │ [Claim 1,500 ALPHA] 🟢 │ │
│ └──────────────────────────────────────────────┘ │
│ │
│ Vesting Schedule: │
│ • TGE Unlock: 25% (2,500) ✅ Claimed │
│ • Month 1-6: 0% (Cliff period) │
│ • Month 7-18: Linear unlock (remaining 75%) │
│ │
│ Claim History: │
│ • Jan 15, 2026: 2,500 ALPHA (TGE) ✅ │
│ • Pending: 7,500 ALPHA │
└─────────────────────────────────────────────────────┘
Key Features:

Visual progress bar
Available amount highlighted
Next unlock countdown
Claim button (disabled if 0 available)
Vesting schedule timeline
Claim history log
2.2 Liquidity Lock Status (Public View)
Location: /presale/[id] (project detail page)

UI Component: LiquidityLockBadge

┌─────────────────────────────────────────┐
│ 🔒 Liquidity Locked │
│ │
│ Lock Duration: 24 months │
│ Locked Amount: 50 BNB + 500K ALPHA │
│ DEX: PancakeSwap V2 │
│ Unlock Date: Jan 18, 2028 │
│ │
│ [View Lock Contract →] │
└─────────────────────────────────────────┘
States:

🟡 PENDING: "Liquidity lock in progress..."
🟢 LOCKED: "Liquidity locked for {months} months"
🔴 FAILED: "Lock failed - contact support"
⚪ UNLOCKED: "Lock period ended"
2.3 LP Lock Admin Dashboard
Location: /admin/liquidity-locks

UI Structure:

┌──────────────────────────────────────────────────────┐
│ Liquidity Lock Management │
├──────────────────────────────────────────────────────┤
│ │
│ Queue: Ready to Lock (3) │
│ │
│ ┌────────────────────────────────────────────────┐ │
│ │ Project Alpha - Presale #1234 │ │
│ │ LP Token: 0xabc...def │ │
│ │ Amount: 50 BNB + 500K ALPHA │ │
│ │ Duration: 24 months │ │
│ │ │ │
│ │ [Setup Lock] [Skip] [View Details] │ │
│ └────────────────────────────────────────────────┘ │
│ │
│ Active Locks (12) │
│ ┌────────────────────────────────────────────────┐ │
│ │ Project Beta │ │
│ │ Locked: Jan 1, 2026 │ │
│ │ Unlock: Jan 1, 2028 (in 730 days) │ │
│ │ Status: LOCKED 🟢 │ │
│ │ │ │
│ │ [View Lock] │ │
│ └────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
Workflow:

Admin sees queue of projects ready to lock
Click "Setup Lock" → Opens modal
Select locker provider (Team Finance, Unicrypt, etc.)
Approve LP token spend
Execute lock transaction
Confirm on-chain
Update database status
2.4 SBT Staking Dashboard (New)
Location: /staking/sbt or /dashboard/staking

UI Structure:

┌──────────────────────────────────────────────────────┐
│ SBT Staking Pool (Proof of Human) │
├──────────────────────────────────────────────────────┤
│ │
│ Your SBT Status: │
│ ✅ Verified POH SBT Holder │
│ Token ID: #1234 │
│ │
│ Staking Status: │
│ 🟢 Currently Staked │
│ Staked At: Jan 1, 2026 │
│ │
│ ┌────────────────────────────────────────────────┐ │
│ │ Accumulated Rewards │ │
│ │ │ │
│ │ 💰 125.50 USDT │ │
│ │ │ │
│ │ [Claim Rewards] ($10 fee) │ │
│ │ │ │
│ │ Last Claim: 15 days ago │ │
│ └────────────────────────────────────────────────┘ │
│ │
│ Actions: │
│ [Unstake SBT] (No cooldown, immediate) │
│ │
│ Reward Pool Info: │
│ • Source: NFT_STAKING fee splits │
│ • APY: Variable (depends on platform volume) │
│ • Total Stakers: 1,234 │
│ • Total Pool: 50,000 USDT │
└──────────────────────────────────────────────────────┘
Key Features:

SBT verification status banner
Current stake status
Reward accumulation display
Claim with $10 fee notice
Instant unstake (no cooldown)
Pool statistics
Part 3: Implementation Roadmap
Phase 1: Complete Vesting Module (2-3 days)
1.1 Backend: Claim API
Files to Create:

apps/web/app/api/vesting/claim/route.ts
apps/web/app/api/vesting/[allocationId]/claimable/route.ts
Implementation:

// Claim calculation logic
export function calculateClaimableAmount(
allocation: VestingAllocation,
schedule: VestingSchedule
): number {
const now = Date.now();
const tgeTime = new Date(schedule.tge_at).getTime();

// Before TGE: 0
if (now < tgeTime) return 0;

// TGE unlock
const tgeAmount = allocation.allocation_tokens \* (schedule.tge_percentage / 100);
let claimable = tgeAmount;

// After cliff
const cliffEnd = addMonths(tgeTime, schedule.cliff_months);
if (now >= cliffEnd) {
const vestingEnd = addMonths(cliffEnd, schedule.vesting_months);
const vestingTotal = allocation.allocation_tokens - tgeAmount;

    if (now >= vestingEnd) {
      // All vested
      claimable = allocation.allocation_tokens;
    } else {
      // Linear vesting
      const elapsed = now - cliffEnd;
      const duration = vestingEnd - cliffEnd;
      const vestedAmount = (vestingTotal * elapsed) / duration;
      claimable = tgeAmount + vestedAmount;
    }

}

// Subtract already claimed
return Math.max(0, claimable - allocation.claimed_tokens);
}
API Endpoints:

// POST /api/vesting/claim
// Body: { allocationId, amount }
// Returns: { success, txHash, newClaimedTotal }
// GET /api/vesting/[allocationId]/claimable
// Returns: { claimable, nextUnlock, schedule }
1.2 Frontend: Enhanced Claim UI
Files to Update:

src/components/vesting/VestingClaimPanel.tsx

- Add claim button + transaction flow
  src/app/portfolio/page.tsx
- Integrate claim functionality
  Tests:

Manual: Navigate to /portfolio, verify claimable amount matches calculation
Manual: Click claim, verify transaction succeeds and UI updates
Phase 2: Liquidity Lock Frontend (3-4 days)
2.1 Public Lock Display
Files to Create:

src/components/presale/LiquidityLockBadge.tsx
Implementation:

export function LiquidityLockBadge({ roundId }: Props) {
const { data: lock } = useLiquidityLock(roundId);

if (!lock) return <LockPending />;
if (lock.status === 'LOCKED') return <LockActive lock={lock} />;
if (lock.status === 'FAILED') return <LockFailed />;
return <LockUnlocked lock={lock} />;
}
Integration:

Add to presale detail page (/presale/[id])
Show lock status, duration, unlock date
Link to block explorer for lock contract
2.2 Admin Lock Dashboard
Files to Create:

src/app/admin/liquidity-locks/page.tsx
src/components/admin/LockQueue.tsx
src/components/admin/LockSetupModal.tsx
Features:

Queue of presales ready to lock
Execute lock workflow (approve + lock)
View active locks
Emergency unlock (with 2-man rule)
Tests:

Manual: Admin navigates to /admin/liquidity-locks
Manual: Execute lock on test presale
Manual: Verify status updates in database
Phase 3: SBT Staking Module (1-2 weeks)
3.1 Database Schema
File to Create: supabase/migrations/012_sbt_staking.sql

-- SBT ownership cache
CREATE TABLE sbt_ownership_cache (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
wallet_address TEXT NOT NULL,
sbt_contract TEXT NOT NULL,
token_id TEXT NOT NULL,
chain TEXT NOT NULL,
verified_at TIMESTAMPTZ NOT NULL,
is_valid BOOLEAN NOT NULL DEFAULT true,
last_check_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
UNIQUE(wallet_address, sbt_contract, token_id)
);
-- Staking positions
CREATE TABLE staking_positions (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID NOT NULL REFERENCES auth.users(id),
wallet_address TEXT NOT NULL,
sbt_token_id TEXT NOT NULL,
staked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
unstaked_at TIMESTAMPTZ,
status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'UNSTAKED')),
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Staking reward claims
CREATE TABLE staking_claims (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
position_id UUID NOT NULL REFERENCES staking_positions(id),
user_id UUID NOT NULL REFERENCES auth.users(id),
claim_amount_usdt NUMERIC(20, 2) NOT NULL CHECK (claim_amount_usdt > 0),
claim_fee_paid NUMERIC(20, 2) NOT NULL DEFAULT 10.00,
fee_payment_tx TEXT,
payout_tx TEXT,
status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID_OUT', 'FAILED')),
claimed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
paid_out_at TIMESTAMPTZ
);
3.2 Backend APIs
Files to Create:

apps/web/app/api/staking/sbt/verify/route.ts - Verify SBT ownership
apps/web/app/api/staking/sbt/stake/route.ts - Stake SBT
apps/web/app/api/staking/sbt/unstake/route.ts - Unstake (instant)
apps/web/app/api/staking/sbt/rewards/route.ts - Get claimable rewards
apps/web/app/api/staking/sbt/claim/route.ts - Claim with $10 fee
3.3 Frontend UI
Files to Create:

src/app/staking/sbt/page.tsx - Main dashboard
src/components/staking/SBTVerifyCard.tsx - Verification UI
src/components/staking/StakePanel.tsx - Stake/unstake
src/components/staking/RewardClaimPanel.tsx - Claim rewards
User Flow:

Connect wallet
Verify SBT ownership (on-chain check)
Stake SBT (update database only, no blockchain tx)
Accumulate rewards (from fee splits)
Claim rewards ($10 fee deducted before payout)
Unstake (instant, no cooldown)
Tests:

Manual: Full stake → accumulate → claim → unstake flow
Unit: Reward calculation logic
Integration: Fee deduction verification
Part 4: Verification Plan
Vesting Module
Manual Test:

Create test presale with vesting schedule
Advance time (or override TGE timestamp)
Navigate to /portfolio
Verify claimable amount displayed correctly
Click claim, verify transaction + UI update
Existing Test:

File:
src/
tests
/e2e/scenarios.test.ts
(line 46)
Test: "Listing → Presale SUCCESS → Vesting → Claim"
Run: pnpm test:e2e
Liquidity Lock
Manual Test:

Admin navigate to /admin/liquidity-locks
Execute lock on test presale
Verify database: SELECT \* FROM liquidity_locks WHERE round_id = ...
Check presale page shows lock badge
API Test:

Existing: /api/admin/rounds/[id]/lock/setup
Manual: Use Postman to test lock endpoints
SBT Staking
Manual Test (after implementation):

Connect wallet with SBT
Stake SBT
Wait for reward accumulation (or mock)
Claim rewards with $10 fee
Verify payout received
Unstake (verify instant)
Unit Test (to write):

Reward calculation logic
Fee deduction logic
Part 5: Timeline Estimate
Phase Module Duration Effort
1 Vesting - Complete claim API 2-3 days Medium
2 Liquidity Lock - Public UI 2 days Low
2 Liquidity Lock - Admin Dashboard 2-3 days Medium
3 SBT Staking - Database + API 4-5 days High
3 SBT Staking - Frontend UI 3-4 days Medium
Testing Integration + E2E 2-3 days Medium
Total Estimate: 2-3 weeks (full-time)

Part 6: Priority Recommendations
High Priority (Complete First)
Vesting Claim API - Users need to claim tokens
LP Lock Public Display - Transparency for investors
Medium Priority
LP Lock Admin Dashboard - Streamline admin workflow
Vesting UI Polish - Better UX for claim flow
Low Priority (Can Defer)
SBT Staking Module - New feature, lower urgency
Conclusion
Vesting is nearly complete (85%), needs claim API.
Liquidity Lock has solid backend (60%), needs frontend UI.
SBT Staking is entirely new (0%), requires full implementation.

Recommend starting with Phase 1 (Vesting) and Phase 2 (LP Lock UI) to complete anti-rug infrastructure, then tackle SBT Staking as a separate feature release.
