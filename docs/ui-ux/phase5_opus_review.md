# Phase 5 — UX QA Sweep (Opus Final Review)

QA sweep akhir untuk validasi safety, clarity, dan anti-confusion across all phases.

---

## A. Risk Review (Top 10)

### Transaction Failure Modes & Recovery

| #   | Risk                      | Screen         | Failure Mode                                 | Current Recovery                            | Verdict | Recommendation                                                                                     |
| --- | ------------------------- | -------------- | -------------------------------------------- | ------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------- |
| R1  | **Presale Buy Rejected**  | Presale Widget | User sign di wallet → Tx rejected by network | Toast error + Button re-enabled "Try Again" | ✅ OK   | Add error code mapping untuk user-friendly message                                                 |
| R2  | **Claim Pending Forever** | Rewards Claim  | Tx submitted → never confirms (stuck)        | Banner "Submitted" + tx hash link           | ⚠️ Gap  | Add timeout handling: "Transaksi belum dikonfirmasi setelah 5 menit. Cek explorer atau coba lagi." |
| R3  | **Vesting Claim Fail**    | Portfolio      | Claim button → Tx fail                       | Toast error + retry                         | ✅ OK   | -                                                                                                  |
| R4  | **Double Submit Risk**    | All Tx Flows   | User spam click "Konfirmasi"                 | Button disabled + spinner + idempotency key | ✅ OK   | Verify cooldown timer (3s) implemented                                                             |
| R5  | **Insufficient Gas**      | Presale/Claim  | User has token tapi tidak ada gas            | Pre-sign validation fail                    | ✅ OK   | Ensure message jelas: "Saldo gas tidak cukup" (bukan hanya "Saldo tidak cukup")                    |

**Transaction Risk Summary**: 4/5 well-handled. **R2 (Stuck Tx)** perlu timeout UX.

---

### Gating Confusion Risks

| #   | Risk                                | Screen            | Confusion Scenario                          | Current Handling                       | Verdict | Recommendation                                                                                |
| --- | ----------------------------------- | ----------------- | ------------------------------------------- | -------------------------------------- | ------- | --------------------------------------------------------------------------------------------- |
| R6  | **Blue Check vs KYC Confusion**     | Profile / Rewards | User pikir KYC = Blue Check                 | Separate cards, separate CTAs          | ⚠️ Gap  | Add tooltip/info icon di card explaining: "Blue Check = posting access" vs "KYC = compliance" |
| R7  | **Eligible vs Claimable Confusion** | Rewards Dashboard | User eligible tapi claimable = 0, confusing | 4-state panel dengan explanation       | ✅ OK   | -                                                                                             |
| R8  | **Primary Wallet Removal Block**    | Wallet Management | User tidak paham kenapa tidak bisa remove   | Tooltip "Set primary wallet lain dulu" | ✅ OK   | Convert tooltip ke inline message (more visible on mobile)                                    |
| R9  | **Posting Gating**                  | Feed Composer     | Non-Blue Check user tap FAB → blocked       | GatingNotice modal dengan reason + CTA | ✅ OK   | -                                                                                             |

**Gating Risk Summary**: 3/4 well-handled. **R6 (Blue Check vs KYC)** perlu clarification.

---

### Data Delay/Sync Risks

| #   | Risk                            | Screen            | Sync Issue                                     | Current Handling              | Verdict    | Recommendation                                            |
| --- | ------------------------------- | ----------------- | ---------------------------------------------- | ----------------------------- | ---------- | --------------------------------------------------------- |
| R10 | **Stale Rewards Balance**       | Rewards Dashboard | User klaim → balance tidak update langsung     | Pessimistic update (wait API) | ✅ OK      | Show "Memperbarui..." indicator                           |
| R11 | **Portfolio Pending Confusion** | Portfolio         | Tx submitted tapi state "Pending" terlalu lama | Banner + tx hash              | ⚠️ Gap     | Add "Last checked: X s ago" + manual refresh button       |
| R12 | **Feed Not Refreshed**          | Feed Timeline     | User post → post tidak muncul                  | Optimistic atau re-fetch      | ⚠️ Unclear | Specify: Optimistic insert atau re-fetch setelah success? |

**Sync Risk Summary**: 1/3 clear, 2/3 need specification.

---

## B. Microcopy Final Pack

