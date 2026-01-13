Roadmap Build → Live (berdasarkan modul)
FASE 0 — Scope Lock & Baseline (1–3 hari kerja)
Output utama

Dokumen scope MVP final (fitur ON/OFF)

“Definition of Done” per modul

Risk register (critical: funds, admin, compliance)

Checklist

Semua istilah status distandarkan (DRAFT/REVIEW/APPROVED/LIVE/SUCCESS/FAILED)

Semua gate rule disepakati: LP lock min 12 bulan, vesting wajib, Blue Check rule, payout ke primary wallet

Semua chain target disepakati: EVM networks + Solana

FASE 1 — Fondasi Sistem & Repo (Modul 15 + Modul 14 + Modul 1)

Tujuan: sebelum bikin fitur, pondasi harus rapih: repo, auth, DB, API contract, chain adapter.

1.1 Repo & Environment (Modul 15)

Deliverables

Monorepo (Turborepo) siap: apps/web, apps/admin, packages/shared, packages/ui, services/indexer, services/tx_manager

CI/CD minimal: lint + test + typecheck + deploy staging

Secret management + env separation (dev/staging/prod)

Acceptance

Build semua app bisa jalan dari fresh clone

Secret tidak pernah masuk client bundle

Observability minimal: logs + trace id

1.2 Auth + Profile + Wallet Linking (Modul 8)

Deliverables

Supabase Auth setup

Wallet connect + signature nonce challenge

Multi-wallet table + primary wallet per chain

Privacy rule: hide address default

Acceptance

User bisa login, link wallet EVM dan Solana, set primary wallet

Admin bisa ban user (audit log)

1.3 DB schema core + RLS baseline (Modul 15 + Modul 12)

Deliverables

Tabel inti: users/profiles, wallets, projects, launches, txs, ledger, audit_logs

RLS deny-by-default untuk tabel sensitif

Acceptance

Query dari client tidak bisa baca data sensitif tanpa policy

Audit log append-only

1.4 API Contract (Modul 14)

Deliverables

