# Phase 4 — Identity & Profile: Screen Specifications

## A. Screen Specs

### 1. Profile Overview Screen

#### Goal

User dapat melihat ringkasan akun dan status verifikasi (Blue Check, KYC) dalam satu layar. Akses mudah ke sub-screens identitas tanpa perlu navigasi kompleks.

#### Components Used

- `PageHeader` — "Profile" title
- `AccountStatusCard` — Blue Check & KYC status cards
- `InfoRow` — Account metadata (username, account ID, primary wallet)
- `List` — Settings shortcuts
- `Skeleton`, `EmptyState`, `InlineError`

#### Primary Actions

**View Status Details**:

- Tap Blue Check card → Navigate `/profile/blue-check`
- Tap KYC card → Navigate `/profile/kyc`

**Navigate to Sub-Screens**:

- Tap "Wallets" → Navigate `/profile/wallets`
- Tap "Security" → Navigate `/profile/security`
- Tap "Settings" → Navigate `/profile/settings`

#### Secondary Actions

- Pull-to-refresh → Re-fetch profile data
- Tap avatar (if editable) → Upload new avatar (optional, skip if not ready)

#### States

**Loading State**:

- Show `<Skeleton>` untuk avatar, status cards, shortcuts list

**Error State**:

- **Type**: Network error / API fail
- **Component**: `<InlineError>` di top screen
- **Message**: "Gagal memuat profil"
- **CTA**: "Coba Lagi" (retry fetch)

**Success (Normal)**:

- Display avatar, username, account ID
- Status cards show Blue Check + KYC status
- Wallet summary visible
- Shortcuts list loaded

#### Layout Structure

