Phase 2 — P1 Social + Growth (Feed + Trending + Updates) 📣📈

1. Tujuan Phase 2 🎯

Naikkan engagement: user bisa ngikutin project lewat feed & updates.

Social tetap aman: posting gated (mis. Blue Check), non-verified tetap bisa baca.

Konten jadi “trust amplifier”: Update penting gampang ditemukan dari Project Detail dan Feed.

2. Scope Phase 2 ✅
   A. Feed (User Social)

Feed timeline (read for all)

Composer (post) hanya untuk user eligible (gated)

Interaksi dasar (like/comment opsional—kalau belum di roadmap, tahan dulu)

Report/Hide (moderation affordance)

B. Project Updates (Announcements)

Update list di Project Detail (read-only)

Update detail page

Pin “important update” (opsional jika backend support; kalau belum, cukup “important badge”)

C. Trending Enhancements (light)

Refinement modul “Trending” untuk growth: sorting, category chips, “why trending”

(Kalau trending sudah cukup di Phase 1, Phase 2 hanya polish logic & UI states)

3. Out of Scope Phase 2 🚫

Rewards & referral (Phase 3)

Profile / wallet settings (Phase 4)

Moderation queue admin (bukan user app)

Sistem follow/subscription kompleks (kalau belum ada)

4. Dependencies (wajib sudah ada) 🧱

Phase 0: gating pattern (reason+CTA), empty/loading/error standard, tokens/components

Phase 1: Project Detail sudah ada tab Updates (read-only) minimal

Status dictionary & eligibility checks (mis. Blue Check status) tersedia via API

5. Work Packages (WP) Phase 2 📦
   WP1 — Feed Timeline (Read for all) 📰
   Deliverables

Feed screen spec: layout + list behaviors

Feed item component spec (post card)

Loading/empty/error states

Feed item minimum content

Author identity (username + verified badge jika ada)

Timestamp (relative)

Project reference (jika post terkait project) → tap menuju Project Detail

Content (text, optional media jika ada)

Actions row minimal: (a) View details (b) Report (c) Hide

Kalau like/comment belum siap backend: tampilkan placeholder non-interactive atau jangan tampilkan sama sekali. Jangan “fake buttons”.

Required states

Loading: skeleton list

Empty: empty state + CTA “Explore Projects” + edukasi “Feed akan terisi dari project yang trending/updates”

Error: retry

Acceptance Criteria ✅

Semua user bisa scroll feed dan masuk ke Project Detail dari post yang terkait

Tidak ada dead-end saat empty/error

WP2 — Composer (Gated Posting) ✍️🔐
Deliverables

Composer entry (FAB/button) + composer screen/modal

Gating notice untuk non-eligible user (reason + CTA)

Post submission feedback states

Gating rules (UI)

Kalau non-eligible:

tombol post tetap ada tapi saat tap → tampil “GatingNotice” (kenapa tidak bisa) + CTA “Verify/Activate”

Kalau eligible:

composer aktif

Composer minimum features

Text input + char limit (kalau ada)

Optional attach media (kalau ada)

Optional link to project (tagging project) (kalau backend support; kalau belum: skip)

Post submit UX (wajib)

Confirm (opsional; jika posting sensitif/moderasi ketat, boleh skip confirm)

Submitted state: “Postingan kamu dikirim”

Failure: error + retry guidance

Acceptance Criteria ✅

Non-eligible user selalu dapat reason + CTA

Eligible user bisa post tanpa kehilangan draft (draft autosave opsional)

WP3 — Feed Post Detail (optional tapi recommended) 🔍

Kalau feed item panjang/komentar ada, post detail berguna. Kalau belum perlu, boleh minimal.

Deliverables

Post detail screen spec

Report/hide action consistency

Acceptance Criteria ✅

Dari feed item bisa “view details” jika konten panjang/ada media

WP4 — Project Updates List (in Project Detail tab) 🗞️
Deliverables

Updates tab spec (list)

Update item card spec

Update item minimum content

Title

Date

Tags: Important / Dev / Security (opsional)

Snippet preview

Tap → Update detail

Required states

Loading skeleton

Empty “Belum ada update” + CTA “Back to Overview”

Error retry

Acceptance Criteria ✅

User selalu bisa lihat update terbaru dengan jelas

Update penting kelihatan (badge/position top)

WP5 — Update Detail Screen 📄
Deliverables

Update detail layout spec

Share action (opsional)

Linkback ke Project Detail

Content minimum

Title

Author/admin label (jika ada)

Timestamp

Body (rich text simple)

Attachments/links (jika ada)

Acceptance Criteria ✅

Update detail readable mobile

Ada “Back to Project” jelas

WP6 — Trending UI Refinement (light) 📈
Deliverables

Trending section spec (Home + Explore)

Category chips (mis. All / Presale / Fairlaunch / Verified)

“Why trending” tooltip (opsional)

Acceptance Criteria ✅

Trending tidak membingungkan dan punya states lengkap

Jika trending kosong, fallback ke “Newest/Featured”

6. Global UX Rules Phase 2 📘

Gating pattern selalu: Reason + CTA (jangan error)

Tidak ada tombol palsu (kalau like/comment belum siap, jangan tampilkan)

Feed & Updates wajib punya: loading/empty/error

Semua konten yang terkait project harus bisa tap ke Project Detail

Moderation affordance minimal: Report + Hide (biar user merasa aman)

7. Analytics hooks (minimal) 📊

Feed view, scroll depth (optional)

Tap post → project detail

Tap compose attempt (eligible vs non-eligible)

Post submit success/fail

Updates list view, update open rate

Trending chip usage

8. Definition of Done Phase 2 ✅

Feed read experience selesai + composer gated jelas

Updates list + detail siap

Trending polish selesai (kalau diperlukan)

Semua layar punya states lengkap & tidak ada dead-end

9. Open Questions (maks 10, blocker only) ❓

Eligibility posting: hanya Blue Check atau juga syarat lain?

Post moderation: apakah posting langsung publish atau “pending review”?

Media upload support: image only atau juga video?

Update author: tampilkan admin/project owner label atau anonim?

Update tags: apakah sudah ada di backend?

Feed source: global feed atau per project feed (tab di Project Detail)?
