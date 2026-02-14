
-- Comprehensive fix: Migrate ALL remaining auth.users FK references to profiles(user_id)
-- Pattern 68: Wallet-only auth uses profiles.user_id, not auth.users.id

-- 1. referral_ledger.referrer_id
ALTER TABLE referral_ledger DROP CONSTRAINT referral_ledger_referrer_id_fkey;
ALTER TABLE referral_ledger ADD CONSTRAINT referral_ledger_referrer_id_fkey
  FOREIGN KEY (referrer_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

-- 2. bluecheck_purchases.user_id
ALTER TABLE bluecheck_purchases DROP CONSTRAINT bluecheck_purchases_user_id_fkey;
ALTER TABLE bluecheck_purchases ADD CONSTRAINT bluecheck_purchases_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

-- 3. refunds.user_id
ALTER TABLE refunds DROP CONSTRAINT refunds_user_id_fkey;
ALTER TABLE refunds ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE refunds ADD CONSTRAINT refunds_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE SET NULL;

-- 4. transactions.user_id
ALTER TABLE transactions DROP CONSTRAINT transactions_user_id_fkey;
ALTER TABLE transactions ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE transactions ADD CONSTRAINT transactions_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE SET NULL;

-- 5. vesting_allocations.user_id
ALTER TABLE vesting_allocations DROP CONSTRAINT vesting_allocations_user_id_fkey;
ALTER TABLE vesting_allocations ADD CONSTRAINT vesting_allocations_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

-- 6. vesting_claims.user_id
ALTER TABLE vesting_claims DROP CONSTRAINT vesting_claims_user_id_fkey;
ALTER TABLE vesting_claims ADD CONSTRAINT vesting_claims_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

-- 7. vesting_schedules.created_by
ALTER TABLE vesting_schedules DROP CONSTRAINT vesting_schedules_created_by_fkey;
ALTER TABLE vesting_schedules ADD CONSTRAINT vesting_schedules_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES profiles(user_id) ON DELETE SET NULL;

-- 8. sbt_claims.user_id
ALTER TABLE sbt_claims DROP CONSTRAINT sbt_claims_user_id_fkey;
ALTER TABLE sbt_claims ADD CONSTRAINT sbt_claims_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

-- 9. sbt_stakes.user_id
ALTER TABLE sbt_stakes DROP CONSTRAINT sbt_stakes_user_id_fkey;
ALTER TABLE sbt_stakes ADD CONSTRAINT sbt_stakes_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

-- 10. sbt_rewards_ledger.user_id
ALTER TABLE sbt_rewards_ledger DROP CONSTRAINT sbt_rewards_ledger_user_id_fkey;
ALTER TABLE sbt_rewards_ledger ADD CONSTRAINT sbt_rewards_ledger_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

-- 11. audit_logs.actor_admin_id
ALTER TABLE audit_logs DROP CONSTRAINT audit_logs_actor_admin_id_fkey;
ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_actor_admin_id_fkey
  FOREIGN KEY (actor_admin_id) REFERENCES profiles(user_id) ON DELETE SET NULL;

-- 12. liquidity_locks.created_by
ALTER TABLE liquidity_locks DROP CONSTRAINT liquidity_locks_created_by_fkey;
ALTER TABLE liquidity_locks ADD CONSTRAINT liquidity_locks_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES profiles(user_id) ON DELETE SET NULL;

-- 13. project_badges.awarded_by
ALTER TABLE project_badges DROP CONSTRAINT project_badges_awarded_by_fkey;
ALTER TABLE project_badges ADD CONSTRAINT project_badges_awarded_by_fkey
  FOREIGN KEY (awarded_by) REFERENCES profiles(user_id) ON DELETE SET NULL;

COMMENT ON SCHEMA public IS 'All user FK references now use profiles(user_id) per Pattern 68 wallet-only auth';
