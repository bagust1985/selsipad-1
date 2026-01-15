# Phase 3 — UX QA Review (Opus)

Review hasil Phase 3 Rewards & Referral specifications dari Sonnet untuk safety claim flow, clarity 4-state gating, dan microcopy yang menenangkan.

---

## A. 4-State Gating Audit

### A.1 State Transition Logic Review

**✅ PASS: 4-State Model Well-Defined**

| State                 | Condition                                      | Status Text                | CTA                | Verdict |
| --------------------- | ---------------------------------------------- | -------------------------- | ------------------ | ------- |
| NOT_ELIGIBLE          | `blue_check !== ACTIVE`                        | "Belum Memenuhi Syarat"    | "Mulai Verifikasi" | ✅      |
| ELIGIBLE_NO_REFERRALS | `eligible && referrals === 0`                  | "Siap Mendapatkan Rewards" | "Bagikan Referral" | ✅      |
| ELIGIBLE_REWARD_ZERO  | `eligible && referrals > 0 && claimable === 0` | "Rewards Sedang Diproses"  | "Mengapa $0?"      | ✅      |
| CLAIMABLE             | `claimable_amount > 0`                         | "Rewards Siap Diklaim!"    | "Klaim Sekarang"   | ✅      |

**Assessment**: Setiap state punya reason + CTA yang jelas. No ambiguity.

### A.2 State-Specific Issues

**⚠️ POTENTIAL ISSUES:**

1. **State Transition During Claim (HIGH)**
   - **Problem**: User di state CLAIMABLE → tap claim → tx pending. Apa yang terjadi dengan EligibilityStatePanel?
   - **Missing Spec**: Intermediate state "CLAIM_PENDING" tidak ada
   - **Recommendation**: Add state "CLAIM_PENDING" atau update CLAIMABLE dengan visual feedback

   ```
   CLAIMABLE (during pending):
   - Status: "Klaim Sedang Diproses..."
   - Button: Disabled, show spinner or "Memproses..."
   - Banner: TxBanner visible di atas panel
   ```

2. **NOT_ELIGIBLE Reasons Overflow (MEDIUM)**
   - **Current**: "Max 2 reasons"
   - **Problem**: Jika ada 3+ syarat (Blue Check, Min Balance, KYC Tier), apa yang ditampilkan?
   - **Recommendation**: Prioritize reasons by criticality, show top 2 + "...dan X syarat lain" link

3. **ELIGIBLE_REWARD_ZERO Explanation Too Generic (MEDIUM)**
   - **Current**: "Rewards akan muncul setelah referral Anda melakukan transaksi"
   - **Problem**: Jika claimable = 0 karena threshold (e.g., $10 min), copy ini misleading
   - **Recommendation**: Dynamic copy based on reason:
     - Settlement delay: "Rewards sedang diproses (settlement setiap 24 jam)"
     - Below threshold: "Claimable: $3.50 (Min: $10.00 untuk claim)"
     - No activity: "Referral belum melakukan transaksi"

4. **State Data Stale After Claim (HIGH)**
   - **Problem**: User claim success → dashboard refresh → claimable = 0. Tapi apa state-nya? ELIGIBLE_REWARD_ZERO (jika masih ada referral) atau ELIGIBLE_NO_REFERRALS?
   - **Missing Spec**: Post-claim state transition logic
   - **Recommendation**: Spec "After successful claim, state = ELIGIBLE_REWARD_ZERO jika active_referral_count > 0, else ELIGIBLE_NO_REFERRALS"

### A.3 Cross-State Consistency

**✅ Claim Button Behavior Consistent:**

- NOT_ELIGIBLE: Disabled, grayed out ✅
- ELIGIBLE_NO_REFERRALS: Disabled, "Belum ada rewards" ✅
- ELIGIBLE_REWARD_ZERO: Disabled, "Belum ada yang bisa diklaim" ✅
- CLAIMABLE: Enabled, primary color ✅

**⚠️ Copy Inconsistency:**

- ELIGIBLE_NO_REFERRALS: "Belum ada rewards"
- ELIGIBLE_REWARD_ZERO: "Belum ada yang bisa diklaim"
- **Issue**: Subtle difference, tapi bisa bikin bingung. Prefer ONE standard disable reason.
- **Recommendation**: Unify → "Tidak ada rewards yang bisa diklaim saat ini"

