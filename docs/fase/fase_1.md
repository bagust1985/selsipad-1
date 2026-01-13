EKSEKUSI — FASE 1 (Fondasi Sistem & Repo)
Target akhir fase 1 (Definition of Done)

✅ Repo monorepo rapi + CI/CD staging jalan
✅ Auth + profile + multi-wallet + primary wallet per chain beres
✅ DB schema core + RLS baseline deny-by-default
✅ API contract v1 (public + admin) dengan error standard + pagination + idempotency
✅ Tx Manager + Chain Adapter skeleton (EVM + Solana) + indexer minimal end-to-end
✅ 1 flow transaksi dummy sukses: submit tx → confirmed → DB updated → UI render from DB

1.1 Repo, Workspace, dan Environment (Mod 15)

Eksekusi

Setup monorepo (Turborepo):

apps/web (user)

apps/admin (admin)

packages/shared (types, schema, constants)

packages/ui (komponen)

services/tx_manager

services/indexer (event ingester)

Setup env separation:

dev, staging, prod

secrets via secret manager (bukan .env di repo)

CI pipeline:

lint + typecheck + unit test

build web+admin

deploy staging otomatis (main branch)

Deliverables

Struktur repo final + README runbook

CI workflow (GitHub Actions / setara)

Standard coding: lint rules, commit convention

Acceptance

Fresh clone → pnpm install → turbo build sukses

Deploy staging menghasilkan URL web+admin yang bisa diakses

1.2 Supabase Setup + Auth + RBAC baseline (Mod 15 + Mod 14)

Eksekusi

Supabase project:

Auth enabled

DB schema migration pipeline (SQL migration / prisma/knex—pilih satu)

Auth rules:

User: JWT

Admin: JWT + (nanti) MFA (fase 2), tapi di fase 1 sudah siap struktur klaim role

Buat table role mapping minimal:

user_roles(user_id, role) atau admin_roles

API gateway rules:

/v1/* untuk user

/v1/admin/* untuk admin (server-side check, jangan percaya client)

Deliverables

Supabase project config + migration pipeline

Role schema + helper requireRole()

Acceptance

User login dapat JWT

Endpoint admin menolak user biasa (403)

1.3 User Profile + Multi-wallet + Primary wallet (Mod 8)

Eksekusi

Schema minimal:

profiles: username, bio, avatar, bluecheck_status, privacy flags

wallets: user_id, chain, address, is_primary, verified_at

wallet_link_nonces: nonce per wallet untuk signature challenge

Wallet linking flow:

Client request nonce

Client sign message

Server verify signature → store wallet verified

Primary wallet rules:

1 primary per chain per user

Saat set primary: atomik (transaction DB)

Privacy:

Default hide address untuk publik

Only owner + admin bisa lihat full

Deliverables

Endpoint:

POST /v1/wallets/nonce

POST /v1/wallets/verify

POST /v1/wallets/set-primary

GET /v1/profile/me

GET /v1/profile/:handle (public view, mask address)

RLS policies untuk wallets/profiles

Acceptance

User bisa link EVM wallet + Solana wallet

User bisa set primary per chain

Public profile tidak bocorin address kalau privacy ON

1.4 Database Core Schema + RLS Baseline (Mod 15 + “fondasi semua modul”)

Eksekusi
Bikin schema inti yang akan dipakai modul lain:

Core tables (minimal v1)

projects

launches (presale/fairlaunch/bonding)

transactions (tx_manager tracking)

ledger_entries (reward/referral/fee split nanti)

audit_logs (sudah ada baseline walau admin full di fase 2)

fee_rules (v1 statik dulu, editable fase 2)

kyc_submissions (stub status saja untuk sekarang)

scans (stub status saja untuk sekarang)

RLS baseline

deny by default

public read: hanya field aman (project list, public profile)

owner read/write: row-based (user_id match)

service role: hanya backend

Deliverables

Migration scripts + schema docs singkat

RLS policies minimal per table

Acceptance

Client tidak bisa query audit_logs, fee_rules, transactions tanpa policy

Owner hanya bisa update row miliknya

1.5 API Contract v1 (Mod 14)

Eksekusi

Standard response:

{ data, meta, error }

Pagination:

cursor-based (limit + cursor)

Error standard:

code, message, optional details

Idempotency:

Header Idempotency-Key untuk POST sensitif (mulai disiapkan walau aksi sensitif baru banyak di fase 4–6)

Rate limit:

nonce endpoints & wallet verify wajib rate limit

Deliverables

OpenAPI/Swagger doc v1 (minimal)

Middleware: auth, role guard, idempotency, rate limit

Acceptance

Semua endpoint punya error format konsisten

Endpoint sensitif menolak request tanpa Idempotency-Key (kalau ditandai sensitif)

1.6 Multi-network Chain Adapter + Tx Manager Skeleton (Mod 1)

Eksekusi

Chain adapter interface (kontrak internal):

buildTx(), sendTx(), getTxReceipt(), getBlockHeight()

implementasi EVM + Solana

Tx Manager service:

POST /tx/submit (internal)

store tx row: chain, hash, type, status, user_id(optional), project_id(optional)

retry & reconcile job tiap X menit

Indexer minimal:

ingest tx confirmations → update transactions → emit domain event sederhana (mis: WALLET_VERIFIED, DUMMY_TX_CONFIRMED)

Observability:

trace_id per request

structured logs

Deliverables

services/tx_manager running + job reconcile

services/indexer running + job poll/subscribe event

Acceptance

Buat 1 transaksi dummy (mis: send 0 value tx atau ping program):

status bergerak CREATED → SUBMITTED → CONFIRMED

DB updated

UI menampilkan status dari DB (bukan query chain)

1.7 Minimal UI untuk Validasi Fondasi (apps/web)

Eksekusi

Halaman:

Login

Profile (me)

Link wallet (EVM & Sol)

Set primary wallet

“Tx status page” (menampilkan list transactions)

Admin (stub saja):

Login admin

“Role denied screen” (untuk uji guard)

Deliverables

UI minimal untuk smoke test end-to-end

Acceptance

Flow: login → link wallet → set primary → trigger dummy tx → lihat tx confirmed

1.8 QA Checklist Fase 1 (wajib lulus)

✅ Wallet linking: replay protection (nonce sekali pakai)
✅ RLS: user A tidak bisa baca wallets user B
✅ Idempotency middleware tidak duplikasi write
✅ Tx reconcile job bisa recover kalau service restart
✅ Secrets tidak bocor ke client bundle

Output akhir Fase 1 (yang harus jadi)

Repo monorepo + CI/CD staging

Supabase schema core + RLS baseline

Auth + Profile + Multi-wallet + Primary wallet

API contract v1 + middleware (auth/role/idempotency/rate limit)

Chain adapter + Tx Manager + Indexer minimal (EVM+Sol)

Demo flow end-to-end: tx confirmed → DB update → UI render