```
┌─────────────────────────────────────────┐
│ Profile                                 │
├─────────────────────────────────────────┤
│ [Avatar]                                │
│ @username                               │ ← Username (if available)
│ ID: acc_1234567                         │ ← Account ID (shortened)
│                                         │
│ ┌STATUS CARDS────────────────────────┐  │
│ │ ┌─────────────┐  ┌─────────────┐  │  │
│ │ │ Blue Check  │  │ KYC         │  │  │
│ │ │ [✓ Active]  │  │ [Verified]  │  │  │
│ │ │ ────────────│  │ ────────────│  │  │
│ │ │ Manage →    │  │ View →      │  │  │
│ │ └─────────────┘  └─────────────┘  │  │
│ └───────────────────────────────────┘  │
│                                         │
│ Primary Wallet                          │
│ 0x1234...5678 • EVM                     │ ← Primary wallet summary
│ [Manage Wallets →]                      │
│                                         │
│ Settings                                │
│ ┌─────────────────────────────────────┐ │
│ │ Wallets                          →  │ │
│ │ Security & Sessions              →  │ │
│ │ Settings                         →  │ │
│ │ Help & Support                   →  │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

#### AccountStatusCard Spec (2 Variants)

**Blue Check Card**:

- **Active State**:
  - Icon: Checkmark badge (blue)
  - Label: "Blue Check"
  - Status: "Active" (green text)
  - CTA: "Manage →"
- **Inactive State**:
  - Icon: Lock or Badge outline (gray)
  - Label: "Blue Check"
  - Status: "Inactive" (gray text)
  - CTA: "Activate →"

**KYC Card**:

- **Verified**:
  - Icon: Shield check (green)
  - Status: "Verified"
  - CTA: "View →"
- **Pending**:
  - Icon: Clock (orange)
  - Status: "Pending Review"
  - CTA: "View Status →"
- **Not Started**:
  - Icon: Shield outline (gray)
  - Status: "Not Started"
  - CTA: "Start KYC →"
- **Rejected**:
  - Icon: Shield X (red)
  - Status: "Rejected"
  - CTA: "View Details →"

#### Analytics Events

| Event                       | Trigger             | Properties                                      |
| --------------------------- | ------------------- | ----------------------------------------------- |
| `profile_viewed`            | Screen mount        | `blue_check_status`, `kyc_status`               |
| `blue_check_card_clicked`   | Tap Blue Check card | `status: active/inactive`                       |
| `kyc_card_clicked`          | Tap KYC card        | `status: verified/pending/rejected/not_started` |
| `wallets_shortcut_clicked`  | Tap "Wallets"       | -                                               |
| `security_shortcut_clicked` | Tap "Security"      | -                                               |

#### Acceptance Checklist

- [ ] User dapat lihat Blue Check & KYC status dalam 1 layar
- [ ] All shortcuts ke sub-screens mudah diakses
- [ ] Primary wallet visible di overview
- [ ] Loading skeleton match real layout
- [ ] Error state show retry CTA

---

### 2. Wallet Management Screen

#### Goal

User dapat view semua linked wallets, identify primary wallet dengan jelas, dan manage (add/remove/set primary) dengan guard rules yang aman.

#### Components Used

- `PageHeader` — "Wallets" + back
- `WalletItemRow` — Wallet list item
- `PrimaryTag` — Badge untuk primary wallet
- `ActionMenu` — Kebab menu (set primary, copy, remove)
- `PrimaryButton` — "Add Wallet"
- `Skeleton`, `EmptyState`, `InlineError`
- `ConfirmModal` — Destructive action confirmation

#### Primary Actions

**Set Primary Wallet**:

- **Label**: "Set as Primary" (dari action menu)
- **Trigger**: User tap menu → select "Set as Primary"
- **Flow**: Show confirm modal → API call → Update list
- **Guard**: None (any wallet dapat di-set sebagai primary)

**Remove Wallet**:

- **Label**: "Remove" (dari action menu)
- **Trigger**: User tap menu → select "Remove"
- **Flow**: Check guard → Show confirm modal → API call → Update list
- **Guard**: Cannot remove primary wallet (button disabled + reason)

#### Secondary Actions

- Tap "Add Wallet" → Navigate `/profile/wallets/add`
- Tap "Copy Address" → Copy to clipboard + toast
- Pull-to-refresh → Re-fetch wallet list

#### States

**Loading State**:

- Show `<Skeleton>` untuk 2-3 WalletItemRow

**Empty State** (0 Wallets):

- **Message**: "Belum ada wallet terhubung"
- **Submessage**: "Hubungkan wallet untuk mulai bertransaksi"
- **CTA**: `<PrimaryButton>` "Tambah Wallet"

**Error State**:

- **Message**: "Gagal memuat daftar wallet"
- **CTA**: "Coba Lagi"

**Success**:

- List of wallets, primary wallet at top

#### Layout Structure

```
┌─────────────────────────────────────────┐
│ ← Wallets                               │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ [EVM] 0x1234...5678        [⋮]      │ │ ← Primary wallet
│ │ [PRIMARY]                           │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ [SOL] ABC1...XYZ2          [⋮]      │ │ ← Regular wallet
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ [EVM] 0x9876...4321        [⋮]      │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [        + Tambah Wallet        ]       │ ← Add button (full width)
└─────────────────────────────────────────┘
```

#### WalletItemRow Spec

- **Network Badge**: Small chip (EVM/SOL/etc) with network color
- **Address**: Shortened format (0x1234...5678)
- **Primary Tag** (if primary): Small badge "PRIMARY" (primary color bg)
- **Action Menu**: Kebab icon (⋮) → Open ActionMenu

#### ActionMenu Options

**For Non-Primary Wallet**:

1. Set as Primary
2. Copy Address
3. Remove (red text)

**For Primary Wallet**:

1. Copy Address
2. ~~Remove~~ (grayed out + tooltip "Cannot remove primary wallet")

#### Set Primary Confirm Modal

```
┌─────────────────────────────────────────┐
│ Set Primary Wallet           [X]        │
├─────────────────────────────────────────┤
│ Mengubah primary wallet akan            │
│ memengaruhi transaksi dan claim yang    │
│ menggunakan wallet default.              │
│                                         │
│ New Primary:                            │
│ 0x1234...5678 (EVM)                     │
│                                         │
├─────────────────────────────────────────┤
│ [Batal]              [Set Primary]      │
└─────────────────────────────────────────┘
```

#### Remove Wallet Confirm Modal

```
┌─────────────────────────────────────────┐
│ Remove Wallet                [X]        │
├─────────────────────────────────────────┤
│ ⚠️ Wallet akan dihapus dari akun Anda.  │
│                                         │
│ Address: 0x9876...4321                  │
│                                         │
│ Anda masih dapat menghubungkan wallet   │
│ ini lagi nanti.                         │
│                                         │
├─────────────────────────────────────────┤
│ [Batal]              [Remove]           │
└─────────────────────────────────────────┘
```

#### Guard Rules

| Action        | Condition             | Not Met           | Behavior                                                |
| ------------- | --------------------- | ----------------- | ------------------------------------------------------- |
| Remove Wallet | Wallet is NOT primary | Wallet IS primary | Button disabled, tooltip "Set primary wallet lain dulu" |
| Set Primary   | Any wallet            | -                 | Always allowed (show confirm)                           |

#### Analytics Events

| Event                       | Trigger               | Properties               |
| --------------------------- | --------------------- | ------------------------ |
| `wallets_list_viewed`       | Screen mount          | `wallet_count`           |
| `wallet_action_menu_opened` | Tap kebab menu        | `is_primary: true/false` |
| `set_primary_initiated`     | Tap "Set as Primary"  | `wallet_address`         |
| `set_primary_confirmed`     | Confirm in modal      | `wallet_address`         |
| `set_primary_success`       | API success           | `wallet_address`         |
| `remove_wallet_blocked`     | Tap remove on primary | `reason: is_primary`     |
| `remove_wallet_initiated`   | Tap "Remove"          | `wallet_address`         |
| `remove_wallet_confirmed`   | Confirm in modal      | `wallet_address`         |
| `remove_wallet_success`     | API success           | `wallet_address`         |
| `copy_address_clicked`      | Tap "Copy Address"    | `wallet_address`         |

#### Acceptance Checklist

- [ ] Primary wallet clearly visible (tag + top position)
- [ ] Remove primary wallet blocked dengan reason jelas
- [ ] Set primary show confirm modal dengan impact explanation
- [ ] Copy address show toast "Address copied"
- [ ] Empty state show CTA "Add Wallet"

---

### 3. Add/Link Wallet Flow

#### Goal

User dapat menghubungkan wallet baru dengan flow yang jelas, error handling friendly, dan tidak "stuck" di tengah flow.

#### Components Used

- `PageHeader` — "Add Wallet" + back
- `PrimaryButton` — Connect wallet CTA
- `Modal` (optional) — Wallet connector picker
- `TxToast` — Success/fail feedback
- `InlineError` — Error display

#### Primary Action

**Connect Wallet**:

- **Label**: "Connect Wallet"
- **Trigger**: User tap button
- **Flow**:
  1. (Optional) Select network/connector
  2. Trigger wallet connection (e.g., MetaMask, Phantom)
  3. (Optional) Sign message for verification
  4. API call to link wallet
  5. Show success → Navigate back to wallet list

#### Secondary Actions

- Tap "Back" → Dismiss flow (confirm if in progress)
- Tap "Cancel" → Cancel connection attempt

#### States

**Default (Ready to Connect)**:

- Show instructions + Connect button enabled

**Connecting** (Wallet popup open):

- Button disabled, text "Connecting..."
- Show loading spinner

**Verifying** (After wallet connected, before API):

- Button disabled, text "Verifying..."
- Show loading spinner

**Success**:

- Toast "Wallet berhasil terhubung!"
- Auto-navigate back to wallet list (with new wallet visible)

**Failed**:

- Toast with reason (see error types below)
- Button re-enabled "Try Again"

#### Error Types & Copy

**Already Linked**:

- **Toast**: "Wallet ini sudah terhubung ke akun Anda"
- **CTA**: "Lihat Daftar Wallet" → Navigate to wallet list

**Connection Rejected**:

- **Toast**: "Koneksi ditolak. Silakan coba lagi."
- **CTA**: Button "Try Again"

**Network Error**:

- **Toast**: "Gagal menghubungkan. Periksa koneksi Anda."
- **CTA**: Button "Try Again"

**Generic Error**:

- **Toast**: "Gagal menghubungkan wallet. Silakan coba lagi."
- **CTA**: Button "Try Again"

#### Layout Structure

```
┌─────────────────────────────────────────┐
│ ← Add Wallet                            │
├─────────────────────────────────────────┤
│                                         │
│ [Wallet Icon Illustration]              │
│                                         │
│ Connect Your Wallet                     │ ← Title
│                                         │
│ Hubungkan wallet Anda untuk mulai       │
│ bertransaksi dan claim rewards.         │
│                                         │
│ Supported Networks:                     │
│ • Ethereum (EVM)                        │
│ • Solana                                │
│                                         │
│ [     Connect Wallet     ]              │ ← Primary Button
│                                         │
│ ⓘ Aman: Kami tidak pernah meminta       │
│   private key atau seed phrase Anda.    │
└─────────────────────────────────────────┘
```

#### Optional: Network Selector (if multi-chain)

```
┌─────────────────────────────────────────┐
│ Select Network               [X]        │
├─────────────────────────────────────────┤
│ [ ] Ethereum (EVM)                      │
│ [ ] Solana                              │
│ [ ] BSC                                 │
├─────────────────────────────────────────┤
│ [Cancel]              [Continue]        │
└─────────────────────────────────────────┘
```

#### Flow Diagram

```
[Add Wallet Screen]
       ↓ Tap "Connect Wallet"
