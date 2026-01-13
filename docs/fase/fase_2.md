EKSEKUSI — FASE 2 (Admin Security & Ops Control)
Target akhir fase 2 (Definition of Done)

✅ Admin portal domain terpisah + akses aman
✅ MFA wajib untuk semua admin
✅ RBAC server-side (bukan UI doang) + role matrix jelas
✅ Two-man rule untuk aksi kritis + workflow request→approve
✅ Audit log append-only & lengkap
✅ Proteksi abuse: rate limit, session hardening, IP allowlist (opsional)
✅ “Admin Ops Runbook v1” (SOP) siap dipakai

2.1 Admin App & Security Boundary (Mod 12 + Mod 15)

Tujuan: pisahkan risiko admin dari web user.

Eksekusi

Pastikan apps/admin deploy di domain/subdomain terpisah

Disable semua “admin access lewat web user” (nggak boleh ada route admin di apps/web)

Session hardening:

secure cookies, short-lived access token + refresh

device/session list (opsional tapi bagus)

CORS ketat: admin API hanya dari domain admin

Deliverables

Admin app live di staging domain terpisah

Config security header (CSP minimal, HSTS untuk prod)

Acceptance

Admin API tidak bisa di-call dari domain web user

Tidak ada secret/service role key bocor ke admin client

2.2 MFA TOTP untuk Admin (Mod 12)

Tujuan: admin tanpa MFA = NO ACCESS.

Eksekusi

Tambah field di admin_profiles / profiles:

mfa_enabled, mfa_verified_at, mfa_secret_encrypted

Flow:

Admin login → jika mfa_enabled=false wajib enroll

Generate TOTP secret server-side, tampilkan QR

Verify code → set enabled

Recovery codes (wajib minimal 1 set) disimpan hashed

Deliverables

Endpoint:

POST /v1/admin/mfa/enroll

POST /v1/admin/mfa/verify

POST /v1/admin/mfa/recovery (generate/rotate)

UI enroll & verify MFA

Acceptance

Admin tanpa MFA tidak bisa akses dashboard

Session admin invalid kalau MFA dicabut/rotate

2.3 RBAC Matrix & Server-side Enforcement (Mod 12 + Mod 14)

Tujuan: kontrol “siapa boleh apa”.

Role minimal (rekomendasi MVP)

super_admin: semua

reviewer: review KYC/scan, approve listing

ops: manage project status, pause/cancel (non-finance)

finance: payout approvals, treasury view

support: ban user, revoke blue check (tanpa finance)

Eksekusi

Schema:

admin_roles(admin_user_id, role)

optional: admin_permissions(role, permission)

Implement guard middleware server-side:

requireAdmin()

requireRole([...])

requireMFA()

Semua /v1/admin/* harus lewat guard

Deliverables

RBAC matrix dokumen (role → permissions)

Middleware guard reusable di Edge Functions/API

Acceptance

Coba akses endpoint tanpa role → 403

UI admin tidak bisa “bypass” karena enforcement di server

2.4 Audit Log Append-only (Mod 12)

Tujuan: setiap aksi admin tercatat rapi (forensik + compliance).

Apa yang WAJIB diaudit (fase 2)

Login admin (success/fail)

Enroll/disable MFA

Role grant/revoke

Project status changes (approve/reject/live/pause/cancel)

Perubahan fee rules / treasury config

Manual override scan status

Ban user / revoke blue check

Semua aksi two-man rule (request & approve)

Eksekusi

Table audit_logs:

id, at, actor_admin_id, action, entity_type, entity_id, before, after, ip, user_agent, trace_id

Append-only constraint:

tidak ada UPDATE/DELETE (pakai policy + DB trigger)

Write audit log server-side saja

Deliverables

Table + trigger append-only

Helper writeAuditLog()

Acceptance

Tidak bisa edit/hapus audit log walau admin biasa

Semua endpoint admin nulis audit log otomatis

2.5 Two-man Rule Workflow (Mod 12)

Tujuan: aksi kritis harus “request → approve oleh orang berbeda”.

Aksi yang wajib two-man (MVP)

Grant/revoke admin roles

Manual payout / treasury transfer

Perubahan fee rules & treasury addresses

Override KYC/scan menjadi PASS (OVERRIDDEN_PASS)

Unlock/override liquidity lock (kalau ada emergency)

Approve “listing to LIVE” (opsional: bisa reviewer+approver terpisah)

Eksekusi

Schema:

admin_actions (request)

id, type, payload_json, status(PENDING/APPROVED/REJECTED/EXPIRED), requested_by, requested_at, expires_at

admin_action_approvals

action_id, approved_by, approved_at, decision

Rule enforcement:

requester tidak boleh approve sendiri

minimal 1 approver (atau 2 untuk super critical)

idempotent: satu action dieksekusi sekali

Action executor:

setelah approve → server menjalankan perubahan (transaction DB) → audit log

Deliverables

Endpoint:

POST /v1/admin/actions/request

POST /v1/admin/actions/:id/approve

POST /v1/admin/actions/:id/reject

GET /v1/admin/actions?status=PENDING

UI queue “Pending approvals”

Acceptance

Requester mencoba approve → ditolak

Approve menjalankan perubahan persis sekali (no double execute)

Semua step tercatat audit

2.6 Hardening Endpoint Admin (Mod 12 + Mod 14)

Tujuan: cegah abuse, brute force, replay.

Eksekusi

Rate limit:

login, MFA verify, role changes, payout approve

Idempotency-Key:

untuk approve actions, payout, treasury changes

IP allowlist (opsional tapi recommended untuk finance/super_admin)

“Break-glass” policy:

akun super_admin emergency + proses audit ketat (access log)

Deliverables

Rate limit middleware

Idempotency middleware dipakai di endpoint kritis

Acceptance

Brute force MFA ke-block

Duplicate approve dengan key sama tidak jalan dua kali

2.7 Admin Dashboard Modules (UI Minimal untuk Ops) (Mod 12)

Tujuan: admin bisa operasi dasar dari awal.

Layar minimal

Admin home (health status: tx_manager/indexer up/down)

User management (ban/unban, blue check revoke)

Project review queue (status + documents pointer)

Two-man approval queue

Audit log viewer (filter by action/entity/actor/date)

Deliverables

UI pages di admin app + API integration

Acceptance

Admin reviewer bisa approve listing (tanpa finance)

Finance bisa lihat queue payout/treasury changes (tanpa akses KYC docs kalau dibatasi)

2.8 Runbook & SOP (Ops Playbook v1)

Tujuan: biar tim ops nggak improvisasi saat live.

SOP yang harus ada

Cara onboard admin baru (MFA wajib + role)

Cara revoke akses admin

Cara handle suspicious payout / fraud

Cara pause project/launch

Cara eskalasi incident (severity levels)

Cara audit trail export untuk investigasi

Deliverables

“Admin Ops Runbook v1” (markdown/doc)

Acceptance

Simulasi tabletop incident 30 menit: semua langkah jelas

Output akhir Fase 2 (yang harus jadi)

Admin portal domain terpisah + security headers

MFA TOTP wajib + recovery codes

RBAC matrix + server-side guards

Audit log append-only + viewer

Two-man rule system (request/approve/reject) + queue UI

Rate limit + idempotency untuk endpoint admin kritis

Ops Runbook v1