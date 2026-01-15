# Phase 0 — UX QA Review (Opus)

Review hasil Phase 0 Deliverables untuk konsistensi, edge cases, dan keamanan flow transaksi.

---

## A. Consistency Report

### A.1 Status Naming Audit

**✅ PASS: Tidak Ada Label Ambigu**

| Domain         | Status List                                                               | Verdict      |
| -------------- | ------------------------------------------------------------------------- | ------------ |
| Sale Lifecycle | UPCOMING / LIVE / ENDED / FINALIZING / SUCCESS / FAILED                   | ✅ Konsisten |
| TX State       | TX_IDLE / TX_AWAITING_SIGNATURE / TX_SUBMITTED / TX_CONFIRMED / TX_FAILED | ✅ Konsisten |
| LP Lock        | LOCKED / PENDING / NOT_LOCKED                                             | ✅ Konsisten |
| KYC            | VERIFIED / PENDING / NOT_SUBMITTED                                        | ✅ Konsisten |

**⚠️ GAP DITEMUKAN:**

| Issue                      | Detail                                                                                                                                            | Severity |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| Missing Project Status     | Dokumen task_phase_0.md menyebut `DRAFT / SUBMITTED / REVIEWING / APPROVED / REJECTED`, tapi di deliverables tidak ada mapping lengkap status ini | Medium   |
| Missing Post-Sale Status   | `CLAIM_AVAILABLE / CLAIMED / REFUND_AVAILABLE / REFUNDED` dari task_phase_0.md tidak di-spec di deliverables                                      | High     |
| FINALIZING vs TX_SUBMITTED | Potensi confusion: keduanya "sedang proses" tapi beda konteks (sale vs tx)                                                                        | Low      |

### A.2 CTA Mapping Audit

**✅ Transaction Pattern CTA: Konsisten**

- Step 1 → "Konfirmasi"
- Step 2 → "Batal"
- Step 3 → "Lihat di Portfolio"
- Step 4A → "Tutup"
- Step 4B → "Coba Lagi"

**⚠️ GAP: Gating CTA Mapping Belum Lengkap**

| Gating Scenario | Reason                  | CTA                   | Status |
| --------------- | ----------------------- | --------------------- | ------ |
| Feed Composer   | Blue Check required     | "Verifikasi Sekarang" | ✅ Ada |
| Participate     | Wallet required         | "Hubungkan Wallet"    | ✅ Ada |
| Participate     | Primary Wallet required | **MISSING**           | ❌ Gap |
| Claim Vesting   | Nothing to claim        | "Belum ada token..."  | ✅ Ada |
| Claim Refund    | Sale masih ongoing      | **MISSING**           | ❌ Gap |

### A.3 Component Duplikasi Audit

**✅ PASS: Tidak Ada Duplikasi Fungsi**

| Komponen                       | Fungsi                                              | Verdict     |
| ------------------------------ | --------------------------------------------------- | ----------- |
| TxToast vs TxBanner            | Toast = temporary, Banner = persistent              | ✅ Distinct |
| GatingNotice vs DisabledReason | GatingNotice = full block, DisabledReason = tooltip | ✅ Distinct |
| InlineError vs EmptyState      | Error = retry focus, Empty = discovery CTA          | ✅ Distinct |

---

## B. Edge Case Matrix (P0 Money Flow)

### B.1 Transaction Edge Cases

| Scenario                          | Current Handling | Recommendation                                                                     | Severity |
| --------------------------------- | ---------------- | ---------------------------------------------------------------------------------- | -------- |
| **TX Pending > 5 min**            | Tidak di-spec    | Tampilkan "Transaksi memakan waktu lebih lama" + link explorer + "Hubungi Support" | High     |
| **TX Failed (gas insufficient)**  | Generic retry    | Spesifik: "Gas tidak cukup. Tambah saldo di wallet Anda."                          | Medium   |
| **TX Failed (user rejected)**     | Not distinct     | Tampilkan: "Transaksi dibatalkan" (bukan "failed") + silent reset                  | Medium   |
| **TX Replaced (speed-up/cancel)** | Tidak di-spec    | Detect via tx manager: show "Transaksi ini sudah diproses dengan hash berbeda"     | High     |
| **Double Submit Prevention**      | Loading state    | Tambahkan: disable button + `loading` prop + idempotency key di backend            | High     |
| **Chain Switch Mid-TX**           | Tidak di-spec    | Detect chain change: show warning "Network berubah, transaksi dibatalkan"          | High     |

