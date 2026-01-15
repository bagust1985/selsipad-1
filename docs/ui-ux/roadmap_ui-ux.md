Roadmap UI/UX User App (hingga semua fitur selesai) 🗺️
Phase 0 — UX Foundation (1 paket pondasi) 🧱

Target: semua desain konsisten & cepat diproduksi

Deliverables

Information Architecture (IA) final + sitemap user app

Design System v1 (tokens + components + patterns)

UX rules: status chip + stepper/timeline + gating notice + tx feedback pattern

Eksekusi

Sonnet: IA + daftar layar + component inventory

Gemini: style direction + design tokens + contoh 3 layar (Home, Project Detail, Portfolio)

Opus: UX rules & anti-error patterns (tx pending, disable reason, confirm modals)

Definition of Done ✅

Ada “komponen inti” yang reusable: StatusBadge, Timeline/Stepper, ProjectCard, CTA states, TxToast, GatingNotice, Skeleton/EmptyState.

Phase 1 — P0 Money Flows (Core Launchpad Experience) 💸🚀

Target: user bisa ikut presale/fairlaunch + track status + claim/refund tanpa bingung

1A) Project Discovery Core

Home (Trending/Featured/Quick actions)

Explore (Search + filter + sorting)

Project Card templates (compact & detailed)

Eksekusi

Sonnet: wireframe + interaction spec + data fields per card/list

Gemini: final UI Home/Explore + card visual hierarchy

Opus: copywriting untuk trust + empty states + filter logic sanity check

1B) Project Detail (Universal Hub)

Overview / Participation / Tokenomics / Timeline / Safety / Updates

Badges: KYC/Scan/LP lock/vesting indicator

Timeline stepper end-to-end

Eksekusi

Sonnet: layout + tab behaviors + state mapping (UPCOMING/LIVE/ENDED/FINALIZING/SUCCESS/FAIL)

Gemini: high-fi Project Detail (ini layar paling sering dibuka)

Opus: validasi trust surface + microcopy risk disclosure (tanpa nakut-nakutin)

1C) Participate Flow

Presale: buy, pending tx, receipt, finalize status, refund/claim

Fairlaunch: contribute, pricing explanation, finalize, claim

Eksekusi

Sonnet: wizard/flow spec + components (amount input, preview, fees, receipt)

Opus: edge-case matrix (double submit, tx fail, chain switch, expired round)

Gemini: UI forms & confirmation modal yang “fintech-grade”

1D) Portfolio + Claim Center

Portfolio tab: Active / Claimable / History

Vesting detail: schedule + claim history

Refund screen (kalau fail)

Eksekusi

Sonnet: screen set + list item states + claim UX pattern

Opus: idempotent UX + “what if pending?” behaviors

Gemini: visual clarity untuk “Claimable now” & next unlock highlight

1E) LP Lock Transparency

LP lock status + unlock date + proof/tx link

Eksekusi

Sonnet: LP lock screen spec + trust widgets

Opus: wording transparansi + fallback kalau data belum sinkron

Gemini: layout “Safety card” yang mudah dipahami

Definition of Done ✅

User bisa: discover → open project → participate → track → claim/refund/vesting → lihat LP lock proof tanpa dead-end.

Phase 2 — P1 Social + Growth (Feed + Trending + Updates) 📣📈

Target: growth jalan tapi tetap aman & gated

2A) Feed (Gated)

Read-only untuk non-verified

Composer untuk verified + post states + report/hide

Eksekusi

Sonnet: feed layout + composer + moderation affordances

Opus: gating rules microcopy + anti-spam UX patterns

Gemini: visual feed + empty states + highlight verified

2B) Updates / Announcements

Update list di project + detail view + pin important updates

Eksekusi

Sonnet: update modules spec

Opus: info hierarchy (apa yang penting tampil dulu)

Gemini: layout update card (nyambung dengan brand)

Definition of Done ✅

Feed & updates enak dipakai, jelas gating-nya, dan user ngerti “kenapa gak bisa post”.

Phase 3 — P1 Rewards & Referral UX (High friction area) 🎁🧲

Target: user paham syarat, ngerti status, dan gak salah ekspektasi

Rewards Dashboard (4-state gating)

Referral link/share UX

Claim rewards + history

Eksekusi

Sonnet: rewards screens + claim flow + history

Opus: state rules + microcopy (biar user gak komplain “kok 0?”)

Gemini: visual “progress/eligibility” yang simpel (tanpa ribet)

Definition of Done ✅

User selalu tau: syarat → progress → eligible? → claimable? → history.

Phase 4 — Identity & Profile (Wallet + Blue Check + KYC View) 🧑‍💼🔐

Target: semua urusan akun beres & jelas

Profile overview

Wallet management (link multiple, set primary)

Blue check status + purchase/renew entrypoint

KYC status viewer (progress & result)

Eksekusi

Sonnet: profile IA + forms + account settings screens

Opus: privacy/security UX (warnings, confirmations)

Gemini: visual cleanliness + spacing (settings gampang dibaca)

Definition of Done ✅

User bisa ngatur akun tanpa takut salah langkah, dan status verification selalu jelas.

Phase 5 — Polish & QA UX (Release-ready) ✨✅

Target: “feel” produk naik kelas, minim error UX

Checklist:

Copywriting konsisten (tone, istilah, status naming)

Loading/empty/error states di semua layar

Accessibility basic (contrast, tap targets, focus states)

Performance UX (skeleton, pagination, optimistic UI yang aman)

Analytics events map (view, click CTA, drop-off points)

Eksekusi

Opus: QA UX + edge-case sweep + microcopy final

Gemini: UI polish pass + icon/illustration consistency

Sonnet: final spec pack + handoff ke FE (komponen & tokens final)

Definition of Done ✅

Semua layar punya states lengkap + gak ada dead-end + semua CTA punya alasan bila disable.
