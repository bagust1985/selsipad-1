# FASE 0 - Quick Reference Summary

## 📋 Document Location
**Main Deliverable:** `/docs/fase-0-deliverables/COMPLETE_FASE_0_DELIVERABLES.md`

## ✅ All 8 Deliverables Created

### 0.1 Project Charter
- MVP Objective: Multi-chain launchpad (EVM + Solana) dengan safety mechanisms
- Target Users: Creator, Investor, Community, Admin
- KPIs: Time to list <7d, Success rate >70%, Stuck tx <2%

### 0.2 Feature Switchboard
- **ON for Launch:** Presale, Fairlaunch, Lock, Vesting, Blue Check, Feed, Referral, Trending
- **Staged (Week 3-4):** Bonding Curve, SBT Staking
- **OFF:** Multi-language, Advanced Analytics

### 0.3 Status Dictionary
Complete state machines for:
- Project: DRAFT → SUBMITTED → IN_REVIEW → APPROVED → LIVE → ENDED
- Rounds: DRAFT → SUBMITTED → APPROVED → LIVE → ENDED → FINALIZED (SUCCESS/FAILED)
- Tx: CREATED → SUBMITTED → PENDING → CONFIRMED/FAILED
- Lock/Vesting: PENDING → ACTIVE → COMPLETE

### 0.4 Eligibility Rules (Truth Tables)
- **Listing:** Need KYC VERIFIED + SC Scan PASS/OVERRIDDEN_PASS
- **Success:** Need LP Lock >=12mo + Vesting ACTIVE (investor+team)
- **Posting:** Need Blue Check ACTIVE/VERIFIED
- **Referral Claim:** Need Blue Check + active_referral_count >= 1 + primary wallet set

### 0.5 Fee Rulebook
| Fee Type | Amount | Split |
|----------|--------|-------|
| Presale/Fairlaunch Success | 5% | 50% Treasury (2.5%) / 40% Referral (2%) / 10% SBT (0.5%) |
| Bonding Swap | 1.5% | 50% Treasury / 50% Referral |
| Blue Check | $10 | 70% Treasury / 30% Referral |
| Token Creation | TBD | 100% Treasury |
| SBT Claim | $10 | 100% Treasury |

### 0.6 NFR & SLO
- **Performance:** Trending <300ms, Feed <500ms
- **Security:** RLS deny-by-default, Idempotency-Key for critical endpoints
- **Incident:** S1 response <15min, kill switches ready

### 0.7 QA Strategy
6 Critical E2E Flows:
1. Presale SUCCESS → Lock → Vesting → Claim
2. Presale FAILED → Refund
3. Fairlaunch SUCCESS → Allocation
4. Blue Check → Post → Referral Claim
5. Double-Claim Protection
6. Admin Two-Man Rule

### 0.8 RACI & Timeline
- **Roles:** PO, Tech Lead, Backend, Frontend, SC, DevOps, QA, Security
- **FASE 1 Duration:** 2-3 weeks
- **Critical Path:** Repo → Auth/DB → API → Tx Manager → Integration

## 🚀 Next Actions
1. ✅ Review & sign off (PO + Tech Lead)
2. Team briefing & Q&A
3. Kickoff FASE 1

## 📊 Key Constraints Locked
- ✅ LP Lock minimum 12 months (hard enforced)
- ✅ 3-way fee split (Treasury/Referral/SBT)
- ✅ Payout always to primary wallet
- ✅ Two-man rule for critical admin actions
- ✅ Idempotency for all financial operations
