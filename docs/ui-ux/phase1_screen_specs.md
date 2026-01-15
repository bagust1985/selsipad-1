# Phase 1 — P0 Money Flows: Screen Specifications

## A. Screen Specs

### 1. Home Screen

#### Goal

User bisa cepat discover project trending, featured, dan langsung akses ke Project Detail atau Explore untuk browse lebih lanjut.

#### Components Used

- `BottomNav` — Tab navigasi utama
- `ProjectCard` (expanded variant) — Featured projects
- `ProjectCard` (compact variant) — Trending list
- `StatusBadge` — Sale status per project
- `Skeleton` — Loading states
- `EmptyState` — Jika tidak ada data

#### Primary Action

- **Label**: Tap ProjectCard
- **Trigger**: User tap card di trending/featured
- **Flow**: Navigate ke `/project/:projectId`

#### Secondary Actions

- Tap "Lihat Semua" (Trending) → Navigate ke `/explore?sort=trending`
- Tap "Jelajahi Project" → Navigate ke `/explore`
- Tap Bottom Nav tabs → Navigate ke tab lain

#### States

**Loading State**:

- Show `<Skeleton>` untuk 3-5 ProjectCard (match layout real cards)
- Trending Section: skeleton row horizontal cards
- Featured Section: skeleton 1-2 expanded cards

**Empty State** (Trending section kosong):

- **Condition**: API return 0 projects
- **Message**: "Belum ada project trending"
- **CTA**: `<PrimaryButton>` "Jelajahi Project" → `/explore`

**Error State**:

- **Type**: Network error / API fail
- **Component**: `<InlineError>` di dalam section
- **Message**: "Gagal memuat trending projects"
- **CTA**: "Coba Lagi" (retry fetch)

#### Layout Structure

```
[Page Header] — Logo (kiri), Wallet Status (kanan/icon)

[Section: Trending Projects]
  Header: "🔥 Trending" | "Lihat Semua >"
  <Horizontal Scroll Row>
    <ProjectCard variant="compact" /> × 10
  </Horizontal Scroll>

[Section: Featured/Recommended]
  Header: "Featured Projects"
  <ProjectCard variant="expanded" /> × 2-3

[Section: Quick Actions (Optional)]
  Grid 2×1:
    [Button] "Jelajahi Semua Project"
    [Button] "Lihat Portfolio"

[BottomNav active="home"]
```

#### Analytics Events

| Event                   | Trigger                     | Properties           |
| ----------------------- | --------------------------- | -------------------- |
| `home_viewed`           | Screen mount                | -                    |
| `trending_card_clicked` | Tap projektCard di Trending | `project_id`, `rank` |
| `featured_card_clicked` | Tap card di Featured        | `project_id`         |
| `explore_cta_clicked`   | Tap "Jelajahi"              | `source: home`       |

#### Acceptance Checklist

- [ ] Home memuat trending list dengan loading skeleton
- [ ] Empty state muncul jika 0 projects
- [ ] Tap card navigate ke Project Detail
- [ ] Tap "Lihat Semua" navigate ke Explore dengan filter/sort
- [ ] Error state punya retry

---

### 2. Explore Screen

#### Goal

User bisa search, filter (network/status/type), dan sort project list untuk menemukan project yang sesuai.

#### Components Used

- `PageHeader` — Header dengan search
- `ProjectCard` (compact) — List results
- `StatusBadge` — Status per card
- `Skeleton`, `EmptyState`, `InlineError`

#### Primary Action

- **Label**: Tap ProjectCard
- **Trigger**: User tap card di list hasil filter
- **Flow**: Navigate ke `/project/:projectId`

#### Secondary Actions

- Input search query → debounce 500ms → fetch filtered
- Tap "Filter" button → open Filter Modal/Sheet
- Tap "Sort" dropdown → change sort order
- Tap "Reset Filter" (jika filtered) → reset state

#### States

**Loading State**:

- Skeleton untuk 5-10 `<ProjectCard variant="compact">`

**Empty State (No Results)**:

- **Condition**: Filter applied + 0 results
- **Message**: "Tidak ditemukan project yang sesuai"
- **CTA**: `<SecondaryButton>` "Reset Filter"

**Empty State (No Projects at All)**:

- **Condition**: DB kosong
- **Message**: "Belum ada project tersedia"
- **CTA**: Tidak ada (informational only)

**Error State**:

- Network/API error → `<InlineError>` + "Coba Lagi"

#### Filter Spec

**Filter Modal/Sheet** (Bottom sheet mobile, Modal desktop):

- **Network**: Checkbox multiselect (EVM, Solana)
- **Status**: Checkbox (UPCOMING, LIVE, ENDED)
- **Type**: Radio (All, Presale, Fairlaunch)
- **Verified**: Toggle (KYC/SC Scan verified only)
- Buttons: "Reset" | "Apply Filter"