Endpoint /v1/* dan /v1/admin/* (Edge Functions)

Standar error/pagination/idempotency-key

Acceptance

Semua endpoint sensitif punya Idempotency-Key

Admin endpoints tidak bisa dipanggil tanpa RBAC + MFA

1.5 Multi-network adapter + Tx Manager skeleton (Modul 1)

Deliverables

Chain adapter layer (EVM + Solana)

Tx Manager: submit tx, track status, reconcile, retry policy

Indexer skeleton: ingest event → update DB

Acceptance

UI hanya baca dari DB (bukan chain langsung)

Satu transaksi “finalize / claim / lock” tercatat end-to-end (submit → mined → DB updated)

FASE 2 — Admin Security & Ops Control (Modul 12)

Tujuan: admin portal aman dulu, karena ini kunci semua aksi dana & status listing.

2.1 Admin portal + RBAC + MFA

Deliverables

Admin app domain terpisah

MFA TOTP wajib

Role: super_admin, reviewer, ops, finance, support

Two-man rule untuk aksi kritis

Acceptance

Tidak ada aksi kritis bisa dilakukan tanpa:

role yang tepat

audit log

two-man rule (requester ≠ approver)

2.2 Audit & Monitoring

Deliverables

Audit log untuk: role changes, treasury rules, approve listing, payout, revoke bluecheck

Alert minimal: stuck tx, high error rate, abnormal payout attempts

Acceptance

Semua aksi admin punya record audit lengkap (who/when/what)

FASE 3 — Project Lifecycle Core (Listing, KYC, Scan, Badge)

Modul: 11 (Badge), plus gating KYC/Scan yang disebut kuat di Presale/Fairlaunch docs.

3.1 Project creation & metadata

Deliverables

Create project, update info, logo/banner, chain target, token info, links

Status flow: DRAFT → SUBMITTED → REVIEW → APPROVED → LIVE

Acceptance

Semua status change admin tercatat (audit)

3.2 KYC onboarding developer (dipakai Presale/Fairlaunch)

Deliverables

KYC submission pipeline (dokumen + selfie/liveness)

Status: PENDING/VERIFIED/REJECTED

Acceptance

Presale/fairlaunch tidak bisa LIVE tanpa KYC VERIFIED

3.3 Smart contract scan (SC Scan)

Deliverables

Upload report / integrasi scanner

Status: PASS/FAIL/OVERRIDDEN_PASS (two-man rule)

Acceptance

Launch tidak bisa live jika scan FAIL

3.4 Badge system (Modul 11)

Deliverables

Auto badge + admin badge (revokable)

Project badges: DEV_KYC_VERIFIED, SC_AUDIT_PASS

Acceptance

Badge bukan pengganti RBAC (murni label + gating di UI)

FASE 4 — Launchpad Launch Types: Presale & Fairlaunch (Modul 2 + Modul 3)

Tujuan: ini engine fundraising. Harus beres dengan refund, finalize, ledger, dan gating lock+vesting.

4.1 Presale (Modul 2)

Deliverables

Buat presale round (hardcap/softcap, token_for_sale, price, timeframe)

Contribution flow (EVM/Solana), verifikasi via Tx Manager

Finalize flow (success/fail)

Refund flow kalau fail

Acceptance

Kalau raised < softcap → otomatis refund eligible

Kalau sukses → lanjut gating ke vesting + liquidity lock

4.2 Fairlaunch pool (Modul 3)

Deliverables

Contribution pooled

Final price computation (total_raised / token_for_sale)

Allocation + claim schedule

Refund kalau < softcap

Acceptance

Dana ke liquidity ≥70% (rule enforced)

Finalize fairlaunch mengunci “next steps” (LP lock + vesting)

FASE 5 — Funds Safety: Liquidity Lock + Vesting (Modul 5 + Modul 6 + Modul 13)

Tujuan: ini “anti rug” layer. Listing baru boleh dianggap sukses kalau ini done.

5.1 Liquidity lock (Modul 5)

Deliverables

Lock vault (EVM LP & Solana LP)

Min duration 12 bulan enforced

UI status lock dari DB

Acceptance

Tidak bisa mark project SUCCESS sebelum lock CONFIRMED

Unlock only after expiry, admin override harus two-man + audit

5.2 Vesting (Modul 6)

Deliverables

Vesting schedule: investor + team

Claimable calc server-side

Claim tx via Tx Manager + idempotency

Acceptance

Claim tidak bisa double-spend

“tge_at default = finalize time” jalan sesuai rule

Semua claim tercatat ledger

5.3 Smart contract/program hardening (Modul 13)

Deliverables

Contract/prog invariants: pause/cancel, refund path safe

Role admin minimal, prefer non-upgradeable untuk core funds

Acceptance

External review / internal audit checklist lulus

Emergency pause tidak memblokir refund rightful users

FASE 6 — Social & Growth: Blue Check, Feed, Referral Pool, AMA (Modul 7 + Modul 10 + Patch + AMA Update)

Tujuan: growth loop jalan, tapi aman dan tidak bisa “farm”.

6.1 User Social Feed + Blue Check (Modul 7)

Deliverables

Post/reply/quote/repost + moderation hooks

Blue Check purchase $10 lifetime

Gate: hanya Blue Check ACTIVE boleh posting

Acceptance

Non-BlueCheck tidak bisa insert post (RLS + server validation)

Blue Check fee split 70/30 (treasury/referral)

6.2 Referral ledger + Reward Pool (Modul 10)

Deliverables

Referral relationship tracking

Ledger accrue dari:

presale/fairlaunch success fee split

bonding swap fee split

bluecheck fee split

Claim payout ke primary wallet (per chain)

Acceptance

Tidak ada payout tanpa verifikasi eligibility + primary wallet

Semua payout masuk audit + idempotency

6.3 Patch Spec Eligibility (Patch modul 10)

Deliverables

activated_at saat referee qualifying event pertama

active_referral_count update otomatis

UI disable reason untuk klaim

Acceptance

Klaim hanya jika:

Blue Check ACTIVE/VERIFIED

active_referral_count >= 1

6.4 AMA / Selsifeed Live session (Modul 7 update)

Deliverables

Schedule event + payment + admin approve

Token join voice/video TTL pendek, server-generated

Logs + abuse prevention

Acceptance

Token provider secret tidak pernah bocor ke client

Approve flow admin tercatat audit

FASE 7 — Solana Bonding Curve + Graduation (Modul 4)

Tujuan: permissionless launch mechanism (Solana) + migration + lock.

7.1 Bonding curve deploy + swap

Deliverables

Deploy with fixed fees

Swap constant-product + virtual reserves

Fee split swap 1.5% (50/50)

Acceptance

Fee masuk ledger sesuai rule

Anti-manipulation basic checks (min tx size / slippage guards)

7.2 Graduation → DEX + LP Lock + Vesting

Deliverables

Graduation threshold logic

Migration fee

Post-migration lock min 12 bulan + team vesting

Acceptance

Graduation dianggap complete hanya jika lock+vesting done

FASE 8 — SBT Staking + Claim Fee (Modul 9 v2)

Tujuan: engagement + reward stream terpisah dari referral.

Deliverables

Verifikasi kepemilikan SBT eksternal

Stake/unstake no cooldown

Claim reward dengan flat fee $10

Reward source dari fee_splits target NFT_STAKING

Acceptance

Claim fee dipungut dan tercatat

Reward distribution akurat & anti double claim

FASE 9 — Trending + Aggregations (Modul 17)

Tujuan: discovery layer untuk growth.

Deliverables

Worker agregasi tiap 10 menit

Window 24 jam

Top 50 store, UI tampil top 10

Acceptance

Query homepage <300ms dari DB (tanpa heavy compute)

Upsert hanya worker role

FASE 10 — QA, Security, & Pre-Launch Hardening (semua modul)

Tujuan: sebelum live, harus ada “release gate”.

10.1 Test strategy (wajib)

Unit test: calc vesting, allocation fairlaunch, fee split

Integration: tx_manager + indexer + DB reconcile

E2E: presale success & fail + refund, claim vesting, lock LP

Permission tests: RLS, admin RBAC, two-man rule

10.2 Security checklist

Secret scanning + dependency audit

Rate limit untuk endpoint sensitif

Replay protection (nonce signature)

Idempotency cover: finalize/claim/payout/lock

Database: RLS deny-by-default verified

10.3 Staging “Dress Rehearsal”

Simulasi 1 project dari DRAFT → LIVE → SUCCESS → vesting claims + LP lock verified

Simulasi abuse: double claim, spoof wallet, bypass blue check posting

Acceptance (Release Gate)

Semua flow kritis lulus di staging

Tidak ada P0/P1 bug

Dashboard monitoring siap

FASE 11 — Go-Live Plan (Launch Day) 🚀
Deliverables

Prod deploy (web+admin+services)

Seed config:

treasury wallets

fee rules

supported networks

Admin SOP:

approve listing

incident response

pause policy

Launch checklist (harus hijau)

Tx manager & indexer healthy

RPC paid key server-side only

Audit log aktif

Backup & recovery plan ada

Support playbook (refund cases, lock disputes, KYC issues)

FASE 12 — Post-Launch Operations (minggu 1–4 setelah live)
Prioritas

Monitoring: stuck tx, mismatch indexer, payout anomalies

Anti-spam: feed moderation + rate limit tuning

Analytics: funnel presale → finalize → lock → claims

Iterasi: UX improvements (claim screens, disable reasons, status clarity)

Dependency Map (biar jelas urutannya) 🧩

Mod 15/14/1/8/12 = fondasi wajib sebelum semua

Presale/Fairlaunch (Mod 2/3) wajib selesai sebelum vesting/lock final acceptance

Liquidity Lock + Vesting (Mod 5/6) adalah gate “project success”

Referral & Blue Check (Mod 7/10 + Patch) bergantung ke profile + ledger + admin security

Bonding Curve (Mod 4) bisa paralel setelah chain adapter Solana siap

SBT staking (Mod 9) bisa paralel setelah ledger + payout infra siap

Trending (Mod 17) terakhir setelah feed/project metadata stabil