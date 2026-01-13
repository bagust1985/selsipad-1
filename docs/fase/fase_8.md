EKSEKUSI — FASE 8 (SBT Staking v2)
Target akhir fase 8 (Definition of Done)

✅ User bisa verifikasi kepemilikan SBT eksternal (Solana/EVM sesuai desain)
✅ User bisa stake / unstake tanpa cooldown
✅ Reward accrual berjalan dari sumber fee_splits -> NFT_STAKING
✅ Claim reward memungut fee $10 per claim dan tercatat ledger
✅ Claim payout via Tx Manager → ke primary wallet (sesuai chain reward)
✅ Semua flow idempotent + anti double-claim + audit untuk aksi admin

8.1 Tentukan “SBT Source of Truth” (external SBT)

Tujuan: karena SBT tidak mint di launchpad, kita perlu definisi cara verifikasi kepemilikan.

Keputusan MVP yang wajib dikunci

SBT ada di chain mana? (Solana saja / EVM juga)

Kriteria valid:

“punya 1 token dari collection/mint tertentu”

atau “punya badge on-chain tertentu”

Apakah SBT non-transferable (ideal), tapi sistem cukup cek ownership saat stake & saat claim (re-verify optional)

Deliverables

Config table: sbt_collections / sbt_rules (chain + collection/mint + requirements)

Acceptance

Satu endpoint verifikasi bisa menyatakan user eligible atau tidak (jelas reason-nya)

8.2 Data Model (DB)

Tujuan: schema staking sederhana tapi aman.

Schema minimum
sbt_rules

id, chain

collection_id (Solana collection / EVM contract)

min_balance (umumnya 1)

is_active

sbt_ownership_cache (optional tapi recommended)

user_id, chain, collection_id

is_owner

checked_at

evidence (tx/signature/slot) optional

sbt_stakes

id, user_id

chain

collection_id

status = STAKED | UNSTAKED

staked_at, unstaked_at

last_reward_checkpoint_at (untuk accrual)

unique: (user_id, chain, collection_id) 1 stake aktif

sbt_rewards_ledger

id, user_id

amount, asset, chain

source_event_id (dari fee_splits)

status = ACCRUED | CLAIMING | CLAIMED

created_at

sbt_claims

id, user_id

amount, asset, chain

fee_usd (10)

fee_tx_id

payout_tx_id

status = PENDING_FEE | PAYOUT_PENDING | CONFIRMED | FAILED

created_at

Acceptance

Tidak ada 2 stake aktif untuk rule yang sama

Ledger entries tidak bisa double spend

8.3 Verifikasi Kepemilikan SBT (Core)

Tujuan: cek ownership tanpa mint internal.

Eksekusi

Endpoint:

GET /v1/sbt/eligibility

return list rule yang eligible + reasons jika tidak

Ownership check dilakukan server-side via chain adapter/indexer:

Solana: cek collection/mint ownership via RPC/indexer

EVM (jika ada): cek balanceOf contract

Cache hasil singkat (mis. 5–15 menit) untuk hemat RPC

Deliverables

Helper verify_sbt_ownership(user_id, rule_id) + caching

Endpoint eligibility & debug (admin only)

Acceptance

User yang tidak punya SBT selalu ditolak stake

User yang punya SBT bisa stake tanpa delay besar (cache)

8.4 Stake / Unstake (tanpa cooldown) (Mod 9 v2)

Tujuan: staking sifatnya “platform staking”, bukan locking token, jadi cukup record state (dan optional on-chain tx kalau desainmu butuh).

Pilihan desain MVP (recommended)

Off-chain staking record + periodic ownership verification

Pro: cepat, simpel

Kontra: perlu mitigasi jika user transfer SBT (tapi SBT idealnya non-transferable)

Jika perlu on-chain staking program: masukkan ke Tx Manager (lebih berat)

Eksekusi

Stake:

POST /v1/sbt/stake (Idempotency-Key)

server verify ownership → set status STAKED + checkpoint

Unstake:

POST /v1/sbt/unstake (Idempotency-Key)

status UNSTAKED + set unstaked_at

Jika mau lebih aman:

re-verify ownership saat claim (wajib kalau SBT bisa pindah)

Deliverables

Endpoints:

POST /v1/sbt/stake

POST /v1/sbt/unstake

GET /v1/sbt/stake/me

Acceptance

Unstake bisa kapan saja

Stake tidak bisa jika already staked untuk rule yang sama

Semua idempotent