---

## B. Claim Flow Safety Review

### B.1 Double Claim Prevention Audit

**✅ Multi-Layer Protection Implemented:**

| Layer           | Mechanism             | Status                          |
| --------------- | --------------------- | ------------------------------- |
| Client UI       | Button lock after tap | ✅ Spec'd                       |
| Client Cooldown | 3s between attempts   | ✅ Spec'd                       |
| Backend         | Idempotency key       | ✅ Referenced (Phase 1 pattern) |

**⚠️ MISSING SPECS:**

1. **UI Feedback During Cooldown (MEDIUM)**
   - Current spec: "3s cooldown" tapi tidak spec visual feedback
   - **Problem**: User retry tap setelah fail, button tidak respond, user bingung
   - **Recommendation**: Show countdown di button: "Coba Lagi (2s)"

2. **Idempotency Key Generation (HIGH)**
   - Current: "Reuse Phase 1 pattern"
   - **Problem**: Tidak specify HOW key generated (timestamp? UUID?)
   - **Recommendation**: Reference specific Phase 1 section atau spec: "UUID v4 generated on modal open, sent with every claim attempt for this session"

3. **Concurrent Browser Tab/Device (LOW)**
   - **Scenario**: User open 2 tabs, claim di tab 1 pending, tab 2 masih show claimable
   - **Missing**: Cross-tab state sync spec
   - **Recommendation**: Optional - mention "State sync via polling/websocket after claim"

### B.2 TX State Handling Review

**Pending State**:
| Element | Current Spec | Issue | Fix |
|---------|--------------|-------|-----|
| Modal | "Show spinner" | ⚠️ Vague | Spec: Modal stays open, button disabled + spinner, text "Memproses..." |
| Banner | "TxBanner pending" | ✅ | - |
| Dashboard | Not spec'd | ⚠️ Missing | State panel should show "Klaim sedang diproses" |

**Failed State**:
| Element | Current Spec | Issue | Fix |
|---------|--------------|-------|-----|
| Modal | "Keep open OR toast" | ⚠️ Ambiguous | Decision needed: Keep open (retry easy) vs Close (less clutter) |
| Button | "Re-enable for retry" | ✅ | - |
| Dashboard | Not spec'd | ✅ OK | Return to CLAIMABLE state |

**⚠️ CRITICAL ISSUE: Modal Behavior on Fail (BLOCKER)**

- Current: "Keep modal open **OR** show error toast"
- **Problem**: Inconsistent UX, implementation will choose arbitrarily
- **Decision Required**:
  - **Option A (Recommended)**: Keep modal open, show inline error, re-enable button → Easy retry
  - **Option B**: Close modal, show toast, return to dashboard → Cleaner but harder to retry

### B.3 Refresh & History Consistency

**✅ Well-Specified:**

- Success triggers: Dashboard refresh ✅
- History update: Add entry ✅
- Amount update: `claimable_amount → 0` ✅

**⚠️ EDGE CASE GAPS:**

1. **History Entry Timing (MEDIUM)**
   - When is entry added? On submit atau on confirm?
   - **Recommendation**: "Add PENDING entry to history on submit, update to SUCCESS/FAILED on confirm"

2. **Refresh Failure Handling (MEDIUM)**
   - **Scenario**: Claim success, tapi dashboard refresh API fail
   - **Current Spec**: "Refresh rewards dashboard" - tidak mention error handling
   - **Recommendation**: "On refresh fail, show stale data warning + manual refresh CTA"

3. **Optimistic vs Pessimistic Update (LOW)**
   - **Current**: Not specified
   - **Recommendation**: Clarify - "Dashboard refresh uses pessimistic update (wait for API response)"

---

## C. Microcopy Pack v1 (Phase 3)

### C.1 4-State Panel Copy

**NOT_ELIGIBLE:**

- **Title**: "Belum Memenuhi Syarat"
- **Intro**: "Untuk mendapatkan rewards, Anda perlu:"
- **Reasons**:
  - "Verifikasi akun (Blue Check)"
  - "Wallet terkoneksi"
  - (+) "...dan 1 syarat lain" (if > 2)
