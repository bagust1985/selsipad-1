# Admin Operations Runbook v1
**SELSIPAD Admin Security & Operations**

Version: 1.0  
Last Updated: 2026-01-13  
Owner: DevOps + Security Team

---

## 1. Admin Onboarding

### 1.1 Adding New Admin User

**Prerequisites:**
- User must have verified email
- Approval from Tech Lead or super_admin

**Steps:**

1. **Create User Account** (if not exists)
   ```sql
   -- In Supabase Auth dashboard or SQL:
   -- User should sign up normally first
   ```

2. **Mark as Admin**
   ```sql
   UPDATE profiles 
   SET is_admin = TRUE 
   WHERE user_id = '<USER_ID>';
   ```

3. **Grant Role** (Use Two-Man Rule)
   - Requester: Create action via API
   ```bash
   POST /api/admin/actions/request
   {
     "type": "role_grant",
     "payload": {
       "userId": "<USER_ID>",
       "role": "reviewer",  # or ops, finance, support
       "grantedBy": "<REQUESTER_ID>"
     }
   }
   ```
   - Approver: Different super_admin approves
   ```bash
   POST /api/admin/actions/<ACTION_ID>/approve
   Headers: Idempotency-Key: <UUID>
   {
     "decision": "APPROVE",
     "reason": "Approved by <NAME>"
   }
   ```

4. **Force MFA Enrollment**
   - User logs in → system detects `mfa_enabled=false`
   - Redirect to MFA enrollment page
   - User scans QR code, verifies, saves recovery codes
   - MFA now mandatory for all admin access

**Verification:**
```sql
SELECT p.user_id, p.is_admin, p.mfa_enabled, ar.role
FROM profiles p
LEFT JOIN admin_roles ar ON p.user_id = ar.user_id
WHERE p.user_id = '<USER_ID>';
```

---

## 2. Revoking Admin Access

### 2.1 Emergency Revocation (Suspected Compromise)

**Immediate Actions:**

1. **Revoke All Sessions**
   ```sql
   UPDATE admin_sessions 
   SET revoked = TRUE 
   WHERE user_id = '<USER_ID>';
   ```

2. **Disable MFA** (forces re-enrollment)
   ```sql
   UPDATE profiles 
   SET mfa_enabled = FALSE,
       mfa_secret_encrypted = NULL
   WHERE user_id = '<USER_ID>';
   ```

3. **Remove All Roles** (Use Two-Man Rule for audit)
   ```sql
   DELETE FROM admin_roles WHERE user_id = '<USER_ID>';
   ```

4. **Review Audit Logs**
   ```bash
   GET /api/admin/audit-logs?actor=<USER_ID>&startDate=<INCIDENT_DATE>
   ```

5. **Notify Team** via Slack/incident channel

---

### 2.2 Planned Offboarding

Use Two-Man Rule workflow:
```json
POST /api/admin/actions/request
{
  "type": "role_revoke",
  "payload": {
    "userId": "<USER_ID>",
    "role": "reviewer"
  }
}
```

---

## 3. Handling Suspicious Activity

### 3.1 Detecting Anomalies

**Red Flags:**
- Multiple failed MFA attempts (>5 in 10 min)
- Login from unusual IP
- Large payout approval at odd hours
- Bulk user bans
- Fee rule change without documented reason

**Query Audit Logs:**
```bash
GET /api/admin/audit-logs?actor=<USER_ID>&action=<ACTION_TYPE>
```

**Example Actions to Monitor:**
- `MFA_DISABLED` (should never happen without ticket)
- `TWO_MAN_ACTION_APPROVED` with self-approval attempt
- `PAYOUT_APPROVED` outside business hours

---

### 3.2 Incident Response

**Severity Levels:**

| Level | Definition | Response Time | Action |
|-------|-----------|--------------|---------|
| S1 | Funds at risk, exploit active | <15 min | War room, pause all payouts |
| S2 | Admin compromise suspected | <30 min | Revoke access, audit logs |
| S3 | Policy violation (e.g., self-approval attempt) | <2 hours | Investigate, warning |

**S1 Response (Active Exploit):**

1. **Activate Kill Switch**
   ```sql
   -- Pause all critical operations (add feature flag table)
   UPDATE feature_flags 
   SET enabled = FALSE 
   WHERE flag_name IN ('payouts', 'finalize_rounds', 'admin_actions');
   ```

2. **Freeze Suspicious Accounts**
   ```sql
   UPDATE profiles SET is_admin = FALSE WHERE user_id IN (...);
   ```

3. **Notify super_admins** (SMS/pager duty)

4. **Start Audit** (external security review)

---

## 4. Two-Man Rule Operations

### 4.1 Critical Actions Requiring Approval

- Grant/revoke admin roles
- Manual payout approvals
- Fee rule changes
- Treasury address changes
- Smart contract scan override (mark as PASS when failed)
- Emergency LP unlock

### 4.2 Self-Approval Detection

System automatically prevents:
```typescript
if (action.requested_by === approver.user_id) {
  throw Error('CANNOT_APPROVE_OWN_REQUEST');
}
```

