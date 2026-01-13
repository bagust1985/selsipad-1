EKSEKUSI — FASE 3 (Project Lifecycle Core: Project → Review → Approved)
Target akhir fase 3 (Definition of Done)

✅ User bisa buat project (draft) + submit untuk review
✅ Admin bisa review & approve/reject dengan audit log
✅ KYC submission pipeline jalan (status + dokumen pointer + approval)
✅ Smart contract scan status pipeline jalan (PASS/FAIL/OVERRIDDEN_PASS via two-man)
✅ Badge system aktif (user + project badges) dan bisa jadi gating di UI/API
✅ Semua status/state konsisten dan “hard fail reasons” jelas

3.1 Data Model & Status Flow (Core)

Tujuan: struktur project & status final, supaya modul 2/3 tinggal pakai.

Schema minimum (DB)
projects

id, owner_user_id

name, symbol, description

category, tags

website, twitter, telegram, docs_url

logo_url, banner_url

chains_supported (EVM list, Solana boolean)

status (DRAFT/SUBMITTED/IN_REVIEW/APPROVED/REJECTED/LIVE)

created_at, updated_at

project_team_members (opsional v1 tapi recommended)

project_id, name, role, socials, is_public

project_admin_notes

project_id, admin_id, note, created_at

Eksekusi

Implement state machine (server-side):

DRAFT → SUBMITTED (user)

SUBMITTED → IN_REVIEW (admin reviewer)

IN_REVIEW → APPROVED/REJECTED (admin reviewer)

Guard rules:

owner hanya bisa edit saat DRAFT

setelah SUBMITTED: owner edit dibatasi (atau buat “resubmission flow”)

Deliverables

Migration tables + RLS

API:

POST /v1/projects

PATCH /v1/projects/:id (owner only, DRAFT only)

POST /v1/projects/:id/submit

GET /v1/projects/:id

GET /v1/projects (public approved only)

Acceptance

User A tidak bisa edit project user B

Project yang belum approved tidak muncul di public list

Semua status change tercatat audit (via admin endpoint)

3.2 File Upload & Asset Policy (Logo, Banner, KYC Docs)

Tujuan: asset aman, tidak bocor (terutama KYC).

Eksekusi

Storage bucket policy:

Public bucket: project_assets_public (logo/banner)

Private bucket: kyc_private_docs (hanya admin tertentu)

Signed URL:

untuk akses KYC docs: signed URL TTL pendek, hanya admin role tertentu

Virus/malware scanning (minimal v1: file type whitelist + size limit)

Deliverables

Buckets + policy

Endpoint signed URL generator untuk admin

Acceptance

User publik tidak bisa akses KYC doc walau tahu path

Logo/banner bisa diakses publik

3.3 KYC Submission Pipeline (dipakai untuk gating Presale/Fairlaunch)

Tujuan: KYC jadi syarat “eligible launch”.

Schema minimum
kyc_submissions

id, project_id, owner_user_id

status (PENDING/VERIFIED/REJECTED)

submitted_at, reviewed_at

reviewed_by_admin_id

rejection_reason

liveness_video_url (private)

selfie_with_id_url (private)

id_document_front_url (private)

id_document_back_url (private)

Eksekusi

User flow:

Upload dokumen (private)

Submit KYC → status PENDING

Admin flow:

Review → set VERIFIED atau REJECTED

Wajib isi reason kalau reject

Two-man rule untuk override ke VERIFIED bila perlu (opsional; atau cukup reviewer role + audit, tapi kalau risk tinggi: two-man)

Deliverables

API user:

POST /v1/projects/:id/kyc/start

POST /v1/projects/:id/kyc/submit

GET /v1/projects/:id/kyc/status

API admin:

GET /v1/admin/kyc?status=PENDING

POST /v1/admin/kyc/:kyc_id/review (verify/reject)

Audit log events: KYC_SUBMITTED, KYC_VERIFIED, KYC_REJECTED

Acceptance

Presale/fairlaunch nanti bisa “check gate” dari kyc_submissions.status

