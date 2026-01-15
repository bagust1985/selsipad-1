# Phase 3 — P1 Rewards & Referral UX: Screen Specifications

## A. Screen Specs

### 1. Rewards Dashboard Screen

#### Goal

User langsung memahami status rewards mereka dalam 3 detik: NOT_ELIGIBLE, ELIGIBLE (no referrals/reward zero), atau CLAIMABLE. Tidak ada "false hope" - bedakan jelas antara eligible vs claimable.

#### Components Used

- `PageHeader` — Header dengan "Rewards" title
- `RewardsSummaryCard` — Summary metrics cards
- `EligibilityStatePanel` — 4-state renderer (gating + progress)
- `PrimaryButton`, `SecondaryButton` — Claim, Share, History CTAs
- `Skeleton`, `EmptyState`, `InlineError`
- `InfoRow` — Last updated timestamp

#### Primary Actions

**Claim Rewards** (CLAIMABLE state only):

- **Label**: "Klaim Rewards"
- **Trigger**: User tap claim button
- **Flow**: Navigate ke Claim Confirmation → Tx flow → History
- **Gating**: Hanya aktif jika `state === CLAIMABLE && claimable_amount > 0`

**Share Referral**:

- **Label**: "Bagikan Referral"
- **Trigger**: User tap share button
- **Flow**: Open Referral Share sheet/modal

#### Secondary Actions

- Tap "View History" → Navigate `/rewards/history`
- Tap "How it works?" → Open Education sheet
- Pull-to-refresh → Re-fetch rewards data

#### States

**Loading State**:

- Show `<Skeleton>` untuk summary cards + eligibility panel
- Skeleton match real card sizes (3 summary cards + 1 panel)

**Error State**:

- **Type**: Network error / API fail
- **Component**: `<InlineError>` di top screen
- **Message**: "Gagal memuat data rewards"
- **CTA**: "Coba Lagi" (retry fetch)

**Empty State** (First-time user, no data):

- **Condition**: User never had rewards, never shared referral
- **Message**: "Mulai dapatkan rewards"
- **Submessage**: "Bagikan referral link untuk mendapatkan rewards"
- **CTA**: `<PrimaryButton>` "Bagikan Referral" → Open share sheet

#### 4-State Gating Model (EligibilityStatePanel)

**State 1: NOT_ELIGIBLE**

```
┌─────────────────────────────────────────┐
│ [🔒 Icon]  Belum Memenuhi Syarat        │ ← Header
├─────────────────────────────────────────┤
│ Untuk mendapatkan rewards, Anda perlu:  │
│ • Verifikasi akun (Blue Check)          │ ← Reason list (max 2)
│                                         │
│ [   Mulai Verifikasi   ]                │ ← Primary CTA
└─────────────────────────────────────────┘
```

- **Condition**: `blue_check !== ACTIVE`
- **Status Text**: "Belum Memenuhi Syarat"
- **Reasons**: List syarat yang belum terpenuhi (1-2 poin)
- **CTA**: "Mulai Verifikasi" → `/profile/blue-check`
- **Claim Button**: Disabled, grayed out

**State 2: ELIGIBLE_NO_REFERRALS**

```
┌─────────────────────────────────────────┐
│ [✓ Icon]  Siap Mendapatkan Rewards      │
├─────────────────────────────────────────┤
│ Anda sudah eligible untuk rewards!      │
│                                         │
│ Bagikan referral link untuk mulai       │
│ mendapatkan rewards.                    │
│                                         │
│ Active Referrals: 0                     │
│                                         │
│ [   Bagikan Referral   ]                │
└─────────────────────────────────────────┘
```

- **Condition**: `eligible === true && active_referral_count === 0`
- **Status Text**: "Siap Mendapatkan Rewards"
- **Message**: Encourage user untuk share referral
- **Metric**: "Active Referrals: 0"
- **CTA**: "Bagikan Referral" → Open share sheet
- **Claim Button**: Disabled, "Belum ada rewards"

**State 3: ELIGIBLE_REWARD_ZERO**