**Sort Options** (Dropdown):

- Trending (default)
- Newest
- Ending Soon (sale end date ASC)

**Filter Persistence**:

- Save to sessionStorage or URL params
- Persist during session, reset on app close/logout

#### Layout Structure

```
[PageHeader]
  Search Input (left), Filter Icon (right)

[Active Filter Pills Row] (if any)
  [Pill] "LIVE" ×  |  [Pill] "EVM" ×  |  [Reset]

[Sort Dropdown]
  "Sort: Trending ▾"

[Project List]
  <ProjectCard variant="compact" /> × N

[BottomNav active="explore"]
```

#### Analytics Events

| Event                    | Trigger                     | Properties                         |
| ------------------------ | --------------------------- | ---------------------------------- |
| `explore_viewed`         | Screen mount                | -                                  |
| `search_query_submitted` | User type + debounce        | `query`                            |
| `filter_applied`         | Tap "Apply" di filter modal | `filters: {network, status, type}` |
| `sort_changed`           | Select sort option          | `sort_by`                          |
| `explore_card_clicked`   | Tap card                    | `project_id`                       |

#### Acceptance Checklist

- [ ] Search dengan debounce 500ms
- [ ] Filter modal apply → update list
- [ ] Filter state persist selama session
- [ ] Empty result → show reset filter CTA
- [ ] Sort change → re-fetch

---

### 3. Project Detail Screen

#### Goal

Single source screen untuk semua info project: overview, participate, safety, timeline. User bisa langsung participate dari tab Participation.

#### Components Used

- `PageHead` — Back + Title + Share
- `Tabs` — Horizontal tabs (sticky)
- `StatusBadge`, `InfoRow`, `TimelineStepper`, `SafetyCard`, `Countdown`
- `PrimaryButton`, `GatingNotice`

#### Primary Action (Tab Participation LIVE)

- **Label**: "Beli" / "Ikut Presale"
- **Trigger**: Status LIVE + wallet connected
- **Flow**: Trigger Participate Flow (inline atau navigate `/participate/:roundId`)

#### Secondary Actions

- Tap Tab → change tab content
- Tap "Lihat Detail KYC/Audit" → Navigate atau modal detail
- Tap "Share" → Open share sheet

#### Tab Spec

**Tab: Overview** (Default)

- Sale Status + Countdown (jika LIVE/UPCOMING)
- Progress Bar (Raised / Target)
- Description (2-3 paragraphs, "Read More" untuk expand)
- Key Highlights (bulletpoint)

**Tab: Participation**

- Embed Presale/Fairlaunch widget (sesuai project type)
- Lihat spec WP4/WP5 untuk detail internal widget

**Tab: Tokenomics**

- `<InfoRow>` grid:
  - Total Supply
  - Presale Rate / Listing Rate
  - Liquidity %
  - Vesting Summary

**Tab: Timeline**

- `<TimelineStepper orientation="vertical">`
- Steps: UPCOMING → LIVE → ENDED → FINALIZING → SUCCESS/FAILED
- Show timestamps per step

**Tab: Safety**

- `<SafetyCard>` × 4:
  - KYC Status (VERIFIED/PENDING/NOT_SUBMITTED)
  - SC Scan (PASS/WARNING/FAILED)
  - LP Lock (LOCKED/PENDING/NOT_LOCKED)
  - Vesting (ACTIVE/N_A)

**Tab: Updates** (Phase 1 read-only)

- List update posts (title + timestamp + excerpt)
- Tap → expand detail (inline atau modal)

#### States (Per Tab)

**Loading**: `<Skeleton>` match layout tab aktif

**Error**: `<InlineError>` di dalam tab content

**Tab Participation — Gating**:

- Wallet not connected → `<GatingNotice>` "Hubungkan wallet" + CTA "Hubungkan"
- Sale UPCOMING → CTA disabled + reason "Penjualan dimulai [date]"
- Sale ENDED → show "Menunggu finalisasi" atau navigate Portfolio

#### Layout Structure

```
[PageHeader] ← Back | "Project Detail" | Share

[Header Section]
  [Logo 64px] [Name] [StatusBadge: LIVE]
  [Badges Row] [KYC✓] [Audit✓] [EVM]

[Tabs Sticky]
  [OVERVIEW] [PARTICIPATION] [TOKENOMICS] [TIMELINE] [SAFETY] [UPDATES]

[Tab Content Area]
  ... (sesuai tab aktif)

[Bottom Fixed Bar] (hanya muncul jika tab Participation + LIVE)
  <PrimaryButton> "Beli" (full width)
```

#### Analytics Events

