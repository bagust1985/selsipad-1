# Phase 1 — UX QA Review (Opus)

Review hasil Phase 1 Screen Specifications dari Sonnet untuk keamanan dan konsistensi money flows.

---

## A. Edge-Case Matrix (Money Flow Critical Paths)

###A.1 Presale/Fairlaunch Participation Edge Cases

| Scenario                               | Current Handling                           | Risk                                                    | Recommendation                                                                            | Severity    |
| -------------------------------------- | ------------------------------------------ | ------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ----------- |
| **TX Pending > 5 min**                 | TxBanner state="submitted" persists        | User panic, refresh page → state lost                   | Add timeout handler: after 5min show "Memakan waktu lebih lama. Lihat di Explorer" + link | **HIGH**    |
| **TX Replaced (speed-up)**             | Tidak di-spec                              | New tx_hash, old banner still show                      | Detect tx replacement via wallet event → update TxBanner with new hash                    | **MEDIUM**  |
| **User Rejected Sign**                 | TX_FAILED generic                          | Confusing (bukan "gagal" tapi "dibatalkan")             | Distinguish rejection: "Transaksi dibatalkan" (info tone, bukan error) → reset silent     | **MEDIUM**  |
| **Network Switch Mid-TX**              | Tidak di-spec                              | Tx submitted di Solana, user switch ke EVM → hung state | Detect network change → show warning "Network changed, tx cancelled" + reset              | **HIGH**    |
| **Sale ENDED during confirm modal**    | Modal still allows confirm                 | User confirm tapi tx fail (sale sudah ended)            | Poll status setiap 10s → detect ENDED → auto-close modal + show "Sale telah berakhir"     | **HIGH**    |
| **Balance Insufficient after confirm** | Validated at Step 0, not re-checked Step 2 | User transfer out balance between confirm-sign          | Re-validate balance saat trigger tx (before sign) → show error jika insufficient          | **HIGH**    |
| **Double Submit (rapid tap)**          | Button lock via `loading` prop             | Lock bisa bypass jika state update delay                | Add idempotency key + client-side lock timestamp (prevent submit < 3s apart)              | **BLOCKER** |
| **Amount Input "0.00001" edge**        | Min validation                             | Floating point precision errors di backend              | Frontend: enforce min decimals (max 6 decimals for SOL/ETH) + validation                  | **MEDIUM**  |

### A.2 Claim (Vesting) Edge Cases

| Scenario                                   | Current Handling                        | Risk                                                             | Recommendation                                                                   | Severity   |
| ------------------------------------------ | --------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------- | ---------- |
| **Claimable becomes 0 during confirm**     | Validated at button tap, not re-checked | Schedule advanced, claimable = 0 saat sign                       | Re-fetch claimable setelah modal open → show error jika 0                        | **HIGH**   |
| **Partial Claim Available**                | Not specified                           | User expect claim all, tapi hanya partial unlock                 | Show exact claimable amount di modal + disable "All" jika not supported          | **MEDIUM** |
| **Claim TX Success but UI not update**     | Toast dismissed, no forced refresh      | User see "still claimable" → try again → error "already claimed" | After TX_CONFIRMED → auto-refresh vesting detail + portfolio + optimistic update | **HIGH**   |
| **Vesting Schedule Change (admin adjust)** | Static schedule shown                   | User see schedule, admin change, user confused                   | Poll schedule every screen mount → show notice "Schedule updated" if changed     | **MEDIUM** |

### A.3 Refund Edge Cases

| Scenario                                    | Current Handling             | Risk                                               | Recommendation                                                          | Severity   |
| ------------------------------------------- | ---------------------------- | -------------------------------------------------- | ----------------------------------------------------------------------- | ---------- |
| **Refund Already Claimed (race condition)** | Button hidden after claim    | 2 tabs open, claim di tab1, tab2 still show button | Poll refund status every 30s → disable button + show "Sudah di-claim"   | **MEDIUM** |
| **Partial Refund (fees deducted)**          | Show "Fee Refund ~0.001 SOL" | User expect full 0.5 SOL, get 0.499, feel cheated  | Emphasize in modal: "Total after fees: X SOL" (highlight final amount)  | **MEDIUM** |
| **Refund Fail (contract issue)**            | Generic TX_FA ILED           | User panic (uang terselip?)                        | Specific copy: "Refund gagal. Dana masih aman. Hubungi support: [link]" | **HIGH**   |

### A.4 Portfolio Sync & Status Delay