```
┌─────────────────────────────────────────┐
│ [📊 Icon]  Rewards Sedang Diproses      │
├─────────────────────────────────────────┤
│ Active Referrals: 3                     │
│ Claimable: $0.00                        │
│                                         │
│ Rewards akan muncul setelah referral    │
│ Anda melakukan transaksi.               │
│                                         │
│ Last updated: 2 min ago                 │
│                                         │
│ [   Mengapa $0?   ]                     │
└─────────────────────────────────────────┘
```

- **Condition**: `eligible === true && active_referral_count > 0 && claimable === 0`
- **Status Text**: "Rewards Sedang Diproses"
- **Metrics**: Show active referral count, claimable amount
- **Explanation**: Short reason kenapa claimable = 0
- **Last Updated**: Timestamp untuk transparansi
- **CTA**: "Mengapa $0?" → Open education sheet (explain thresholds/settlement)
- **Claim Button**: Disabled, "Belum ada yang bisa diklaim"

**State 4: CLAIMABLE**

```
┌─────────────────────────────────────────┐
│ [✨ Icon]  Rewards Siap Diklaim!        │
├─────────────────────────────────────────┤
│ Claimable: $125.50 USDC                 │ ← Large, prominent
│                                         │
│ From 5 active referrals                 │
│ Last updated: 1 min ago                 │
│                                         │
│ [   Klaim Sekarang   ]                  │ ← Primary Button ACTIVE
└─────────────────────────────────────────┘
```

- **Condition**: `claimable_amount > 0`
- **Status Text**: "Rewards Siap Diklaim!"
- **Amount**: Large display of claimable amount + token
- **Context**: "From X active referrals"
- **Last Updated**: Timestamp
- **CTA**: "Klaim Sekarang" → Claim confirmation
- **Claim Button**: ENABLED, primary color

#### Summary Cards Layout

```
┌─────────────────────────────────────────┐
│ Rewards                          [?]    │ ← Header + help icon
├─────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐        │
│ │ Claimable   │ │ Lifetime    │        │
│ │ $125.50     │ │ Earned      │        │
│ │ USDC        │ │ $450.00     │        │
│ └─────────────┘ └─────────────┘        │
│ ┌─────────────┐                        │
│ │ Claimed     │                        │
│ │ Total       │                        │
│ │ $324.50     │                        │
│ └─────────────┘                        │
├─────────────────────────────────────────┤
│ [EligibilityStatePanel - 4-state]      │ ← Dynamic based on state
├─────────────────────────────────────────┤
│ [Bagikan Referral] [Lihat Riwayat]     │ ← Secondary actions
└─────────────────────────────────────────┘
```

#### Gating Rules

| Condition                 | Not Met | Action                                         |
| ------------------------- | ------- | ---------------------------------------------- |
| Blue Check ACTIVE         | No      | State = NOT_ELIGIBLE, show reasons + CTA       |
| active_referral_count > 0 | No      | State = ELIGIBLE_NO_REFERRALS, encourage share |
| claimable_amount > 0      | No      | State = ELIGIBLE_REWARD_ZERO, explain why      |
| claimable_amount > 0      | Yes     | State = CLAIMABLE, enable claim button         |

**Post-Claim Transition Logic**:

- IF claim successful (`claimable_amount` → 0):
  - IF `active_referral_count > 0` → State becomes **ELIGIBLE_REWARD_ZERO**
  - IF `active_referral_count === 0` → State becomes **ELIGIBLE_NO_REFERRALS**
- Update UI secara _Pessimistic_ (tunggu API response confirm/refresh).

#### Analytics Events

| Event                      | Trigger            | Properties                                    |
| -------------------------- | ------------------ | --------------------------------------------- |
| `rewards_dashboard_viewed` | Screen mount       | `state`, `claimable_amount`, `referral_count` |
| `claim_attempt`            | Tap claim button   | `eligible: true/false`, `amount`              |
| `share_referral_clicked`   | Tap share button   | `source: dashboard`                           |
| `view_history_clicked`     | Tap history        | -                                             |
| `help_opened`              | Tap "How it works" | `from: dashboard`                             |

#### Acceptance Checklist

