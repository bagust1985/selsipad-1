# Bonding Curve Solana - Deployment Checklist

**Last Updated:** February 9, 2026  
**Status:** Ready for Deployment

---

## 🔧 Pre-Deployment Setup

### Environment Configuration

- [ ] Set `SOLANA_RPC_URL`

  ```bash
  # Devnet
  SOLANA_RPC_URL=https://api.devnet.solana.com

  # Mainnet
  SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
  ```

- [ ] Set `TREASURY_ADDRESS`

  ```bash
  # Treasury wallet for fee collection
  TREASURY_ADDRESS=<your_solana_wallet_pubkey>
  ```

- [ ] Verify Supabase credentials
  ```bash
  NEXT_PUBLIC_SUPABASE_URL=<your_url>
  SUPABASE_SERVICE_ROLE_KEY=<your_key>
  ```

### Database Migration

- [ ] Run Supabase migration

  ```bash
  npx supabase migration up
  ```

- [ ] Verify tables created

  ```sql
  SELECT tablename FROM pg_tables
  WHERE schemaname = 'public'
  AND tablename LIKE 'bonding%';
  ```

  Expected: `bonding_pools`, `bonding_swaps`, `bonding_events`, `dex_migrations`

- [ ] Verify RLS policies

  ```sql
  SELECT tablename, policyname FROM pg_policies
  WHERE schemaname = 'public'
  AND tablename LIKE 'bonding%';
  ```

- [ ] Check constraints
  ```sql
  SELECT constraint_name, constraint_type
  FROM information_schema.table_constraints
  WHERE table_name LIKE 'bonding%';
  ```

---

## 📦 Code Deployment

### API Endpoints

- [ ] Deploy `apps/web/app/api/v1/bonding/route.ts`
  - POST /api/v1/bonding (create pool)
  - GET /api/v1/bonding (list pools)

- [ ] Deploy `apps/web/app/api/v1/bonding/[pool_id]/deploy/confirm/route.ts`
  - Updated with `verifyBondingOperation()`

- [ ] Deploy `apps/web/app/api/v1/bonding/[pool_id]/swap/confirm/route.ts`
  - Updated with `verifyTransactionExists()`

- [ ] Deploy `apps/web/app/api/v1/bonding/[pool_id]/migrate/confirm/route.ts`
  - Updated with `verifyBondingOperation()`

### Libraries & Utilities

- [ ] Deploy `apps/web/lib/solana-verification.ts`
  - TX verification module (no dependencies, uses @solana/web3.js)

### UI Components

- [ ] Deploy `apps/web/components/bonding/DEXSelector.tsx`
  - DEX selection, fee display, graduation progress

- [ ] Deploy `apps/web/components/bonding/CreateBondingPoolForm.tsx`
  - Pool creation form with validation

- [ ] Update `apps/web/app/bonding-curve/[id]/BondingCurveDetail.tsx`
  - Integrated fee & DEX components

### Worker Services

- [ ] Deploy worker service

  ```bash
  cd services/worker
  npm run build
  npm start
  ```

- [ ] Configure cron schedule

  ```typescript
  // Should run every 5 minutes
  schedule('0 */5 * * * *', bonding - graduation - detector);
  ```

- [ ] Test worker locally
  ```bash
  npx ts-node jobs/bonding-graduation-detector.ts
  ```

---

## 🧪 Testing & Verification

### Unit Tests

```bash
# Run bonding-specific tests
npm test -- --testPathPattern="bonding|amm"
```

Required tests:

- [ ] `calculateAMMSwap()` - AMM formula validation
- [ ] `calculateSwapFee()` - Fee split calculation
- [ ] `checkGraduationThreshold()` - Threshold logic
- [ ] Type validation - All request/response types

### Integration Tests

```bash
# Create devnet RPC client for testing
npm test -- --testPathPattern="integration/bonding"
```

Required tests:

- [ ] Pool creation with valid/invalid DEX choice
- [ ] Pool creation permission checks
- [ ] Deploy intent generation
- [ ] Deploy fee verification (mock TX)
- [ ] Swap quote calculation
- [ ] Swap confirmation (mock TX)
- [ ] Migration threshold detection
- [ ] Migration fee verification (mock TX)

### Manual Testing on Devnet

#### 1. Pool Creation

```bash
# Create new pool
curl -X POST http://localhost:3000/api/v1/bonding \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "<project_uuid>",
    "token_name": "Test Token",
    "token_symbol": "TEST",
    "total_supply": "1000000000000000000",
    "virtual_sol_reserves": "10000000000",
    "virtual_token_reserves": "1000000000000000000",
    "graduation_threshold_sol": "50000000000",
    "target_dex": "RAYDIUM"
  }'

# Verify response
# - pool.id returned
# - status = DRAFT
# - target_dex = RAYDIUM
```

- [ ] Pool created in DRAFT status
- [ ] target_dex field populated
- [ ] POOL_CREATED event recorded