### B.2 Data Sync / Delay Edge Cases

| Scenario                                          | Current Handling | Recommendation                                                                  | Severity |
| ------------------------------------------------- | ---------------- | ------------------------------------------------------------------------------- | -------- |
| **Indexer Delay (Sale status belum update)**      | Tidak di-spec    | Show skeleton + "Memuat data terbaru..." max 10s, lalu show stale + refresh CTA | High     |
| **Portfolio TX confirmed tapi list belum update** | Tidak di-spec    | Show "Transaksi sukses!" toast + auto-refresh portfolio setelah 3s              | Medium   |
| **LP Lock proof belum tersedia**                  | Tidak di-spec    | Show:`LP lock sedang diproses` + disable "Lihat Proof" + show ETA jika ada      | Medium   |

### B.3 Eligibility / Gating Conflicts

| Scenario                                          | Current Handling | Recommendation                                                                 | Severity |
| ------------------------------------------------- | ---------------- | ------------------------------------------------------------------------------ | -------- |
| **Blue Check ACTIVE tapi wallet belum connected** | Partial gating   | Priority: wallet first → show "Hubungkan wallet" bukan "Verifikasi Blue Check" | High     |
| **Wallet connected tapi bukan Primary**           | Tidak di-spec    | Show: "Gunakan primary wallet untuk berpartisipasi" + CTA "Atur Primary"       | High     |
| **Eligible tapi Sale belum LIVE**                 | Tidak di-spec    | CTA disabled + reason: "Penjualan dimulai [countdown]"                         | Medium   |
| **Eligible tapi Sale ENDED**                      | Tidak di-spec    | CTA hidden atau show: "Penjualan sudah berakhir"                               | Medium   |
| **Balance cukup tapi < minimum buy**              | Tidak di-spec    | Show: "Minimum pembelian [amount]" di AmountInput helper                       | Medium   |

---

## C. Microcopy Pack v1

### C.1 Disable Reasons (Tombol Mati)

Format: `[Context]: "[Copy]"`

**Participate Button**

- Wallet not connected: "Hubungkan wallet terlebih dahulu"
- Not primary wallet: "Gunakan primary wallet untuk berpartisipasi"
- Sale not live: "Penjualan belum dimulai"
- Sale ended: "Penjualan sudah berakhir"
- Amount below min: "Minimum pembelian [X]"
- Amount above max: "Maksimum pembelian [X]"
- Insufficient balance: "Saldo tidak mencukupi"
- Already participated (if single-contribution): "Anda sudah berpartisipasi"

**Claim Button (Vesting)**

- Nothing to claim: "Belum ada token yang bisa di-claim"
- Already claimed all: "Semua token sudah di-claim"
- Cliff not ended: "Cliff berakhir [date]"

**Claim Button (Refund)**

- Sale not failed: "Refund hanya tersedia jika penjualan gagal"
- Already refunded: "Refund sudah di-claim"
- No participation: "Anda tidak memiliki partisipasi di project ini"

**Post Button (Feed)**

- Not verified: "Verifikasi Blue Check untuk bisa posting"
- Wallet not connected: "Hubungkan wallet terlebih dahulu"

### C.2 Transaction Copy

**Awaiting Signature**

- Banner: "Menunggu tanda tangan di wallet Anda..."
- Subtext: "Konfirmasi transaksi di [Wallet Name]"

**TX Submitted**

- Toast: "Transaksi terkirim"
- Banner: "Transaksi sedang diproses"
- Link: "Lihat di Explorer →"

**TX Confirmed**

- Toast: "Transaksi berhasil! ✓"
- Detail: "[Action] sebesar [Amount] berhasil."

**TX Failed**

- Generic: "Transaksi gagal. Coba lagi."
- User rejected: "Transaksi dibatalkan."
- Gas issue: "Gas tidak cukup. Tambah saldo di wallet."
- Network error: "Koneksi bermasalah. Periksa jaringan Anda."
- Unknown: "Terjadi kesalahan. [Error code]. Hubungi support."

**TX Taking Long**

- Banner (after 2min): "Transaksi memakan waktu lebih lama dari biasanya"
- Action: "Lihat di Explorer" + "Hubungi Support"

### C.3 Empty State Copy