### B.1 Disable Reasons (Standar)

**Format**: 1 kalimat, jelas, tidak menyalahkan user.

| Context               | Condition            | Disable Reason Text                               |
| --------------------- | -------------------- | ------------------------------------------------- |
| Presale Buy           | Wallet not connected | "Hubungkan wallet untuk melanjutkan"              |
| Presale Buy           | Sale UPCOMING        | "Penjualan dimulai [date]"                        |
| Presale Buy           | Sale ENDED           | "Penjualan telah berakhir"                        |
| Presale Buy           | Insufficient balance | "Saldo tidak mencukupi"                           |
| Fairlaunch Contribute | Same as Presale      | Same as Presale                                   |
| Vesting Claim         | Claim not unlocked   | "Klaim tersedia pada [date]"                      |
| Vesting Claim         | Nothing to claim     | "Tidak ada token yang bisa diklaim"               |
| Rewards Claim         | Not eligible         | "Verifikasi akun untuk klaim rewards"             |
| Rewards Claim         | Claimable = 0        | "Belum ada rewards yang bisa diklaim"             |
| Post                  | Not Blue Check       | "Posting memerlukan Blue Check"                   |
| Post                  | Account SUSPENDED    | "Akun ditangguhkan sementara"                     |
| Post                  | Account BANNED       | "Akun tidak dapat melakukan tindakan ini"         |
| Remove Wallet         | Is primary           | "Set wallet lain sebagai Primary terlebih dahulu" |
| Remove Wallet         | Last wallet          | "Minimal harus ada 1 wallet terhubung"            |
| KYC Resubmit          | Cooldown active      | "Anda dapat resubmit dalam [X] hari"              |
| KYC Resubmit          | Max attempts         | "Hubungi support untuk bantuan"                   |

---

### B.2 Transaction Errors & Retry (Standar)

**Toast Format**: "[Error Type]: [Reason]. [Recovery Hint]"

| Error Type            | Toast Message                                          | Recovery                                 |
| --------------------- | ------------------------------------------------------ | ---------------------------------------- |
| Network Error         | "Koneksi terputus. Periksa internet Anda."             | Button: "Coba Lagi"                      |
| Tx Rejected (User)    | "Transaksi dibatalkan."                                | Button: "Coba Lagi"                      |
| Tx Rejected (Network) | "Transaksi ditolak jaringan. Coba beberapa saat lagi." | Button: "Coba Lagi"                      |
| Insufficient Balance  | "Saldo tidak mencukupi. Dibutuhkan [X] SOL."           | Dismiss (no retry, user needs to top up) |
| Insufficient Gas      | "Saldo gas tidak mencukupi untuk transaksi."           | Dismiss                                  |
| Already Submitted     | "Transaksi sudah dikirim sebelumnya."                  | CTA: "Lihat Status"                      |
| Tx Timeout            | "Transaksi belum dikonfirmasi. Cek explorer."          | CTA: "Lihat Explorer"                    |
| Generic Error         | "Terjadi kesalahan. Silakan coba lagi."                | Button: "Coba Lagi"                      |

**Success Toast Format**: "[Action] berhasil!" (auto-dismiss 2-3s)

| Action          | Success Message                  |
| --------------- | -------------------------------- |
| Buy/Contribute  | "Pembelian berhasil!"            |
| Claim (Vesting) | "Klaim berhasil!"                |
| Claim (Rewards) | "Rewards berhasil diklaim!"      |
| Post            | "Postingan berhasil dikirim!"    |
| Copy            | "Tersalin!"                      |
| Copy Address    | "Address tersalin"               |
| Share           | (no toast, native sheet handles) |

---

### B.3 Empty State Copy (Standar)

**Format**: Message (bold) + Submessage + CTA