- [ ] User dapat identify state mereka dalam 3 detik
- [ ] Setiap state punya 1 kalimat status + next best action
- [ ] Claim button hanya aktif di state CLAIMABLE
- [ ] NOT_ELIGIBLE show clear reasons (max 2 points)
- [ ] ELIGIBLE_REWARD_ZERO explain why claimable = 0
- [ ] Last updated timestamp visible untuk transparency

---

### 2. Referral Share Sheet/Modal

#### Goal

User dapat copy referral link atau share dengan mudah. User paham "orang yang pakai link jadi referral aktif".

#### Components Used

- `Modal` atau Bottom Sheet
- `ReferralLinkCard` — Display link + code
- `PrimaryButton`, `SecondaryButton` — Copy, Share, Close
- `TxToast` — Copy success feedback

#### Primary Actions

**Copy Link**:

- **Label**: "Salin Link"
- **Trigger**: User tap copy button
- **Flow**: Copy to clipboard → Show toast "Link tersalin!"
- **Feedback**: `<TxToast variant="success">` auto-dismiss 2s

**Share**:

- **Label**: "Bagikan"
- **Trigger**: User tap share button
- **Flow**: Open native share sheet (WhatsApp, Telegram, etc)
- **Fallback**: Jika share API tidak available, hanya show copy

#### Secondary Actions

- Tap "Close" → Dismiss sheet
- Tap "Lihat Tracking" → Navigate `/rewards/referrals`

#### States

**Loading State**:

- Show `<Skeleton>` untuk referral link area
- Buttons disabled

**Error State**:

- **Condition**: API fail to fetch referral link
- **Message**: "Gagal memuat link referral"
- **CTA**: "Coba Lagi" (retry)

**Success (Normal)**:

- Referral link displayed
- Copy + Share buttons active

#### Layout Structure (Bottom Sheet)

```
┌─────────────────────────────────────────┐
│ Bagikan Referral                [X]     │ ← Sheet Header
├─────────────────────────────────────────┤
│ Orang yang pakai link kamu akan jadi   │ ← Explanation (short)
│ referral aktif dan kamu dapat rewards. │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Referral Link                       │ │
│ │ ─────────────────────────────────── │ │
│ │ https://selsipad.app/r/ABC123       │ │ ← Link (truncate if long)
│ │                                     │ │
│ │ Code: ABC123                        │ │ ← Optional code
│ └─────────────────────────────────────┘ │
│                                         │
│ Active Referrals: 5                     │ ← Context
│                                         │
│ [   Salin Link   ]  [   Bagikan   ]    │ ← Action buttons
│                                         │
│ [Lihat Detail Referral]                 │ ← Link to tracking
└─────────────────────────────────────────┘
```

#### Copy Success Feedback

- Toast: "Link tersalin!"
- Duration: 2s auto-dismiss
- Variant: Success (green)

#### Analytics Events

| Event                      | Trigger            | Properties                          |
| -------------------------- | ------------------ | ----------------------------------- |
| `referral_share_opened`    | Sheet mount        | `source: dashboard/profile`         |
| `referral_link_copied`     | Tap copy           | `method: button`                    |
| `referral_shared`          | Tap share          | `platform: whatsapp/telegram/other` |
| `referral_tracking_viewed` | Tap "Lihat Detail" | -                                   |

#### Acceptance Checklist

- [ ] Copy link kasih toast feedback "Link tersalin!"
- [ ] Share tidak bikin user keluar flow (sheet/modal)
- [ ] Explanation singkat dan jelas (max 2 kalimat)
- [ ] Active referral count visible untuk context

---

### 3. Referral Tracking Screen

#### Goal

User dapat lihat active referral count dan (optional) breakdown jika backend ready. Jika list tidak tersedia, tetap informatif dengan count + guidance.

#### Components Used

- `PageHeader` — "Referral Tracking" + back
- `InfoRow` — Summary metrics
- `List` — Referral items (optional)
- `Skeleton`, `EmptyState`, `InlineError`

#### Primary Action

- View referral list (if available)

#### Secondary Actions

- Tap "Share More" → Open Referral Share sheet
- Pull-to-refresh → Re-fetch data

#### States