| Screen                | Message                               | CTA                                       |
| --------------------- | ------------------------------------- | ----------------------------------------- |
| Portfolio (Active)    | "Belum ada investasi aktif"           | "Jelajahi Project"                        |
| Portfolio (Claimable) | "Tidak ada token yang bisa di-claim"  | - (no CTA)                                |
| Portfolio (History)   | "Belum ada riwayat transaksi"         | "Jelajahi Project"                        |
| Explore (No Results)  | "Tidak ditemukan project yang sesuai" | "Reset Filter"                            |
| Feed                  | "Belum ada post"                      | "Refresh"                                 |
| Vesting List          | "Tidak ada jadwal vesting"            | - (contextual, might be project-specific) |

### C.4 Error State Copy

| Type                  | Message                                   | CTA               |
| --------------------- | ----------------------------------------- | ----------------- |
| Network               | "Koneksi bermasalah"                      | "Coba Lagi"       |
| API Error             | "Gagal memuat data"                       | "Coba Lagi"       |
| Timeout               | "Waktu habis. Server sibuk."              | "Coba Lagi"       |
| Permission            | "Akses ditolak"                           | "Kembali"         |
| Persistent (3x retry) | "Masih gagal? Hubungi support. [ERR-XXX]" | "Hubungi Support" |

---

## D. Fix List (Actionable)

### BLOCKER (Harus fix sebelum Phase 1)

| #   | Issue                                  | Location                    | Fix                                                                                                                                     |
| --- | -------------------------------------- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| B1  | Missing Status Dictionary lengkap      | Deliverables A.2            | Tambahkan section `Status Dictionary` dengan mapping: Label, Deskripsi, CTA, Disable Reason untuk semua status di task_phase_0.md (0.2) |
| B2  | Double submit prevention tidak di-spec | Component Spec ConfirmModal | Tambahkan prop `isSubmitting: boolean` yang auto-disable button + lock modal dismiss                                                    |
| B3  | Chain switch mid-tx handling           | UX Pattern Wiring           | Tambahkan Step 2.1: Chain change detection → auto-cancel + warning                                                                      |

### HIGH (Fix sebelum implementation)

| #   | Issue                                   | Location              | Fix                                                                    |
| --- | --------------------------------------- | --------------------- | ---------------------------------------------------------------------- |
| H1  | Primary wallet gating tidak ada         | Guard Rules table     | Tambahkan row: `/participate/*` requires Primary Wallet + reason + CTA |
| H2  | TX timeout/long-pending tidak di-spec   | Transaction Pattern   | Tambahkan Step 3.1: If pending > 2min → show "Taking longer" banner    |
| H3  | Sale status gating (not live/ended)     | Gating Pattern table  | Tambahkan 2 rows: Sale UPCOMING + Sale ENDED scenarios                 |
| H4  | CLAIM_AVAILABLE/REFUND_AVAILABLE status | Component StatusBadge | Tambahkan status ini ke Semantic Mapping                               |
| H5  | Indexer delay fallback                  | Screen Spec Template  | Tambahkan section "Data Freshness" dengan fallback behavior            |

### MEDIUM (Fix during Phase 1)

| #   | Issue                             | Location                   | Fix                                                         |
| --- | --------------------------------- | -------------------------- | ----------------------------------------------------------- |
| M1  | AmountInput min/max validation UX | Component Spec AmountInput | Tambahkan helper text pattern untuk error states            |
| M2  | LP Lock proof pending state       | Trust Surface Pattern      | Tambahkan "Processing" state untuk SafetyCard LP            |
| M3  | TX Failed reason disambiguation   | Microcopy                  | Tambahkan 5 distinct failure reasons (sudah di section C.2) |

### LOW (Nice to have)

| #   | Issue                                    | Location          | Fix                                                        |
| --- | ---------------------------------------- | ----------------- | ---------------------------------------------------------- |
| L1  | FINALIZING vs TX_SUBMITTED naming        | Status Dictionary | Tambahkan note bahwa ini beda domain (sale vs transaction) |
| L2  | Keyboard accessibility untuk AmountInput | Component Spec    | Tambahkan note: support +/- keyboard increment             |

---

## Summary

**Overall Assessment: 🟡 GOOD with Required Fixes**

- ✅ IA & Routes: Solid, deep links well-defined
- ✅ Component Inventory: Complete, no duplicates
- ✅ Transaction Pattern: Flow clear
- ⚠️ Status Dictionary: Missing (BLOCKER)
- ⚠️ Edge Cases: Several gaps in money flow safety
- ⚠️ Gating: Primary wallet scenario missing

**Recommended Action**:
Sonnet harus update deliverables dengan fixes B1-B3 dan H1-H5 sebelum handoff ke Phase 1.
