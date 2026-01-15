# Phase 4 — UX QA Review (Opus)

Review hasil Phase 4 Identity & Profile specifications dari Sonnet untuk safety, clarity, dan recovery path.

---

## A. Guard & Destructive Action Audit

### A.1 Remove Primary Wallet Guard ✅

**Status**: Well-Implemented

| Check                           | Result     | Details                                        |
| ------------------------------- | ---------- | ---------------------------------------------- |
| Guard exists for remove primary | ✅ Pass    | Button disabled jika wallet IS primary         |
| Reason message provided         | ✅ Pass    | Tooltip "Set primary wallet lain dulu"         |
| CTA for recovery                | ⚠️ Partial | Reason ada, tapi tidak ada explicit CTA button |

**Recommendation**: Convert reason tooltip to actionable CTA: "Set wallet lain sebagai Primary terlebih dahulu" + link highlight ke wallet lain.

### A.2 Unlink Minimum Wallet Rule (BLOCKER)

**Status**: NOT SPECIFIED ⚠️

**Issue**: Spec mengasumsikan "boleh unlink semua wallet" tetapi tidak ada explicit guard jika user punya 1 wallet sisa.

| Scenario                                | Current Behavior                | Risk                                |
| --------------------------------------- | ------------------------------- | ----------------------------------- |
| User punya 1 wallet (primary)           | Remove disabled (primary guard) | ✅ Safe                             |
| User punya 2 wallet, remove non-primary | Allowed                         | Post-removal: 1 wallet (primary) ✅ |
| User punya 1 wallet, mau unlink         | Remove disabled (primary guard) | ✅ Safe (accidentally)              |

**Analysis**: Karena satu-satunya wallet selalu jadi primary, guard "cannot remove primary" secara tidak sengaja mencegah unlink semua wallet. **Namun ini tidak explicit.**

**BLOCKER RECOMMENDATION**: Explicit spec tambahan untuk edge case:

- Jika `wallet_count === 1`: Show different reason "Minimal harus ada 1 wallet terhubung"
- ATAU confirm dengan PM: Boleh unlink semua wallet (akun "orphan")?

### A.3 Set Primary Confirm Modal ✅

**Status**: Well-Specified

| Check                  | Result | Details                                  |
| ---------------------- | ------ | ---------------------------------------- |
| Confirm modal required | ✅     | Modal spec ada dengan impact explanation |
| Impact explained       | ✅     | "Memengaruhi transaksi dan claim"        |
| Show target wallet     | ✅     | New primary address displayed            |
| Button labels          | ✅     | "Batal" + "Set Primary"                  |

**Minor Enhancement**: Tambah "Previous Primary: [address]" untuk clarity.

### A.4 Remove Wallet Confirm Modal ✅

**Status**: Well-Specified

| Check               | Result | Details                          |
| ------------------- | ------ | -------------------------------- |
| Warning present     | ✅     | ⚠️ emoji + warning text          |
| Reversibility noted | ✅     | "dapat menghubungkan lagi nanti" |
| Address visible     | ✅     | Wallet address shown             |

**Minor**: Button label "Remove" bisa diganti "Hapus Wallet" untuk konsistensi bahasa Indonesia.

### A.5 Logout All Confirm Modal ✅

**Status**: Well-Specified

| Check            | Result | Details                                     |
| ---------------- | ------ | ------------------------------------------- |
| Warning present  | ✅     | ⚠️ + "SEMUA device" emphasized              |
| Impact explained | ✅     | "termasuk sesi ini" + "perlu login kembali" |
| Button color     | ✅     | Red/Warning specified                       |

**Assessment**: Logout All modal sangat baik - wording jelas dan scary (intended).

### A.6 Logout Current Session

**Status**: Minimal But Acceptable

| Check            | Result | Details                                           |
| ---------------- | ------ | ------------------------------------------------- |
| Confirm required | ✅     | Simple confirm message                            |
| Impact mentioned | ⚠️     | Only "logout dari sesi ini" - bisa lebih specific |

**Recommendation**: Enhanced copy: "Anda akan logout dari [Device Name]. Lanjutkan?"

---

## B. Status Clarity Audit

### B.1 Blue Check States

