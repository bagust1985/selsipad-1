EKSEKUSI — FASE 4 (Presale + Fairlaunch Core)
Target akhir fase 4 (Definition of Done)

✅ Dev bisa create presale/fairlaunch (draft) setelah project eligible
✅ Admin bisa approve & set LIVE sesuai window waktu
✅ User bisa contribute (EVM/Solana) dan status masuk DB via Tx Manager
✅ Ended round bisa finalize:

SUCCESS → publish allocation/claim plan (belum claim token dulu; claim token + vesting fase 5/6)

FAILED → refund enabled + refund flow jalan
✅ Semua aksi sensitif pakai Idempotency-Key + audit log (admin)

4.1 Data Model (DB) untuk Launch Rounds

Tujuan: skema stabil supaya gampang dikunci ke vesting/lock nanti.

Table: launch_rounds

id, project_id

type = PRESALE | FAIRLAUNCH

chain (EVM chain_id / SOLANA)

token_address (or mint)

raise_asset (USDC/ETH/SOL dsb)

start_at, end_at

status = DRAFT | SUBMITTED | APPROVED | LIVE | ENDED | FINALIZED

result = NONE | SUCCESS | FAILED | CANCELED

Gate snapshots:

kyc_status_at_submit

scan_status_at_submit

Financial params:

Presale: price, hardcap, softcap, token_for_sale

Fairlaunch: softcap, token_for_sale

Fairlaunch computed: final_price (nullable until finalize)

Totals (denormalized):

total_raised, total_participants

Table: contributions

id, round_id, user_id

wallet_address

amount

tx_id (link ke table transactions)

status = PENDING | CONFIRMED | FAILED | REFUNDED

Table: round_allocations (dipakai saat finalize)

round_id, user_id

contributed_amount

allocation_tokens

claimable_tokens (initially 0 atau full tergantung vesting phase)

refund_amount (kalau fail atau oversubscribe rules)

Table: refunds

id, round_id, user_id

amount, status

tx_id (refund tx)

Acceptance

Semua angka total di launch_rounds konsisten dengan sum contributions CONFIRMED (pakai job reconcile)

4.2 Eligibility Gate sebelum Create Round (nyambung fase 3)

Tujuan: presale/fairlaunch tidak bisa dibuat/submit kalau project belum eligible.

Eksekusi

Saat POST /v1/projects/:id/rounds:

panggil helper eligibility_check

kalau tidak eligible → 400 + reasons

Saat submit round:

snapshot kyc_status_at_submit, scan_status_at_submit

kalau berubah jadi tidak eligible sebelum approve → admin tidak bisa approve (guard)

Deliverables

POST /v1/projects/:id/rounds (owner)

POST /v1/rounds/:id/submit (owner)

GET /v1/rounds/:id (public only if approved/live/ended)

Acceptance

Round tidak bisa lanjut kalau KYC/scan belum pass

4.3 Admin Review & Approval Flow (fase 2 enforcement)

Tujuan: admin yang menghidupkan round.

Eksekusi

Admin queue:

list rounds status SUBMITTED

Admin action:

approve → status APPROVED

reject → status REJECTED + reason

Scheduler:

auto set LIVE ketika start_at tercapai (worker cron)

auto set ENDED ketika end_at lewat

Deliverables

Admin endpoints:

GET /v1/admin/rounds?status=SUBMITTED

POST /v1/admin/rounds/:id/approve

POST /v1/admin/rounds/:id/reject

Worker cron:

round_state_scheduler (APPROVED→LIVE, LIVE→ENDED)

Acceptance

Status round berubah otomatis sesuai waktu

Semua admin action audit log

4.4 Contribution Flow (User) — EVM & Solana (Tx Manager)

Tujuan: user contribute, sistem memastikan status akurat, no double credit.

Flow standar

UI: user pilih amount → call POST /v1/rounds/:id/contribute/intent

Server return:

deposit_address / contract call params

intent_id

Idempotency-Key requirement

Client sign/send tx

Client submit tx hash ke server:

POST /v1/rounds/:id/contribute/confirm (tx_hash)

Tx Manager + Indexer verify:

event/receipt valid → mark contribution CONFIRMED + update totals

Anti-fraud / anti-bug rules

1 tx hash hanya bisa dipakai sekali (unique constraint)

amount harus match on-chain (receipt decode)

round harus LIVE (server check)

optional: min/max contribution per wallet (kalau ada)

Deliverables

Endpoints:

POST /v1/rounds/:id/contribute/intent

POST /v1/rounds/:id/contribute/confirm (Idempotency-Key)

