Phase 0 — UX Foundation (detail untuk eksekusi agent) 🧱
A) Tujuan Phase 0 (biar semua phase berikutnya ngebut) 🎯

Satu bahasa status & aksi (biar UI gak “bohong” vs backend)

Komponen inti reusable (biar Phase 1–4 tinggal assembling)

Polanya konsisten: transaksi, gating, error/loading/empty, confirmation

0.1 IA (Information Architecture) + Navigation Spec 🧭
Output yang harus jadi

(1) Sitemap (struktur layar)

Tabs utama: Home / Explore / Portfolio / Feed / Profile

Detail routes: Project Detail (tabs), Participation (presale/fairlaunch), Vesting Detail, LP Lock Detail, Rewards, Settings, Wallet Management, KYC status

(2) Navigation rules

Back behavior (misal dari deep link ke Project Detail → balik ke Home/Explore)

Deep link format (misal: app://project/:id?tab=participation)

Guard route (misal: Feed composer hanya kalau Blue Check)

(3) User journey map (P0)

Discover → Project Detail → Participate → Track → Claim/Refund/Vesting → Proof (LP Lock)

Eksekusi agent

Sonnet (owner):

Buat sitemap + route list + low-fi wireframe nav

Definisikan tab structure + “entry points” (CTA dari mana ke mana)

Opus (review):

Cek flow tidak dead-end

Cek gating route (misal: non-blue-check masuk composer harus diarahkan ke verify)

Gemini (polish):

Saran hierarchy & visual navigation pattern (bottom nav vs top tabs, dll)

Acceptance checklist ✅

Semua fitur Phase 1–4 punya “rumah” di sitemap

Tidak ada layar yang cuma bisa diakses dari 1 jalan yang rapuh

Deep link bisa bawa user langsung ke tab yang tepat

0.2 Status & State Language (Single Source of Truth) 🧠

Ini kunci biar UI konsisten. Kita bikin “status dictionary” yang dipakai di semua layar.

Output yang harus jadi

(1) Status Dictionary (Global)
Contoh kategori (kamu boleh adjust sesuai backend tapi struktur wajib ada):

Project lifecycle

DRAFT / SUBMITTED / REVIEWING / APPROVED / REJECTED

Sale lifecycle (Presale/Fairlaunch)

UPCOMING / LIVE / ENDED / FINALIZING / SUCCESS / FAILED

Post-sale

LP_LOCK_PENDING / LP_LOCKED / LP_LOCK_FAILED

VESTING_ACTIVE / VESTING_ENDED

CLAIM_AVAILABLE / CLAIMED

REFUND_AVAILABLE / REFUNDED

Tx UI state (per aksi)

TX_IDLE / TX_AWAITING_SIGNATURE / TX_SUBMITTED / TX_CONFIRMED / TX_FAILED

(2) Status → UI mapping
Untuk setiap status wajib ada:

Label (teks singkat)

1 kalimat deskripsi (“apa yang terjadi”)

Primary CTA (“apa yang bisa user lakukan sekarang”)

Disable reasons (kalau CTA off)

Eksekusi agent

Opus (owner):

Susun status dictionary + microcopy + rules CTA

Susun daftar “disable reasons” yang manusiawi

Sonnet (implementable spec):

Jadikan ini jadi file spec yang gampang dipakai FE (misal JSON/TS object)

Pastikan setiap layar pakai mapping ini

Gemini (UX tone):

Rapihin bahasa label biar konsisten, gak kepanjangan, dan “fintech clean”

Acceptance checklist ✅

Setiap status punya: Label + 1 kalimat + CTA + alasan disabled

Tidak ada 2 status beda tapi labelnya sama (bikin bingung)

Semua aksi uang pakai TX state standard (tidak improvisasi per layar)

0.3 Design System v1 (Tokens + Foundations) 🎨
Output yang harus jadi

(1) Foundations

Color palette + semantic colors (success/warn/error/info/neutral)

Typography scale (Heading, body, caption)

Spacing scale (4/8/12/16/24/32, dll)

Radius, shadow, border thickness

Icon size rules

Dark mode decision: (pilih salah satu)

Option A: Light-only dulu (lebih cepat)

Option B: Light + Dark tokens (lebih rapi jangka panjang)

(2) Design tokens format
Minimal bentuknya bisa kayak:

color.background.primary

color.text.primary

color.status.live

spacing.4, spacing.8

radius.sm/md/lg

shadow.1/2/3

(3) Accessibility baselines

Contrast minimum (terutama status badge)

Tap target minimum (44px)

Focus state untuk tombol & input

Eksekusi agent

Gemini (owner):

Tentukan visual direction + tokens values + contoh 2–3 komponen (badge, button, card)

Sonnet (systematize):

Buat token naming, struktur file tokens, dan aturan penerapan ke komponen

Opus (QA):

Review contrast + “red/green dependency” (jangan bergantung warna doang)

Acceptance checklist ✅

Token naming konsisten & siap dipakai FE

Semantic color ada untuk semua status utama (LIVE/SUCCESS/FAILED/PENDING)

Ada aturan focus/disabled/hover (biar tidak random)

0.4 Component Library (Core Reusable Components) 🧩
Output yang harus jadi (minimal core set)

Komponen inti yang jadi “paku” seluruh app:

Navigation & Layout

BottomNav

PageHeader (title + back + actions)

Tabs (Project Detail tabs)

Data display

ProjectCard (compact + expanded)

StatusBadge

TimelineStepper

SafetyCard (LP lock, audit/scan, vesting)

InfoRow (label-value)

Countdown

Forms & actions

PrimaryButton / SecondaryButton / DangerButton

AmountInput (dengan max, min, helper)

ConfirmModal (2-step untuk aksi uang)

Checkbox confirm (“I understand”)

Feedback states

TxToast / TxBanner (submitted/confirmed/failed)

Skeleton loaders (list + detail)

EmptyState (dengan CTA)

InlineError + Retry

ReasonTooltip / DisabledReason

Spec tiap komponen wajib ada

Untuk tiap komponen:

Purpose

Props (nama + type + required/optional)

States (default/hover/disabled/loading/error)

Do/Don’t usage

Example placements (di layar mana dipakai)

Eksekusi agent

Sonnet (owner):

Buat component inventory + spec props + state list + contoh penggunaan

Gemini (visual owner):

Buat variant visual + spacing rules + icon usage

Opus (UX QA):

Review komponen “anti kesalahan”: ConfirmModal, DisabledReason, Tx patterns

Acceptance checklist ✅

Setiap komponen punya states lengkap (loading/disabled/error)

Tidak ada 2 komponen fungsi sama tapi nama beda (hindari duplikasi)

Komponen “money action” wajib punya ConfirmModal + Tx state

0.5 UX Patterns Playbook (aturan main yang dipakai semua layar) 📘
Output yang harus jadi

(1) Transaction pattern

Step 1: Confirm (ringkasan amount + fee + warning)

Step 2: Await signature

Step 3: Submitted (tx hash + “track in Portfolio”)

Step 4: Confirmed / Failed (retry guidance)

(2) Gating pattern

Jika user tidak eligible → tampilkan:

“Kenapa gak bisa?” (1 kalimat)

CTA untuk memenuhi syarat (verify / set primary wallet / dll)

(3) Empty/loading/error standard

Skeleton dulu, bukan spinner doang

Empty state selalu punya CTA (Explore, Verify, Connect wallet)

Error state ada retry + fallback

(4) Trust surface pattern

Di Project Detail selalu ada panel Safety:

KYC / SC Scan / LP Lock / Vesting ringkas

Jangan sembunyiin info safety di bawah

Eksekusi agent

Opus (owner): tulis playbook rules + contoh microcopy

Sonnet: tempel pattern ke setiap screen spec template (biar selalu kebawa)

Gemini: bikin contoh layout pattern yang elegan (Tx banner, gating notice)

Acceptance checklist ✅

Semua aksi uang punya pola identik

Semua gating punya “reason + CTA”

Semua layar punya empty/loading/error (tidak ada “blank screen”)

0.6 Handoff Pack (biar FE tinggal gas) 📦
Output final Phase 0

IA & Routes doc (sitemap + deep links)

Status Dictionary (mapping status → label/desc/CTA/disable reasons)

Design Tokens v1

Component Specs v1

UX Patterns Playbook

Screen Spec Template (template standar untuk Phase 1+)

Eksekusi agent

Sonnet (owner): compile semua jadi “paket handoff”

Opus: final QA pass (consistency & edge cases)

Gemini: final style sanity check