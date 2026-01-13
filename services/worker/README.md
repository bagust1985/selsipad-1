# FASE 4 Worker Jobs

Worker jobs for automated pool management and data integrity verification.

## Jobs

### 1. Round State Scheduler

**File:** `jobs/round-state-scheduler.ts`  
**Schedule:** Every 1 minute  
**Purpose:** Automatically transition pool states based on time

**Transitions:**

- `APPROVED → LIVE` when `start_at` time is reached
- `LIVE → ENDED` when `end_at` time has passed

**Run manually:**

```bash
cd services/worker
pnpm scheduler
```

**Run with cron:**

```bash
# Add to crontab
* * * * * cd /path/to/selsipad/services/worker && pnpm scheduler >> /var/log/round-scheduler.log 2>&1
```

---

### 2. Round Reconciliation

**File:** `jobs/round-reconciliation.ts`  
**Schedule:** Every 10 minutes  
**Purpose:** Verify data integrity and detect anomalies

**Checks:**

- `total_raised` matches sum of CONFIRMED contributions
- `total_participants` matches count of unique contributors
- Detects missing or duplicate transactions

**Auto-fix:**

- Automatically fixes mismatches in non-FINALIZED rounds
- Flags FINALIZED rounds for manual review

**Run manually:**

```bash
cd services/worker
pnpm reconcile
```

**Run with cron:**

```bash
# Add to crontab
*/10 * * * * cd /path/to/selsipad/services/worker && pnpm reconcile >> /var/log/round-reconcile.log 2>&1
```

---

## Setup

1. **Install dependencies:**

   ```bash
   cd services/worker
   pnpm install
   ```

2. **Configure environment:**
   Create `.env` file in `services/worker/`:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

3. **Test workers:**

   ```bash
   # Test state scheduler
   pnpm scheduler

   # Test reconciliation
   pnpm reconcile
   ```

4. **Deploy to production:**
   - Use cron jobs (shown above), or
   - Use a job scheduler (e.g., Vercel Cron, GitHub Actions), or
   - Use a queue system (e.g., Bull, BeeQueue)

---

## Monitoring

### State Scheduler Logs

```
🔄 Running Round State Scheduler...
Time: 2026-01-13T17:00:00.000Z
Found 3 rounds to transition APPROVED → LIVE
✅ Transitioned 3 rounds to LIVE
Found 1 rounds to transition LIVE → ENDED
✅ Transitioned 1 rounds to ENDED

📊 Summary:
  - APPROVED → LIVE: 3
  - LIVE → ENDED: 1
✅ Scheduler completed successfully
```

### Reconciliation Logs

```
🔍 Running Round Reconciliation...
Time: 2026-01-13T17:00:00.000Z
Found 10 rounds to reconcile
⚠️  Mismatch detected in round abc123:
   Total Raised: DB=1000, Actual=1050, Diff=50
   Participants: DB=5, Actual=6
🔧 Fixing mismatch for round abc123...
✅ Fixed round abc123

📊 Reconciliation Summary:
  - Total rounds checked: 10
  - Mismatches found: 1
  - Auto-fixed: 1
  - Requires manual review: 0
✅ All rounds balanced correctly
```

---

## Error Handling

Both workers include:

- ✅ Comprehensive error logging
- ✅ Transaction rollback on failures
- ✅ Retry logic for transient errors
- ✅ Alerting for critical issues

**Recommended:**

- Monitor logs for anomaly warnings
- Set up alerts for repeated failures
- Review manual review flags regularly

---

## Performance

### State Scheduler

- **Execution time:** ~100-500ms per run
- **Database queries:** 2 SELECT + 2 UPDATE (if transitions needed)
- **Impact:** Minimal (runs every minute)

### Reconciliation

- **Execution time:** ~1-5 seconds per run (depends on # rounds)
- **Database queries:** 2 queries per round + fixes
- **Impact:** Moderate (runs every 10 minutes)
- **Limit:** Processes max 100 rounds per run

---

## Notes

- Both workers use `SUPABASE_SERVICE_ROLE_KEY` for full database access
- Workers are idempotent - safe to run multiple times
- State transitions are atomic (database-level)
- Reconciliation auto-fix is conservative (only non-FINALIZED rounds)
