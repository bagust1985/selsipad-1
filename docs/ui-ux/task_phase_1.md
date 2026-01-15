Phase 1 — P0 Money Flows (User App) 💸🚀

1. Tujuan Phase 1 🎯

User bisa discover → buka project → ikut presale/fairlaunch → track → claim/refund/vesting → lihat bukti LP lock tanpa dead-end.

Semua aksi uang punya UX yang konsisten: Confirm → Sign → Submitted → Confirmed/Failed.

Semua gating jelas: reason + CTA (bukan error mendadak).

2. Scope Phase 1 (yang dikerjakan) ✅
   A. Discovery Core

Home (Trending/Featured/Quick actions)

Explore (Search + filter + sorting)

Project Card (list item & highlight components)

B. Project Detail (Universal Hub)

Tabs: Overview / Participation / Tokenomics / Timeline / Safety / Updates

Status & badges (KYC, SC scan, LP lock, vesting indicator)

Timeline stepper end-to-end

C. Participate Flow

Presale Participate: buy + receipt + tx status + finalize outcome + claim/refund entrypoint

Fairlaunch Participate: contribute + “final price” explanation + finalize outcome + claim entrypoint

D. Portfolio & Claim Center

Portfolio: Active / Claimable / History

Vesting detail: schedule + claim history + next unlock

Refund screen (kalau failed)

E. LP Lock Transparency

LP lock status + unlock date + tx proof/link

3. Out of Scope Phase 1 (ditahan dulu) 🚫

Feed composer + moderation (Phase 2)

Rewards & referral (Phase 3)

Profile advanced settings (Phase 4)

Visual polish final & full QA UX pass (Phase 5)

4. Dependencies (wajib sudah ada dari Phase 0) 🧱

Status Dictionary + mapping status → label/desc/CTA/disable reasons

Transaction pattern standard (confirm/sign/submitted/confirmed/failed)

Gating pattern standard (reason + CTA)

Design tokens + core components v1

Kalau salah satu belum ada, Phase 1 bakal banyak “bolong” dan agent rawan ngarang.

5. Work Packages (WP) Phase 1 📦
   WP1 — Home (Discovery Entry) 🏠
   Deliverables

Wireframe + interaction spec (scroll sections, tap behavior)

Component usage mapping

States: loading/empty/error

Content & layout minimum

Section 1: Trending Projects (Top 10)

Section 2: Featured/Recommended

Section 3: Quick actions (Explore / Portfolio / Verify (jika perlu))

Optional banner: edukasi singkat “LP Lock & Vesting”

Acceptance Criteria ✅

Home bisa jadi entry untuk Project Detail dan Explore

Semua list punya skeleton + empty state CTA “Explore projects”

WP2 — Explore (Search/Filter/Sort) 🔎
Deliverables

Search bar behaviors (debounce, clear, empty query)

Filter sheet (modal/bottom sheet)

Sorting options

Filters minimum

Network

Status (UPCOMING/LIVE/ENDED)

Type (Presale/Fairlaunch)

Verified badges (KYC/SC scan)

Sort: Trending / Newest / Ending soon

Acceptance Criteria ✅

Filter state persist (selama session)

Empty result state: “No results” + CTA reset filter

WP3 — Project Detail (Universal Hub) 🧩
Deliverables

Layout spec + tab spec

Status chip & badges spec

Timeline stepper spec

Safety cards spec

Header minimum

Logo + Name + Network badge

StatusBadge (sale status)

Badges row: KYC/SC scan/LP lock/vesting indicator (kalau ada)

Tabs & isi minimum

Overview: summary, highlights, key metrics

Participation: embed presale/fairlaunch widget sesuai tipe

Tokenomics: supply, price rules (ringkas), vesting summary

Timeline: stepper lifecycle end-to-end

Safety: KYC/SC scan status, LP lock status, vesting schedule ringkas, risks note

Updates: list update (read-only)

Acceptance Criteria ✅

Project Detail jadi “single source screen” untuk semua aksi & status

Jika CTA tidak available → tampil reason + CTA alternatif (misal “Go to Portfolio”)

WP4 — Participation: Presale Flow 🧾
Deliverables

Presale widget spec (input, preview, fees note)

Confirm modal spec

Tx feedback spec

Receipt/history panel spec

Finalization outcome states spec

Required UI states

UPCOMING: countdown + “Notify/Remind me” opsional, CTA disabled reason