[Optional: Select Network]
       ↓
[Wallet Popup (MetaMask/Phantom)]
       ↓ User approves
[Optional: Sign Message]
       ↓
[API: Link Wallet]
       ↓ Success
[Toast + Navigate to List]
```

#### Analytics Events

| Event                        | Trigger              | Properties                               |
| ---------------------------- | -------------------- | ---------------------------------------- |
| `add_wallet_initiated`       | Tap "Connect Wallet" | -                                        |
| `wallet_connection_success`  | Wallet connected     | `network: evm/sol`                       |
| `wallet_link_success`        | API success          | `wallet_address`, `network`              |
| `wallet_link_failed`         | API fail             | `reason: already_linked/network/generic` |
| `wallet_connection_rejected` | User reject popup    | -                                        |

#### Acceptance Checklist

- [ ] Flow jelas dan tidak bikin user stuck
- [ ] Error "Already linked" show CTA to wallet list
- [ ] Connection rejected allow retry
- [ ] Success auto-navigate to wallet list dengan wallet baru visible
- [ ] Security notice visible ("Kami tidak pernah meminta private key")

---

### 4. Blue Check Status Screen

#### Goal

User paham apa itu Blue Check, benefit-nya, dan cara activate/manage. CTA tidak misleading (jangan janji instan kalau prosesnya delay).

#### Components Used

- `PageHeader` — "Blue Check" + back
- `AccountStatusCard` — Status display
- `InfoRow` — Benefits list, expiry info
- `PrimaryButton`, `SecondaryButton` — Activate, Manage, Renew
- `Skeleton`, `InlineError`

#### Primary Actions

**Activate Blue Check** (INACTIVE state):

- **Label**: "Activate Blue Check"
- **Trigger**: User tap activate button
- **Flow**: Navigate to activation flow (payment/verification process)
  - **Assumption**: Flow adalah external (payment gateway atau KYC form). Setelah complete, user kembali ke status screen dengan status updated.

**Renew Blue Check** (ACTIVE but expiring):

- **Label**: "Renew Blue Check"
- **Trigger**: User tap renew button
- **Flow**: Navigate to renewal flow (similar to activation)

**Manage Blue Check** (ACTIVE):

- **Label**: "Manage"
- **Trigger**: User tap manage button
- **Flow**: Navigate to management screen (view benefits, expiry, settings)
  - **Assumption**: Management screen show detail benefits dan optional actions (e.g., cancel subscription jika recurring)

#### Secondary Actions

- Tap "Learn More" → Open education modal (benefit details)
- Tap "Back" → Navigate back to Profile

#### States

**Loading State**:

- Show `<Skeleton>` untuk status card + benefits section

**Error State**:

- **Message**: "Gagal memuat status Blue Check"
- **CTA**: "Coba Lagi"

**INACTIVE State**:

```
Status: Inactive
Icon: Lock/Badge outline (gray)
Message: "Aktifkan Blue Check untuk mendapatkan benefit eksklusif"
CTA: [Activate Blue Check] (Primary Button)
```

**ACTIVE State**:

```
Status: Active
Icon: Checkmark badge (blue)
Message: "Blue Check aktif"
Expiry Info: "Berlaku hingga: 31 Des 2026" (if applicable)
CTA: [Manage] (Secondary Button)
```

**PENDING State** (if processing exists):

```
Status: Pending
Icon: Clock (orange)
Message: "Aktivasi sedang diproses. Anda akan mendapat notifikasi setelah selesai."
Expected Time: "Estimasi: 1-3 hari kerja" (if available)
CTA: None (informational only)
```

**EXPIRING State** (Active but near expiry):

```
Status: Active (Expiring Soon)
Icon: Checkmark with warning (yellow)
Message: "Blue Check akan berakhir dalam 7 hari"
Expiry: "Berakhir: 20 Jan 2026"
CTA: [Renew Now] (Primary Button)
```

#### Benefits Section (Always Visible)

**Benefit List** (2-3 key benefits):

- ✓ Posting di Feed
- ✓ Claim Referral Rewards
- ✓ Priority Support (optional)

#### Layout Structure

```
┌─────────────────────────────────────────┐
│ ← Blue Check                            │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ [✓ Icon] Blue Check Active          │ │ ← Status Card
│ │                                     │ │
│ │ Berlaku hingga: 31 Des 2026         │ │
│ │                                     │ │
│ │ [      Manage      ]                │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Benefits                                │
│ ┌─────────────────────────────────────┐ │
│ │ ✓ Posting di Feed                   │ │
│ │ ✓ Claim Referral Rewards            │ │
│ │ ✓ Priority Support                  │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [Learn More]                            │ ← Link to education
└─────────────────────────────────────────┘
```

#### Analytics Events

| Event                           | Trigger          | Properties                                 |
| ------------------------------- | ---------------- | ------------------------------------------ |
| `blue_check_screen_viewed`      | Screen mount     | `status: inactive/active/pending/expiring` |
| `activate_blue_check_clicked`   | Tap "Activate"   | -                                          |
| `renew_blue_check_clicked`      | Tap "Renew"      | `days_until_expiry`                        |
| `manage_blue_check_clicked`     | Tap "Manage"     | -                                          |
| `blue_check_learn_more_clicked` | Tap "Learn More" | -                                          |

#### Acceptance Checklist

- [ ] User paham Blue Check benefit dalam 5 detik
- [ ] CTA tidak misleading (jika processing ada, show "Pending" state)
- [ ] ACTIVE state show expiry date clearly (if applicable)
- [ ] EXPIRING state show prominent CTA to renew
- [ ] Benefits list visible di semua state

---

### 5. KYC Status Viewer Screen

#### Goal

User dapat view KYC status dengan jelas, understand next steps, dan jika rejected, tidak frustrasi (ada reason + CTA resubmit).

#### Components Used

- `PageHeader` — "KYC Status" + back
- `AccountStatusCard` — Status display
- `InfoRow` — Submission date, verification date
- `PrimaryButton`, `SecondaryButton` — Start KYC, Resubmit, View Details
- `Skeleton`, `InlineError`
- `InfoBox` — Policy notice (subtle)

#### Primary Actions

**Start KYC** (NOT_STARTED state):

- **Label**: "Start KYC"
- **Trigger**: User tap button
- **Flow**: Navigate to KYC submission form/flow
  - **Assumption**: External KYC provider or internal form. After submit, status becomes PENDING.

**Resubmit KYC** (REJECTED state):

- **Label**: "Resubmit KYC"
- **Trigger**: User tap button
- **Flow**: Navigate to KYC form with pre-filled data (if available)
- **Guard**: Check if resubmit allowed
  - **Assumption**: Resubmit allowed. If not, button disabled + reason "Contact support"

#### Secondary Actions

- Tap "View Policy" → Open policy modal/link
- Tap "Contact Support" → Open support link/chat (if REJECTED)

#### States

**Loading State**:

- Show `<Skeleton>` untuk status card + info section

**Error State**:

- **Message**: "Gagal memuat status KYC"
- **CTA**: "Coba Lagi"

**NOT_STARTED State**:

```
Status: Not Started
Icon: Shield outline (gray)
Message: "Verifikasi identitas Anda untuk keamanan dan compliance"
Info: Short policy note (1 sentence)
CTA: [Start KYC] (Primary Button)
```

**PENDING State**:

```
Status: Pending Review
Icon: Clock (orange)
Message: "KYC sedang diproses oleh tim kami"
Submission Date: "Disubmit: 12 Jan 2026"
Estimated Time: "Estimasi: 1-3 hari kerja" (if available)
CTA: None (informational)
```

**VERIFIED State**:

```
Status: Verified
Icon: Shield check (green)
Message: "Identitas Anda telah diverifikasi"
Verification Date: "Diverifikasi: 14 Jan 2026"
CTA: None or [View Details] (Secondary)
```

**REJECTED State**:

```
Status: Rejected
Icon: Shield X (red)
Message: "KYC ditolak. Lihat alasan di bawah."
Rejection Reason: "[Reason from backend or generic]"
  Examples:
  - "Dokumen tidak jelas/terbaca"
  - "Data tidak sesuai"
  - "Dokumen expired"