- **CTA**: "Mulai Verifikasi"

**ELIGIBLE_NO_REFERRALS:**

- **Title**: "Siap Mendapatkan Rewards"
- **Message**: "Akun Anda sudah eligible! Bagikan referral link untuk mulai mendapatkan rewards."
- **Metric**: "Active Referrals: 0"
- **CTA**: "Bagikan Referral"

**ELIGIBLE_REWARD_ZERO (Dynamic):**

_Variant A: Settlement Delay_

- **Title**: "Rewards Sedang Diproses"
- **Message**: "Rewards sedang dikalkulasi. Settlement dilakukan setiap 24 jam."
- **Last Updated**: "Terakhir update: 5 menit lalu"
- **CTA**: "Mengapa $0?"

_Variant B: Below Threshold_

- **Title**: "Hampir Bisa Diklaim"
- **Current**: "$7.50 claimable"
- **Threshold**: "Minimum $10.00"
- **Progress**: "75% - Butuh $2.50 lagi"
- **CTA**: "Mengapa $0?"

_Variant C: No Referral Activity_

- **Title**: "Menunggu Aktivitas Referral"
- **Message**: "Rewards akan muncul setelah referral Anda melakukan transaksi."
- **Active Referrals**: "3 referral aktif"
- **CTA**: "Mengapa $0?"

**CLAIMABLE:**

- **Title**: "Rewards Siap Diklaim!"
- **Amount**: "$125.50 USDC" (large, bold)
- **Context**: "Dari 5 referral aktif"
- **CTA**: "Klaim Sekarang"

**CLAIM_PENDING (NEW):**

- **Title**: "Klaim Sedang Diproses"
- **Message**: "Transaksi sedang dikonfirmasi. Ini mungkin memakan waktu beberapa menit."
- **Progress**: Spinner atau progress indicator
- **CTA**: "Lihat Riwayat" (secondary)

### C.2 Claim Flow Copy

**Pre-Check Failed:**

- Toast: "Tidak ada rewards yang bisa diklaim saat ini"

**Confirm Modal:**

- **Title**: "Konfirmasi Klaim Rewards"
- **Amount Label**: "Jumlah"
- **Destination Label**: "Tujuan"
- **Fee Notice**: "ⓘ Biaya jaringan apply dan akan dipotong dari balance wallet Anda"

**Submit States:**

- Button (submitting): "Memproses..."
- Banner (pending): "⏳ Klaim sedang diproses..."
- Toast (success): "Rewards berhasil diklaim!"
- Banner (success): "✓ Klaim berhasil! Rewards akan masuk ke wallet Anda."

**Fail States (Specific):**

- Toast (network): "Tidak ada koneksi. Periksa jaringan Anda."
- Toast (rejected): "Transaksi ditolak. Silakan coba lagi."
- Toast (insufficient balance): "Balance tidak cukup untuk biaya jaringan ($0.50 diperlukan)"
- Toast (generic): "Klaim gagal. Silakan coba lagi."
- Banner (retryable): "✗ Klaim gagal: [Reason]. [Coba Lagi]"

**Cooldown:**

- Button (cooling): "Coba Lagi (2s)"
- Tooltip: "Tunggu beberapa detik sebelum mencoba lagi"

### C.3 "Why $0?" Education Sheet

**Section 1: Kenapa Claimable $0? (Enhanced)**

```
💰 Kenapa Claimable Saya $0?

Ada beberapa alasan umum:

1. Referral belum bertransaksi
   Rewards hanya dihitung setelah referral Anda
   melakukan transaksi pertama mereka.

2. Masih dalam proses settlement
   Settlement dilakukan setiap 24 jam.
   Cek "Last updated" untuk info terbaru.

3. Belum mencapai minimum threshold
   Minimum $10.00 untuk claim.
   Claimable saat ini: $[AMOUNT]

Jika sudah >48 jam dan masih $0, hubungi support.
```

**Section 2: Referral Aktif**

```
👥 Apa itu Referral Aktif?

Referral aktif = orang yang:
• Daftar menggunakan link Anda
• Melakukan transaksi pertama (presale/fairlaunch)
• Transaksi berhasil (tidak refund)

Referral inactive = daftar tapi belum transaksi.
```

