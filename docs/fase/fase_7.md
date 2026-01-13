EKSEKUSI — FASE 7 (Bonding Curve Solana + Graduation)
Target akhir fase 7 (Definition of Done)

✅ Dev bisa deploy token + bonding curve pool di Solana (permissionless)
✅ User bisa swap buy/sell via bonding curve, tx terverifikasi & tercatat di DB
✅ Fee swap 1.5% tersplit 50% Treasury / 50% Referral (ledger idempotent)
✅ Ada “graduate” threshold → migrasi ke DEX (Raydium/Orca)
✅ Setelah migrasi: LP lock min 12 bulan + team vesting wajib → baru dianggap “graduate complete”
✅ UI baca status dari DB, worker/indexer menjaga konsistensi

7.1 Data Model Bonding Curve (DB)

Tujuan: status lifecycle jelas dari deploy → live → graduated.

Schema minimum
bonding_pools

id, project_id

chain = SOLANA

token_mint

pool_address (program PDA / pool account)

virtual_reserve_a, virtual_reserve_b (config awal)

real_reserve_a, real_reserve_b (snapshot opsional)

swap_fee_bps (150 bps)

status = DRAFT | DEPLOYING | LIVE | GRADUATING | GRADUATED | FAILED

graduation_threshold (mis: target marketcap/raised/price level)

created_at, updated_at

bonding_swaps

id, pool_id, user_id

side = BUY | SELL

amount_in, amount_out

fee_amount

tx_id

status = PENDING | CONFIRMED | FAILED

created_at

bonding_events (optional, untuk indexer)

pool_id, type, payload_json, block_time, signature

Acceptance

Swap record unique per tx signature

Pool status hanya berubah lewat worker/admin actions (bukan client)

7.2 Deploy Flow (Token creation + Pool deploy) — sesuai Mod 4

Tujuan: deploy bonding curve pool + bayar deploy fee.

Eksekusi

Dev buat “Bonding Launch” dari project:

POST /v1/projects/:id/bonding/create

Server cek minimal:

project basic metadata lengkap

(KYC OFF untuk permissionless bonding curve, sesuai modul)

Generate deploy intent:

tampilkan biaya deploy 0.5 SOL + parameter pool (virtual reserves, fee)

Dev submit tx deploy (client sign) → confirm ke server:

POST /v1/bonding/:pool_id/deploy/confirm (Idempotency-Key)

Tx Manager + indexer verifikasi signature:

pool account created sesuai program

set pool status LIVE

Deliverables

Endpoints:

POST /v1/projects/:id/bonding/create

POST /v1/bonding/:pool_id/deploy/intent

POST /v1/bonding/:pool_id/deploy/confirm

GET /v1/bonding/:pool_id

Worker: verify_bonding_deploy(signature)

Acceptance

Pool status LIVE hanya kalau deploy benar-benar terjadi on-chain

Deploy confirm idempotent (no duplicate pool)

7.3 Swap Flow (Buy/Sell) + Fee Split 1.5% (Mod 4 + Mod 10)

Tujuan: user swap aman, fee dicatat ke ledger sesuai aturan.

Flow standar

UI request quote:

GET /v1/bonding/:pool_id/quote?side=BUY&amount_in=...

server bisa compute off-chain untuk UX, tapi final tetap on-chain

User execute swap via wallet → submit signature:

POST /v1/bonding/:pool_id/swap/confirm (Idempotency-Key)

Indexer decode swap event/receipt:

amount_in/out, fee_amount

insert bonding_swaps CONFIRMED

Fee split ledger:

create 2 ledger entries:

Treasury 50%

Referral pool 50%

Deliverables

Endpoints:

GET /v1/bonding/:pool_id/quote

POST /v1/bonding/:pool_id/swap/confirm

GET /v1/bonding/:pool_id/swaps (public)

Worker:

bonding_swap_indexer (subscribe/poll program logs)

fee_split_writer (idempotent per swap signature)

Acceptance

1 signature = 1 swap record (unique)

Fee split tidak dobel walau indexer replay

UI PnL/price chart optional; minimal tampil last price & volume

7.4 Graduation Rules & Detector (Mod 4)

Tujuan: ketika threshold tercapai, pool masuk fase migrasi ke DEX.

Eksekusi

Definisikan threshold untuk MVP (pilih 1 yang paling mudah):

total SOL raised mencapai X

atau price mencapai Y

atau circulating marketcap (butuh oracle/supply calc)

Worker graduation_detector:

cek metrik tiap N menit atau setiap swap confirm

kalau threshold tercapai:

update pool status → GRADUATING

buat record dex_migrations (PENDING)

Schema minimum
dex_migrations

id, pool_id, project_id

target_dex = RAYDIUM | ORCA