**Loading State**:

- Show `<Skeleton>` untuk summary + list items (3-5)

**Empty State** (0 Referrals):

- **Message**: "Belum ada referral"
- **Submessage**: "Bagikan link untuk mendapatkan referral pertama"
- **CTA**: `<PrimaryButton>` "Bagikan Sekarang"

**Error State**:

- **Message**: "Gagal memuat data referral"
- **CTA**: "Coba Lagi"

**Success (With List)**:

- Summary: Total active, Total inactive
- List: Referral items (anonymized)

**Success (Without List - Fallback)**:

- Summary metrics only
- Encouragement message + share CTA

#### Layout Structure (With List)

```
┌─────────────────────────────────────────┐
│ ← Referral Tracking                     │
├─────────────────────────────────────────┤
│ Active Referrals: 5                     │ ← Summary
│ Total Referrals: 8                      │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ [Avatar] User #1    [✓ Active]      │ │ ← Anonymized
│ │ Joined: 12 Jan 2026                 │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ [Avatar] User #2    [○ Inactive]    │ │
│ │ Joined: 10 Jan 2026                 │ │
│ └─────────────────────────────────────┘ │
│ ...                                     │
├─────────────────────────────────────────┤
│ [   Bagikan Lagi   ]                    │ ← CTA
└─────────────────────────────────────────┘
```

#### Layout Structure (Without List - Fallback)

```
┌─────────────────────────────────────────┐
│ ← Referral Tracking                     │
├─────────────────────────────────────────┤
│ Active Referrals: 5                     │
│                                         │
│ Referral aktif adalah orang yang sudah │
│ melakukan transaksi pertama mereka.     │
│                                         │
│ Detail referral akan segera tersedia.   │
│                                         │
│ [   Bagikan Lebih Banyak   ]            │
└─────────────────────────────────────────┘
```

#### Referral Item Spec (If List Available)

- Avatar: Generic anonymized avatar
- Label: "User #X" (tidak show username untuk privacy)
- Status: Badge "Active" (green) or "Inactive" (gray)
- Date: "Joined: [Date]"

#### Analytics Events

| Event                      | Trigger                        | Properties                    |
| -------------------------- | ------------------------------ | ----------------------------- |
| `referral_tracking_viewed` | Screen mount                   | `active_count`, `total_count` |
| `referral_item_tapped`     | Tap item (if detail available) | `referral_id`                 |

#### Acceptance Checklist

- [ ] Jika list tidak ada, UI tetap informatif (count + guidance)
- [ ] Referral items anonymized untuk privacy
- [ ] Clear distinction between Active vs Inactive
- [ ] CTA "Bagikan Lagi" always accessible

---

### 4. Claim Rewards Confirmation & Flow

#### Goal

User confirm claim amount, sign tx, dan dapat feedback yang jelas (submitted/confirmed/failed). Prevent double claim.

#### Components Used

- `ConfirmModal` — Claim confirmation (reuse Phase 0 pattern)
- `TxBanner` — Transaction feedback (reuse Phase 0)
- `TxToast` — Success/fail feedback
- `PrimaryButton`, `SecondaryButton`

#### Claim Flow Steps

**Step 0: Pre-Check (Before Modal)**

- **Check**: `claimable_amount > 0`
- **If fail**: Show toast "Tidak ada rewards yang bisa diklaim"
- **If pass**: Open Confirm Modal

**Step 1: Confirm Modal**

```
┌─────────────────────────────────────────┐
│ Klaim Rewards                  [X]      │
├─────────────────────────────────────────┤
│ Amount                                  │
│ $125.50 USDC                            │ ← Large, prominent
│                                         │
│ Destination                             │
│ 0x1234...5678 (Connected Wallet)        │
│                                         │
│ ⓘ Network fee may apply                 │ ← Info (if on-chain)
│                                         │
├─────────────────────────────────────────┤
│ [Batal]              [Klaim]            │
└─────────────────────────────────────────┘
```

- **Content**: Amount, destination wallet, fee info (if on-chain)
- **Primary**: "Klaim" (enabled)
- **Secondary**: "Batal" (close modal)

