-- FASE 8: SBT Staking v2
-- Tables for SBT Rules, Active Stakes, Rewards Ledger, and Claims

-- 1. SBT Rules (Configuration)

-- Ensure trigger function exists (Fix for clean deploy/missing function)
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TABLE sbt_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chain TEXT NOT NULL CHECK (chain IN ('solana', 'evm')),
    collection_id TEXT NOT NULL, -- Mint or Contract Address
    min_balance INTEGER NOT NULL DEFAULT 1,
    name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(chain, collection_id)
);

-- 2. SBT Stakes (Active Staking Positions)
CREATE TABLE sbt_stakes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    rule_id UUID NOT NULL REFERENCES sbt_rules(id),
    wallet_address TEXT NOT NULL, -- The external wallet holding the SBT
    staked_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraint: User can only stake a specific rule once (Proof-of-Human logic)
    -- Even if they have multiple SBTs of same collection, staking is binary.
    UNIQUE(user_id, rule_id)
);

-- 3. SBT Rewards Ledger (Account Balances)
CREATE TABLE sbt_rewards_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    total_accrued NUMERIC(78, 0) DEFAULT 0, -- Massive integer support (wei/lamports)
    total_claimed NUMERIC(78, 0) DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- 4. SBT Claims (Claim Lifecycle)
CREATE TABLE sbt_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    amount NUMERIC(78, 0) NOT NULL,
    fee_tx_hash TEXT NOT NULL, -- The $10 fee payment hash
    status TEXT NOT NULL CHECK (status IN ('PENDING_FEE', 'PROCESSING', 'CONFIRMED', 'FAILED')),
    payout_tx_hash TEXT, -- The reward payout hash (optional until paid)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sbt_stakes_user ON sbt_stakes(user_id);
CREATE INDEX idx_sbt_stakes_rule ON sbt_stakes(rule_id);
CREATE INDEX idx_sbt_claims_user ON sbt_claims(user_id);
CREATE INDEX idx_sbt_claims_status ON sbt_claims(status);

-- RLS Policies

-- Enable RLS
ALTER TABLE sbt_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE sbt_stakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sbt_rewards_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE sbt_claims ENABLE ROW LEVEL SECURITY;

-- Policies

-- sbt_rules: Public read, Admin write
CREATE POLICY "Public read sbt_rules" ON sbt_rules
    FOR SELECT USING (true);

-- sbt_stakes: Users read own, Insert own
CREATE POLICY "Users read own stakes" ON sbt_stakes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own stakes" ON sbt_stakes
    FOR INSERT WITH CHECK (auth.uid() = user_id);
    
CREATE POLICY "Users delete own stakes" ON sbt_stakes
    FOR DELETE USING (auth.uid() = user_id);

-- sbt_rewards_ledger: Users read own
CREATE POLICY "Users read own ledger" ON sbt_rewards_ledger
    FOR SELECT USING (auth.uid() = user_id);

-- sbt_claims: Users read own, Insert own
CREATE POLICY "Users read own claims" ON sbt_claims
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own claims" ON sbt_claims
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_sbt_rules_modtime
    BEFORE UPDATE ON sbt_rules
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_sbt_claims_modtime
    BEFORE UPDATE ON sbt_claims
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
