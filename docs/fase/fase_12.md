EKSEKUSI — FASE 12 (Post-Launch Ops Week 1–4)
Target akhir fase 12 (Definition of Done)

✅ Monitoring stabil: tidak ada blind spot (tx/indexer/ledger/payout)
✅ Incident response berjalan rapi (SOP + audit trail + komunikasi)
✅ Anti-spam & anti-fraud efektif tanpa merusak UX
✅ Reconcile & data integrity rutin (tidak ada mismatch dana)
✅ KPI & funnel analytics tersedia untuk keputusan product
✅ Patch/tuning cepat dengan release cadence yang sehat

12.1 War Room Setup (Week 1: Hari 1–7)

Tujuan: 7 hari pertama itu “masa rawan”. Harus ada mode siaga.

Eksekusi

Buat “war room channel” internal (ops/tech/security/product)

Jadwal on-call:

primary + backup (minimal untuk: backend/ops/finance)

Daily check-in 15 menit:

status tx/indexer

payout failures

spam reports

bug RC backlog

Deliverables

On-call rota + escalation tree

Daily ops checklist (pagi/sore)

Acceptance

Ada pemilik yang jelas untuk setiap incident ticket

12.2 Monitoring Routine & SLO Tracking (Week 1–4)

Tujuan: bukan cuma alert, tapi rutin dicek.

Checklist harian (minimal)

Tx pending aging (top 20 paling lama)

Indexer lag & missed events

Reconcile status (round totals, ledger balances, trending snapshots)

Claim failures (vesting/referral/SBT)

Refund queue (failed rounds)

Admin actions review (audit log sampling)

SLO yang dipantau

API p95 latency

Success rate: contribute confirm, claim, refund

% stuck tx > X menit

Error spike per endpoint

Deliverables

Dashboard “Daily Ops”

Weekly SLO report singkat

Acceptance

Semua alert punya owner + runbook link

12.3 Incident Response Playbook (Week 1–4)

Tujuan: respons cepat tapi tidak panik, dan tidak merusak hak user.

Severity levels (contoh)

S1: dana berisiko / payout salah / exploit

S2: fitur utama down (contribute/claim)

S3: bug minor / UI glitch

Eksekusi incident (template)

Identify + classify severity

Mitigate cepat pakai system flags:

disable contribute / disable claim / freeze payout

Preserve evidence:

export logs + snapshot DB rows terkait

Fix + deploy hotfix

Post-mortem 24–48 jam:

root cause

tindakan pencegahan

follow-up tasks

Deliverables

Incident template (1 halaman)

Post-mortem template

Acceptance

Setiap incident S1/S2 ada post-mortem

12.4 Anti-Spam & Anti-Fraud Tuning (Week 1–4)

Tujuan: feed + referral + AMA itu magnet abuse.

A. Social Feed (Mod 7)

Naikkan rate limit bertahap:

create post / reply

Tambah heuristik:

burst posting (N posts/menit)

repeated content

Moderation ops:

queue report

quick actions: remove post, ban user, revoke bluecheck

B. Referral (Mod 10 + Patch)

Deteksi referral farming:

banyak referee tapi tanpa qualifying event nyata

claim attempts gagal berulang

Freeze claim sementara untuk user tertentu (admin support + audit)

C. AMA

Limit join-token requests

Block suspicious accounts

Deliverables

Rate limit config v2

“Fraud signals” dashboard sederhana (counts + top offenders)

Acceptance

Spam turun tanpa mematikan engagement normal

12.5 Financial Ops & Ledger Integrity (Week 1–4)

Tujuan: menjaga sistem reward/refund/claim tidak mismatch.

Eksekusi

Daily reconcile:

contributions vs round totals

fee_events vs ledger totals

referral payouts vs ledger claimed

Payout anomalies:

payout gagal → retry policy

payout dobel → harus impossible; kalau terjadi → incident S1

Treasury checks:

saldo treasury cukup untuk payout/refund schedule

fee splits masuk sesuai rule

Deliverables

Reconcile report harian (auto)

Alert untuk negative balance / double spend attempt

Acceptance

Tidak ada mismatch yang dibiarkan >24 jam tanpa ticket

12.6 Customer Support Playbook (Week 1–4)

Tujuan: banyak tiket akan muncul, harus ada jawaban standar.

Top cases + SOP

“Refund saya gagal” → cek primary wallet / tx status / round result

“Claim vesting gagal” → cek claimable, wallet chain, pending tx

“Tidak bisa posting” → cek bluecheck status

“Tidak bisa claim referral” → cek patch rules (bluecheck + active_referral_count)

“KYC ditolak” → reason + resubmit flow

“Wallet saya salah” → prosedur update primary wallet + risiko

Deliverables

Canned responses template

Support dashboard minimal (user lookup, tx lookup, status lookup)

Acceptance

Support bisa menyelesaikan 80% kasus tanpa dev intervensi

12.7 Product Analytics & Funnel (Week 2–4)

Tujuan: setelah stabil, mulai ukur & optimasi.

Funnel yang di-track

Signup → wallet link → primary set

Project create → submit → approved

Round live → contribute → finalize

Success → lock/vesting → claim

Blue check view → purchase → post

Referral apply → activation → claim

AMA submit → approve → join

Deliverables

Event schema v1 + dashboard funnel

Weekly insight report (top drop-off + rekomendasi)

Acceptance

Data cukup untuk ambil keputusan UX (bukan feeling)

12.8 Release Cadence & Hotfix Policy (Week 1–4)

Tujuan: rilis cepat tapi aman.

Eksekusi

Hotfix window:

S1/S2 bisa kapan saja (dengan approval)

Regular release:

1–2x per minggu

Post-release checklist:

smoke test

monitor metrics 60 menit pertama

Deliverables

Release checklist v1

Change log publik (opsional)

Acceptance

Tidak ada “silent breaking changes” di prod

12.9 Stability Improvements Backlog (Week 2–4)

Tujuan: perbaikan yang biasanya muncul setelah live.

Kandidat paling umum

Optimasi query feed & trending (index, cache)

Perbaikan UI “disable reasons” lebih jelas

Retry UX untuk tx pending

Improve admin queues (bulk actions, filters)

Better reconcile tooling (one-click rerun)

Deliverables

Backlog prioritized (P0/P1/P2)

2–3 quick wins rilis

Acceptance

Metrik error turun dan funnel membaik

Output akhir Fase 12 (yang harus jadi)

War room + on-call + daily ops checklist

Monitoring routine + SLO weekly report

Incident response playbook + post-mortems

Anti-spam/fraud tuning + dashboards

Financial reconcile rutin + anomaly alerts

Support playbook + canned responses

Analytics funnel + weekly insights

Release cadence + hotfix policy + stability backlog