| State    | Status Text              | CTA          | Verdict             |
| -------- | ------------------------ | ------------ | ------------------- |
| INACTIVE | "Inactive"               | "Activate →" | ✅ Clear            |
| ACTIVE   | "Active"                 | "Manage →"   | ✅ Clear            |
| PENDING  | "Pending"                | None         | ⚠️ Need enhancement |
| EXPIRING | "Active (Expiring Soon)" | "Renew Now"  | ✅ Clear            |

**Issues Found:**

1. **PENDING State CTA Gap (HIGH)**
   - Current: "CTA: None (informational only)"
   - Problem: User tidak bisa cancel atau escalate jika pending terlalu lama
   - Recommendation: Add "Contact Support" link (bukan primary CTA)

2. **INACTIVE → PENDING Transition (MEDIUM)**
   - Not specified: Apa yang terjadi setelah tap "Activate"? Langsung pending atau flow external?
   - Recommendation: Add note "Setelah pembayaran berhasil, status akan berubah ke Pending"

3. **EXPIRING State Threshold (LOW)**
   - Current: "7 hari"
   - Question: Haruskah backend provide `days_until_expiry` atau hardcode?
   - Recommendation: Dynamic threshold dari backend, fallback 7 hari

### B.2 KYC States

| State       | Status Text      | CTA            | Verdict    |
| ----------- | ---------------- | -------------- | ---------- |
| NOT_STARTED | "Not Started"    | "Start KYC"    | ✅ Clear   |
| PENDING     | "Pending Review" | None           | ⚠️ Partial |
| VERIFIED    | "Verified"       | "View Details" | ✅ Clear   |
| REJECTED    | "Rejected"       | "Resubmit KYC" | ✅ Clear   |

**Issues Found:**

1. **PENDING State - No Escalation Path (HIGH)**
   - Current: No CTA for user yang pending >7 hari
   - Recommendation: Add "Masih menunggu? Contact Support" link setelah X hari

2. **REJECTED Resubmit Guard Not Specified (MEDIUM)**
   - Current: Assumption "resubmit allowed"
   - What if: Cooldown period? Max attempts?
   - Recommendation: Add guard spec:
     ```
     IF resubmit_cooldown_active:
       Button disabled + "Anda dapat resubmit dalam X hari"
     IF max_attempts_reached:
       Button disabled + "Hubungi support untuk bantuan"
     ```

3. **Rejection Reason Fallback (LOW)**
   - Well-specified: Fallback ke "Hubungi support" jika generic fail
   - ✅ Good

### B.3 Account Status Cards (Profile Overview)

**Status**: Well-Structured

| Card       | Variants                                 | CTA per Variant                            | Verdict |
| ---------- | ---------------------------------------- | ------------------------------------------ | ------- |
| Blue Check | Active, Inactive                         | Manage, Activate                           | ✅      |
| KYC        | Verified, Pending, Not Started, Rejected | View, View Status, Start KYC, View Details | ✅      |

**Minor Issue**: "Pending Review" tapi CTA "View Status" - bisa unified ke "View" saja.

---

## C. Microcopy Pack v1 (Phase 4)

### C.1 Disable Reasons

**Remove Wallet (Primary):**

- Tooltip: "Set wallet lain sebagai Primary terlebih dahulu"
- Alternative: "Tidak dapat menghapus wallet utama"

**Remove Wallet (Last Wallet) [NEW - jika min=1]:**

- Tooltip: "Minimal harus ada 1 wallet terhubung ke akun Anda"

**Resubmit KYC (Cooldown) [NEW]:**

- Button text: "Resubmit dalam X hari"
- Tooltip: "Anda dapat mengirimkan ulang KYC setelah [DATE]"

**Resubmit KYC (Max Attempts) [NEW]:**

- Button text: "Hubungi Support"
- Notice: "Anda telah mencapai batas pengiriman ulang. Silakan hubungi support."

### C.2 Destructive Confirm Copy

**Remove Wallet:**

```
Title: "Hapus Wallet"
Body: "⚠️ Wallet akan dihapus dari akun Anda."
       "Address: 0x9876...4321"
       "Anda dapat menghubungkan wallet ini lagi nanti."
Cancel: "Batal"
Confirm: "Hapus"
```

**Set Primary Wallet:**