Submission Date: "Disubmit: 12 Jan 2026"
CTA: [Resubmit KYC] (Primary) + [Contact Support] (Link)
```

#### Rejection Reason Display

**If Backend Provides Specific Codes**:

- Map codes to user-friendly messages
- Example mapping:
  ```
  DOCUMENT_UNCLEAR → "Foto dokumen tidak jelas. Upload foto yang lebih jelas."
  DATA_MISMATCH → "Data tidak sesuai dengan dokumen. Periksa kembali."
  DOCUMENT_EXPIRED → "Dokumen sudah expired. Upload dokumen yang masih berlaku."
  ```

**If Backend Only Provides Generic Fail**:

- Show: "KYC ditolak. Hubungi support untuk info lebih lanjut."
- CTA: "Contact Support" (prominent)

#### Layout Structure (REJECTED example)

```
┌─────────────────────────────────────────┐
│ ← KYC Status                            │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ [✗ Icon] KYC Rejected               │ │
│ │                                     │ │
│ │ Alasan:                             │ │
│ │ Dokumen tidak jelas/terbaca         │ │
│ │                                     │ │
│ │ Disubmit: 12 Jan 2026               │ │
│ │                                     │ │
│ │ [    Resubmit KYC    ]              │ │ ← Primary
│ └─────────────────────────────────────┘ │
│                                         │
│ Tips untuk KYC sukses:                  │
│ • Pastikan dokumen jelas dan terbaca    │
│ • Data sesuai dengan dokumen            │
│ • Gunakan dokumen yang masih berlaku    │
│                                         │
│ [Contact Support]                       │ ← Link
│ [View KYC Policy]                       │
└─────────────────────────────────────────┘
```

#### Policy Notice (InfoBox - Subtle)

```
ⓘ Data Anda aman. KYC diperlukan untuk
  keamanan dan compliance regulasi.
  [View Policy]
