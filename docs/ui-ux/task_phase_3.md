Phase 3 — P1 Rewards & Referral UX 🎁🧲

1. Tujuan Phase 3 🎯

User paham syarat (gating) tanpa harus tanya admin/CS.

User bisa share referral dengan mudah.

User selalu ngerti bedanya:

“Belum eligible”

“Eligible tapi reward = 0”

“Claimable”

Claim flow aman, konsisten (pakai Tx pattern Phase 0).

2. Scope Phase 3 ✅
   A. Rewards Dashboard (Referral Earnings)

Summary (total earned, claimable now, claimed lifetime)

Eligibility & progress panel

Claim rewards + tx states

Rewards history (claim history + earning events jika ada)

B. Referral Share UX

Referral link/code display

Share actions (copy/share)

Referral tracking (active referral count, status)

C. Education & Transparency

“How it works” sheet (ringkas)

“Why is my reward 0?” helper state

3. Out of Scope Phase 3 🚫

Sistem tier/level kompleks (kalau belum ada)

Rewards selain referral (kalau belum masuk roadmap)

Admin payout tooling (bukan user app)

4. Dependencies 🧱

Phase 0: transaction pattern, gating pattern, empty/loading/error standard, components

Eligibility flags tersedia dari backend (mis. Blue Check, active_referral_count, reward_balance/claimable)

Reward claim endpoint + history endpoint tersedia (minimal claim history)

5. UX Rules Khusus Rewards (Wajib) 📘

Rule paling penting: Jangan bikin user “berharap palsu”.

5.1 4-State Gating Model (harus dipakai)

NOT_ELIGIBLE

Contoh: belum Blue Check / belum memenuhi syarat lain

UI: CTA “Activate/Verify” + reasons list (1–2 poin max)

ELIGIBLE_NO_REFERRALS

Eligible tapi active_referral_count = 0

UI: CTA “Share referral link” + tips singkat

ELIGIBLE_REWARD_ZERO

ada referral tapi claimable = 0

UI: tampil progress + jelaskan kenapa 0 (mis. belum memenuhi threshold / belum settled)

CLAIMABLE

claimable > 0

UI: Claim button aktif + breakdown amount

Semua state harus punya: 1 kalimat status + next best action.

5.2 Claim button behavior

Claim button hanya aktif di state CLAIMABLE

Saat tx submitted → disable + show tx banner + link ke history

Setelah confirmed → update claimable → 0 + entry di history

5.3 Transparansi minimum

Tampilkan “Last updated” timestamp kalau data bisa delay (opsional tapi bagus)

Bedakan jelas:

“Claimable now”

“Pending / processing” (kalau ada)

“Claimed total”

6. Work Packages (WP) Phase 3 📦
   WP1 — Rewards Dashboard 🧾
   Deliverables

Rewards main screen spec (layout + components)

Eligibility/progress panel spec

Summary cards spec

Loading/empty/error states

Layout minimum

Header: Rewards

Summary cards:

Claimable now

Lifetime earned (opsional)

Claimed total (opsional)

Eligibility panel (4-state)

Actions:

Claim (jika claimable)

Share referral

View history

States required

Loading skeleton

Error with retry

Empty state (jika reward feature belum ada data) → CTA share referral

Acceptance Criteria ✅

User bisa mengerti statusnya dalam 3 detik (lihat state + CTA)

Tidak ada kondisi UI “kosong” tanpa arahan

WP2 — Referral Share Screen / Sheet 🔗📤
Deliverables

Referral share UI spec

Copy link / share button behaviors

Referral code/link display component spec

Content minimum

Referral link (copy)

Referral code (jika ada)

Short explanation: “Orang yang pakai link kamu → jadi referral aktif”

“Active referrals” count + status (opsional list)

Acceptance Criteria ✅

Copy link kasih toast “Copied”

Share tidak bikin user keluar flow (sheet modal recommended)

WP3 — Referral Tracking (Minimal) 👥

Kalau backend belum siap list detail, cukup summary.

Deliverables

Tracking section spec: active_referral_count + optional breakdown

Optional: list of referrals (anonim) + status (active/inactive)

Acceptance Criteria ✅

Jika tidak ada list, UI tetap informatif (count + guidance)

WP4 — Claim Rewards Flow 💸
Deliverables

Confirm modal spec (amount + note fee jika ada)

Tx feedback states (submitted/confirmed/failed)

Success handling (refresh claimable + append history)

UX steps

Tap claim → confirm modal

Sign/submit → tx banner

Confirmed → show success toast + route to history

Acceptance Criteria ✅

Tidak bisa double claim saat pending

Error state jelas + tombol retry

WP5 — Rewards History 📜
Deliverables

History screen spec

History item component spec

Filter (opsional): Claims / Earnings

Content minimum per item

Type: Claim / Earn (kalau ada)

Amount

Date

Status (success/failed/pending)

Tx link (jika on-chain)

Acceptance Criteria ✅

User bisa audit sendiri: “gue claim kapan, berapa”

Semua tx dari claim flow muncul di history

WP6 — Education: “How it works” + “Why 0?” ℹ️
Deliverables

Bottom sheet/help screen spec

Microcopy rules

Must cover (singkat)

Syarat eligibility

Bagaimana referral dihitung jadi aktif

Kenapa claimable bisa 0 (contoh 2–3 penyebab)

Kapan biasanya update (kalau ada settlement delay)

Acceptance Criteria ✅

Copy singkat, tidak menyalahkan user

Link dari Rewards Dashboard “Learn more”

7. Global Components (tambahan jika perlu) 🧩

RewardsSummaryCard

EligibilityStatePanel (4-state renderer)

ReferralLinkCard (copy/share)

RewardHistoryItem

RewardsHelpSheet (“How it works”)

Semua harus pakai token + pattern Phase 0.

8. Analytics hooks (minimal) 📊

View Rewards dashboard

Tap Share referral

Copy referral link success

Claim attempt (eligible vs not)

Claim tx submitted/confirmed/failed

View history

Open “How it works”

9. Definition of Done Phase 3 ✅

Rewards dashboard lengkap + 4-state gating beres

Share referral UX beres (copy/share)

Claim flow aman & konsisten

History ada dan bisa dipakai audit user

Help sheet “why 0?” mengurangi kebingungan

10. Open Questions (maks 10, blocker only) ❓

Eligibility syarat persisnya apa saja selain Blue Check?

Reward settlement: real-time atau periodik (delay)?

Claim min threshold ada atau tidak?

Reward dibayar on-chain atau off-chain (mempengaruhi tx link & states)?

Referral definition: “active” dihitung kapan (first buy? KYC?).

Apakah ada expiry referral?
