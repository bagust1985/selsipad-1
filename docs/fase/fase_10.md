EKSEKUSI — FASE 10 (QA Hardening + Security + Pre-Launch)
Target akhir fase 10 (Definition of Done)

✅ Semua critical E2E flows lulus di staging (success/fail/refund/claim/lock)
✅ Tidak ada bug P0/P1
✅ Security baseline lulus (RLS, idempotency, secrets, RBAC/MFA, two-man rule)
✅ Monitoring + alerting minimum siap
✅ “Go/No-Go Checklist” siap ditandatangani

10.1 Freeze Scope + Release Candidate (RC)

Tujuan: stop nambah fitur, fokus stabilisasi.

Eksekusi

Cut-off fitur (hanya bugfix)

Buat release branch rc/*

Tag build staging sebagai “RC build”

Checklist: schema migration locked (no breaking change)

Deliverables

RC notes + changelog

Daftar bug triage board (P0/P1/P2)

Acceptance

Tidak ada fitur baru masuk RC (kecuali wajib untuk fix)

10.2 Test Strategy & Coverage Map (berdasarkan modul)

Tujuan: semua modul tersentuh minimal oleh test yang relevan.

A. Unit Tests (wajib)

Vesting claimable calculator (cliff, interval, rounding, end)

Fairlaunch final_price + allocation formula

Presale hardcap policy (first-confirmed / pro-rata) konsisten

Fee split writer (70/30, 50/50, success fee splits)

Eligibility checker (KYC/scan/lock/vesting gates)

Idempotency handler (same key → same result)

B. Integration Tests (wajib)

Tx Manager: submit → confirm → DB update

Indexer replay: event yang sama tidak dobel insert

RLS: user A tidak bisa akses data user B

C. E2E Tests (wajib)

(Detail flow ada di 10.3)

Deliverables

Test matrix: Test ID → Modul → endpoint → expected

Coverage minimum (mis: 70% untuk core logic)

Acceptance

Semua unit test core pass

Integration suite pass di CI

10.3 Critical E2E Scenarios (Release Gate)

Tujuan: simulasi real production, dari awal sampai akhir.

Flow E2E-01: Project Listing → Presale SUCCESS → Vesting + LP Lock → Claim

User buat project → submit

Admin approve project + KYC VERIFIED + scan PASS

User buat presale round → submit

Admin approve → round LIVE

3 user contribute (EVM/Solana sesuai target)

Round ENDED → admin finalize SUCCESS

Orchestrator buat investor vesting + team vesting

Execute liquidity lock (min 12 bulan) → LOCKED

Success gates PASSED

Investor claim vesting (tge portion) → payout confirmed

Expected

No double credit contribution

Lock+vesting wajib sebelum “project success”

Claim ke primary wallet

Flow E2E-02: Presale FAILED → Refund

Presale berjalan tapi total_raised < softcap

Finalize FAILED

User claim refund

Refund tx confirmed, status REFUNDED

Expected

Refund hanya sekali

Refund blocked jika primary wallet belum set (dengan reason jelas)

Flow E2E-03: Fairlaunch SUCCESS → Allocation → Gates

Fairlaunch contribute banyak user

Finalize SUCCESS → final_price computed

allocation per user benar

liquidity target ≥70% tersimpan

lock + vesting completed → success gates passed

Expected

final_price tepat (total_raised / token_for_sale)

total allocation token konsisten

Flow E2E-04: Blue Check → Posting → Referral Claim Eligibility (Patch)

User A jadi referrer (punya 1 referee yang qualifying)

User A beli Blue Check → ACTIVE

User A bisa posting

User A claim referral → berhasil

Jika user B Blue Check tapi active_referral_count=0 → claim ditolak

Expected

Gate posting hanya untuk bluecheck

Patch rule ditegakkan

Flow E2E-05: AMA End-to-end

Host submit AMA + bayar

Admin approve

User join token generate (TTL)

Token expired tidak bisa dipakai ulang

Expected

Token tidak reusable & tidak lintas user

Flow E2E-06: Bonding Curve Swap → Fee Split → Graduation → Lock+Vesting

Deploy bonding pool

Swap buy/sell confirm

Fee 1.5% split 50/50 tercatat

Threshold tercapai → GRADUATING

Migrate to DEX (fee 2.5 SOL)

LP lock 12 bulan + team vesting → graduation gates passed

Expected

Indexer idempotent (replay aman)

Graduation “complete” hanya jika lock+vesting done

Flow E2E-07: SBT Staking

User eligible SBT → stake

Reward accrual worker runs

Claim reward: fee $10 wajib → payout confirmed

Expected

Tidak bisa payout sebelum fee confirmed

Unstake tanpa cooldown

10.4 Security Hardening Checklist (P0)

Tujuan: jangan live kalau ini belum hijau.

A. Secrets & Access

Service role key tidak pernah di client

RPC paid key server-side only

Rotate secrets untuk staging sebelum prod

B. Auth/RBAC/MFA

Admin MFA enforced

RBAC enforcement server-side

Two-man rule untuk aksi kritis jalan

C. Database Security (RLS)

deny-by-default untuk sensitif

PII & KYC docs private bucket + signed URL TTL

Audit logs append-only

D. Idempotency & Replay Protection

Idempotency-Key untuk finalize/claim/payout/execute lock

Wallet nonce single-use untuk signature login/link

E. Rate Limiting

login/MFA verify

create post

claim referral

join AMA token

Deliverables

Security checklist doc + hasil verifikasi (pass/fail)

Threat model ringkas (top 10 risks + mitigations)

Acceptance

Semua item P0 PASS, tidak ada “accepted risk” untuk dana

10.5 Performance & Load Testing (minimal)

Tujuan: UI tidak lambat & worker tidak jebol.

Target minimal

/v1/trending p95 < 300ms

Feed list p95 < 500ms (dengan pagination)

Tx manager reconcile tidak backlog > 2 interval

Eksekusi

Load test:

200–500 req/min trending

100 req/min feed

burst posting (rate limited)

DB index review:

posts(project_id, created_at)

contributions(round_id, status)

ledger(user_id, status)

Deliverables

Hasil load test + rekomendasi index

Parameter rate limit final

Acceptance

p95 sesuai target atau ada mitigation (cache/index)

10.6 Data Integrity & Reconciliation (Anti mismatch)

Tujuan: kalau indexer delay, data tetap bisa pulih.

Eksekusi

Reconcile jobs:

round totals recompute dari contributions confirmed

ledger totals recompute dari fee_events

trending snapshot sanity check

Anomaly detector:

tx pending terlalu lama

payout gagal berulang

negative balances (harus 0)

Deliverables

Reconcile scripts + cron schedule

Alert rules untuk anomalies

Acceptance

Restart services tidak menyebabkan double payout/credit

10.7 Staging Dress Rehearsal (Simulasi Launch Day)

Tujuan: latihan persis seperti production.

Eksekusi

Buat 1 project “Dummy Live”:

jalankan E2E-01 sampai selesai

Buat 1 project “Dummy Fail”:

jalankan E2E-02

Latihan incident:

simulate stuck tx

simulate admin revoke bluecheck

simulate pause claim

Deliverables

Checklist rehearsal + hasil (screenshots/logs)

Post-mortem rehearsal (apa yang perlu diperbaiki)

Acceptance

Tim ops bisa menjalankan SOP tanpa improvisasi besar

10.8 Go/No-Go Checklist (sign-off)

Wajib hijau

Semua E2E-01 s/d E2E-07 PASS

Security P0 PASS

Monitoring & alerting aktif

Backup & restore test minimal 1x

RC build tags siap untuk prod deploy

Deliverables

Go/No-Go sheet + sign-off owner (PO/TechLead/Sec/Ops)

Output akhir Fase 10 (yang harus jadi)

Release Candidate + scope freeze

Test matrix (unit/integration/e2e) + hasil PASS

Security checklist P0 PASS

Load test report + tuning index/cache

Reconcile jobs + alerts

Dress rehearsal report + readiness sign-off