| Scenario                                                    | Current Handling                       | Risk                                          | Recommendation                                                                            | Severity   |
| ----------------------------------------------------------- | -------------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------- | ---------- |
| **Indexer Delay (TX confirmed, Portfolio belum update)**    | Skeleton → Data                        | User see "not in portfolio" → think tx failed | Show TxBanner persistent: "Transaksi berhasil. Muncul di Portfolio dalam 1-2 menit"       | **HIGH**   |
| **Status Stuck at FINALIZING**                              | Just show "Finalisasi sedang diproses" | User wait hours, no feedback                  | Add timeout notice: if FINALIZING > 24h → show "Delay detected. Cek Updates atau Support" | **MEDIUM** |
| **Claimable appears but claim failed (contract not ready)** | User tap Claim → TX fail               | Frustrated (button should not appear)         | Backend filter: only show claimable if contract ready (atau add "Coming soon" state)      | **HIGH**   |

### A.5 LP Lock Transparency Edge Cases

| Scenario                                | Current Handling      | Risk                             | Recommendation                                                                            | Severity   |
| --------------------------------------- | --------------------- | -------------------------------- | ----------------------------------------------------------------------------------------- | ---------- |
| **LP_LOCK_PENDING > 48h**               | Just show "pending"   | User think scam (LP not locked?) | Timeout notice: if PENDING > 48h → "Delay unusual. Contact support"                       | **MEDIUM** |
| **Proof TX not found (explorer error)** | Link opens 404        | Trust broken (fake proof?)       | Fallback: check tx exist before show link → if not found show "Proof generating..."       | **MEDIUM** |
| **LP FAILED but Sale SUCCESS**          | Not specified clearly | Contradiction → user confused    | Clear messaging: "Sale succeeded but LP lock failed. Team investigating. Updates: [link]" | **HIGH**   |

---

## B. Consistency Check

### B.1 Status & CTA Mapping Audit

**✅ PASS: No Conflicts Found**

| Sale Status | Participation CTA           | Portfolio Position     | Verdict |
| ----------- | --------------------------- | ---------------------- | ------- |
| UPCOMING    | Disabled ("Dimulai [date]") | Not in Portfolio       | ✅      |
| LIVE        | "Beli"/"Kontribusi"         | Active tab (after buy) | ✅      |
| ENDED       | Hidden/disabled             | Active tab             | ✅      |
| FINALIZING  | Hidden                      | Active tab             | ✅      |
| SUCCESS     | "Lihat Vesting"/Hidden"     | Claimable tab          | ✅      |
| FAILED      | "Klaim Refund"              | Claimable tab          | ✅      |

**⚠️ POTENTIAL ISSUE:**

- **Presale SUCCESS** → Spec says `"Lihat Vesting" atau "Claim"` → Ambiguous!
  - Fix: Must specify exact logic: IF vesting_enabled → "Lihat Vesting" ELSE IF instant_claim → "Claim" ELSE hide.

### B.2 Entrypoint to Portfolio Check

**✅ PASS: All TX Flows Have Portfolio Link**

| Flow                                  | Portfolio Entrypoint              | Verdict                    |
| ------------------------------------- | --------------------------------- | -------------------------- |
| Presale Participate → TX_SUBMITTED    | TxBanner CTA "Lihat di Portfolio" | ✅                         |
| Fairlaunch Participate → TX_SUBMITTED | Same                              | ✅                         |
| Vesting Claim → TX_SUBMITTED          | (Assume same pattern)             | ✅ (verify implementation) |
| Refund Claim → TX_SUBMITTED           | (Assume same pattern)             | ✅ (verify implementation) |

**Missing Spec**:

- What if user dismiss TxBanner before clicking "Lihat di Portfolio"?
  - Recommendation: Add persistent "View in Portfolio" pill/CTA di PageHeader setelah TX_CONFIRMED (dismiss after user navigate away).

### B.3 Dead-End Audit

**✅ No Dead-Ends Found**, assuming:

- Semua detail screens punya back button (specified di PageHeader).
- Empty states punya CTA (specified).
- Error states punya retry (specified).

**⚠️ Potential Dead-End (Edge Case)**:

- **LP Lock FAILED** screen → CTA "Contact Support" tapi no back? → Ensure back button visible.
- **Portfolio History item (CLAIMED)** tap → Navigate ke Vesting Detail tapi vesting sudah fully claimed → Vesting Detail still useful (history log) or dead-end?
  - Recommendation: Vesting Detail always show claim history, even if fully claimed (no dead-end).

---

## C. Microcopy Pack v1 (Phase 1 Specific)

### C.1 Disable Reasons (Participation Widget)

**Presale/Fairlaunch Button Disabled**:

- Wallet not connected: "Hubungkan wallet untuk berpartisipasi"
- Primary wallet not set: " Gunakan primary wallet untuk berpartisipasi"
- Sale UPCOMING: "Penjualan dimulai pada [date time]"
- Sale ENDED: "Penjualan telah berakhir"
- Amount below min: "Minimum pembelian [X] SOL"
- Amount above max: "Maksimum pembelian [X] SOL"
- Amount above balance: "Saldo tidak mencukupi (Saldo: [Y] SOL)"
- Input empty/0: "Masukkan jumlah pembelian"