#### 2. Deploy Fee Flow

```bash
# Get deploy intent
curl -X POST http://localhost:3000/api/v1/bonding/<pool_id>/deploy/intent

# Record intent_id and treasury_address

# Create devnet TX sending 0.5 SOL to treasury
# (Use Phantom wallet or Solana CLI)

# Confirm deploy fee
curl -X POST http://localhost:3000/api/v1/bonding/<pool_id>/deploy/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "intent_id": "<intent_id>",
    "fee_tx_hash": "<devnet_tx_hash>"
  }'

# Verify response
# - success = true
# - pool_status = DEPLOYING
```

- [ ] Deploy intent generated with correct fee (0.5 SOL)
- [ ] TX verified on devnet
- [ ] Status updated to DEPLOYING
- [ ] Events created (DEPLOY_FEE_PAID, DEPLOY_STARTED)
- [ ] deploy_tx_verified = true in DB

#### 3. Swap Execution

```bash
# Get swap quote
curl -X POST http://localhost:3000/api/v1/bonding/<pool_id>/swap/intent \
  -H "Content-Type: application/json" \
  -d '{
    "swap_type": "BUY",
    "input_amount": "1000000000",
    "slippage_tolerance_bps": 100
  }'

# Verify response
# - estimated_output > 0
# - swap_fee = 15000000 (1.5% of 1 SOL)
# - treasury_fee = 7500000
# - referral_pool_fee = 7500000

# Execute swap (mock with shell)
# (In real scenario, wallet signs TX)

# Confirm swap
curl -X POST http://localhost:3000/api/v1/bonding/<pool_id>/swap/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "intent_id": "<intent_id>",
    "tx_hash": "<swap_tx_hash>"
  }'
```

- [ ] Swap quote includes correct fees
- [ ] Treasury fee = 50% of total fee
- [ ] Referral fee = 50% of total fee
- [ ] Swap recorded in bonding_swaps
- [ ] Fee split recorded in fee_splits
- [ ] Pool reserves updated
- [ ] SWAP_EXECUTED event created

#### 4. Graduation Detection

```bash
# Manually test worker or wait for scheduled run
npm run worker:test

# Monitor logs for graduation detection
# Should see: "[Pool ID] 🎯 GRADUATION THRESHOLD REACHED!"

# Verify in DB
SELECT status FROM bonding_pools WHERE id = '<pool_id>';
# Should be GRADUATING
```

- [ ] Worker detects graduation threshold
- [ ] Status transitions LIVE → GRADUATING
- [ ] GRADUATION_THRESHOLD_REACHED event created
- [ ] GRADUATION_STARTED event created

#### 5. Migration Flow

```bash
# Get migration intent with DEX choice
curl -X POST http://localhost:3000/api/v1/bonding/<pool_id>/migrate/intent \
  -H "Content-Type: application/json" \
  -d '{
    "target_dex": "RAYDIUM"
  }'

# Record intent_id and required_fee_lamports (2.5 SOL)

# Create devnet TX sending 2.5 SOL to treasury

# Confirm migration
curl -X POST http://localhost:3000/api/v1/bonding/<pool_id>/migrate/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "intent_id": "<intent_id>",
    "fee_tx_hash": "<migration_tx_hash>",
    "target_dex": "RAYDIUM"
  }'
```

- [ ] Migration intent shows correct fee (2.5 SOL)
- [ ] target_dex option accepted
- [ ] TX verified on devnet
- [ ] Status transitions GRADUATING → GRADUATED
- [ ] dex_migrations record created
- [ ] LP lock created in liquidity_locks table
- [ ] Events created (MIGRATION_FEE_PAID, MIGRATION_COMPLETED, LP_LOCK_CREATED)

---

## 🔍 Production Readiness Checks

### Performance & Load

- [ ] Test with 10+ concurrent pools
- [ ] Test with 100+ swaps per second (on single pool)
- [ ] Monitor RPC response times (should be <1s)
- [ ] Monitor DB query times (should be <100ms)
- [ ] Check for connection pool exhaustion

### Security

- [ ] Verify RLS policies are enforced

  ```sql
  -- Try selecting another user's DRAFT pool
  SELECT * FROM bonding_pools WHERE status = 'DRAFT' AND creator_id != auth.uid();
  -- Should return 0 rows for non-creators
  ```

- [ ] Verify fee amounts cannot be overridden in API

  ```javascript
  // Try sending custom fee in request
  // Should be rejected or ignored
  ```

- [ ] Verify TX hashes are immutable

  ```sql
  -- Try updating tx_hash after creation
  -- Should be prevented by constraints or RLS
  ```

- [ ] Verify idempotency works
  ```bash
  # Call same confirm endpoint twice with same tx_hash
  # Second call should return success (no duplicate insert)
  ```

### Reliability

- [ ] Test RPC failover
  - [ ] Temporarily disable primary RPC
  - [ ] Verify fallback RPC is used
  - [ ] Verify error messages guide user to retry