```
Title: "Ubah Wallet Utama"
Body: "Mengubah wallet utama akan memengaruhi:"
      "• Transaksi default"
      "• Klaim rewards"
      "• Penerimaan token"

      "Wallet baru: 0x1234...5678 (EVM)"
      "Wallet sebelumnya: 0x9876...4321 (EVM)"
Cancel: "Batal"
Confirm: "Ubah Primary"
```

**Logout Current:**

```
Title: "Logout"
Body: "Anda akan logout dari sesi ini ([Device Name])."
      "Lanjutkan?"
Cancel: "Batal"
Confirm: "Logout"
```

**Logout All Devices:**

```
Title: "Logout dari Semua Device"
Body: "⚠️ Anda akan logout dari SEMUA device yang terhubung, termasuk sesi ini."

      "Aksi ini akan:"
      "• Mengakhiri X sesi aktif"
      "• Memerlukan login ulang di semua device"
Cancel: "Batal"
Confirm: "Logout Semua" [RED]
```

### C.3 Status Messages

**Blue Check:**

- INACTIVE: "Aktifkan Blue Check untuk membuka semua fitur seperti posting di feed dan klaim rewards."
- ACTIVE: "Blue Check Anda aktif. Berlaku hingga [DATE]."
- PENDING: "Aktivasi sedang diproses. Anda akan menerima notifikasi saat selesai. Estimasi: 1-3 hari kerja."
- EXPIRING: "⚠️ Blue Check Anda akan berakhir dalam [X] hari. Perpanjang sekarang agar tidak kehilangan akses."

**KYC:**

- NOT_STARTED: "Verifikasi identitas Anda untuk keamanan akun dan compliance regulasi."
- PENDING: "KYC Anda sedang ditinjau tim kami. Disubmit: [DATE]. Estimasi: 1-3 hari kerja."
- VERIFIED: "✓ Identitas Anda telah diverifikasi pada [DATE]."
- REJECTED: "KYC ditolak. Alasan: [REASON]. Perbaiki dan kirim ulang untuk verifikasi."

**KYC Rejection Reasons (Code → Copy):**
| Code | User-Friendly Message |
|------|----------------------|
| DOCUMENT_UNCLEAR | "Foto dokumen tidak jelas. Pastikan foto tajam dan terbaca." |
| DATA_MISMATCH | "Data tidak sesuai dengan dokumen. Periksa nama dan tanggal lahir." |
| DOCUMENT_EXPIRED | "Dokumen sudah kadaluarsa. Gunakan dokumen yang masih berlaku." |
| SELFIE_MISMATCH | "Foto selfie tidak cocok dengan dokumen. Pastikan wajah terlihat jelas." |
| GENERIC/UNKNOWN | "KYC tidak dapat diproses. Hubungi support untuk informasi lebih lanjut." |

### C.4 Wallet Link Error Copy

| Error Type          | Toast Message                                                 | Recovery Hint    |
| ------------------- | ------------------------------------------------------------- | ---------------- |
| Already Linked      | "Wallet ini sudah terhubung ke akun Anda"                     | [Lihat Daftar →] |
| Connection Rejected | "Koneksi ditolak. Silakan setujui permintaan di wallet Anda." | [Coba Lagi]      |
| Network Error       | "Gagal terhubung. Periksa koneksi internet Anda."             | [Coba Lagi]      |
| Unsupported Wallet  | "Wallet ini tidak didukung. Gunakan MetaMask atau Phantom."   | -                |
| Generic             | "Gagal menghubungkan wallet. Silakan coba lagi."              | [Coba Lagi]      |

---

## D. Fix List untuk Sonnet

### BLOCKER (Must Fix)

| #   | Issue                            | Location                | Fix                                                                              |
| --- | -------------------------------- | ----------------------- | -------------------------------------------------------------------------------- |
| B1  | Minimum wallet rule not explicit | Wallet Management Guard | Add explicit guard: "Minimal 1 wallet" OR confirm with PM that orphan account OK |
| B2  | KYC resubmit guard not specified | KYC Status Viewer       | Add cooldown/max attempts handling with disabled button + reason                 |

### HIGH (Fix Before Implementation)