| Screen                  | Message                      | Submessage                                        | CTA                   |
| ----------------------- | ---------------------------- | ------------------------------------------------- | --------------------- |
| Home - Trending         | "Belum ada project trending" | "Jelajahi project yang tersedia"                  | "Jelajahi Project"    |
| Explore - No Results    | "Tidak ditemukan project"    | "Coba ubah filter atau kata kunci"                | "Reset Filter"        |
| Portfolio - Empty       | "Belum ada investasi"        | "Mulai investasi di project favorit Anda"         | "Jelajahi Project"    |
| Feed - Empty            | "Feed belum ada postingan"   | "Postingan dari komunitas akan muncul di sini"    | "Jelajahi Project"    |
| Rewards - First Time    | "Mulai dapatkan rewards"     | "Bagikan referral link untuk mendapatkan rewards" | "Bagikan Referral"    |
| Referral - No Referrals | "Belum ada referral"         | "Bagikan link untuk mendapatkan referral pertama" | "Bagikan Sekarang"    |
| Wallet - Empty          | "Belum ada wallet terhubung" | "Hubungkan wallet untuk mulai bertransaksi"       | "Tambah Wallet"       |
| History - Empty         | "Belum ada riwayat"          | "Aktivitas Anda akan muncul di sini"              | -                     |
| Updates - Empty         | "Belum ada update"           | "Project akan posting update di sini"             | "Kembali ke Overview" |

---

### B.4 Status Labels (Standar)

**Project Status**:

- UPCOMING → "Segera Hadir"
- LIVE → "Sedang Berlangsung"
- ENDED → "Selesai"
- FINALIZING → "Proses Finalisasi"
- SUCCESS → "Berhasil"
- FAILED → "Gagal"

**Verification Status**:

- ACTIVE / VERIFIED → "Terverifikasi" (green)
- PENDING → "Menunggu Review" (orange)
- REJECTED → "Ditolak" (red)
- NOT_STARTED → "Belum Dimulai" (gray)
- INACTIVE → "Tidak Aktif" (gray)
- EXPIRING → "Segera Berakhir" (yellow)

**Transaction Status**:

- PENDING → "Menunggu Konfirmasi"
- CONFIRMED → "Dikonfirmasi"
- FAILED → "Gagal"
- SUBMITTED → "Terkirim"

---

## C. Fix/Recommendation List untuk Sonnet

Urutan severity, fokus clarity + safety + konsistensi.

### BLOCKER 🔴

None identified by Opus. Sonnet's Phase 5 audit confirmed no blockers.

---

### HIGH (Must Address) 🟠

| #   | Category        | Issue                                           | Location          | Fix Detail                                                                                                                                                           |
| --- | --------------- | ----------------------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| H1  | **Safety**      | Stuck Tx timeout tidak ada handling             | All Tx Flows      | Tambah timeout UX setelah 5 menit: Message "Transaksi belum dikonfirmasi setelah 5 menit. Cek explorer atau coba lagi." dengan CTA "Lihat Explorer" dan "Coba Lagi". |
| H2  | **Clarity**     | Blue Check vs KYC distinction kurang jelas      | Profile Overview  | Tambah info icon di masing-masing card dengan tooltip: Blue Check = "Akses posting & rewards", KYC = "Verifikasi identitas untuk compliance"                         |
| H3  | **Sync**        | Portfolio pending tx tidak ada refresh progress | Portfolio         | Tambah "Last checked: Xs ago" + manual "Check Status" button di banner                                                                                               |
| H4  | **Sync**        | Feed post success tidak clear apakah optimistic | Composer          | Specify: Gunakan optimistic insert (post langsung muncul di top feed) + rollback jika fail                                                                           |
| H5  | **Consistency** | Remove wallet tooltip tidak visible di mobile   | Wallet Management | Convert tooltip ke inline text di bawah disabled button: "Set wallet lain sebagai Primary dulu"                                                                      |

---

### MEDIUM 🟡

| #   | Category    | Issue                                                                | Location              | Fix Detail                                                                                            |
| --- | ----------- | -------------------------------------------------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------- |
| M1  | Clarity     | Gas error message tidak bedakan dari balance error                   | Presale/Claim         | Ubah message dari "Saldo tidak cukup" jadi "Saldo gas tidak mencukupi untuk transaksi" saat gas issue |
| M2  | Clarity     | "Klaim" vs "Claim" mixed in specs                                    | All                   | Standardize ke "Klaim" (Indonesia) di semua user-facing copy                                          |
| M3  | Consistency | Toast duration tidak di-spec                                         | All Toasts            | Specify: Success toast = 2s, Error toast = 4s (longer for reading)                                    |
| M4  | Consistency | Copy toast varied: "Tersalin!", "Address tersalin", "Link tersalin!" | All Copy Actions      | Standardize: Semua pakai "[Item] tersalin" tanpa "!" (e.g., "Address tersalin", "Link tersalin")      |
| M5  | Safety      | Pre-sign validation error position tidak explicit                    | Presale Confirm Modal | Specify: Error text muncul di atas button row, warna red, dengan inline retry                         |

