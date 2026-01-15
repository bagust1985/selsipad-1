Phase 5 — Polish & QA UX (Release-ready) ✅✨

1. Tujuan Phase 5 🎯

Semua layar terasa “produk jadi”: rapi, konsisten, jelas, dan minim friksi.

Tidak ada UX “bolong”: semua screen punya loading/empty/error + recovery.

Semua alur berisiko (uang, verifikasi, aksi destruktif) punya guard + confirm + feedback.

Siap handoff ke FE dengan acceptance checklist & QA matrix.

2. Scope Phase 5 ✅
   A. UX QA Sweep (semua phase 1–4)

Audit konsistensi status/CTA/disable reasons

Audit navigation & deep-link behavior

Audit transaction patterns & pending states

B. Microcopy & Content Finalization

Final microcopy pack (status label, helper text, error messages)

Empty states & tooltips yang konsisten

C. UI Polish Pass

Spacing, alignment, typography consistency

Visual hierarchy untuk “trust surface”

Touch targets & accessibility baseline

D. Performance UX

Skeleton strategy & pagination/infinite scroll rules

Optimistic UI rules (yang aman) vs non-optimistic (yang harus tunggu confirm)

E. Analytics Map (minimal tapi solid)

Event naming conventions + required events per screen

Funnel definition untuk money flow & verification flow

F. Release Checklist

Pre-release QA checklist (UX)

“Known limitations” list (jika ada fitur yang ditunda)

3. Out of Scope Phase 5 🚫

Nambah fitur baru

Re-architecture besar

Redesign total (phase 5 hanya polish & konsistensi)

4. Dependencies 🧱

Phase 0: tokens/components/patterns sudah final v1

Phase 1–4: screen specs sudah lengkap

Minimal list endpoint/fields tersedia untuk ditest (mock pun boleh)

5. Work Packages (WP) Phase 5 📦
   WP1 — Global UX Audit (Consistency & Coverage) 🔍
   Deliverables

Coverage checklist per screen:

Loading / Empty / Error / Success

Primary CTA / disabled reason

Back/escape route

Consistency report:

Status label sama di semua tempat

CTA sama untuk status yang sama

Komponen tidak dobel fungsi

Acceptance Criteria ✅

Tidak ada screen tanpa states lengkap

Tidak ada status/CTA yang “beda sendiri”

WP2 — Transaction UX Hardening (Money actions) 💸🛡️
Deliverables

Tx state spec final (idle → awaiting signature → submitted → confirmed/failed)

Pending behavior rules:

Disable double submit

Persist pending banner di Portfolio

Retry rules (kapan boleh retry, kapan jangan)

Failure recovery patterns:

“Try again”

“Check explorer”

“Contact support” (opsional)

Acceptance Criteria ✅

Semua aksi uang di Phase 1 & 3 memakai pattern sama

Tidak ada kemungkinan user spam klik claim/buy tanpa feedback

WP3 — Gating & Guardrails Finalization 🔐
Deliverables

Gating matrix:

Posting eligibility

Rewards eligibility

Wallet/primary requirements

KYC requirements (jika mempengaruhi partisipasi)

UI standard untuk:

Reason (1 kalimat)

CTA next action

Link ke help (jika perlu)

Acceptance Criteria ✅

Semua “blocked actions” punya alasan dan jalan keluar

Tidak ada error “generic unauthorized” yang tampil ke user

WP4 — Microcopy Pack Final ✍️
Deliverables

Microcopy library final:

Status descriptions

Button labels

Disable reasons

Error messages

Empty state text + CTA label

Tone rules:

singkat, jelas, tidak menyalahkan user

hindari jargon teknis

Acceptance Criteria ✅

Copy konsisten antar layar

Tidak ada copy yang bikin user salah ekspektasi (mis: “instan” padahal delay)

WP5 — Visual Polish & Accessibility Baseline 🎨♿
Deliverables

Spacing audit: padding/margin konsisten (grid)

Typography audit: heading/body/caption konsisten

Accessibility baseline:

Tap target min

Focus state jelas

Kontras status badge memadai

Dark mode decision final (kalau dipakai)

Acceptance Criteria ✅

Tidak ada layout “loncat” antar layar

Semua komponen penting dapat dipakai nyaman di mobile

WP6 — Performance UX Rules ⚡
Deliverables

Skeleton guidelines (list vs detail)

Pagination/infinite scroll rules

Caching & refresh affordance:

pull-to-refresh untuk feed/portfolio

“last updated” untuk data yang delay (opsional)

Optimistic UI rules:

Boleh optimistic: copy referral link, hide post locally

Jangan optimistic: claim/buy/refund (harus tunggu tx milestone)

Acceptance Criteria ✅

UX tidak terasa lambat walau data berat

User paham saat data “sedang update”

WP7 — Analytics Event Map 📊
Deliverables

Event naming convention (snake_case / dot.notation—pilih satu)

Required events per screen (Phase 1–4)

Funnel definitions minimal:

Discover → Project detail → Participate → Submitted → Confirmed

Portfolio → Vesting → Claim → Confirmed

Rewards → Share → Claim (jika claimable)

Profile → Add wallet → Set primary

Feed → Compose attempt (eligible vs blocked)

Acceptance Criteria ✅

Event map cukup untuk baca drop-off tanpa “tracking berlebihan”

WP8 — Release UX Checklist ✅📋
Deliverables

Pre-release checklist (UX)

QA test cases (happy path + edge cases)

Known limitations list (jika ada yang ditunda)

Acceptance Criteria ✅

Ada dokumen final yang bisa dipakai QA/PM untuk sign-off

6. QA Test Matrix (ringkas tapi kuat) 🧪

Per fitur penting, test minimal:

Presale: buy success, buy fail, pending, finalize success, finalize fail/refund

Fairlaunch: contribute success/fail/pending, finalize, claim

Vesting: claim success/fail/pending, next unlock

LP lock: pending/locked/failed

Feed: non-eligible compose attempt, eligible post success/fail

Rewards: 4-state gating, claim success/fail/pending, history update

Wallet: add wallet success/fail, set primary, remove primary blocked

KYC: pending/verified/rejected display

7. Definition of Done Phase 5 ✅✨

UX audit selesai dan semua temuan Blocker/High ditutup

Microcopy final terpasang & konsisten

Visual polish pass selesai (spacing/typography/accessibility)

Analytics map tersedia

Release checklist & QA matrix siap untuk sign-off

8. Open Questions (maks 10, blocker only) ❓

Tracking/event naming convention yang dipakai tim (dot vs snake)?

Apakah ada support channel in-app (link/help) atau cukup generic?

Dark mode masuk MVP atau ditunda?

Batasan performance: target device kelas apa?