### C.2 Transaction Error Copy (Specific Reasons)

**TX_FAILED Reasons**:

- User rejected: "Transaksi dibatalkan oleh Anda"
- Insufficient gas: "Gas tidak cukup. Tambah saldo untuk biaya transaksi"
- Network error: "Koneksi bermasalah. Periksa jaringan Anda dan coba lagi"
- Contract error (revert): "Transaksi ditolak smart contract. Alasan: [reason]"
- Timeout (no response): "Transaksi timeout. Cek Explorer untuk status terbaru"
- Unknown: "Transaksi gagal. Kode error: [code]. Hubungi support jika masalah berlanjut"

**TX Taking Too Long (>5min)**:

- Banner: "Transaksi memakan waktu lebih lama dari biasanya"
- Subtext: "Blockchain sedang sibuk. Transaksi masih valid."
- CTAs: "Lihat di Explorer" | "Hubungi Support"

### C.3 Empty State Copy (Phase 1)

| Screen                | Condition                  | Message                                       | CTA                      |
| --------------------- | -------------------------- | --------------------------------------------- | ------------------------ |
| Home Trending         | 0 projects                 | "Belum ada project trending saat ini"         | "Jelajahi Semua Project" |
| Explore               | No results + filter active | "Tidak ditemukan project yang sesuai filter"  | "Reset Filter"           |
| Explore               | No results + no filter     | "Belum ada project tersedia"                  | - (info only)            |
| Portfolio Active      | 0 participations           | "Belum ada investasi aktif"                   | "Jelajahi Project"       |
| Portfolio Claimable   | 0 claimable                | "Tidak ada token yang bisa di-claim saat ini" | - (info only)            |
| Portfolio History     | 0 history                  | "Belum ada riwayat transaksi"                 | "Jelajahi Project"       |
| Vesting Claim History | 0 claims                   | "Belum ada riwayat claim"                     | - (info only, not error) |

### C.4 Status-Driven Copy (Widget States)

**Presale Widget States**:

- UPCOMING: "Penjualan dimulai dalam [countdown]"
- LIVE: "Penjualan sedang berlangsung. [X/Y SOL raised]"
- ENDED: "Penjualan berakhir. Menunggu finalisasi..."
- FINALIZING: "Finalisasi sedang diproses. Kembali nanti untuk cek hasilnya."
- SUCCESS: "Penjualan berhasil! Token Anda tersedia."
- FAILED: "Penjualan gagal mencapai target. Refund tersedia."

**Vesting Detail States**:

- Claimable > 0: "Kamu bisa claim [X] TOKEN sekarang"
- Claimable = 0 + next unlock soon: "Next unlock: [X] TOKEN pada [date]"
- Claimable = 0 + all locked: "Semua token masih terkunci. Next unlock: [date]"
- All claimed: "Semua token sudah di-claim. Total: [X] TOKEN"

### C.5 Gating Notice Copy

| Feature       | Condition              | Notice                                        | CTA                            |
| ------------- | ---------------------- | --------------------------------------------- | ------------------------------ |
| Participate   | Wallet not connected   | "Hubungkan wallet untuk ikut presale"         | "Hubungkan Wallet"             |
| Participate   | Primary wallet not set | "Gunakan primary wallet untuk berpartisipasi" | "Atur Wallet Primary"          |
| Vesting Claim | Claimable = 0          | "Belum ada token yang bisa di-claim"          | - (disabled button, no notice) |
| Refund Claim  | Already claimed        | "Refund sudah di-claim pada [date]"           | - (just info, button hidden)   |

---

## D. Fix List untuk Sonnet

### BLOCKER (Must Fix Before Implementation)

| #   | Issue                                            | Location                     | Fix                                                                                                                                                       |
| --- | ------------------------------------------------ | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| B1  | Double submit prevention insufficient            | Presale/Fairlaunch/Claim     | Add **idempotency check**: client-side lock (timestamp) + backend idempotency key. Spec: "Prevent submit < 3s apart + unique tx ID per attempt"           |
| B2  | SUCCESS → "Lihat Vesting" atau "Claim" ambiguous | Presale Widget SUCCESS state | Specify exact logic tree: `IF project.vesting_enabled THEN "Lihat Vesting" ELSE IF instant_claim THEN "Claim Now" ELSE hide CTA + show "Check Portfolio"` |
| B3  | Missing balance re-validation before sign        | Transaction Flow Step 2      | Add step 1.5: Re-validate balance + amount after modal confirm, before trigger wallet sign. Show error inline if insufficient.                            |

### HIGH (Fix During Implementation)