| #   | Issue                                          | Location             | Fix                                                       |
| --- | ---------------------------------------------- | -------------------- | --------------------------------------------------------- |
| H1  | PENDING states have no escalation path         | Blue Check + KYC     | Add "Contact Support" link jika status pending > X hari   |
| H2  | Set Primary modal missing previous wallet info | Wallet Confirm Modal | Add "Wallet sebelumnya: [address]" for clarity            |
| H3  | Remove primary reason not actionable           | Wallet ActionMenu    | Convert tooltip to mini-CTA pointing to available wallets |
| H4  | Button label inconsistency                     | Remove Wallet Modal  | Change "Remove" → "Hapus" for Indonesian consistency      |
| H5  | Logout current device name missing             | Session Confirm      | Show device name in confirm: "logout dari [Device Name]"  |

### MEDIUM (Nice to Have)

| #   | Issue                                          | Location                  | Fix                                                             |
| --- | ---------------------------------------------- | ------------------------- | --------------------------------------------------------------- |
| M1  | EXPIRING threshold hardcoded                   | Blue Check States         | Document that `days_until_expiry` from backend, fallback 7 hari |
| M2  | KYC PENDING no submission date in profile card | Profile Overview KYC Card | Add "Disubmit: [DATE]" to card summary                          |
| M3  | Logout All button color not enforced           | Security Screen           | Explicit spec: Use `variant="destructive"` or `color="error"`   |
| M4  | Post-logout redirect timing                    | Logout Actions            | Specify redirect delay (immediate vs 1s after toast)            |

### LOW (Polish)

| #   | Issue                                 | Location                    | Fix                                              |
| --- | ------------------------------------- | --------------------------- | ------------------------------------------------ |
| L1  | "View Status" vs "View" inconsistency | KYC Card CTAs               | Unify to just "Lihat" atau "View Details"        |
| L2  | Network selector uses checkboxes      | Add Wallet Network Selector | Change to radio buttons (single select)          |
| L3  | Session location might be inaccurate  | Session List                | Add disclaimer "Lokasi perkiraan berdasarkan IP" |

---

## E. Enhanced Guard Spec (For B1)

### Minimum Wallet Guard Specification

**Decision Required:** Pilih salah satu:

**Option A: Minimum 1 Wallet Required**

```typescript
// Guard logic
const canRemoveWallet = (wallet, allWallets) => {
  if (wallet.isPrimary) {
    return { allowed: false, reason: 'Set wallet lain sebagai Primary terlebih dahulu' };
  }
  if (allWallets.length === 1) {
    return { allowed: false, reason: 'Minimal harus ada 1 wallet terhubung' };
  }
  return { allowed: true };
};
```

**Option B: Allow Zero Wallets (Orphan Account)**

```typescript
// Guard logic - only primary check
const canRemoveWallet = (wallet, allWallets) => {
  if (wallet.isPrimary && allWallets.length > 1) {
    return { allowed: false, reason: 'Set wallet lain sebagai Primary terlebih dahulu' };
  }
  // If only 1 wallet (is primary), removing it is the same as unlinking last wallet
  if (wallet.isPrimary && allWallets.length === 1) {
    return {
      allowed: true,
      warning:
        'Ini adalah wallet terakhir Anda. Anda perlu menghubungkan wallet baru untuk bertransaksi.',
    };
  }
  return { allowed: true };
};
```

**Recommendation:** Option A lebih aman untuk kebanyakan use case. Pilih ini kecuali ada requirement khusus.

---

## Summary & Recommendations

**Overall Assessment**: 🟢 **GOOD with Minor Blockers**

**Strengths:**

- ✅ Primary wallet guard well-implemented dengan reason
- ✅ Destructive action confirms (Remove, Logout All) thorough
- ✅ Status states comprehensive (4 states each for Blue Check & KYC)
- ✅ KYC rejection handling dengan reason codes
- ✅ Recovery paths (retry, contact support) available

**Critical Gaps:**

- ⚠️ Minimum wallet rule not explicit (BLOCKER B1)
- ⚠️ KYC resubmit guard missing cooldown/limit handling (BLOCKER B2)
- ⚠️ PENDING states lack escalation path for stuck users (HIGH H1)

**Recommended Actions:**

1. Sonnet address B1-B2 (BLOCKER) immediately
2. Add H1-H5 enhancements before FE handoff
3. Use Microcopy Pack C.1-C.4 as reference for copy implementation
4. Confirm with PM on Option A vs B untuk minimum wallet rule

**Microcopy Ready**: Section C provides complete copy for all Phase 4 identity interactions.

**Next Step**: Sonnet fix Blockers → Gemini visual review → FE implementation.
