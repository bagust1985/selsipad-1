-- Migration: 002_rls_policies.sql
-- Created: 2026-01-13
-- Description: Row Level Security policies (deny-by-default for sensitive data)

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_link_nonces ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can insert their own profile (after signup)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Public can view profiles (but address privacy controlled by app logic)
CREATE POLICY "Public can view profiles"
  ON profiles FOR SELECT
  USING (TRUE);

-- ============================================
-- WALLETS POLICIES (Strict: owner-only access)
-- ============================================

-- Users can view only their own wallets
CREATE POLICY "Users can view own wallets"
  ON wallets FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own wallets
CREATE POLICY "Users can insert own wallets"
  ON wallets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own wallets (e.g., set primary)
CREATE POLICY "Users can update own wallets"
  ON wallets FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own wallets
CREATE POLICY "Users can delete own wallets"
  ON wallets FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- WALLET_LINK_NONCES POLICIES
-- ============================================

-- Service role only (no client access)
-- No policies = deny by default for non-service-role users

-- ============================================
-- TRANSACTIONS POLICIES
-- ============================================

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert/update transactions (Tx Manager)
-- No client insert policy = only service role can write

-- ============================================
-- PROJECTS POLICIES
-- ============================================

-- Users can view public projects (APPROVED, LIVE, ENDED)
CREATE POLICY "Users can view public projects"
  ON projects FOR SELECT
  USING (status IN ('APPROVED', 'LIVE', 'ENDED'));

-- Users can view their own projects (any status)
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  USING (auth.uid() = owner_user_id);

-- Users can insert their own projects
CREATE POLICY "Users can insert own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = owner_user_id);

-- Users can update their own DRAFT projects
CREATE POLICY "Users can update own draft projects"
  ON projects FOR UPDATE
  USING (auth.uid() = owner_user_id AND status = 'DRAFT');

-- ============================================
-- AUDIT_LOGS POLICIES (Service role only)
-- ============================================

-- No policies = deny all client access
-- Only service role (admin actions) can write
-- Admin users can view via service role endpoints

-- ============================================
-- NOTES
-- ============================================
-- 1. Service role bypasses RLS (used by backend/admin endpoints)
-- 2. Anonymous/authenticated users subject to these policies
-- 3. Admin actions use service role + audit logging