| Event                     | Trigger            | Properties                         |
| ------------------------- | ------------------ | ---------------------------------- |
| `project_detail_viewed`   | Screen mount       | `project_id`, `tab`                |
| `tab_changed`             | User tap tab       | `from_tab`, `to_tab`               |
| `participate_cta_clicked` | Tap "Beli"         | project_id`                        |
| `safety_card_clicked`     | Tap SafetyCard CTA | `card_type` (KYC/Audit/LP/Vesting) |

#### Acceptance Checklist

- [ ] Semua tab load dengan skeleton
- [ ] Tab Participation embed widget sesuai type (Presale/Fairlaunch)
- [ ] Gating notice muncul jika wallet not connected
- [ ] Safety tab tampilkan 4 cards selalu (meski N/A)
- [ ] Timeline stepper update real-time sesuai status

---

### 4. Participation: Presale Flow

#### Goal

User bisa input amount, confirm, sign tx, dan track status participation hingga finalize (success claim atau failed refund).

#### Components Used

- `AmountInput`, `InfoRow`, `ConfirmModal`, `TxBanner`, `TxToast`, `PrimaryButton`, `SecondaryButton`, `GatingNotice`

#### Primary Action (LIVE)

- **Label**: "Beli"
- **Trigger**: Status LIVE + amount valid + wallet connected
- **Flow**: Transaction Pattern Phase 0

#### Secondary Actions

- Input amount change → validate + update preview
- Tap "Max" → set to user balance or max allocation
- Tap "Batal" (di modal confirm) → dismiss modal

#### Transaction Flow (Phase 0 Pattern + Blocker Fixes)

```
Step 0: CTA Ready
  Widget state: input enabled, button "Beli"
  Idempotency: Generate unique attempt_id (UUID v4)
  ↓ (User tap "Beli")

Step 1: Confirm Modal Open
  <ConfirmModal>
    title: "Konfirmasi Pembelian"
    description: "Anda akan membeli [X] TOKEN dengan [Y] SOL"
    amount: "[Y] SOL"
    fee: "~0.001 SOL"
    warnings: ["Token akan di-vesting 6 bulan"] (jika ada)
    onConfirm: trigger Step 1.5
  </ConfirmModal>
  ↓ (User tap "Konfirmasi")

Step 1.5: Pre-Sign Validation ⚠️ NEW (FIX B3)
  Actions:
    1. Disable "Konfirmasi" button + show inline spinner
    2. Re-fetch user balance from wallet provider
    3. Re-validate: balance >= (amount + estimated_gas)

  IF validation PASS:
    ↓ Proceed to Step 2

  IF validation FAIL:
    - Show inline error in modal (red text):
      "Saldo tidak mencukupi. Dibutuhkan [X] SOL (termasuk gas)"
    - Re-enable "Konfirmasi" button
    - User can adjust amount or cancel
    - DO NOT proceed to wallet sign
  ↓ (Validation passed)

Step 2: Awaiting Signature
  State: TX_AWAITING_SIGNATURE
  Client Lock: Set processing=true, disable all inputs ⚠️ (FIX B1)
  Cooldown Timer: Start 3000ms lock (prevent rapid re-tap)

  <TxBanner state="awaiting">
    "Menunggu tanda tangan di wallet..."
  </TxBanner>

  Trigger: wallet.signTransaction(tx, attempt_id)
  CTA "Batal" disabled (wallet popup active)
  ↓ (User sign di wallet)

Step 3: Submitted
  State: TX_SUBMITTED
  Send to backend with attempt_id (idempotency key) ⚠️ (FIX B1)

  <TxBanner state="submitted">
    "Transaksi terkirim"
    [TX Hash Link]
    CTA "Lihat di Portfolio"
  </TxBanner>

  AmountInput disabled, Button "Beli" hidden
  Maintain processing=true (prevent duplicate)
  ↓ (Blockchain confirm)

Step 4A: Confirmed Success
  <TxToast variant="success">
    "Pembelian berhasil! ✓"
  </TxToast>
  Auto-dismiss 5s atau manual "Tutup"
  Widget update: show receipt panel
  Release lock: processing=false

Step 4B: Failed
  <TxBanner state="failed">
    <InlineError>
      "Transaksi gagal. [Reason]"
      CTA "Coba Lagi"
    </InlineError>
  </TxBanner>
  Release lock: processing=false + clear attempt_id
  Generate new attempt_id for retry
  Reset ke Step 0