8.5 Reward Funding & Accrual (source: fee_splits NFT_STAKING)

Tujuan: reward untuk staker berasal dari fee split yang dialokasikan ke NFT_STAKING.

Eksekusi

Pastikan pipeline fee events (fase 6/7) sudah punya jalur:

fee_events → fee_sweep_worker → ledger bucket NFT_STAKING

Accrual worker:

periodik (mis. tiap 10 menit / 1 jam)

hitung active_stakers_count (yang STAKED)

distribusikan reward per staker:

MVP: equal split

(opsional) weighted berdasarkan staking duration

Simpan entry di sbt_rewards_ledger untuk tiap user

Deliverables

Worker:

sbt_reward_accrual_worker(window)

Config:

staking_distribution_mode = EQUAL (MVP)

Acceptance

Reward total yang dibagikan == total bucket NFT_STAKING pada window tersebut (minus rounding)

Worker idempotent (window punya unique key)

8.6 Claim Reward + Fee $10 per Claim (Mod 9 v2)

Tujuan: claim butuh bayar fee $10 dan payout reward berjalan aman.

Flow

Quote:

GET /v1/sbt/claim/quote

return claimable amount + fee $10

Pay fee:

POST /v1/sbt/claim/pay/intent

POST /v1/sbt/claim/pay/confirm (tx hash) (Idempotency-Key)

Setelah fee CONFIRMED:

server jalankan payout reward → Tx Manager

Mark ledger entries CLAIMED

Rules

Fee $10 wajib setiap claim (flat)

Claim payout ke primary wallet pada chain asset reward

Optional safety: re-verify ownership sebelum payout jika SBT transferable

Deliverables

Endpoints:

GET /v1/sbt/claim/quote

POST /v1/sbt/claim/intent (buat claim record)

POST /v1/sbt/claim/pay/confirm (fee tx)

POST /v1/sbt/claim/payout (internal, dipanggil worker setelah fee confirmed)

State machine sbt_claims:

PENDING_FEE → PAYOUT_PENDING → CONFIRMED/FAILED

Acceptance

Tidak bisa payout sebelum fee confirmed

Claim idempotent (double click tidak dobel payout)

Ledger locking mencegah race condition (set status CLAIMING saat proses)

8.7 Admin & Ops Controls (Mod 12)

Tujuan: kontrol konfigurasi staking tanpa membahayakan dana.

Eksekusi

Admin bisa:

enable/disable sbt_rules

pause accrual worker (emergency)

view claims & stuck payouts

Two-man rule untuk:

ubah address treasury fee receiver

ubah rule distribusi reward (kalau ada)

manual payout override (kalau disediakan)

Deliverables

Admin endpoints:

POST /v1/admin/sbt/rules/:id/enable|disable

GET /v1/admin/sbt/claims?status=...

Audit log untuk semua perubahan rule

Acceptance

Change rule selalu tercatat audit

Aksi sensitif tidak bisa dilakukan single admin jika ditandai critical

8.8 UI Minimal (apps/web)

Tujuan: user bisa pakai staking tanpa bingung.

Layar

Eligibility checker (rule list + status)

Stake/unstake button per rule

Reward dashboard:

claimable amount

fee $10 notice

claim history

Acceptance

UI menunjukkan alasan jika tidak eligible

UI menampilkan “primary wallet missing” jika payout blocked

8.9 Observability & Reconciliation

Eksekusi

Monitor:

accrual worker runtime & window coverage

claim funnel (quote→fee→payout)

stuck claims (PAYOUT_PENDING > X menit)

Reconcile:

total ledger accrued vs bucket NFT_STAKING source

Acceptance

Restart worker tidak bikin accrual dobel (window idempotent)

8.10 QA Checklist Fase 8 (wajib hijau)

✅ Eligibility benar (punya SBT → bisa stake, tidak punya → ditolak)
✅ Stake unik per user per rule (tidak dobel)
✅ Unstake tanpa cooldown
✅ Accrual membagi bucket NFT_STAKING dengan benar & idempotent
✅ Claim:

fee $10 wajib

payout setelah fee confirmed

double claim tidak mungkin
✅ Payout ke primary wallet saja
✅ Admin rule changes diaudit & (critical) two-man rule

Output akhir Fase 8 (yang harus jadi)

SBT eligibility verification (external) + caching

Stake/unstake flow (no cooldown)

Reward accrual worker dari bucket NFT_STAKING

Claim flow dengan fee $10 + payout via Tx Manager

Admin controls + audit + monitoring

UI staking dashboard minimal