---

### LOW ⚪

| #   | Category | Issue                                                | Location                     | Fix Detail                                                            |
| --- | -------- | ---------------------------------------------------- | ---------------------------- | --------------------------------------------------------------------- |
| L1  | Polish   | "Coba Lagi" vs "Try Again" mixed                     | All Error States             | Standardize ke "Coba Lagi" (Indonesia)                                |
| L2  | Polish   | Success message "berhasil!" bisa lebih specific      | All Success Toasts           | Consider: "Pembelian 10 SOL berhasil!" dengan amount (optional, v1.1) |
| L3  | Polish   | Empty state CTA button style tidak consistent        | All Empty States             | Specify: Semua empty state CTA pakai PrimaryButton variant            |
| L4  | Polish   | Pending indicator style beda di Portfolio vs Rewards | Portfolio, Rewards Dashboard | Unify pending banner component styling                                |

---

## D. Safety UX Checklist (Opus Validation)

### Money Flow Safety ✅

- [x] Double-submit prevention (idempotency + cooldown) → Specified in Phase 1
- [x] Pre-sign balance validation → Specified (Blocker B3 fix)
- [x] Confirm modal untuk semua money actions → Specified
- [x] Tx status visible setelah submit → Specified (hash + banner)
- [ ] **Stuck tx timeout handling** → **H1 Gap, add handling**

### Verification Safety ✅

- [x] KYC rejection reason visible → Specified with code mapping
- [x] Resubmit CTA only when allowed → Specified with guard
- [x] Blue Check expiry warning → Specified (EXPIRING state)
- [ ] **Blue Check vs KYC distinction** → **H2 Gap, add clarification**

### Wallet Safety ✅

- [x] Primary wallet cannot be removed → Specified with guard + reason
- [x] Minimum wallet rule → Specified (wait for PM decision on Option A/B)
- [x] Set primary confirmation → Specified
- [ ] **Remove primary tooltip visibility** → **H5 Gap, convert to inline**

### Feed/Social Safety ✅

- [x] Gating for non-Blue Check users → Specified
- [x] Report mechanism → Specified
- [x] Draft confirm on exit → Specified
- [ ] **Post optimistic vs pessimistic** → **H4 Gap, clarify**

---

## E. Summary

### Opus Findings

**Risk Analysis**:

- **5 Transaction Risks**: 4 handled, 1 gap (stuck tx timeout)
- **4 Gating Risks**: 3 handled, 1 gap (Blue Check vs KYC confusion)
- **3 Sync Risks**: 1 handled, 2 gaps (portfolio refresh, feed optimistic)

**Total New Issues Found**: 5 HIGH, 5 MEDIUM, 4 LOW
**Combined with Sonnet's H1-H5**: Total 10 HIGH priority items

---

### Recommended Priority Order for Sonnet

1. **H1 (Safety)**: Stuck tx timeout - prevents user confusion on pending forever
2. **H3 (Sync)**: Portfolio refresh indicator - critical for tx tracking trust
3. **H4 (Sync)**: Feed optimistic spec - prevents duplicate post confusion
4. **H2 (Clarity)**: Blue Check vs KYC tooltip - prevents gating confusion
5. **H5 (Mobile)**: Remove wallet inline text - mobile accessibility

---

### Microcopy Pack Status

- **Disable Reasons**: 16 scenarios covered ✅
- **Transaction Errors**: 8 error types + 6 success types ✅
- **Empty States**: 9 screens covered ✅
- **Status Labels**: 3 categories standardized ✅

**Pack is ready for FE implementation.**

---

### Release Readiness (Opus Assessment)

**Current Status**: 🟡 **READY WITH MINOR FIXES**

**Before Production**:

1. Address H1-H5 from this review
2. Apply Microcopy Pack standardization
3. Verify all toasts follow duration spec (Success=2s, Error=4s)

**Sign-Off**: Opus QA Sweep **COMPLETE**. Specs are comprehensive and safe. Minor clarifications needed for edge cases. Ready for FE handoff after H1-H5 fixes.
