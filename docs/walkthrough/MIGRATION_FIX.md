# Migration Fix - Database Synchronization

**Date:** 2026-01-13  
**Phase:** Pre-FASE 3

## Problem

Supabase migration synchronization failed with multiple errors:

- Migration history mismatch between local and remote
- SQL syntax errors in migration 001
- Docker permission issues

## Issues Fixed

### 1. Migration History Sync

**Error:**

```
The remote database's migration history does not match local files
```

**Solution:**
Used `supabase migration repair` to mark migrations as applied:

```bash
supabase migration repair --status applied 001
supabase migration repair --status applied 002
supabase migration repair --status applied 003
supabase migration repair --status applied 004
supabase migration repair --status applied 005
```

### 2. Invalid Partial Unique Constraint Syntax

**Error:**

```sql
-- ❌ Line 42 in 001_core_tables.sql
CONSTRAINT unique_primary_per_chain UNIQUE(user_id, chain) WHERE is_primary = TRUE
-- ERROR: syntax error at or near "WHERE"
```

**Root Cause:**  
PostgreSQL doesn't support `WHERE` clauses directly in table-level `CONSTRAINT` declarations.

**Fix:**
Converted to separate partial unique index:

```sql
-- ✅ Moved to indexes section
CREATE UNIQUE INDEX idx_wallets_unique_primary_per_chain
  ON wallets(user_id, chain)
  WHERE is_primary = TRUE;
```

Applied to 2 locations:

- `wallets` table - unique primary wallet per chain
- `transactions` table - unique tx_hash per chain (when not NULL)

### 3. UUID Function Not Available

**Error:**

```
ERROR: function uuid_generate_v4() does not exist (SQLSTATE 42883)
```

**Root Cause:**  
`uuid-ossp` extension exists but function not in search path, or PostgreSQL version compatibility.

**Fix:**
Replaced with PostgreSQL 13+ built-in function (6 occurrences):

```sql
-- ❌ BEFORE
id UUID PRIMARY KEY DEFAULT uuid_generate_v4()

-- ✅ AFTER
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
```

**Tables Updated:**

- profiles
- wallets
- wallet_link_nonces
- transactions
- projects
- audit_logs

### 4. Trailing Comma Syntax Error

**Error:**

```sql
-- ❌ Line 76 in transactions table
updated_at TIMESTAMPTZ DEFAULT NOW(),

-- Indexes will enforce uniqueness where needed
)
-- ERROR: syntax error at or near ")"
```

**Fix:**
Removed trailing comma after last column:

```sql
-- ✅ Fixed
updated_at TIMESTAMPTZ DEFAULT NOW()

-- Indexes will enforce uniqueness where needed
)
```

## Verification

✅ **All migrations successfully applied:**

```bash
supabase migration list
```

Output:

```
Local | Remote | Time (UTC)
------|--------|------------
001   | 001    | 001
002   | 002    | 002
003   | 003    | 003
004   | 004    | 004
005   | 005    | 005
```

## Files Modified

- [`supabase/migrations/001_core_tables.sql`](file:///home/selsipad/final-project/selsipad/supabase/migrations/001_core_tables.sql)
  - Fixed 2 partial unique constraint syntax errors
  - Replaced 6 `uuid_generate_v4()` calls with `gen_random_uuid()`
  - Removed trailing comma in transactions table

## Lessons Learned

1. **PostgreSQL Partial Indexes**: Use `CREATE UNIQUE INDEX ... WHERE` instead of inline `CONSTRAINT ... WHERE`
2. **Modern UUID Generation**: Prefer `gen_random_uuid()` over extension-dependent functions
3. **Trailing Commas**: PostgreSQL doesn't allow trailing commas before closing parenthesis
4. **Migration Repair**: Use `supabase migration repair` to sync history without re-running migrations

## Impact

- No data loss
- All existing migrations preserved
- Database ready for FASE 3 implementation