- [ ] Test with slow RPC
  - [ ] Set RPC with high latency
  - [ ] Verify confirmation polling works
  - [ ] Verify timeout messages are helpful

- [ ] Monitor logs for errors
  ```bash
  tail -f logs/app.log | grep -i "error\|failed\|timeout"
  ```

### Documentation Review

- [ ] Read through `BONDING_CURVE_SOLANA_IMPLEMENTATION.md`
- [ ] Read through `BONDING_CURVE_QUICK_REFERENCE.md`
- [ ] Verify all API examples are correct
- [ ] Update docs with your specific URLs/addresses

---

## 📊 Monitoring Setup

### Key Metrics to Track

```
Pool Counts by Status:
  - DRAFT
  - DEPLOYING
  - LIVE
  - GRADUATING
  - GRADUATED
  - FAILED

Swap Volume:
  - Total SOL per hour
  - Total tokens per hour
  - Average swap size

Fees Collected:
  - Treasury fee total
  - Referral pool fee total

Graduation Rate:
  - % of LIVE pools reaching threshold
  - Average time to graduation

TX Verification:
  - Success rate (should be >99%)
  - Average verification time
  - Timeout count
```

### Logging Configuration

```typescript
// In API routes
console.log(`[Pool ${pool_id}] Pool created: ${pool.target_dex}`);
console.log(`[TX ${tx_hash}] Verification: ${verification.success}`);

// Structured logging (recommended)
logger.info('pool.created', {
  pool_id,
  project_id,
  target_dex,
  creator_id,
  timestamp,
});

logger.info('tx.verified', {
  operation,
  tx_hash,
  recipient,
  amount,
  success,
  timestamp,
});
```

### Alerting Rules

- [ ] Alert if RPC endpoint timeout rate > 5%
- [ ] Alert if TX verification failure rate > 1%
- [ ] Alert if pool creation failure rate > 0.1%
- [ ] Alert if worker hasn't run in 10 minutes
- [ ] Alert if graduation detector finds 0 LIVE pools (check if query broke)

---

## 🚀 Launch Day Checklist

### Before Launch

- [ ] Final code review of all modified files
- [ ] Final database migration backup
- [ ] Final environment variable verification
- [ ] Final RPC endpoint health check
- [ ] Final documentation review
- [ ] Team trained on debugging procedures
- [ ] Incident response plan reviewed

### Launch

- [ ] Deploy code to production
- [ ] Run database migration
- [ ] Verify all endpoints responding
- [ ] Verify worker running
- [ ] Monitor logs for first 1 hour
- [ ] Manual test of pool creation
- [ ] Manual test of deploy fee flow
- [ ] Manual test of swap execution

### Post-Launch

- [ ] Monitor metrics for 24 hours
- [ ] Verify graduation detection works
- [ ] Verify migration flow works
- [ ] Review logs for any errors
- [ ] Check user feedback
- [ ] Document any issues encountered

---

## 📝 Rollback Plan

If critical issues are found:

1. **Immediate:** Pause worker

   ```bash
   kill $(pgrep -f bonding-graduation-detector)
   ```

2. **Immediate:** Disable API endpoints

   ```typescript
   // In route handlers
   if (process.env.BONDING_DISABLED) {
     return NextResponse.json({ error: 'Bonding curve temporarily disabled' }, { status: 503 });
   }
   ```

3. **If DB corruption:** Restore from backup

   ```bash
   supabase db pull  # Backup current state
   supabase restore <backup_id>
   ```

4. **Code rollback:** Revert to previous commit
   ```bash
   git revert <commit_hash>
   npm run build && npm start
   ```

---

## 📞 Support & Escalation

**On Critical Issue:**

1. Set `BONDING_DISABLED=true` env var
2. Stop worker process
3. Notify team immediately
4. Review logs for root cause
5. Fix code or restore backup
6. Test thoroughly before re-enabling

**Common Issues & Fixes:**

- **"RPC timeout"** → Check RPC endpoint health, increase timeout
- **"TX not found"** → Verify TX hash, check Solana cluster
- **"Invalid recipient"** → Verify TREASURY_ADDRESS matches
- **"Invalid amount"** → Check fee amounts match hardcoded values
- **"Pool not found"** → Verify pool_id UUID, check DB access

---

## ✅ Final Verification

Before closing this checklist:

- [ ] All NEW files exist and are deployed
- [ ] All MODIFIED files are updated and deployed
- [ ] All tests pass locally and in CI/CD
- [ ] Documentation is complete and accurate
- [ ] Environment variables are configured
- [ ] Database migration has run
- [ ] Worker is scheduled and tested
- [ ] RPC endpoint is healthy
- [ ] All team members trained
- [ ] Monitoring is configured
- [ ] Rollback plan reviewed

---

**Status:** ✅ Ready for Deployment  
**Date:** February 9, 2026  
**Next Step:** Execute deployment checklist items and launch!