Dokumen KYC hanya bisa diakses admin sesuai role

3.4 Smart Contract Scan Status Pipeline (PASS/FAIL/OVERRIDDEN_PASS)

Tujuan: SC scan jadi gate penting sebelum listing.

Schema minimum
scans

id, project_id

status (PENDING/PASS/FAIL/OVERRIDDEN_PASS)

provider (manual/thirdparty)

report_url (private atau semi-private)

submitted_at, reviewed_at

reviewed_by_admin_id

override_reason (wajib jika OVERRIDDEN_PASS)

checksum/hash (opsional untuk integritas)

Eksekusi

User/dev submit:

upload report (atau input link + hash)

status PENDING

Admin review:

PASS / FAIL

OVERRIDDEN_PASS:

wajib two-man rule (request → approve)

wajib override_reason jelas

Deliverables

API:

POST /v1/projects/:id/scan/submit

GET /v1/projects/:id/scan/status

GET /v1/admin/scans?status=PENDING

POST /v1/admin/scans/:scan_id/review

two-man action type: SCAN_OVERRIDE_PASS

Acceptance

Tidak bisa set OVERRIDDEN_PASS tanpa approval 2nd admin

Semua perubahan status tercatat audit

3.5 Badge System (Mod 11) — User & Project Badges

Tujuan: badge untuk label + beberapa gating ringan (bukan RBAC).

Schema minimum
badges

code (REFERRAL_PRO, WHALE, DEV_KYC_VERIFIED, SC_AUDIT_PASS, dll)

scope (USER/PROJECT)

name, description

is_revokable

user_badges

user_id, badge_code, issued_at, revoked_at, issued_by

project_badges

project_id, badge_code, issued_at, revoked_at, issued_by

Eksekusi

Auto-badge:

Saat KYC VERIFIED → issue DEV_KYC_VERIFIED

Saat scan PASS/OVERRIDDEN_PASS → issue SC_AUDIT_PASS

Manual badge (admin):

grant/revoke via admin UI

revoke wajib reason (audit)

Worker rule engine (optional in phase 3):

bisa ditunda; yang penting infra badge siap

Deliverables

API:

GET /v1/projects/:id/badges

GET /v1/profile/:handle/badges

POST /v1/admin/badges/grant

POST /v1/admin/badges/revoke

Acceptance

Badge muncul otomatis sesuai event KYC/Scan

Badge bisa revoked dan tercatat audit

3.6 Admin Review UI (Queue) untuk Project/KYC/Scan

Tujuan: reviewer bisa kerja cepat.

Layar minimal

Project review queue (SUBMITTED)

KYC queue (PENDING)

Scan queue (PENDING)

Detail screen per item + tombol approve/reject

Notes panel + history status

Acceptance

Reviewer bisa memproses antrian tanpa akses fitur finance

Semua aksi review menghasilkan audit log

3.7 “Launch Eligibility Check” Endpoint (dipakai fase 4)

Tujuan: bikin satu fungsi standar untuk validasi sebelum presale/fairlaunch dibuat.

Eksekusi
Buat endpoint/helper:

GET /v1/projects/:id/eligibility
Return:

eligible: boolean

reasons: [KYC_NOT_VERIFIED, SCAN_NOT_PASS, ...]

Acceptance

Response sama persis dipakai UI (user & admin) untuk “kenapa tombol disabled”

Jadi single source of truth untuk gating

3.8 QA Checklist Fase 3

✅ Project status flow tidak bisa lompat (mis: DRAFT langsung APPROVED)
✅ Private storage KYC tidak bocor (uji akses langsung URL)
✅ OVERRIDDEN_PASS hanya lewat two-man action
✅ Badge auto-issue benar saat status berubah
✅ Eligibility endpoint menampilkan reasons akurat

Output akhir Fase 3 (yang harus jadi)

Project CRUD + submit/review flow

KYC submission + admin review + storage policy

Scan submission + PASS/FAIL + override via two-man

Badge system (auto + manual)

Admin queues UI + audit log lengkap

Eligibility checker endpoint siap dipakai fase 4