**Section 3: Timeline & Update**

```
⏰ Kapan Rewards Saya Update?

• Data dashboard: Update setiap 10 menit
• Settlement: Dilakukan setiap 24 jam pukul 00:00 UTC
• History: Real-time setelah claim

Tip: Cek "Last updated" timestamp untuk
memastikan data terbaru.
```

### C.4 Disable Reasons (Unified)

**Dashboard Claim Button:**

- NOT_ELIGIBLE: "Verifikasi akun untuk claim"
- ELIGIBLE_NO_REFERRALS: "Tidak ada rewards yang bisa diklaim saat ini"
- ELIGIBLE_REWARD_ZERO: "Tidak ada rewards yang bisa diklaim saat ini"
- CLAIMABLE (wallet disconnected): "Connect wallet untuk claim"
- CLAIMABLE (tx pending): "Transaksi sedang diproses"

**Copy Rules:**

- Positive tone: "Untuk claim, [action]" bukan "Kamu tidak bisa karena..."
- Actionable: Always provide next step
- Consistent: Same reason for similar states (ELIGIBLE_NO_REFERRALS = ELIGIBLE_REWARD_ZERO)

### C.5 Empty States

**Rewards Dashboard (First-Time):**

- **Title**: "Mulai Dapatkan Rewards"
- **Message**: "Bagikan referral link untuk mendapatkan rewards dari setiap transaksi referral Anda."
- **CTA**: "Bagikan Referral"

**Referral Tracking (0 Referrals):**

- **Title**: "Belum Ada Referral"
- **Message**: "Bagikan link Anda untuk mendapatkan referral pertama. Setiap transaksi mereka akan memberikan rewards untuk Anda."
- **CTA**: "Bagikan Sekarang"

**Rewards History (No Claims):**

- **Title**: "Belum Ada Riwayat"
- **Message**: "Klaim rewards akan muncul di sini. Mulai dengan bagikan referral link!"
- **CTA**: "Kembali ke Dashboard"

---

## D. Fix List untuk Sonnet

### BLOCKER (Must Fix)

| #   | Issue                                     | Location           | Fix                                                                                                    |
| --- | ----------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------ |
| B1  | Modal behavior on fail ambiguous          | Claim Flow Step 3b | Decision: Keep modal open OR close? Specify ONE approach                                               |
| B2  | Post-claim state transition not specified | Dashboard States   | Add: "After claim success, state = ELIGIBLE_REWARD_ZERO (if referrals > 0) else ELIGIBLE_NO_REFERRALS" |

### HIGH (Fix Before Implementation)

| #   | Issue                                        | Location              | Fix                                                                         |
| --- | -------------------------------------------- | --------------------- | --------------------------------------------------------------------------- |
| H1  | Claim pending state missing                  | EligibilityStatePanel | Add CLAIM_PENDING state: "Klaim Sedang Diproses..." with spinner            |
| H2  | Idempotency key generation not specified     | Claim Flow            | Specify: "Generate UUID v4 on modal open, send with all attempts"           |
| H3  | ELIGIBLE_REWARD_ZERO explanation too generic | State 3 Panel         | Add dynamic copy variants for settlement/threshold/no-activity              |
| H4  | History entry timing unclear                 | Claim Flow Success    | Specify: "Add PENDING entry on submit, update to SUCCESS/FAILED on confirm" |
| H5  | Dashboard refresh fail handling missing      | Claim Flow Success    | Add: "On refresh fail, show stale data warning + 'Refresh' CTA"             |

### MEDIUM (Nice to Have)

| #   | Issue                                    | Location             | Fix                                                        |
| --- | ---------------------------------------- | -------------------- | ---------------------------------------------------------- |
| M1  | Cooldown feedback missing                | Claim Flow           | Show countdown in button: "Coba Lagi (2s)"                 |
| M2  | NOT_ELIGIBLE reasons overflow            | State 1 Panel        | If > 2 reasons, show top 2 + "...dan X syarat lain" link   |
| M3  | Disable reason copy inconsistent         | States 2 & 3         | Unify: "Tidak ada rewards yang bisa diklaim saat ini"      |
| M4  | Cross-tab state sync not mentioned       | Claim Flow           | Optional: Mention state sync mechanism (polling/websocket) |
| M5  | Optimistic vs pessimistic update unclear | Dashboard Refresh    | Clarify: "Use pessimistic update (wait API response)"      |
| M6  | Below-threshold progress not shown       | ELIGIBLE_REWARD_ZERO | Add variant B with progress bar: "$7.50 / $10.00"          |