migration_fee_paid boolean (biaya 2.5 SOL)

status = PENDING | IN_PROGRESS | COMPLETE | FAILED

lp_mint (setelah migrate)

lp_amount

tx_id

timestamps

Acceptance

Pool tidak boleh kembali ke LIVE setelah GRADUATING (kecuali admin rollback with two-man + reason)

7.5 Migration Execution to DEX (Raydium/Orca) + Fee 2.5 SOL

Tujuan: migrasi liquidity ke DEX, hasilkan LP token.

Eksekusi

Generate migration intent:

POST /v1/bonding/:pool_id/migrate/intent

menampilkan biaya migrasi 2.5 SOL

Execute tx (dev/admin sesuai rule) → confirm:

POST /v1/bonding/:pool_id/migrate/confirm (Idempotency-Key)

Indexer verify:

LP mint created

LP amount minted ke vault/owner sesuai desain

dex_migrations.status = COMPLETE

bonding_pools.status = GRADUATED (atau menunggu lock+vesting gate, lihat bawah)

Deliverables

Endpoints:

POST /v1/bonding/:pool_id/migrate/intent

POST /v1/bonding/:pool_id/migrate/confirm

GET /v1/bonding/:pool_id/migration

Indexer parse migration events

Acceptance

Migration idempotent

LP mint & amount tercatat benar

7.6 Post-Graduation Gates: LP Lock 12 Bulan + Team Vesting Wajib (Mod 5 + Mod 6)

Tujuan: graduation dianggap “complete” hanya kalau:

LP lock min 12 bulan ✅

team vesting aktif ✅

Eksekusi

Setelah dex_migrations.COMPLETE, trigger orchestrator:

post_graduation_orchestrator(pool_id)

Create Liquidity Lock record:

chain: SOLANA

lp_mint dari migration

lock_end_at >= now + 12 bulan

execute lock via Tx Manager → status LOCKED

Pastikan team vesting ada:

kalau belum ada schedule TEAM → create (admin/owner input)

Gate status:

bonding_pools.graduation_gate_status = PENDING | PASSED | FAILED

Deliverables

Reuse modul fase 5:

liquidity_locks untuk Solana LP

vesting_schedules type TEAM

Endpoint status:

GET /v1/bonding/:pool_id/graduation-gates

Acceptance

Pool “GRADUATED (complete)” hanya kalau lock LOCKED + team vesting ACTIVE

UI tampil checklist gates

7.7 Referral Integration (Mod 10) untuk Bonding Swaps

Tujuan: fee referral dari swap masuk pool referral, lalu claimable seperti fase 6.

Eksekusi

Swap confirmed → fee split 50% referral

Referral distribution:

direct attribution ke referrer (kalau buyer/seller punya referrer ACTIVE)

atau masuk global pool (kalau itu desainmu)

Patch eligibility tetap berlaku untuk claim

Acceptance

Swap fee referral tidak bisa di-claim jika referrer belum BlueCheck + active_referral_count>=1

7.8 Admin Controls & Incident Handling (Mod 12)

Tujuan: mitigasi saat ada exploit/bug di program.

Eksekusi

Admin action (two-man):

pause swaps (jika program support pause flag)

disable UI trading (soft kill switch) kalau on-chain pause belum ada

freeze payouts referral sementara (jika ada exploit fee)

Semua butuh reason + incident id + audit log

Acceptance

Kill switch tidak merusak data ledger & tidak menyebabkan double counting

7.9 Observability & Reconciliation

Eksekusi

Indexer health:

slot lag monitor

missed event detector

Reconcile:

bandingkan volume swap DB vs on-chain sample

detect duplicated signatures

Acceptance

Kalau indexer restart, swap history tetap konsisten (idempotent inserts)

7.10 QA Checklist Fase 7 (wajib hijau)

✅ Deploy pool: status LIVE hanya setelah on-chain verified
✅ Swap confirm: 1 signature = 1 swap (unique)
✅ Fee split 1.5% tercatat, 50/50 treasury/referral, idempotent
✅ Graduation detector memindahkan status dengan benar
✅ Migration fee 2.5 SOL ditagih & tercatat
✅ Migration menghasilkan LP mint & amount valid
✅ LP lock min 12 bulan enforced & LOCKED status benar
✅ Team vesting wajib ada sebelum graduation gate PASSED
✅ Admin pause/kill switch tercatat audit & two-man untuk aksi kritis

Output akhir Fase 7 (yang harus jadi)

Bonding pool lifecycle (deploy → live swap → graduating → migrated)

Swap indexer + fee split ledger (50/50)

Graduation detector + migration records

Post-graduation orchestrator: LP lock 12 bulan + team vesting

UI status + gates checklist

Admin incident controls + audit