**Step 2: Submitting**

- **State**: `claiming = true`
- **Buttons**: Disabled
- **Modal**: Show `<Spinner>` or loading state
- **Banner**: `<TxBanner variant="pending">` "Mengirim transaksi..."

**Step 3a: Success**

- **Close modal**
- **Show**: `<TxToast variant="success">` "Rewards berhasil diklaim!"
- **Banner**: `<TxBanner variant="success">` with tx link (if on-chain)
- **Data Update**:
  - `claimable_amount` → 0
  - Refresh rewards dashboard
  - Add entry to history
- **Auto-navigate**: Navigate to `/rewards/history` after 2s (optional)

**Step 3b: Failed**

- **Modal Behavior**: **KEEP MODAL OPEN** (User can retry immediately without re-entering amount)
- **Show**: Inline error message inside modal (e.g., above buttons) AND/OR `<TxToast variant="error">`
- **Button**: Re-enable "Klaim" button (remove spinner)
- **Reason Examples** (Microcopy Pack C.2):
  - Network: "Tidak ada koneksi. Periksa jaringan Anda."
  - Rejected: "Transaksi ditolak. Silakan coba lagi."
  - Fee: "Balance tidak cukup untuk biaya jaringan"
  - Generic: "Klaim gagal: [Reason]. Silakan coba lagi."

#### Double Claim Prevention

- **Client-side**: Lock button after tap (disable until response)
- **Cooldown**: 3s cooldown between attempts
- **Backend**: Idempotency key (reuse Phase 1 pattern)

#### Transaction Banner Spec (Reuse Phase 0)

```
┌─────────────────────────────────────────┐
│ ⏳ Klaim sedang diproses...             │ ← Pending
│ [Lihat Riwayat]                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ ✓ Klaim berhasil!                       │ ← Success
│ [Lihat Riwayat] [Lihat TX]              │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ ✗ Klaim gagal: [Reason]                 │ ← Failed
│ [Coba Lagi]                             │
└─────────────────────────────────────────┘
```

#### Gating Rules

| Condition            | Not Met | Action                                            |
| -------------------- | ------- | ------------------------------------------------- |
| claimable_amount > 0 | No      | Button disabled, tooltip "Belum ada rewards"      |
| Wallet connected     | No      | Show "Connect wallet first"                       |
| Tx not pending       | No      | Button disabled, show "Transaksi sedang diproses" |

#### Analytics Events

| Event             | Trigger                  | Properties                 |
| ----------------- | ------------------------ | -------------------------- |
| `claim_initiated` | Tap claim from dashboard | `amount`, `eligible: true` |
| `claim_confirmed` | Tap confirm in modal     | `amount`                   |
| `claim_submitted` | Tx submitted             | `tx_id`, `amount`          |
| `claim_success`   | Tx confirmed             | `tx_id`, `amount`          |
| `claim_failed`    | Tx failed                | `reason`, `amount`         |

#### Acceptance Checklist

- [ ] Tidak bisa double claim saat tx pending
- [ ] Error state jelas + tombol retry
- [ ] Success feedback show toast + banner
- [ ] Success auto-refresh dashboard (claimable → 0)
- [ ] Tx link available (if on-chain)
- [ ] Entry added to history after success

---

### 5. Rewards History Screen

#### Goal

User bisa audit sendiri: "gue claim kapan, berapa". Semua claim tx muncul di history.

#### Components Used

- `PageHeader` — "Riwayat Rewards" + back
- `RewardHistoryItem` — History item component
- `Tabs` (optional) — Filter: All / Claims / Earnings
- `Skeleton`, `EmptyState`, `InlineError`

#### Primary Action

- View history list
- Tap item → expand detail (if collapsed)

#### Secondary Actions

- Filter by type (Claims / Earnings) - optional
- Tap tx link → Open block explorer (if on-chain)
- Pull-to-refresh → Re-fetch history

#### States

**Loading State**:

- Show `<Skeleton>` untuk 5-7 history items

**Empty State**:

- **Message**: "Belum ada riwayat"
- **Submessage**: "Klaim rewards akan muncul di sini"
- **CTA**: `<SecondaryButton>` "Kembali ke Dashboard"