```

**Idempotency Mechanism (FIX B1)**:

- `attempt_id`: UUID v4 generated on Step 0, sent with every backend call
- `processing` state: Boolean lock, prevents button tap during TX flow
- `cooldown`: 3000ms timer, prevents rapid bypass (even if state update delayed)
- Backend: Reject duplicate `attempt_id` within 10min window

#### Presale Widget States (Status-Driven)

**UPCOMING**:

- Show `<Countdown>` ke sale start
- `<PrimaryButton disabled>` + reason "Penjualan dimulai [date]"

**LIVE**:

- `<AmountInput>` enabled
- Preview panel: "Anda akan terima [X] TOKEN"
- `<PrimaryButton>` "Beli" (enabled jika valid)

**ENDED**:

- Input disabled
- Info panel: "Penjualan berakhir. Menunggu finalisasi..."
- CTA hidden atau "Lihat di Portfolio"

**FINALIZING**:

- Info panel: `<InfoRow>` "Status: Finalisasi sedang diproses"
- No CTA

**SUCCESS** (FIX B2 - Clear Decision Tree):

- Info panel: "Penjualan berhasil! ✓"
- CTA Logic:

  ```
  IF project.vesting_enabled === true:
    <PrimaryButton> "Lihat Vesting"
    Action: Navigate to /vesting/:vestingId

  ELSE IF project.instant_claim === true:
    <PrimaryButton> "Klaim Sekarang"
    Action: Trigger direct claim transaction flow

  ELSE:
    Hide CTA button
    Display: "Token Anda tersedia. Cek di Portfolio"
    (User navigate via Portfolio tab)
  ```

**FAILED**:

- Info panel: "Penjualan gagal mencapai target"
- `<DangerButton>` "Klaim Refund"

#### Gating Rules

| Condition          | Not Met         | Action                                                 |
| ------------------ | --------------- | ------------------------------------------------------ |
| Wallet connected   | No              | `<GatingNotice>` "Hubungkan wallet" + CTA              |
| Primary wallet set | No (assumption) | `<GatingNotice>` Primary required + CTA "Atur Primary" |
| Amount >= min      | No              | Button disabled + reason "Minimum [X]"                 |
| Amount <= max      | No              | Button disabled + reason "Maksimum [X]"                |
| Balance sufficient | No              | Button disabled + reason "Saldo tidak cukup"           |

#### Layout (Widget Inside Tab Participation)

```
[Sale Info Panel]
  Progress: 850 / 1000 SOL (85%)
  [===========================    ]

[Amount Input Section]
  <AmountInput>
    label: "Jumlah SOL"
    helper: "Saldo: 2.5 SOL"  |  "MAX"
  </AmountInput>

[Preview Panel]
  <InfoRow> "Anda akan terima" | "10,000 TOKEN"
  <InfoRow> "Harga per token" | "0.0001 SOL"
  <InfoRow> "Fee network" | "~0.001 SOL"

[Warnings] (jika ada)
  ⚠ "Token akan di-vesting 6 bulan"

[CTA]
  <PrimaryButton full-width> "Beli"

[TxBanner] (muncul saat TX_SUBMITTED/CONFIRMED/FAILED)
```

#### Analytics Events

| Event                   | Trigger      | Properties              |
| ----------------------- | ------------ | ----------------------- |
| `presale_widget_viewed` | Widget mount | `project_id`, `status`  |
| `amount_input_changed`  | User input   | `amount`                |
| `buy_clicked`           | Tap "Beli"   | `project_id`, `amount`  |
| `tx_submitted`          | TX sent      | `project_id`, `tx_hash` |
| `tx_confirmed`          | TX success   | `project_id`, `tx_hash` |
| `tx_failed`             | TX fail      | `project_id`, `reason`  |

#### Acceptance Checklist

- [ ] Semua status (UPCOMING/LIVE/ENDED/SUCCESS/FAILED) punya UI distinct
- [ ] Transaction pattern Phase 0 (5 steps) implemented
- [ ] Double submit prevention (button lock)
- [ ] TxBanner persist selama TX_SUBMITTED
- [ ] Gating wallet connection + primary wallet
- [ ] Amount validation (min/max/balance)

---

### 5. Participation: Fairlaunch Flow

#### Goal

User bisa contribute di fairlaunch, dengan pemahaman "final price ditentukan di akhir". Flow identik dengan Presale tapi ada explanation panel.

#### Components Used

Sama dengan Presale: `AmountInput`, `ConfirmModal`, `TxBanner`, `TxToast`, etc.

#### Primary Action (LIVE)

- **Label**: "Kontribusi"
- **Trigger**: LIVE + amount valid + wallet connected
- **Flow**: Transaction Pattern Phase 0 (identik Presale)

#### Fairlaunch Widget States

**UPCOMING**: Sama dengan Presale

**LIVE**:

- `<AmountInput>` "Kontribusi SOL"
- **Explanation Panel** (distinct dari Presale):
  ```
  [Info Box]
  ℹ "Harga final token ditentukan setelah sale berakhir berdasarkan total kontribusi."
  "Estimasi alokasi: [X] TOKEN (bisa berubah)"
  ```
- `<PrimaryButton>` "Kontribusi"

**ENDED / FINALIZING / SUCCESS / FAILED**: Identik dengan Presale

#### Confirm Modal (Minor Difference)

```tsx
<ConfirmModal
  title="Konfirmasi Kontribusi Fairlaunch"
  description="Anda berkontribusi [Y] SOL. Alokasi token final akan ditentukan setelah sale berakhir."
  amount="[Y] SOL"
  warnings={["Harga final dapat berbeda dari estimasi"]}
  ...
