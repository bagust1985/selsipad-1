EKSEKUSI — FASE 9 (Trending Projects & Aggregations)
Target akhir fase 9 (Definition of Done)

✅ Trending dihitung berdasarkan jumlah post terkait project_id dalam 24 jam
✅ Tie-breaker: comment_count (reply_count)
✅ Worker agregasi setiap 10 menit (window 24 jam)
✅ Simpan Top 50 per kategori (global & optional per chain/category)
✅ UI homepage tampil Top 10 dengan response <300ms (DB read-only)
✅ Upsert data trending hanya oleh worker/service role (RLS ketat)

9.1 Pastikan Feed Data Mendukung Trending

Tujuan: semua post yang terkait project harus punya project_id.

Eksekusi

Di tabel posts (fase 6) pastikan:

project_id nullable

type termasuk REPLY

Pastikan “comment_count” bisa dihitung:

Reply = post dengan parent_post_id tidak null

Atau gunakan post_stats.reply_count

Deliverables

Constraint/validation: jika user posting di “project page”, set project_id

Index DB: (project_id, created_at) untuk query cepat

Acceptance

Post di project page selalu ter-tag project_id

Reply count bisa dihitung konsisten

9.2 Definisi Skor Trending (sesuai Modul 17)

Tujuan: rumus final dan deterministik.

Score rule (MVP)

Primary: post_count_24h = jumlah posts (type POST/QUOTE/REPOST) dengan project_id = X dalam 24 jam terakhir

Tie-breaker: comment_count_24h = jumlah REPLY yang parent-nya berada di project feed (atau reply dengan project_id = X)

Optional tie-breaker tambahan (kalau perlu):

latest_activity_at (lebih baru menang)

Deliverables

Dokumen “Trending Score v1” (untuk QA & data consistency)

Acceptance

Dua project dengan post_count sama → yang comment_count lebih tinggi rankingnya

9.3 Data Model Trending (DB)

Tujuan: simpan hasil agregasi agar UI cepat.

Schema minimum
trending_snapshots

id

window_start_at

window_end_at (now)

computed_at

version (v1)

trending_projects

snapshot_id

project_id

rank (1..50)

post_count_24h

comment_count_24h

score (optional, bisa sama dengan post_count)

category (optional: ALL / MEME / DEFI / GAMEFI / dll)

chain_scope (optional: SOLANA/EVM/ALL)

updated_at

Unique: (snapshot_id, category, chain_scope, rank) dan (snapshot_id, category, chain_scope, project_id)

Untuk MVP paling simpel: cukup category = ALL, chain_scope = ALL. Nanti bisa diperluas.

RLS

Public read: allow select pada trending_projects + join ke projects yang APPROVED/LIVE

Write: hanya service role/worker

Acceptance

User tidak bisa insert/update trending table dari client (100% diblok)

9.4 Worker Aggregation Job (tiap 10 menit)

Tujuan: generate trending secara periodik dan idempotent.

Algoritma (MVP, aman & cepat)

window_end = now()

window_start = now() - 24h

Query posts:

Filter: created_at between window_start and window_end

project_id is not null

Hitung:

post_count_24h untuk type in (POST, QUOTE, REPOST)

comment_count_24h untuk type = REPLY

Join projects:

hanya status in (APPROVED, LIVE) (atau LIVE saja untuk homepage)

Sort:

post_count desc

comment_count desc

latest_activity desc

Take Top 50

Upsert:

buat trending_snapshot

insert rows trending_projects

Idempotency

Job key: floor(now to 10-min bucket) mis: 2026-01-13T10:20:00Z

Jika job rerun untuk bucket sama → replace snapshot (delete+insert) atau update by snapshot_id

Deliverables

Service trending_worker

Schedule (Cloud Scheduler/QStash/cron): tiap 10 menit

Logs: duration + rows computed + checksum

Acceptance

Jika worker restart, snapshot tetap konsisten & tidak dobel

Job runtime stabil (target < 30–60 detik, tergantung volume)

9.5 Query API untuk UI (read-only cepat)

Tujuan: homepage load cepat <300ms.

Eksekusi

Endpoint:

GET /v1/trending?category=ALL&chain=ALL&limit=10

Response:

project fields yang dibutuhkan: name, logo, short_desc, chain, status

trending fields: rank, post_count_24h, comment_count_24h

Caching

CDN cache 30–60 detik (aman karena update 10 menit)

ETag/Last-Modified opsional

Deliverables

Endpoint + SQL query optimized (pakai indexes)

Cache policy

Acceptance

P95 response <300ms di staging load test

UI tidak memanggil query berat ke posts table (cukup trending table)

9.6 UI Homepage Trending Widget (Top 10)

Tujuan: tampilkan discovery yang rapi.

Komponen UI

Tab minimal: “Trending”

Item: rank, logo, name, mini stats (posts/replies 24h)

Klik → project page

Acceptance

Render cepat, fallback skeleton loader

Jika snapshot belum ada (fresh deploy) → empty state

9.7 Moderation & Anti-Gaming (MVP Basic)

Tujuan: trending gampang diserang spam. MVP minimal harus ada filter.

Eksekusi minimal

Abaikan posts dari user BANNED

Abaikan posts yang soft-deleted

Rate limit posting (sudah di fase 6)

Optional: weight kecil untuk repost supaya tidak farming (bisa v2)

Deliverables

Query filter conditions

Admin ability to remove spam posts (fase 6)

Acceptance

Post yang dihapus tidak ikut trending window

9.8 Observability & Data Quality Checks

Eksekusi

Monitor:

snapshot generated tiap 10 menit (missed run alert)

jumlah projects trending (harus >0 kalau ada aktivitas)

Reconcile checker:

sampling 5 project → recompute count direct dari posts → bandingkan snapshot (toleransi 0)

Deliverables

Alert rule “no snapshot in last 20 minutes”

Reconcile script/job (daily)

Acceptance

Kalau data mismatch → log + incident ticket

9.9 QA Checklist Fase 9 (wajib hijau)

✅ Snapshot dibuat tiap 10 menit
✅ Window 24 jam benar (bukan “hari kalender”)
✅ Ranking sesuai rule (post_count → comment_count tie-break)
✅ Hanya projects APPROVED/LIVE yang masuk
✅ Upsert worker-only (RLS)
✅ Endpoint trending cepat dan tidak query posts besar
✅ Post deleted/banned tidak dihitung

Output akhir Fase 9 (yang harus jadi)

Trending schema (trending_snapshots, trending_projects) + RLS

Worker agregasi 10 menit (window 24h) idempotent

API /v1/trending cepat + caching

UI homepage widget Top 10

Anti-gaming minimal + monitoring

