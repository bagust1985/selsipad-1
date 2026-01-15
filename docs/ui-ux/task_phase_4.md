Phase 4 — Identity & Profile (Wallet + Blue Check + KYC View) 🧑‍💼🔐

1. Tujuan Phase 4 🎯

User bisa mengelola identitas & akun tanpa bingung: wallet, primary wallet, session.

Status verifikasi jelas: Blue Check dan KYC (progress/result).

Semua aksi sensitif punya UX aman: konfirmasi, warning, dan recovery path.

2. Scope Phase 4 ✅
   A. Profile Home (Account overview)

Ringkasan akun + status badge (Blue Check, KYC)

Shortcut ke: Wallets, Blue Check, KYC, Security/Settings

B. Wallet Management

List linked wallets (multi-chain/multi-address)

Add/link wallet

Set primary wallet

Remove/unlink wallet (dengan guard kalau wallet itu primary)

C. Blue Check (Status + Action entry)

Status screen (active/inactive/expired jika ada)

CTA activate/renew (kalau ada)

Benefit summary (mis: posting/rewards gating)

D. KYC Status Viewer

Status: not started / pending / verified / rejected

Informasi ringkas: kapan submit, apa yang kurang (jika rejected), next step CTA

View policy note (ringkas)

E. Security & Settings (minimal)

Session/device list (opsional tapi recommended)

Logout current / logout all (opsional)

Basic preferences (language, notifications toggle jika ada)

3. Out of Scope Phase 4 🚫

Admin KYC operations (portal admin)

Advanced privacy controls (jika belum ada)

Rewards/referral (Phase 3)

Feed moderation (Phase 2)

4. Dependencies 🧱

Phase 0: gating pattern, confirm patterns, tokens/components

Wallet linking endpoints tersedia (add/list/remove/set primary)

Blue Check status endpoint (+ purchase/renew entrypoint jika ada)

KYC status endpoint (dan optional: “rejected reason codes”)

5. Global UX Rules Phase 4 📘

Primary wallet adalah “source of truth” untuk aksi tertentu → UI harus menonjolkan primary dan jelasin efeknya.

Aksi destruktif (remove wallet, logout all) wajib:

confirm modal

warning singkat

disable jika melanggar rule (mis remove primary) + reason + CTA “set primary dulu”

Status verifikasi selalu ditampilkan sebagai:

chip + 1 kalimat + next action

Jangan bikin user “terjebak”: selalu sediakan link balik ke Profile.

6. Work Packages (WP) Phase 4 📦
   WP1 — Profile Overview 🧑‍💼
   Deliverables

Profile home screen spec (layout + component usage)

Status cards (Blue Check, KYC)

Navigation shortcuts spec

Layout minimum

Header: avatar/username (jika ada), account id ringkas

Status section:

Blue Check: Active/Inactive + CTA

KYC: Verified/Pending/Not started/Rejected + CTA

Wallet summary: primary wallet + count linked wallets

Settings shortcuts list

Required states

Loading skeleton

Error retry

Empty states (misal belum link wallet)

Acceptance Criteria ✅

Dari Profile, user bisa masuk ke semua sub-screen identitas tanpa cari-cari

Status Blue Check & KYC terlihat jelas

WP2 — Wallet Management (List + Set Primary) 👛
Deliverables

Wallet list screen spec

Wallet item component spec

Set primary flow spec

Remove/unlink flow spec (dengan guard)

Wallet list item minimum

Address (shortened)

Network badge (EVM/SOL)

Tag: Primary (jika primary)

Actions menu: Set primary / Copy / Remove

Rules

Remove primary wallet: disabled + reason “Set primary wallet lain dulu”

Set primary: confirm modal “Mengubah primary wallet akan memengaruhi …”

Acceptance Criteria ✅

Primary wallet jelas & tidak mudah salah pilih

Remove wallet aman & tidak bikin akun “broken”

WP3 — Add/Link Wallet Flow ➕🔗
Deliverables

Entry point (button) + flow UI

Connect wallet modal/screen (jika pakai wallet connector)

Success state + update list

UX steps (ideal)

Tap “Add wallet”

Pilih network/connector (jika ada)

Sign message (opsional) / connect

Success toast → balik ke list

Edge rules

Kalau address sudah linked → tampil “Already linked” + CTA “Go to wallet list”

Kalau connect gagal → error + retry

Acceptance Criteria ✅

Flow linking jelas dan tidak bikin user “stuck”

Error handling friendly

WP4 — Blue Check Status & Activation ✅
Deliverables

Blue Check screen spec

Status states + CTA mapping

Benefit list (singkat)

Required states

INACTIVE: CTA activate + explain benefit utama (posting, rewards)

ACTIVE: show expiry date jika ada + CTA manage/renew

PENDING (jika ada): show “processing” + what to expect

ERROR: retry

Acceptance Criteria ✅

User paham: Blue Check itu apa & ngaruh ke fitur apa

CTA tidak misleading (jangan janji “instan” kalau prosesnya delay)

WP5 — KYC Status Viewer 🪪
Deliverables

KYC status screen spec

Status mapping + next steps

Rejected handling (reason + CTA resubmit kalau ada)

Required states

NOT_STARTED: CTA start KYC + info ringkas

PENDING: “sedang diproses” + estimasi (kalau boleh) / info next step

VERIFIED: “verified” + date

REJECTED: reason summary + CTA resubmit + link policy/help

Acceptance Criteria ✅

Rejected tidak bikin user frustrasi: jelas apa yang harus dilakukan

Pending tidak “silent”; selalu ada status explanation

WP6 — Security & Sessions (Minimal) 🛡️

Kalau backend belum support session listing, tetap bikin screen placeholder “coming soon” jangan dipublish; atau skip.

Deliverables (jika support)

Sessions list screen spec

Logout current / logout all flow spec (confirm modal)

Optional: device name + last active

Acceptance Criteria ✅

Logout all jelas dampaknya

Destructive action always confirmed

WP7 — Settings (Basic) ⚙️
Deliverables

Settings screen spec (simple list)

Toggles (notifications, language) kalau ada

Links: terms/privacy/help (opsional)

Acceptance Criteria ✅

Settings tidak ramai, fokus hal penting

Semua link balik jelas

7. Component Additions (jika belum ada di Phase 0) 🧩

AccountStatusCard (Blue Check / KYC)

WalletItemRow

PrimaryTag

ActionMenu (kebab menu)

ConfirmModal variant for destructive actions (remove/logout)

8. Analytics hooks (minimal) 📊

View Profile

Open Wallet management

Add wallet attempt success/fail

Set primary success/fail

Remove wallet attempt success/fail (blocked reason tracking)

Blue Check open + activate click

KYC open + start click + status views

Logout all click

9. Definition of Done Phase 4 ✅

Profile overview beres

Wallet management (list/add/set primary/remove) beres dengan guard

Blue Check status + CTA beres

KYC status viewer beres

Security/settings minimal beres (atau jelas di-skip)

10. Open Questions (maks 10, blocker only) ❓

Wallet linking butuh sign message (SIWE style) atau connect saja?

Boleh unlink semua wallet atau minimal harus ada 1 wallet?

Primary wallet dipakai untuk apa saja (claim/rewards/posting)?

Blue Check flow: on-chain payment atau off-chain checkout?

Blue Check ada expiry/renew atau sekali beli?

KYC: bisa resubmit setelah rejected? reason codes tersedia?