| #   | Issue                                    | Location                         | Fix                                                                                                                             |
| --- | ---------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| H1  | TX Pending > 5min no feedback            | Transaction Pattern Phase 0      | Add Step 3.1: If TX_SUBMITTED > 5min → TxBanner update: "Taking longer than usual" + "View Explorer" link + "Contact Support"   |
| H2  | Sale ENDED during confirm modal          | Presale/Fairlaunch Confirm Modal | Poll sale status every 10s while modal open → auto-close + show "Sale telah berakhir" jika ENDED detected                       |
| H3  | Network switch mid-transaction handling  | Presale/Fairlaunch TX Flow       | Detect network change event → cancel TX → show warning "Network changed. Transaction cancelled" → reset Step 0                  |
| H4  | Indexer delay → Portfolio not updated    | Participation TX_CONFIRMED       | Add persistent notice in TxToast: "Berhasil! Muncul di Portfolio dalam 1-2 menit" + auto-refresh Portfolio after 30s (optional) |
| H5  | Claimable becomes 0 during claim confirm | Vesting Claim Modal              | Re-fetch claimable amount after modal open → if 0 show inline error "No longer claimable" + close modal                         |
| H6  | LP Lock FAILED but Sale SUCCESS          | LP Lock Detail FAILED state      | Add specific messaging: "Sale succeeded but LP lock encountered issues. Team investigating. Check Updates tab for details"      |
| H7  | Refund fail specific copy                | Refund TX_FAILED                 | Distinguish refund failure: "Refund failed. Your funds are safe. Contact support: [link]" (bukan generic error)                 |

### MEDIUM (Nice to Have, Improve UX)

| #   | Issue                             | Location               | Fix                                                                                                             |
| --- | --------------------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------- |
| M1  | TX Replaced (speed-up) handling   | Transaction Pattern    | Detect tx replacement via wallet event → update TxBanner with new tx_hash (inform user "Transaction updated")   |
| M2  | User Rejected Sign not distinct   | TX_FAILED state        | Check fail reason: if "user_rejected" → show "Transaksi dibatalkan" (info tone) bukan error tone + reset silent |
| M3  | Partial claim not specified       | Vesting Detail         | Add note di spec: "Support partial claim: user claim subset of claimable (or all-or-nothing? Specify)"          |
| M4  | Vesting schedule change detection | Vesting Detail         | Poll schedule on mount → if hash changed → show notice "Schedule has been updated" (yellow banner)              |
| M5  | Status FINALIZING timeout         | Portfolio Active tab   | If status FINALIZING > 24h → show notice "Finalization delayed. Check Updates or contact support"               |
| M6  | LP Lock PENDING timeout           | LP Lock Detail         | If PENDING > 48h → show notice "LP lock delay unusual. Contact team for investigation"                          |
| M7  | Amount input floating point       | AmountInput validation | Enforce max decimals (6 for SOL, 18 for ETH) + round/truncate UI display untuk prevent precision errors         |

### LOW (Polish, Not Critical)

| #   | Issue                                        | Location                       | Fix                                                                                                  |
| --- | -------------------------------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------- |
| L1  | Dismiss TX Banner before "Lihat Portfolio"   | Post-Transaction               | Add persistent "View in Portfolio" CTA di PageHeader setelah TX_CONFIRMED (auto-hide after nav away) |
| L2  | Vesting Detail for fully claimed (dead-end?) | Portfolio History → Vesting    | Ensure Vesting Detail always show claim history even if all claimed (useful for user audit)          |
| L3  | Explorer link 404 fallback                   | LP Lock Proof link             | Check tx exist before show link → if not yet indexed show "Generating proof..." + retry button       |
| L4  | Presale typo                                 | Presale SUCCESS state line 414 | Fix typo: "Penjun succeeded" → "Penjualan berhasil"                                                  |

---

## Summary & Recommendations

**Overall Assessment**: 🟡 **GOOD with Critical Fixes Required**

**Strengths**:

- ✅ Transaction Pattern Phase 0 consistently applied
- ✅ All screens have Portfolio entrypoints
- ✅ Gating rules well-defined
- ✅ No dead-ends (assuming back buttons)

**Critical Gaps**:

- ⚠️ Double submit prevention (BLOCKER)
- ⚠️ Edge cases for TX timeout, network switch, balance re-check (HIGH)
- ⚠️ Ambiguous SUCCESS state CTA logic (BLOCKER)
- ⚠️ Indexer delay handling (HIGH)

**Recommended Action**:

1. Sonnet fix B1-B3 (BLOCKER) + H1-H7 (HIGH) sebelum handoff
2. Document edge-case behaviors di implementation notes
3. M1-M7 (MEDIUM) bisa masuk backlog polish

**Microcopy Ready**: Section C bisa langsung dipakai untuk copy final.

**Next Step**: Setelah Sonnet fix Blockers → Gemini review visual consistency → FE implementation.