**Error State**:

- **Message**: "Gagal memuat riwayat"
- **CTA**: "Coba Lagi"

**Success**:

- List of history items, newest first

#### Layout Structure

```
┌─────────────────────────────────────────┐
│ ← Riwayat Rewards                       │
├─────────────────────────────────────────┤
│ [All] [Claims] [Earnings]               │ ← Filter tabs (optional)
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ [✓] Claim                           │ │ ← Type + Status icon
│ │ +$125.50 USDC                       │ │
│ │ 12 Jan 2026, 10:30 AM               │ │
│ │ [Lihat TX →]                        │ │ ← Tx link (if on-chain)
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ [✓] Claim                           │ │
│ │ +$50.00 USDC                        │ │
│ │ 10 Jan 2026, 3:45 PM                │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ [⏳] Claim Pending                  │ │
│ │ +$75.00 USDC                        │ │
│ │ 14 Jan 2026, 9:00 AM                │ │
│ └─────────────────────────────────────┘ │
│ ...                                     │
└─────────────────────────────────────────┘
```

#### RewardHistoryItem Spec

**Minimum Content**:

```
┌─────────────────────────────────────────┐
│ [Icon] Type • Status                    │ ← Claim/Earn + Success/Failed/Pending
│ Amount (+$125.50 USDC)                  │ ← Amount (positive for claims/earnings)
│ Date (12 Jan 2026, 10:30 AM)            │
│ [Lihat TX →] (if on-chain)              │ ← Optional tx link
└─────────────────────────────────────────┘
```

**Status Variants**:

- **Success**: Green checkmark, normal text
- **Pending**: Orange clock icon, "Pending" badge
- **Failed**: Red X icon, "Failed" badge + reason

**Type**:

- **Claim**: "Claim" label, amount prefixed with "+"
- **Earn** (optional): "Earned from referral" label

#### Analytics Events

| Event                     | Trigger      | Properties                    |
| ------------------------- | ------------ | ----------------------------- |
| `history_viewed`          | Screen mount | `item_count`                  |
| `history_item_clicked`    | Tap item     | `type`, `status`, `amount`    |
| `history_tx_link_clicked` | Tap tx link  | `tx_id`                       |
| `history_filter_changed`  | Switch tab   | `filter: all/claims/earnings` |

#### Acceptance Checklist

- [ ] User bisa audit: "claim kapan, berapa"
- [ ] Semua tx dari claim flow muncul
- [ ] Status jelas (Success/Pending/Failed)
- [ ] Tx link tersedia untuk on-chain claims
- [ ] Newest first (DESC order)

---

### 6. Education: "How It Works" + "Why 0?" Sheet

#### Goal

User paham syarat eligibility, kenapa claimable bisa 0, dan kapan rewards biasanya update. Copy singkat, tidak menyalahkan user.

#### Components Used

- `Modal` atau Bottom Sheet
- `Accordion` (optional) — Collapsible sections
- `SecondaryButton` — Close

#### Content Sections

**Section 1: Syarat Eligibility**

```
📋 Syarat Mendapatkan Rewards

Untuk eligible mendapatkan rewards:
• Akun terverifikasi (Blue Check)
• Minimal 1 referral aktif

Referral aktif = orang yang sudah melakukan
transaksi pertama mereka di platform.
```

**Section 2: Kenapa Claimable Bisa $0?**

```
💰 Kenapa Claimable Saya $0?

Beberapa alasan umum:
• Referral belum melakukan transaksi
• Rewards masih dalam proses settlement
• Belum mencapai minimum threshold ($10)

Settlement biasanya dilakukan setiap 24 jam.
```

**Section 3: Kapan Rewards Update?**

```
⏰ Kapan Rewards Saya Update?

• Data rewards diupdate setiap 10 menit
• Settlement dilakukan setiap 24 jam
• Cek "Last updated" di dashboard untuk
  info terbaru

Jika ada masalah, hubungi support.
```

#### Layout Structure (Bottom Sheet)

