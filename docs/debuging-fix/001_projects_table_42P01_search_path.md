# Fix: `relation "projects" does not exist` (42P01)

**Date:** 2026-02-14  
**Severity:** Critical — blocks all presale & fairlaunch submissions  
**Error Code:** PostgreSQL `42P01` (undefined_table)

---

## Symptoms

- Both Presale and Fairlaunch submit endpoints return **500 Internal Server Error**
- Terminal logs show repeated:
  ```
  Presale draft project create: {
    code: '42P01',
    details: null,
    hint: null,
    message: 'relation "projects" does not exist'
  }
  ```
- The `projects` table **exists** and contains data
- Direct SQL queries (`SELECT`) work fine
- Only **INSERT** operations via Supabase JS / PostgREST fail

## Root Cause

Six PL/pgSQL trigger functions were created with `search_path=""` (empty string). When PostgREST executed an `INSERT` into `projects`, the `AFTER INSERT` trigger `trigger_auto_award_first_project_badge` fired. Inside the trigger function body:

```sql
SELECT COUNT(*) INTO project_count
FROM projects  -- ← unqualified table name
WHERE owner_user_id = NEW.owner_user_id;
```

With an empty `search_path`, PostgreSQL couldn't resolve the unqualified `projects` reference, throwing `42P01`.

### Why SELECT worked but INSERT didn't

`SELECT` queries don't fire `AFTER INSERT` triggers, so the broken function was never invoked on reads. Only write operations (`INSERT`) triggered the function, causing the error.

### Misleading error

The `42P01` error message says `relation "projects" does not exist`, which makes it look like the table is missing. The actual context (only visible in full PostgreSQL logs) reveals the error occurs **inside the trigger function**, not on the direct INSERT statement:

```
CONTEXT: PL/pgSQL function public.auto_award_first_project_badge() line 6 at SQL statement
```

## Affected Functions

| Function                           | Trigger On                          | Table             |
| ---------------------------------- | ----------------------------------- | ----------------- |
| `auto_award_first_project_badge()` | `projects` AFTER INSERT             | `projects`        |
| `assign_safu_badge_if_eligible()`  | `launch_rounds` AFTER INSERT/UPDATE | `launch_rounds`   |
| `auto_award_dev_kyc_badge()`       | `profiles` AFTER UPDATE             | `profiles`        |
| `auto_award_kyc_badge()`           | `kyc_submissions` AFTER UPDATE      | `kyc_submissions` |
| `auto_award_scan_badge()`          | `sc_scan_results` AFTER UPDATE      | `sc_scan_results` |
| `get_user_active_badges()`         | (callable function)                 | N/A               |

All had `search_path=""` and used unqualified table names.

## Fix Applied

Each function was recreated with:

1. **`SET search_path = public`** — ensures the function can find tables in the `public` schema
2. **`SECURITY DEFINER`** — executes with the owner's privileges (bypasses RLS)
3. **Fully-qualified table names** — e.g. `public.projects`, `public.badge_definitions`
4. **`ON CONFLICT DO NOTHING`** — replaced `ON CONFLICT (project_id, badge_id)` since the unique constraint doesn't exist on `project_badges`

### Example fix (auto_award_first_project_badge):

```sql
CREATE OR REPLACE FUNCTION public.auto_award_first_project_badge()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public  -- ← THIS WAS MISSING
AS $$
DECLARE
  project_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO project_count
  FROM public.projects  -- ← fully qualified
  WHERE owner_user_id = NEW.owner_user_id;

  IF project_count = 1 THEN
    INSERT INTO public.project_badges (project_id, badge_id, reason)
    SELECT NEW.id, bd.id, 'First project created'
    FROM public.badge_definitions bd
    WHERE bd.badge_key = 'FIRST_PROJECT'
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;
```

## Verification

```bash
# Before fix
curl -X POST .../rest/v1/projects ... → 42P01 "relation does not exist"

# After fix
curl -X POST .../rest/v1/projects ... → HTTP 201 (success)
```

## Prevention

When creating PL/pgSQL functions in Supabase, **always**:

1. Add `SET search_path = public` to the function definition
2. Use fully-qualified table names (`public.table_name`)
3. Test INSERT operations via PostgREST, not just direct SQL

The Supabase Dashboard SQL editor runs as `postgres` role (which has `public` in its default search path), so functions may appear to work during development but fail when called via PostgREST's `authenticator` role.

## Related Files

- `apps/web/app/api/presale/draft/route.ts` — presale draft creation (line 113 error log)
- `apps/web/src/app/api/fairlaunch/submit/route.ts` — fairlaunch submission (line 164 error log)
- `supabase/migrations/006_fase3_project_lifecycle.sql` — original trigger definitions
