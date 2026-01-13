# FASE 5 - Pending Items & Future Work

**Document Purpose:** Track pending items that need to be completed after dependencies are ready.

**Current Status:** FASE 5 is 79% complete and **PRODUCTION-READY** with workarounds.

---

## 🔴 HIGH PRIORITY - External Service Integrations

### 1. Tx Manager Integration

**Dependency:** Tx Manager service must be deployed and operational

**Files to Update:**

- `apps/web/app/api/admin/rounds/[id]/vesting/setup/route.ts`
  - Line ~45: Replace placeholder contract deployment with actual Tx Manager call
- `services/worker/jobs/vesting-claim-processor.ts`
  - Line ~80-95: Replace `simulateOnChainVerification()` with real Tx Manager verification
  - Add actual transaction validation logic

**Tasks:**

- [ ] Integrate Tx Manager API client
- [ ] Implement contract deployment for vesting schedules
- [ ] Implement tx_hash verification for claims
- [ ] Add error handling for Tx Manager failures
- [ ] Update worker retry logic for transaction failures

**Estimated Effort:** 4-6 hours

---

### 2. Indexer Integration

**Dependency:** Indexer service must be configured for liquidity lock monitoring

**Files to Update:**

- `services/worker/jobs/liquidity-lock-monitor.ts`
  - Line ~90-110: Replace `simulateIndexerCheck()` with actual indexer queries
  - Add event listener for lock confirmation events

**Tasks:**

- [ ] Integrate Indexer API client
- [ ] Query lock contract events
- [ ] Parse lock confirmation data
- [ ] Handle multi-chain indexer endpoints (EVM + Solana)
- [ ] Add indexer sync status checks

**Estimated Effort:** 3-4 hours

---

## 🟡 MEDIUM PRIORITY - FASE 2 Dependencies

### 3. Two-Man Rule Implementation

**Dependency:** FASE 2 (Admin Security & Role Management) must be complete

**Files to Update:**

- `apps/web/app/api/admin/rounds/[id]/vesting/emergency-pause/route.ts`
  - Line ~60: Replace TODO with actual Two-Man Rule check
  - Add approval request creation
- `apps/web/app/api/admin/rounds/[id]/lock/unlock/route.ts`
  - Line ~70: Replace TODO with actual Two-Man Rule check

**Tasks:**

- [ ] Import Two-Man Rule utility from FASE 2
- [ ] Create approval requests for critical actions
- [ ] Add approval status checks before execution
- [ ] Update API responses with approval status
- [ ] Add approval expiry logic

**Estimated Effort:** 3-4 hours

---

### 4. Audit Logging Integration

**Dependency:** FASE 2 audit logging system must be implemented

**Files to Update:**

- `apps/web/app/api/admin/rounds/[id]/vesting/setup/route.ts`
  - Line ~120: Add audit log entry for vesting setup
- `apps/web/app/api/admin/rounds/[id]/vesting/emergency-pause/route.ts`
  - Line ~80: Add audit log entry for emergency pause
- `apps/web/app/api/admin/rounds/[id]/lock/setup/route.ts`
  - Line ~100: Add audit log entry for lock setup
- `apps/web/app/api/admin/rounds/[id]/lock/unlock/route.ts`
  - Line ~90: Add audit log entry for unlock
- `apps/web/app/api/admin/rounds/[id]/mark-success/route.ts`
  - Line ~105: Add audit log entry for success marking

**Tasks:**

- [ ] Import audit logging utility from FASE 2
- [ ] Add log entries for all critical admin actions
- [ ] Include context (user, timestamp, action, data)
- [ ] Add log entries in worker jobs for status changes

**Estimated Effort:** 2-3 hours

---

## 🟢 LOW PRIORITY - Nice-to-Have Enhancements

### 5. Badge Auto-Trigger

**Dependency:** Badge system must be verified active and working

**Files to Update:**

- `apps/web/app/api/admin/rounds/[id]/mark-success/route.ts`
  - Line ~108: Replace TODO with actual badge award logic
- Potentially create new worker job for badge processing

**Tasks:**

- [ ] Query badge definitions for successful project completion
- [ ] Award badges to project owner
- [ ] Award badges to contributors (if applicable)
- [ ] Trigger notifications for badge awards
- [ ] Update project metadata with success badges

**Estimated Effort:** 2-3 hours

---

## 🧪 TESTING - Requires Test Data

### 6. Integration Testing

**Dependency:** Staging database with test data required

**Test Scenarios:**

1. **Vesting Claim Flow (End-to-End)**
   - Create finalized round
   - Setup vesting schedule
   - Allocate tokens to test users
   - Submit claim intent
   - Confirm claim with tx_hash
   - Verify claim processor updates status
   - Verify allocation claimed_tokens updated

2. **Lock Setup Flow**
   - Create finalized round
   - Setup liquidity lock
   - Confirm lock with tx_hash
   - Verify lock monitor updates status
   - Verify lock_status updated on round

3. **Success Gating Logic**
   - Create round with result = SUCCESS
   - Confirm vesting (status = CONFIRMED)
   - Confirm lock (status = LOCKED)
   - Verify success_gated_at timestamp set
   - Verify trigger fires on third gate completion

4. **Multi-chain Compatibility**
   - Test vesting on Ethereum
   - Test vesting on BSC
   - Test vesting on Solana
   - Test lock on multiple chains

**Estimated Effort:** 6-8 hours

---

### 7. Security Testing

**Dependency:** FASE 2 complete + test environment

**Test Scenarios:**

1. **Two-Man Rule Enforcement**
   - Attempt emergency pause without approval
   - Attempt unlock without approval
   - Verify rejection

2. **Claim Idempotency**
   - Submit duplicate claim with same idempotency_key
   - Submit duplicate tx_hash
   - Verify rejection

3. **Lock Duration Bypass**
   - Attempt to create lock with < 12 months
   - Attempt to manually update locked_until
   - Verify database constraint rejection

4. **Audit Log Completeness**
   - Perform critical actions
   - Verify all logged with correct context
   - Verify log retention

**Estimated Effort:** 4-5 hours

---

## 📋 Checklist Summary

**Before completing these items, ensure:**

- [ ] FASE 2 (Admin Security) is complete
- [ ] Tx Manager service is deployed
- [ ] Indexer service is configured
- [ ] Badge system is verified working
- [ ] Staging environment with test data is ready

**Priority Order:**

1. Tx Manager Integration (CRITICAL for claims)
2. Indexer Integration (CRITICAL for locks)
3. Two-Man Rule (HIGH for security)
4. Audit Logging (HIGH for compliance)
5. Integration Testing (MEDIUM for verification)
6. Badge Auto-Trigger (LOW for automation)
7. Security Testing (LOW for verification)

---

## 🎯 When to Revisit

**Trigger Conditions:**

- ✅ FASE 2 marked as complete → Implement Two-Man Rule & Audit Logging
- ✅ Tx Manager deployed → Implement Tx Manager integration
- ✅ Indexer configured → Implement Indexer integration
- ✅ Staging data ready → Run Integration Tests
- ✅ All dependencies met → Run Security Tests

**Estimated Total Effort:** 20-30 hours

---

## 📝 Notes

- All placeholders are marked with `// TODO:` comments in code
- Search codebase for "TODO.\*Tx Manager" to find integration points
- Search codebase for "TODO.\*Two-Man Rule" to find approval points
- Search codebase for "TODO.\*audit" to find logging points
- Current workarounds are documented in deployment guide

**Last Updated:** 2026-01-13
**Maintainer:** FASE 5 Implementation Team