**Audit Check:**
```sql
SELECT aa.id, aa.type, aa.requested_by, aaa.approved_by
FROM admin_actions aa
JOIN admin_action_approvals aaa ON aa.id = aaa.action_id
WHERE aa.requested_by = aaa.approved_by;
-- Should return 0 rows
```

---

## 5. MFA Troubleshooting

### 5.1 Lost Device (Recovery Code)

User has recovery codes (given during enrollment):

1. User enters recovery code instead of TOTP
2. System verifies hash match
3. Mark code as used
4. Generate new recovery codes
5. Force MFA re-enrollment

**Manual Recovery (emergency):**
```sql
-- Disable MFA (user must re-enroll)
UPDATE profiles 
SET mfa_enabled = FALSE, mfa_secret_encrypted = NULL 
WHERE user_id = '<USER_ID>';

-- Clear recovery codes
DELETE FROM admin_recovery_codes WHERE user_id = '<USER_ID>';
```

**Audit:**
```sql
INSERT INTO audit_logs (action, entity_type, entity_id, actor_admin_id)
VALUES ('MFA_RESET_MANUAL', 'profile', '<USER_ID>', '<SUPER_ADMIN_ID>');
```

---

### 5.2 Time Sync Issues

TOTP depends on accurate time. If user reports "invalid token":

1. Check server time: `date`
2. User should sync device time (Settings → Date & Time → Auto)
3. TOTP window is ±30 seconds (1 window tolerance)

---

## 6. Audit Log Forensics

### 6.1 Investigating Unauthorized Action

**Example: Unauthorized payout detected**

```bash
# Find the payout action
GET /api/admin/audit-logs?action=PAYOUT_APPROVED&entityId=<PAYOUT_ID>

# Trace who approved
GET /api/admin/audit-logs?action=TWO_MAN_ACTION_APPROVED&entityId=<ACTION_ID>

# Review all actions by that admin today
GET /api/admin/audit-logs?actor=<ADMIN_ID>&startDate=2026-01-13T00:00:00Z
```

**Key Fields to Check:**
- `actor_admin_id` - Who did it
- `ip_address` - Where from
- `trace_id` - Request correlation
- `before_data` / `after_data` - What changed

---

### 6.2 Export for Legal/Compliance

```sql
-- Export last 90 days
COPY (
  SELECT * FROM audit_logs 
  WHERE created_at >= NOW() - INTERVAL '90 days'
  ORDER BY created_at DESC
) TO '/tmp/audit_export_90d.csv' CSV HEADER;
```

**Retention:** Audit logs are append-only, keep forever (or per compliance requirement).

---

## 7. Break-Glass Procedure

**When:** Critical system access needed, normal approval chain broken (e.g., all admins unavailable).

**Super Admin Emergency Access:**

1. **Identify Break-Glass Account**
   - Pre-created `breakglass@selsipad.com` with super_admin role
   - MFA recovery codes in sealed envelope (ops manager safe)

2. **Access Steps:**
   - Retrieve envelope
   - Login with recovery code
   - Perform emergency action
   - **CRITICAL: Log everything manually**

3. **Post-Action:**
   - Write incident report
   - Review all actions taken
   - Rotate break-glass recovery codes
   - Team retrospective

**Audit:**
```sql
INSERT INTO audit_logs (action, actor_admin_id, entity_type, after_data)
VALUES (
  'BREAK_GLASS_ACCESS',
  '<BREAKGLASS_USER_ID>',
  'incident',
  '{"reason": "All admins unavailable during S1 incident", "ticket": "INC-12345"}'
);
```

---

## 8. Monitoring & Alerts

**Metrics to Track:**

- Failed MFA attempts per hour (alert if >10)
- Pending two-man actions age (alert if >24h)  
- Admin sessions from new IPs (log + notify)
- Audit log write failures (critical alert)

**Dashboard Queries:**

```sql
-- Pending approvals count
SELECT COUNT(*) FROM admin_actions WHERE status = 'PENDING';

-- Recent failed actions
SELECT * FROM admin_actions 
WHERE status = 'REJECTED' 
AND requested_at >= NOW() - INTERVAL '24 hours';

-- Most active admins
SELECT actor_admin_id, COUNT(*) as action_count
FROM audit_logs
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY actor_admin_id
ORDER BY action_count DESC;
```

---

## 9. Checklist: Weekly Admin Review

- [ ] Review all pending two-man actions (should be <5)
- [ ] Check for expired actions (auto-cleanup working?)
- [ ] Audit log export + backup
- [ ] Verify no self-approvals in past week
- [ ] Review MFA failures (any brute force attempts?)
- [ ] Confirm all active admins still employed
- [ ] Test break-glass recovery codes (once per quarter)

---

## 10. Contact Information

| Role | Contact | Escalation |
|------|---------|------------|
| On-Call Ops | ops-oncall@selsipad.com | Slack: #ops-emergency |
| Security Lead | security@selsipad.com | Phone: +XX-XXX-XXXX |
| Super Admin | (see encrypted doc) | - |

---

**Document Control:**
- Review: Monthly
- Owner: DevOps Lead
- Approvers: Security Lead, Tech Lead