/>
```

#### Layout

Sama dengan Presale, plus:

```
[Explanation Panel] (muncul di atas Amount Input)
  <InfoBox variant="info">
    "Fairlaunch: Harga final ditentukan di akhir"
  </InfoBox>
```

#### Analytics Events

Sama dengan Presale, tapi event prefix `fairlaunch_*`.

#### Acceptance Checklist

- [ ] Explanation panel muncul dan jelas
- [ ] Transaction flow identik dengan Presale
- [ ] ConfirmModal copy disesuaikan untuk fairlaunch
- [ ] Estimasi alokasi shown (jika backend provide)

---

### 6. Portfolio Screen

#### Goal

User bisa track semua participations (active/claimable/history) dan akses claim/refund dari sini.

#### Components Used

- `Tabs` (Active/Claimable/History)
- `ProjectCard` (compact, modified untuk portfolio item)
- `StatusBadge`, `PrimaryButton`, `SecondaryButton`, `EmptyState`, `Skeleton`

#### Primary Actions (Per Tab)

**Tab Active**:

- Tap Project Item → Navigate `/project/:projectId`

**Tab Claimable**:

- Tap "Claim" → Navigate `/vesting/:vestingId` atau trigger claim flow inline
- Tap "Refund" → Navigate refund screen

**Tab History**:

- Tap Item → Navigate detail (Project atau Vesting/Refund detail)

#### Tab Content

**Active** (Ongoing participations):

- List items: projects dengan status LIVE, ENDED, FINALIZING
- Item structure:
  ```
  [ProjectCard modified]
    [Logo] Project Name  [StatusBadge: FINALIZING]
    "Menunggu finalisasi..."
    [InfoRow] Kontribusi: 0.5 SOL
    [SecondaryButton] "Lihat Detail"
  ```

**Claimable** (Claim/Refund available):

- List items: projects dengan CLAIM_AVAILABLE atau REFUND_AVAILABLE
- Item structure:
  ```
  [ProjectCard modified]
    [Logo] Project Gamma  [StatusBadge: SUCCESS]
    "Vesting aktif. Next unlock: 12 Feb 2026"
    [InfoRow] Claimable: 1,000 TOKEN
    [PrimaryButton] "Claim"
  ```

**History** (Completed):

- List items: projects dengan CLAIMED, REFUNDED, atau finalized
- Item structure:
  ```
  [ProjectCard modified]
    [Logo] Project Delta  [StatusBadge: CLAIMED]
    "Claimed on 10 Jan 2026"
    [InfoRow] Total: 5,000 TOKEN
    [SecondaryButton] "Lihat Detail"
  ```

#### States

**Loading**: `<Skeleton>` untuk 3-5 list items per tab

**Empty State** (Per Tab):

- Active: "Belum ada investasi aktif" + CTA "Jelajahi Project"
- Claimable: "Tidak ada token yang bisa di-claim" (no CTA, informational)
- History: "Belum ada riwayat transaksi" + CTA "Jelajahi Project"

**Error**: `<InlineError>` + "Coba Lagi"

#### Layout Structure

```
[PageHeader] "Portfolio"

[Tabs]
  [ACTIVE] [CLAIMABLE] [HISTORY]

[Tab Content]
  <List>
    <PortfolioItem /> × N
  </List>

[BottomNav active="portfolio"]
```

#### Analytics Events

| Event                    | Trigger      | Properties                            |
| ------------------------ | ------------ | ------------------------------------- |
| `portfolio_viewed`       | Screen mount | `tab`                                 |
| `portfolio_tab_changed`  | Tap tab      | `from_tab`, `to_tab`                  |
| `portfolio_item_clicked` | Tap item     | `project_id`, `tab`, `action`         |
| `claim_clicked`          | Tap "Claim"  | `project_id`, `type` (vesting/refund) |

#### Acceptance Checklist

- [ ] 3 tabs implemented (Active/Claimable/History)
- [ ] Empty state per tab dengan CTA yang sesuai
- [ ] Claimable tab hanya show CLAIM_AVAILABLE/REFUND_AVAILABLE
- [ ] Tap item navigate ke detail yang relevan
- [ ] Status badge konsisten dengan Project Detail

---

### 7. Vesting Detail Screen

#### Goal

User bisa lihat vesting schedule, claimable amount, dan claim tokens yang unlocked.

#### Components Used

- `PageHeader`, `InfoRow`, `PrimaryButton`, `ConfirmModal`, `TxBanner`, `TxToast`, `Timeline`, `Skeleton`

#### Primary Action

- **Label**: "Claim"
- **Trigger**: Claimable > 0 + wallet connected
- **Flow**: Transaction Pattern Phase 0 (Confirm → Sign → Submitted → Confirmed)

#### Secondary Actions

- View claim history (expand/collapse list)
- Navigate back ke Portfolio

#### Layout Structure

```
[PageHeader] ← Back | "Vesting Detail"