```
┌─────────────────────────────────────────┐
│ Cara Kerja Rewards            [X]       │
├─────────────────────────────────────────┤
│ 📋 Syarat Eligibility                   │
│ ┌─────────────────────────────────────┐ │
│ │ Untuk eligible:                     │ │
│ │ • Blue Check                        │ │
│ │ • Min 1 referral aktif              │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ 💰 Kenapa Claimable $0?                 │
│ ┌─────────────────────────────────────┐ │
│ │ • Referral belum transaksi          │ │
│ │ • Masih settlement                  │ │
│ │ • Belum mencapai threshold          │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ⏰ Kapan Update?                        │
│ ┌─────────────────────────────────────┐ │
│ │ • Update: Setiap 10 menit           │ │
│ │ • Settlement: Setiap 24 jam         │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [   Mengerti   ]                        │
└─────────────────────────────────────────┘
```

#### Tone & Copy Rules

- **Positive**: "Untuk mendapatkan" bukan "Kamu belum bisa karena..."
- **Clear**: Bullet points, max 3 per section
- **Helpful**: Provide context (settlement timing, threshold)
- **No blame**: Jangan menyalahkan user

#### Analytics Events

| Event                 | Trigger           | Properties                             |
| --------------------- | ----------------- | -------------------------------------- |
| `help_sheet_opened`   | Sheet mount       | `from: dashboard/state_panel`          |
| `help_section_viewed` | Scroll to section | `section: eligibility/why_zero/update` |

#### Acceptance Checklist

- [ ] Copy singkat (max 3 bullets per section)
- [ ] Tidak menyalahkan user
- [ ] Cover: eligibility, why 0, update timing
- [ ] Accessible from dashboard + ELIGIBLE_REWARD_ZERO state

---

## B. Component Specs Tambahan

### B.1 EligibilityStatePanel

**Props**:

```typescript
interface EligibilityStatePanelProps {
  state: 'NOT_ELIGIBLE' | 'ELIGIBLE_NO_REFERRALS' | 'ELIGIBLE_REWARD_ZERO' | 'CLAIMABLE';
  data: {
    // NOT_ELIGIBLE
    reasons?: string[]; // Max 2
    verifyCTA?: string;

    // ELIGIBLE_NO_REFERRALS
    activeReferralCount?: number;

    // ELIGIBLE_REWARD_ZERO
    claimableAmount?: number;
    lastUpdated?: Date;

    // CLAIMABLE
    claimableAmount?: number;
    referralCount?: number;
  };
  onCTAClick: () => void;
}
```

**Visual Variants**:

- NOT_ELIGIBLE: Lock icon, Red/Gray bg-soft
- ELIGIBLE_NO_REFERRALS: Checkmark icon, Blue bg-soft
- ELIGIBLE_REWARD_ZERO: Chart icon, Yellow bg-soft
- CLAIMABLE: Sparkle icon, Green bg-soft

**States**:

- All states show: Icon + Header + Content + CTA button

---

### B.2 ReferralLinkCard

**Props**:

```typescript
interface ReferralLinkCardProps {
  link: string;
  code?: string;
  onCopy: () => void;
  onShare?: () => void;
}
```

**Visual**:

- Card: `bg.card`, `border.subtle`, `p-4`
- Link: Truncate if > 40 chars, show "..." middle
- Buttons: Copy (Primary), Share (Secondary)

**States**:

- Default
- Copied (show checkmark icon briefly)

---

### B.3 RewardHistoryItem

**Props**:

```typescript
interface RewardHistoryItemProps {
  item: {
    id: string;
    type: 'CLAIM' | 'EARN';
    amount: number;
    token: string;
    date: Date;
    status: 'SUCCESS' | 'PENDING' | 'FAILED';
    txLink?: string;
    failReason?: string;
  };
  onTapTxLink?: (txId: string) => void;
}
```

**Visual**:

- Status icon: ✓ (green) / ⏳ (orange) / ✗ (red)
- Amount: Bold, with + prefix
- Date: Full timestamp
- Tx Link: Inline link (if available)

---

### B.4 RewardsSummaryCard

**Props**:

