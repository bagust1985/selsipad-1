EKSEKUSI — FASE 11 (Go-Live Plan / Launch Day)
Target akhir fase 11 (Definition of Done)

✅ Prod deploy sukses (web + admin + services)
✅ Seed config (treasury, fee rules, supported networks, roles) beres
✅ Monitoring + alerting aktif dan diuji
✅ Playbook incident siap (pause/disable flows tanpa merusak hak user)
✅ 1 “Smoke Test Prod” lulus (tanpa dana besar)
✅ Switch “Public Live” dibuka dengan aman

11.1 Pre-Launch Cutover Checklist (H-1 sampai H-0)

Tujuan: sebelum tekan tombol live, semua komponen prod siap.

Eksekusi

Freeze RC → Prod Release

Tag versi final (mis: v1.0.0)

Lock migrations (hanya yang sudah diuji di staging)

Secrets & Keys

Generate/rotate secrets prod (JWT, encryption keys, provider keys)

RPC paid key server-side only

Infra readiness

Services up: tx_manager, indexer, workers (trending, reconcile, fee sweep)

DB backup policy aktif (daily + point-in-time jika ada)

DNS & SSL

Domain web + admin siap (HSTS untuk prod)

Deliverables

“Prod Readiness Checklist” (centang)

Secret rotation log (internal)

Acceptance

Semua service health-check OK

Tidak ada migration pending

11.2 Seed Config di Production (Wajib sebelum buka publik)

Tujuan: tanpa seed config, sistem bisa salah kirim dana atau salah hitung fee.

Yang harus di-seed

Supported Networks

daftar EVM chain_id + Solana flag

rpc endpoints (server only)

Treasury Wallets

per chain & per asset (mis: SOL treasury, EVM treasury, USDC treasury)

Fee Rules v1

Presale/Fairlaunch success fee split (Treasury/Referral/SBT)

Bonding swap 1.5% (50/50)

Blue check $10 (70/30)

Token creation fee (100% treasury)

SBT claim fee $10

Admin Roles

buat super_admin minimal 2 orang (untuk two-man)

reviewer/ops/finance/support

Eksekusi

Jalankan “seed script” atau admin-only endpoints yang dilindungi two-man rule

Audit log wajib tercatat

Deliverables

Record seed (snapshot JSON internal)

Audit log entry untuk tiap perubahan config

Acceptance

Fee rule bisa di-query oleh service (read-only)

Treasury address valid & sesuai chain

11.3 “Safety Switches” (Kill Switch) sebelum Public Live

Tujuan: kalau ada kejadian, bisa cepat hentikan bagian tertentu tanpa matiin semua.

Switch minimal (server-side flags)

Disable new project submissions (opsional)

Disable new rounds approvals (admin)

Disable contribute (global atau per round)

Disable finalize (admin)

Disable claims (vesting/referral/SBT) per tipe

Disable posting feed (jika spam)

Disable AMA join token issuance

Eksekusi

Feature flags di DB (system_flags) hanya admin ops/super_admin bisa ubah (two-man untuk yang terkait dana)

Deliverables

Endpoint admin: POST /v1/admin/system-flags/set

UI admin: panel flags + audit log

Acceptance

Toggle berlaku dalam <1 menit

Toggle tidak mengubah data historis, hanya block action baru

11.4 Monitoring & Alerting (Hari-H harus nyala)

Tujuan: mendeteksi stuck tx, mismatch ledger, spike abuse.

Metrics wajib

Tx Manager: pending count, confirm latency, fail rate

Indexer: lag (slot/block), event processed rate, replay duplicates

API: error rate (4xx/5xx), p95 latency

DB: slow queries, connection saturation

Financial: payout attempts, failed payouts, negative ledger anomaly

Trending worker: last snapshot age

Alerts wajib (minimal)

No trending snapshot > 20 menit

Tx pending > threshold (mis 15 menit)

Payout failures spike

5xx spike

Indexer lag > X slots/blocks

Deliverables

Dashboard prod

Alert channels (Slack/Telegram/Email internal)

Acceptance

Simulasi alert (test ping) berhasil

11.5 Prod Smoke Test (tanpa risiko besar)

Tujuan: validasi cepat setelah deploy prod.

Smoke test checklist

Login user + link wallet

Blue check purchase test (pakai amount kecil / test environment jika ada)

jika prod mainnet, lakukan “dry-run mode” atau minimal “intent-only”

Post feed (harus berhasil jika bluecheck aktif)

Admin login + MFA + RBAC

Create dummy project (internal) → submit → approve (tanpa launching dana besar)

Trending endpoint bekerja (walau kosong)

Tx manager/indexer status OK

Deliverables

Smoke test report (timestamp + hasil)

Acceptance

Semua langkah penting PASS

Tidak ada stuck background job

11.6 Public Launch Steps (Buka Akses Publik)

Tujuan: buka bertahap biar aman.

Eksekusi (recommended staged rollout)

Soft Launch (limited access)

whitelist user/dev tertentu

limited projects

Public Launch

buka landing page + onboarding

buka project listing (approved only)

fundraising bisa ditahan 12–24 jam pertama kalau perlu (opsional)

Deliverables

Launch toggle plan (flags)

Whitelist mechanism (optional)

Acceptance

Tidak ada action dana besar terbuka sebelum monitoring terbukti stabil

11.7 Launch Day Ops Runbook (Hari-H)

Tujuan: semua orang tahu apa yang dilakukan kalau ada masalah.

SOP ringkas (yang harus siap)

Incident severity S1/S2/S3

Immediate actions:

toggle kill switches sesuai area (contribute/claim/finalize)

freeze payouts jika ada bug ledger

Communication:

status page / pinned post / announcement template

Recovery:

reconcile job rerun

tx manager manual reprocess

audit export untuk investigasi

Deliverables

“Launch Day Runbook v1”

Template pengumuman incident

Acceptance

Tabletop drill 20–30 menit: tim bisa jalankan SOP tanpa bingung

11.8 Post-Deploy Verification untuk Modul Dana (Wajib)

Tujuan: pastikan semua gate dana benar-benar enforce.

Verifikasi

Finalize membutuhkan Idempotency-Key

Execute liquidity lock tidak bisa <12 bulan

Claim referral butuh patch eligibility (bluecheck + active_referral_count>=1)

Payout selalu ke primary wallet

OVERRIDDEN_PASS scan butuh two-man

Deliverables

Checklist “Financial Safety Verification”

Acceptance

Semua checks PASS di prod (dry-run atau test case kecil)

Output akhir Fase 11 (yang harus jadi)

Prod deployment + RC tag final

Seed config (networks, treasury, fee rules, roles) + audit logs

Safety switches (feature flags) siap

Monitoring & alerting aktif dan diuji

Smoke test prod report PASS

Soft launch → public launch plan + runbook hari-H