GET /v1/rounds/:id/contributions/me

DB constraints:

unique (chain, tx_hash)

unique (round_id, tx_id) di contributions

Acceptance

Double submit confirm dengan key sama → tidak dobel

Kalau tx gagal/invalid → contribution FAILED

Total raised real-time dari DB

4.5 Finalize Logic (SUCCESS/FAILED) — Presale & Fairlaunch

Tujuan: finalize menentukan hasil dan menyiapkan allocation/refund.

Presale finalize (Mod 2)

Rules

Jika total_raised >= softcap → SUCCESS

Jika < softcap → FAILED → refund enabled

Hardcap handling:

jika over-cap terjadi (mis. race condition), definisikan policy:

First-confirmed-first-served atau pro-rata (pilih satu; recommended: first-confirmed untuk MVP)

sisa dana → refund partial

Finalize output

round_allocations terisi

status FINALIZED + result

Fairlaunch finalize (Mod 3)

Rules

Jika < softcap → FAILED → refund enabled

Jika SUCCESS:

final_price = total_raised / token_for_sale

allocation tokens per user = kontribusi / final_price

Pastikan rule “≥70% dana ke liquidity” belum dieksekusi di fase 4 (itu fase 5 lock), tapi:

simpan liquidity_target_amount = total_raised * 0.70

Eksekusi

Finalize endpoint (admin):

POST /v1/admin/rounds/:id/finalize (Idempotency-Key)

Worker compute:

generate allocations

set totals snapshot

Audit log finalize

Deliverables

Finalize endpoints + worker job:

finalize_round_job(round_id)

Table snapshot:

round_final_snapshot (opsional tapi bagus untuk akuntansi)

Acceptance

Finalize idempotent (dipanggil dua kali tidak duplikasi)

Fairlaunch final_price tepat dan konsisten

Allocation totals masuk akal (sum allocation_tokens ≈ token_for_sale untuk fairlaunch)

4.6 Refund Flow (untuk FAILED atau partial over-cap)

Tujuan: refund aman, tidak bisa double.

Flow

Setelah round FAILED FINALIZED:

setiap user dapat refund_amount

User klik refund:

POST /v1/rounds/:id/refund/claim (Idempotency-Key)

Tx Manager kirim tx refund (dari vault/contract) atau instruksi sesuai chain

Indexer confirm → mark refunded

Rules

Refund hanya ke primary wallet user pada chain raise asset (sesuai rule payout)

Unique refund per user per round

Jika user belum set primary wallet untuk chain itu → refund blocked + reason

Deliverables

Endpoint user:

GET /v1/rounds/:id/refund/quote

POST /v1/rounds/:id/refund/claim

Admin:

GET /v1/admin/rounds/:id/refunds

Constraints:

unique (round_id, user_id) di refunds

Acceptance

Tidak bisa claim refund 2x

Refund tx status terlihat di UI dari DB

4.7 Admin UI (round management)

Layar minimal

Create/review round detail (params, gates snapshot)

Approve/reject

Live monitoring: total raised, participants, recent tx

Finalize button (enabled saat ENDED)

Refund monitor (failed rounds)

Acceptance

Finance role bisa lihat angka, tapi finalize/approve hanya role tertentu (RBAC)

4.8 Observability & Reconciliation

Tujuan: mencegah mismatch kontribusi vs totals.

Eksekusi

Job reconcile per round:

recompute total_raised dari contributions CONFIRMED

detect anomalies (missing tx, duplicated, mismatch amount)

Alert jika:

tx pending terlalu lama

contributions spike abnormal

Deliverables

round_reconcile_job + log/alert

Acceptance

Kalau indexer restart, totals tetap bisa pulih

4.9 QA Checklist Fase 4 (wajib hijau)

✅ Contribute hanya saat LIVE
✅ Tx invalid tidak mengkredit user
✅ Double submit confirm tidak dobel credit (idempotency + unique tx)
✅ Finalize presale success/fail sesuai softcap
✅ Finalize fairlaunch menghitung final_price benar
✅ Refund:

hanya saat FAILED

hanya sekali per user

hanya ke primary wallet
✅ Admin RBAC + audit log + (bila finalize/override) two-man rule sesuai aturan

Output akhir Fase 4 (yang harus jadi)

launch_rounds + contributions + allocations + refunds schema

Round create/submit/approve/live/ended scheduler

Contribution flow end-to-end (EVM+Sol) via Tx Manager

Finalize success/fail + allocation generation

Refund flow aman & idempotent

Admin UI management + monitoring

Reconcile job + alerts