```typescript
interface RewardsSummaryCardProps {
  label: string; // "Claimable", "Lifetime Earned", "Claimed Total"
  amount: number;
  token: string;
  variant?: 'primary' | 'secondary';
}
```

**Visual**:

- Primary (Claimable): Larger font, primary color accent
- Secondary: Regular size, neutral color
- Card: Compact, 1/3 width on desktop, full on mobile

---

## C. Assumptions Made (Safe Defaults)

1. **Eligibility**: Asumsi hanya Blue Check ACTIVE yang eligible. Jika ada syarat lain (e.g., min wallet balance, KYC tier), tambahkan di NOT_ELIGIBLE reasons.

2. **Claim TX**: Asumsi on-chain claim (tx link available). Jika off-chain, skip tx link dan hanya show success toast.

3. **Settlement Timing**: Asumsi settlement setiap 24 jam. Jika real-time, update copy di education sheet.

4. **Min Threshold**: Asumsi ada minimum threshold ($10). Jika tidak ada, skip mention di "Why 0" section.

5. **Referral Active Definition**: Asumsi "active" = user sudah melakukan first transaction. Jika berbeda (e.g., KYC, min deposit), update education sheet.

6. **Referral List**: Asumsi backend mungkin belum ready untuk list detail. Jika tidak ada, show summary count only dengan fallback UI.

7. **Earn History**: Asumsi hanya claim history yang critical. Earning events (per-referral earnings) optional - jika ada, add filter tab.

8. **Expiry**: Asumsi tidak ada referral expiry. Jika ada, tambahkan info "Referrals expire after X days" di education.

---

## D. Global UX Rules Applied

1. **4-State Gating**: Semua rewards screens implement 4-state model: NOT_ELIGIBLE, ELIGIBLE_NO_REFERRALS, ELIGIBLE_REWARD_ZERO, CLAIMABLE.

2. **No False Hope**: Bedakan jelas eligible (meet requirements) vs claimable (can claim now).

3. **Transaction Pattern**: Claim flow pakai Phase 0 tx pattern: Confirm → Submit → Banner → Success/Fail.

4. **Transparency**: Show "Last updated" timestamp untuk data yang mungkin delay.

5. **Education**: "How it works" accessible dari dashboard dan ELIGIBLE_REWARD_ZERO state.

6. **Loading/Empty/Error**: Semua screens punya 3 states dengan CTA yang jelas.

---

## Definition of Done Phase 3 ✅

Phase 3 complete jika:

- [x] Rewards Dashboard dengan 4-state gating panel
- [x] Referral Share sheet (copy + share)
- [x] Referral Tracking (minimal summary, optional list)
- [x] Claim flow (confirm + tx states, prevent double claim)
- [x] Rewards History (claim history, tx links)
- [x] Education sheet ("How it works" + "Why 0?")
- [x] Component specs (EligibilityStatePanel, ReferralLinkCard, RewardHistoryItem, RewardsSummaryCard)
- [x] Semua screens punya loading/empty/error states
- [x] 4-state gating rules documented dengan clear CTAs
- [x] Claim tx pattern consistent dengan Phase 0
- [x] Analytics events defined

**Handoff Ready**: Dokumen siap untuk FE implementation. Visual design dari Gemini dan edge case review dari Opus akan follow.

---

## Open Questions (Documented)

1. **Eligibility Syarat**: Selain Blue Check, ada syarat lain? (e.g., min balance, KYC tier) → **Assumption**: Blue Check only
2. **Reward Settlement**: Real-time atau periodik (24h)? → **Assumption**: 24h settlement
3. **Min Threshold**: Ada minimum claim amount? → **Assumption**: $10 minimum
4. **Claim TX**: On-chain atau off-chain? → **Assumption**: On-chain (tx link available)
5. **Referral Active**: Dihitung kapan (first buy/KYC/deposit)? → **Assumption**: First transaction
6. **Referral Expiry**: Ada expiry referral? → **Assumption**: Tidak ada expiry
7. **Referral List**: Backend provide detail list atau count only? → **Assumption**: Fallback ke count only jika list belum ready
8. **Earning Events**: Track individual earning events atau hanya claim history? → **Assumption**: Claim history prioritas, earning events optional