```

#### Analytics Events

| Event                  | Trigger               | Properties                                      |
| ---------------------- | --------------------- | ----------------------------------------------- |
| `kyc_screen_viewed`    | Screen mount          | `status: not_started/pending/verified/rejected` |
| `kyc_start_clicked`    | Tap "Start KYC"       | -                                               |
| `kyc_resubmit_clicked` | Tap "Resubmit"        | `rejection_reason`                              |
| `kyc_policy_viewed`    | Tap "View Policy"     | -                                               |
| `kyc_support_clicked`  | Tap "Contact Support" | `from_state: rejected`                          |

#### Acceptance Checklist

- [ ] NOT_STARTED show clear CTA + benefit context
- [ ] PENDING show estimate time (if available) untuk manage expectation
- [ ] VERIFIED show verification date untuk trust
- [ ] REJECTED show reason + actionable CTA (resubmit atau support)
- [ ] Policy notice visible untuk transparansi

---

### 6. Security & Sessions Screen (Minimal)

#### Goal

User dapat view active sessions/devices dan logout (current atau all) dengan confirm untuk destructive action.

**Note**: Jika backend belum support session listing, skip screen ini atau create placeholder "Coming Soon".

#### Components Used (If Supported)

- `PageHeader` — "Security & Sessions" + back
- `List` — Session items
- `SecondaryButton` — Logout current, Logout all
- `ConfirmModal` — Logout confirmation
- `Skeleton`, `EmptyState`, `InlineError`

#### Primary Actions

**Logout Current Session**:

- **Label**: "Logout"
- **Trigger**: User tap button
- **Flow**: Show confirm modal → API call → Redirect to login
- **Confirm**: "Anda akan logout dari sesi ini. Lanjutkan?"

**Logout All Sessions**:

- **Label**: "Logout All Devices"
- **Trigger**: User tap button
- **Flow**: Show confirm modal dengan warning → API call → Redirect to login
- **Confirm**: "⚠️ Anda akan logout dari SEMUA device. Lanjutkan?"

#### Secondary Actions

- Pull-to-refresh → Re-fetch session list

#### States

**Loading State**:

- Show `<Skeleton>` untuk session list

**Empty State** (1 Session Only - Current):

- **Message**: "Hanya ada 1 sesi aktif (saat ini)"
- **Info**: No other devices logged in

**Error State**:

- **Message**: "Gagal memuat daftar sesi"
- **CTA**: "Coba Lagi"

**Success**:

- List of sessions with current session highlighted

#### Session Item Spec (Optional Detail Level)

- **Device**: "Desktop - Chrome" or "Mobile - iOS" (if available)
- **Location**: "Jakarta, Indonesia" (if available, optional)
- **Last Active**: "Active now" or "2 hours ago"
- **Current Tag**: Badge "Current Session" (on current device)

#### Layout Structure

```
┌─────────────────────────────────────────┐
│ ← Security & Sessions                   │
├─────────────────────────────────────────┤
│ Active Sessions                         │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Desktop - Chrome                    │ │
│ │ [CURRENT SESSION]                   │ │ ← Current device
│ │ Active now                          │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ Mobile - iOS                        │ │
│ │ Last active: 2 hours ago            │ │
│ └─────────────────────────────────────┘ │
│                                         │
├─────────────────────────────────────────┤
│ [   Logout Current Session   ]          │ ← Secondary Button
│ [   Logout All Devices   ]              │ ← Secondary Button (Red)
└─────────────────────────────────────────┘
```

#### Logout All Confirm Modal

```
┌─────────────────────────────────────────┐
│ Logout All Devices           [X]        │
├─────────────────────────────────────────┤
│ ⚠️ Anda akan logout dari SEMUA device   │
│ yang terhubung, termasuk sesi ini.      │
│                                         │
│ Anda perlu login kembali di semua       │
│ device.                                 │
│                                         │
├─────────────────────────────────────────┤
│ [Batal]              [Logout All]       │ ← Red/Warning color
└─────────────────────────────────────────┘
```

#### Analytics Events

| Event                    | Trigger          | Properties      |
| ------------------------ | ---------------- | --------------- |
| `sessions_viewed`        | Screen mount     | `session_count` |
| `logout_current_clicked` | Tap "Logout"     | -               |
| `logout_all_clicked`     | Tap "Logout All" | `session_count` |
| `logout_all_confirmed`   | Confirm in modal | -               |

#### Acceptance Checklist (If Implemented)

- [ ] Current session clearly marked
- [ ] Logout all show warning + confirm modal
- [ ] Destructive action always confirmed
- [ ] Post-logout redirect to login correctly

#### Placeholder (If Not Implemented)

```
┌─────────────────────────────────────────┐
│ ← Security & Sessions                   │
├─────────────────────────────────────────┤
│                                         │
│ [Lock Icon]                             │
│                                         │
│ Session Management Coming Soon          │
│                                         │
│ Fitur ini sedang dalam pengembangan.    │
│                                         │
│ [   Kembali   ]                         │
└─────────────────────────────────────────┘
```

---

### 7. Settings Screen (Basic)

#### Goal

User dapat akses basic preferences (notifications, language) dan links penting (terms, privacy, help).

#### Components Used

- `PageHeader` — "Settings" + back
- `List` — Settings items
- `Toggle` — On/off switches (notifications)
- `Dropdown` (optional) — Language selector

#### Primary Actions

**Toggle Notifications**:

- **Label**: "Push Notifications"
- **Trigger**: User toggle switch
- **Flow**: Update preference → API call (background) → Toast confirm

**Change Language** (Optional):

- **Label**: "Language"
- **Trigger**: User tap → Select from dropdown/modal
- **Flow**: Update preference → Reload app/refresh
- **Assumption**: If not ready, skip atau show "Coming Soon"

#### Secondary Actions

- Tap "Terms of Service" → Open link/webview
- Tap "Privacy Policy" → Open link/webview
- Tap "Help & Support" → Open support link/chat
- Tap "About" → Show app version + info

#### Layout Structure

```
┌─────────────────────────────────────────┐
│ ← Settings                              │
├─────────────────────────────────────────┤
│ Preferences                             │
│ ┌─────────────────────────────────────┐ │
│ │ Push Notifications       [Toggle]   │ │
│ │ Email Notifications      [Toggle]   │ │ ← Optional
│ │ Language                 English  →  │ │ ← Optional
│ └─────────────────────────────────────┘ │
│                                         │
│ About                                   │
│ ┌─────────────────────────────────────┐ │
│ │ Terms of Service              →     │ │
│ │ Privacy Policy                →     │ │
│ │ Help & Support                →     │ │
│ │ About                         →     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Version 1.0.0                           │ ← App version (footer)
└─────────────────────────────────────────┘
```

#### About Modal (Optional)

```
┌─────────────────────────────────────────┐
│ About                        [X]        │
├─────────────────────────────────────────┤
│ [App Logo]                              │
│                                         │
│ SELSIPAD v1.0.0                         │
│                                         │
│ Built with ❤️ for the community         │
│                                         │
│ © 2026 SELSIPAD. All rights reserved.  │
│                                         │
│ [   Close   ]                           │
└─────────────────────────────────────────┘
```

#### Analytics Events

| Event                  | Trigger         | Properties            |
| ---------------------- | --------------- | --------------------- |
| `settings_viewed`      | Screen mount    | -                     |
| `notification_toggled` | Toggle switch   | `enabled: true/false` |
| `language_changed`     | Change language | `language: en/id`     |
| `terms_clicked`        | Tap "Terms"     | -                     |
| `privacy_clicked`      | Tap "Privacy"   | -                     |
| `support_clicked`      | Tap "Help"      | -                     |

#### Acceptance Checklist

- [ ] Settings tidak ramai (focus essentials)
- [ ] Toggle show immediate feedback (optimistic update + toast)
- [ ] Terms/Privacy links working
- [ ] App version visible di footer

---

## B. Component Specs Tambahan

### B.1 AccountStatusCard

**Props**:

```typescript
interface AccountStatusCardProps {
  type: 'blue_check' | 'kyc';
  status: 'active' | 'inactive' | 'pending' | 'verified' | 'rejected' | 'not_started';
  expiryDate?: Date; // For Blue Check
  verificationDate?: Date; // For KYC
  rejectionReason?: string; // For KYC rejected
  onCTAClick: () => void;
}
```

**Visual Variants**:

- **Blue Check Active**: Blue checkmark icon, "Active" (green text), "Manage" CTA
- **Blue Check Inactive**: Gray badge outline, "Inactive" (gray text), "Activate" CTA
- **KYC Verified**: Green shield check, "Verified", "View" CTA
- **KYC Pending**: Orange clock, "Pending Review", no CTA
- **KYC Rejected**: Red shield X, "Rejected", "Resubmit" CTA
- **KYC Not Started**: Gray shield outline, "Not Started", "Start KYC" CTA

---

### B.2 WalletItemRow

**Props**:

```typescript
interface WalletItemRowProps {
  wallet: {
    address: string;
    network: 'EVM' | 'SOL' | string;
    isPrimary: boolean;
  };
  onActionMenuClick: () => void;
}
```

**Visual**:

- **Network Badge**: Small chip dengan color per network (EVM=purple, SOL=gradient)
- **Address**: Monospace font, shortened (0x1234...5678)
- **Primary Tag**: Small badge "PRIMARY" jika `isPrimary=true`
- **Action Menu Icon**: Kebab (⋮) di kanan

---

### B.3 PrimaryTag

**Props**:

```typescript
interface PrimaryTagProps {
  label?: string; // Default "PRIMARY"
}
```

**Visual**:

- Small badge, `bg-primary-100`, `text-primary-700`, `rounded-full`, `px-2 py-0.5`
- Font: `text-xs`, `font-medium`, `uppercase`

---

### B.4 ActionMenu

**Props**:

```typescript
interface ActionMenuProps {
  options: Array<{
    label: string;
    disabled?: boolean;
    destructive?: boolean;
    tooltip?: string; // For disabled items
    onClick: () => void;
  }>;
}
```

**Visual**:

- Dropdown/popover dari kebab icon
- List items dengan hover state
- Destructive items: Red text
- Disabled items: Grayed out + tooltip on hover

---

## C. Assumptions Made (Safe Defaults)

1. **Primary Wallet Usage**: Asumsi primary wallet digunakan untuk claim rewards dan transaksi default. Jika usage berbeda, update copy di confirm modal.

2. **Wallet Sign Message**: Asumsi wallet linking hanya perlu connection (tidak perlu sign message SIWE-style). Jika perlu, tambahkan step "Sign to verify" di Add Wallet flow.

3. **Minimum Wallet Count**: Asumsi user boleh unlink semua wallet (tidak ada min=1 requirement). Jika ada min requirement, update guard: "Cannot remove last wallet".

4. **Blue Check Flow**: Asumsi activation flow adalah external (payment/checkout gateway). Setelah complete, user kembali dengan status updated. Jika flow internal, perlu spec lengkap payment screen.

5. **Blue Check Expiry**: Asumsi Blue Check bisa ada expiry (renewable). Jika one-time purchase (no expiry), skip expiry logic dan EXPIRING state.

6. **KYC Resubmit**: Asumsi user boleh resubmit setelah rejected tanpa batasan. Jika ada cooldown/limit, tambahkan guard di Resubmit button.

7. **KYC Reason Codes**: Asumsi backend bisa provide specific reason codes (DOCUMENT_UNCLEAR, etc). Jika hanya generic fail, fallback ke "Contact Support" CTA.

8. **Session Management**: Asumsi backend support session listing. Jika belum, create placeholder "Coming Soon" screen atau skip entirely.

---

## D. Global UX Rules Applied

1. **Primary Wallet Prominence**: Primary wallet selalu di top list, punya tag jelas, dan di-highlight di profile overview.

2. **Destructive Action Guards**: Remove wallet (jika primary), Logout all → wajib confirm modal + warning.

3. **Guard Disable + Reason**: Remove primary wallet → button disabled dengan tooltip/reason "Set primary wallet lain dulu".

4. **Status Display Pattern**: Blue Check & KYC → always show: Icon + Status chip + 1-sentence message + CTA.

5. **No User Trap**: Semua sub-screens punya back button ke Profile. Jangan ada dead-end.

6. **Error Retry**: Semua error states punya "Coba Lagi" CTA yang jelas.

---

## Definition of Done Phase 4 ✅

Phase 4 complete jika:

- [x] Profile overview dengan Blue Check + KYC status cards
- [x] Wallet management (list, add, set primary, remove dengan guard)
- [x] Add wallet flow dengan error handling
- [x] Blue Check status screen (4 states: inactive/active/pending/expiring)
- [x] KYC status viewer (4 states: not_started/pending/verified/rejected)
- [x] Security/Sessions screen (atau placeholder jika belum ready)
- [x] Settings screen (basic preferences + links)
- [x] Component specs (AccountStatusCard, WalletItemRow, PrimaryTag, ActionMenu)
- [x] Semua screens punya loading/empty/error states
- [x] Destructive actions punya confirm modal + guard rules
- [x] Analytics events defined

**Handoff Ready**: Dokumen siap untuk FE implementation. Visual design dari Gemini dan edge case review dari Opus akan follow.

---

## Open Questions (Documented)

1. **Wallet Linking**: Sign message (SIWE) required atau connection only? → **Assumption**: Connection only
2. **Min Wallet Count**: Boleh unlink semua wallet atau min=1? → **Assumption**: Boleh unlink semua
3. **Primary Wallet Usage**: Dipakai untuk apa saja (claim/rewards/posting)? → **Assumption**: Claim + default tx
4. **Blue Check Flow**: On-chain payment atau off-chain checkout? → **Assumption**: Off-chain checkout (external)
5. **Blue Check Expiry**: Ada expiry/renew atau one-time purchase? → **Assumption**: Ada expiry dengan renew
6. **KYC Resubmit**: Bisa resubmit setelah rejected tanpa limit? → **Assumption**: Boleh resubmit
7. **KYC Reason Codes**: Backend provide specific codes atau generic? → **Assumption**: Specific codes available
8. **Session Management**: Backend support session listing? → **Assumption**: Support (atau skip dengan placeholder)