[Summary Panel]
  <InfoRow> "Total Allocation" | "100,000 TOKEN"
  <InfoRow> "Claimed" | "30,000 TOKEN"
  <InfoRow> "Claimable Now" | "10,000 TOKEN" (highlight)
  <InfoRow> "Next Unlock" | "12 Feb 2026"

[Vesting Schedule] (Simple bars atau list)
  Timeline stepper or horizontal bars:
  [===25%===][===25%===][---25%---][---25%---]
  Jan 2026  | Feb 2026  | Mar 2026  | Apr 2026
  ✓ Claimed | ✓ Claimed | → Next   | Locked

[CTA]
  <PrimaryButton full-width> "Claim 10,000 TOKEN"
    (disabled jika claimable = 0, reason "Tidak ada token untuk di-claim")

[Claim History] (Expandable)
  "Riwayat Claim ▾"
  <List>
    <InfoRow> "10 Jan 2026" | "20,000 TOKEN" | [TX link]
    <InfoRow> "1 Jan 2026" | "10,000 TOKEN" | [TX link]
  </List>
```

#### States

**Loading**: `<Skeleton>` untuk summary + schedule

**Claimable = 0**:

- Button disabled + reason "Belum ada token yang bisa di-claim"

**TX States** (saat claim):

- Mengikuti Transaction Pattern Phase 0 identik dengan Participate

#### Gating Rules

| Condition        | Not Met | Action                   |
| ---------------- | ------- | ------------------------ |
| Claimable > 0    | No      | Button disabled + reason |
| Wallet connected | No      | `<GatingNotice>`         |

#### Analytics Events

| Event                    | Trigger            | Properties              |
| ------------------------ | ------------------ | ----------------------- |
| `vesting_detail_viewed`  | Screen mount       | `vesting_id`            |
| `claim_clicked`          | Tap "Claim"        | `vesting_id`, `amount`  |
| `claim_tx_submitted`     | TX sent            | `vesting_id`, `tx_hash` |
| `claim_history_expanded` | Tap expand history | -                       |

#### Acceptance Checklist

- [ ] Summary panel show total/claimed/claimable/next
- [ ] Vesting schedule visual (bars/stepper)
- [ ] Claim button disabled dengan reason jika claimable = 0
- [ ] Claim flow ikut Transaction Pattern Phase 0
- [ ] Claim history list dengan TX links

---

### 8. Refund Flow Screen

#### Goal

User bisa klaim refund untuk failed sale tanpa "disalahkan". Flow fokus ke aksi.

#### Components Used

- `PageHeader`, `InfoRow`, `DangerButton`, `ConfirmModal`, `TxBanner`, `TxToast`

#### Primary Action

- **Label**: "Klaim Refund"
- **Trigger**: Refund available + wallet connected
- **Flow**: Transaction Pattern Phase 0

#### Layout Structure

```
[PageHeader] ← Back | "Refund"

[Info Panel]
  <InfoBox variant="info">
    "Penjualan project [Name] gagal mencapai target."
  </InfoBox>

[Refund Summary]
  <InfoRow> "Kontribusi Anda" | "0.5 SOL"
  <InfoRow> "Fee Refund" | "~0.001 SOL"
  <InfoRow> "Total Refund" | "0.499 SOL"

[CTA]
  <DangerButton full-width> "Klaim Refund"

[Status] (setelah claimed)
  ✓ "Refund berhasil di-claim pada [date]"
  [TX Link]
```

#### States

**Already Claimed**:

- Button hidden
- Show status "Refund sudah di-claim"

**TX States**:

- Mengikuti Transaction Pattern Phase 0

#### Confirm Modal

```tsx
<ConfirmModal
  title="Konfirmasi Refund"
  description="Anda akan menerima refund 0.499 SOL"
  amount="0.499 SOL"
  confirmText="Klaim Refund"
  onConfirm={triggerRefundTx}