### LOW (Polish)

| #   | Issue                               | Location       | Fix                                                                    |
| --- | ----------------------------------- | -------------- | ---------------------------------------------------------------------- |
| L1  | Referral link truncation logic      | Share Sheet    | Specify: Truncate middle "...selsipad.app/r/...123" or use scrollable? |
| L2  | "Last updated" relative time format | Dashboard      | Specify: "2 min ago" / "1h ago" / ">24h show full date"                |
| L3  | Reward amount decimal places        | Summary Cards  | Specify: Always 2 decimals "$125.50" or dynamic "$125.5" / "$100"?     |
| L4  | History filter default state        | History Screen | Specify: Default tab = "All" atau "Claims"?                            |

---

## E. Enhanced Microcopy for ELIGIBLE_REWARD_ZERO (Blocker Fix H3)

**Proposed Dynamic Copy Logic:**

```typescript
function getRewardZeroMessage(data: {
  claimable: number;
  threshold: number;
  settlementPending: boolean;
  lastReferralActivity: Date | null;
}) {
  // Variant B: Below Threshold (prioritize if close)
  if (data.claimable > 0 && data.claimable < data.threshold) {
    const remaining = data.threshold - data.claimable;
    const progress = (data.claimable / data.threshold) * 100;
    return {
      title: 'Hampir Bisa Diklaim',
      message: `Claimable: $${data.claimable.toFixed(2)} (Min: $${data.threshold.toFixed(2)})`,
      progress: `${progress.toFixed(0)}% - Butuh $${remaining.toFixed(2)} lagi`,
      cta: 'Mengapa $0?',
    };
  }

  // Variant A: Settlement Pending
  if (data.settlementPending) {
    return {
      title: 'Rewards Sedang Diproses',
      message: 'Rewards sedang dikalkulasi. Settlement dilakukan setiap 24 jam pukul 00:00 UTC.',
      lastUpdated: 'Terakhir update: [TIME]',
      cta: 'Mengapa $0?',
    };
  }

  // Variant C: No Referral Activity (default)
  return {
    title: 'Menunggu Aktivitas Referral',
    message: 'Rewards akan muncul setelah referral Anda melakukan transaksi.',
    activeReferrals: `${data.activeReferralCount} referral aktif`,
    cta: 'Mengapa $0?',
  };
}
```

---

## Summary & Recommendations

**Overall Assessment**: 🟡 **GOOD with Critical Fixes Required**

**Strengths:**

- ✅ 4-state gating model well-structured dengan clear transitions
- ✅ Multi-layer double claim prevention implemented
- ✅ Transaction pattern Phase 0 correctly reused
- ✅ Education sheet addresses "why $0?" proaktif
- ✅ Fallback UI untuk backend limitations (referral list optional)

**Critical Gaps:**

- ⚠️ Claim flow modal behavior on fail ambiguous (BLOCKER B1)
- ⚠️ Post-claim state transition not specified (BLOCKER B2)
- ⚠️ CLAIM_PENDING state missing (HIGH H1)
- ⚠️ ELIGIBLE_REWARD_ZERO explanation too generic (HIGH H3)
- ⚠️ Idempotency key generation unclear (HIGH H2)

**Recommended Actions:**

1. Sonnet fix B1-B2 (BLOCKER) immediately
2. Sonnet fix H1-H5 (HIGH) before FE handoff
3. Use Microcopy Pack C.1-C.5 as reference implementation
4. Consider M6 (threshold progress) untuk reduce user confusion

**Microcopy Ready**: Section C provides complete, calming copy for all Phase 3 rewards interactions.

**Next Step**: Sonnet address Blocker + High fixes → Gemini visual review → FE implementation.