LIVE: input amount + Buy CTA

ENDED: “Sale ended” → waiting finalization

FINALIZING: info panel “menunggu finalisasi”

SUCCESS: CTA “Claim / View vesting” (tergantung mekanisme)

FAILED: CTA “Refund”

Anti-mistake rules

Saat TX_SUBMITTED: disable buy + show tx banner + link “Portfolio”

Double submit prevention: lock button + show “pending”

Acceptance Criteria ✅

User selalu tau: “apa yang terjadi sekarang” + “aksi berikutnya”

Tidak ada kondisi “blank” setelah submit tx

WP5 — Participation: Fairlaunch Flow 📊
Deliverables

Contribution widget spec

Explanation panel: “final price ditentukan di akhir”

Confirm modal + tx feedback

Outcome states spec

Required UI states

UPCOMING / LIVE / ENDED / FINALIZING / SUCCESS / FAILED

Success: claim entrypoint

Failed: refund entrypoint (jika applicable)

Acceptance Criteria ✅

Copy sederhana: user paham fairlaunch tanpa baca dokumen panjang

Sama anti-double submit seperti presale

WP6 — Portfolio (Active/Claimable/History) 🗂️
Deliverables

Portfolio list spec + item card

Tab behaviors + filtering minimal

Claim Center pattern

Tab content

Active: ongoing participations (LIVE/FINALIZING)

Claimable: claim/refund available

History: completed/claimed/refunded

List item minimum

Project name + status + primary CTA

1-line descriptor (misal: “Next unlock: 12 Feb 2026”)

Acceptance Criteria ✅

Portfolio jadi “ground truth” untuk tracking

Semua entrypoint tx selalu bisa balik/dirujuk ke Portfolio

WP7 — Vesting Detail 🧾⏳
Deliverables

Vesting schedule view (simple list/bars)

Claim button behavior (confirm → tx states)

Claim history list

Required info blocks

Total allocation

Claimed

Claimable now

Next unlock date

Acceptance Criteria ✅

Claimable selalu jelas (angka & status)

History ada untuk audit user (“gue udah claim kapan?”)

WP8 — Refund Flow (Failed Sale) ↩️
Deliverables

Refund screen spec (reason, amount eligible, CTA refund)

Tx states & receipts

Acceptance Criteria ✅

Refund flow tidak “menyalahkan user”, fokus ke tindakan

Status refund tersimpan & muncul di History

WP9 — LP Lock Detail (Transparency) 🔒
Deliverables

LP lock screen spec (status, unlock date, proof)

Link explorer / proof tx

UI states

PENDING: show “in progress”

LOCKED: show unlock date + proof

FAILED: show guidance + “check updates”/support path

Acceptance Criteria ✅

User bisa verifikasi “trust surface” tanpa harus tanya admin

6. Global UX Rules untuk Phase 1 (wajib dipakai di semua WP) 📘

Transaction pattern selalu sama (Confirm → Sign → Submitted → Confirmed/Failed)

Disable reason wajib muncul kalau CTA mati

Skeleton > spinner (spinner boleh hanya untuk micro-loading)

Empty state selalu punya CTA

Status chip + 1 kalimat penjelasan di setiap screen yang status-driven

7. Analytics hooks (minimal, biar ngerti drop-off) 📈

View: Home, Explore, Project Detail, Participation, Portfolio, Vesting, LP Lock

Click CTA: Participate/Buy/Contribute/Claim/Refund

Tx milestone: submitted/confirmed/failed

Filter usage: apply/reset

Nggak perlu rumit sekarang, tapi minimal event listnya ada.

8. Definition of Done Phase 1 ✅

Semua WP selesai dengan: wireframe/spec + states + gating + acceptance criteria

Tidak ada dead-end flow untuk P0 money actions

Semua transaksi punya feedback states yang konsisten

Portfolio bisa melacak semua aksi (submitted/confirmed/failed)

9. Open Questions (maks 10, hanya blocker) ❓

Presale success → claim langsung atau selalu lewat vesting?

Refund berlaku untuk semua failure case atau kondisi tertentu?

Fairlaunch: ada estimasi alokasi real-time atau hanya kontribusi total?

Explorer link format per chain (EVM/SOL) akan di-handle di UI helper atau backend?

Status final “LP lock pending” muncul kapan (immediately setelah success atau setelah job jalan)?

Updates source: dari admin CMS internal atau on-chain metadata?