/>
```

#### Analytics Events

| Event                  | Trigger            | Properties              |
| ---------------------- | ------------------ | ----------------------- |
| `refund_screen_viewed` | Screen mount       | `project_id`            |
| `refund_clicked`       | Tap "Klaim Refund" | `project_id`, `amount`  |
| `refund_tx_confirmed`  | TX success         | `project_id`, `tx_hash` |

#### Acceptance Checklist

- [ ] Info panel tidak "menyalahkan" user
- [ ] Refund summary jelas (kontribusi - fee = refund)
- [ ] Button "Klaim Refund" trigger Transaction Pattern
- [ ] Status "already claimed" shown jika sudah
- [ ] Refund muncul di Portfolio History

---

### 9. LP Lock Detail Screen

#### Goal

User bisa verifikasi LP lock status, unlock date, dan lihat proof transaction sebagai trust surface.

#### Components Used

- `PageHeader`, `InfoRow`, `SafetyCard`, `SecondaryButton`, `Skeleton`

#### Primary Actions

- Tap "Lihat Proof di Explorer" → Open explorer link (new tab/browser)

#### Layout Structure

```
[PageHeader] ← Back | "LP Lock Detail"

[SafetyCard variant="detailed"]
  Icon: 🔒 Lock
  Status: LOCKED / PENDING / FAILED

  <InfoRow> "Lock Duration" | "12 bulan"
  <InfoRow> "Unlock Date" | "15 Jan 2027"
  <InfoRow> "Locked Amount" | "500 LP TOKEN"

  [SecondaryButton] "Lihat Proof di Explorer"
    (link: https://explorer.solana.com/tx/[hash])

[Explanation]
  <InfoBox>
    "LP lock memastikan likuiditas terkunci selama periode yang ditentukan untuk melindungi investor."
  </InfoBox>
```

#### States

**PENDING**:

- Status badge "PENDING"
- Info: "LP lock sedang diproses"
- Button "Lihat Proof" disabled + reason "Proof belum tersedia"

**LOCKED**:

- Status badge "LOCKED" (green)
- Show unlock date + proof link
- Button enabled

**FAILED**:

- Status badge "FAILED" (red)
- Info: "LP lock gagal. Cek updates atau hubungi support."
- Button hidden atau link ke support

**Loading**: `<Skeleton>` untuk SafetyCard

**Error**: `<InlineError>` + "Coba Lagi"

#### Analytics Events

| Event                   | Trigger           | Properties           |
| ----------------------- | ----------------- | -------------------- |
| `lp_lock_detail_viewed` | Screen mount      | `lock_id`, `status`  |
| `lp_proof_clicked`      | Tap "Lihat Proof" | `lock_id`, `tx_hash` |

#### Acceptance Checklist

- [ ] Status LOCKED/PENDING/FAILED distinct
- [ ] Unlock date shown jika LOCKED
- [ ] Proof link berfungsi (open explorer)
- [ ] PENDING state show "proof belum tersedia"
- [ ] Explanation panel muncul untuk edukasi

---

## B. Flow Maps

### Flow 1: Discover → Participate → Track

```
[User Entry: Home atau Explore]
  ↓
Browse Trending/Featured/Filtered Projects
  ↓
Tap <ProjectCard>
  ↓
────────────────────────────────────
[Project Detail Screen]
  ↓
Read Overview, Safety, Timeline tabs
  ↓
IF interested → Tap tab "Participation"
  ↓
────────────────────────────────────
[Participation Tab]
  ↓
IF Sale LIVE:
  ↓
Input Amount di <AmountInput>
  ↓
Tap <PrimaryButton> "Beli/Kontribusi"
  ↓
────────────────────────────────────
[Transaction Flow - Phase 0 Pattern]
  ↓
Step 1: <ConfirmModal> show
  → User review Amount + Fee + Warnings
  → Tap "Konfirmasi"
  ↓
Step 2: <TxBanner state="awaiting">
  → "Menunggu tanda tangan wallet..."
  → User sign di wallet app
  ↓
Step 3: <TxBanner state="submitted">
  → "Transaksi terkirim" + TX Hash Link
  → Show CTA "Lihat di Portfolio"
  ↓
Step 4A: <TxToast> "Berhasil!"
  → Auto-redirectNavigate Portfolio (optional)
  ↓
────────────────────────────────────
[Portfolio Screen]
  ↓
Tab "Active" show project (status LIVE/FINALIZING)
  ↓
User monitor finalize status
  ↓
IF SUCCESS → Move to "Claimable" tab
IF FAILED → Move to "Claimable" (refund)
```

---

### Flow 2: Participate → Finalize Outcome → Claim/Refund

```
[After TX Confirmed dari Flow 1]
  ↓
Project muncul di Portfolio → Tab "Active"
  ↓
User wait finalize (Status: FINALIZING)
  ↓
────────────────────────────────────
[Backend Finalize Job Completed]
  ↓
IF Sale SUCCESS:
  ↓
  Project update status → SUCCESS
  ↓
  Portfolio tab "Claimable" muncul item:
    "Project X - Vesting aktif"
    CTA "Claim" atau "Lihat Vesting"
  ↓
  ────────────────────────────────────
  [User Tap "Claim" atau navigate Vesting]
    ↓
  Navigate to Vesting Detail Screen
    ↓
  Review claimable amount
    ↓
  Tap <PrimaryButton> "Claim [X] TOKEN"
    ↓
  Transaction Pattern Phase 0 (Confirm/Sign/Submitted/Confirmed)
    ↓
  <TxToast> "Claim berhasil!"
    ↓
  Vesting Detail update: Claimed += amount
    ↓
  Portfolio "History" update dengan claim record

ELSE IF Sale FAILED:
  ↓
  Project update status → FAILED
  ↓
  Portfolio tab "Claimable" muncul item:
    "Project Y - Penjualan gagal"
    CTA "Klaim Refund"
  ↓
  ────────────────────────────────────
  [User Tap "Klaim Refund"]
    ↓
  Navigate to Refund Screen
    ↓
  Review refund amount (kontribusi - fee)
    ↓
  Tap <DangerButton> "Klaim Refund"
    ↓
  Transaction Pattern Phase 0 (Confirm/Sign/Submitted/Confirmed)
    ↓
  <TxToast> "Refund berhasil!"
    ↓
  Portfolio "History" update dengan refund record
```

---

### Flow 3: Portfolio → Vesting → Claim

```
[User Navigate to Portfolio]
  ↓
Tab "Claimable" show projects dengan vesting aktif
  ↓
Tap Project Item atau "Claim" button
  ↓
────────────────────────────────────
[Vesting Detail Screen]
  ↓
View Summary:
  - Total Allocation
  - Claimed
  - Claimable Now
  - Next Unlock Date
  ↓
View Vesting Schedule (bars/timeline)
  ↓
IF Claimable > 0:
  ↓
  Tap <PrimaryButton> "Claim [X] TOKEN"
    ↓
  ────────────────────────────────────
  [Transaction Flow - Phase 0 Pattern]
    ↓
  Step 1: <ConfirmModal>
    "Konfirmasi Claim [X] TOKEN"
    ↓
  Step 2: <TxBanner state="awaiting">
    "Menunggu signature..."
    ↓
  Step 3: <TxBanner state="submitted">
    "Transaksi terkirim" + TX Hash
    ↓
  Step 4A: <TxToast> "Claim berhasil!"
    ↓
  Vesting Detail update:
    - Claimed += [X]
    - Claimable = recalculate next unlock
    ↓
  Claim History append:
    "[Date] | [X] TOKEN | [TX Link]"
    ↓
  IF All claimed (Claimed = Total):
    → Portfolio move item ke "History" tab
  ELSE:
    → Portfolio "Claimable" tetap show (next unlock)

ELSE IF Claimable = 0:
  ↓
  Button "Claim" disabled + reason
  "Belum ada token untuk di-claim"
  "Next unlock: [Date]"
  ↓
  User wait next unlock atau exit
```

---

## C. Assumptions & Notes

**Assumptions Dibuat (Safe Defaults)**:

1. **Presale Success → Vesting**: Asumsi semua presale success masuk vesting (tidak ada instant claim). Jika ada instant, tambahkan condition di flow.
2. **Primary Wallet Required**: Asumsi partisipasi wajib primary wallet. Jika tidak wajib, hapus gating notice ini.
3. **Refund for All Failures**: Asumsi semua FAILED sale bisa refund. Jika ada kondisi tertentu (misal: soft cap reached tapi dibatalkan), tambahkan logic.
4. **Explorer Link Format**: Asumsi backend provide URL lengkap (FE hanya perlu open). Jika perlu construct manual, tambahkan helper di FE.
5. **LP Lock Status Immediate**: Asumsi status "LP_LOCK_PENDING" muncul segera setelah SUCCESS. Update ke LOCKED setelah job confirm.
6. **Updates Source**: Asumsi updates dari admin CMS (read-only list). Jika on-chain, perlu indexer integration.

**Global Rules Applied**:

- Semua transaction flow ikut Phase 0 Pattern (Confirm → Sign → Submitted → Confirmed/Failed).
- Semua button disabled punya DisabledReason tooltip.
- Semua list punya Skeleton → Data → EmptyState → Error.
- Semua status badge + 1 kalimat penjelasan.

---

## Definition of Done ✅

Phase 1 selesai jika:

- [x] 9 screen specs lengkap (goal, actions, components, states, gating, analytics, acceptance)
- [x] 3 flow maps untuk critical paths
- [x] Semua transaction flows ikut Phase 0 Pattern
- [x] Semua gating punya reason + CTA
- [x] Portfolio bisa track semua states (active/claimable/history)
- [x] Tidak ada dead-end (selalu ada CTA atau back navigation)

**Handoff Ready**: Dokumen ini bisa langsung dipakai FE untuk implementasi tanpa asumsi tambahan. Visual design dari Gemini Phase 0. QA dari Opus akan review edge cases.
