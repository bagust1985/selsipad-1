# Phase 0 — UX Foundation: Deliverables Pack

## A. Phase 0 Deliverables

### A.1 IA & Routes Spec

#### Sitemap & Tab Structure

**Tab Utama (Bottom Navigation)**

- **Home** — Landing, trending projects, quick actions
- **Explore** — Search, filter, browse all projects
- **Portfolio** — User's investments, claims, vesting
- **Feed** — Social feed (gated: read untuk semua, post untuk Blue Check)
- **Profile** — Account settings, wallet, verification status

**Detail Routes & Subroutes**

```
/
├── /home
├── /explore
│   └── ?filter=presale|fairlaunch|ended
│   └── ?chain=evm|solana
│   └── ?sort=trending|newest
├── /portfolio
│   ├── /portfolio/active
│   ├── /portfolio/claimable
│   └── /portfolio/history
├── /feed
│   └── /feed/post/:postId
├── /profile
│   ├── /profile/settings
│   ├── /profile/wallets
│   ├── /profile/kyc-status
│   └── /profile/blue-check
│
├── /project/:projectId
│   ├── ?tab=overview (default)
│   ├── ?tab=participation
│   ├── ?tab=tokenomics
│   ├── ?tab=timeline
│   ├── ?tab=safety
│   └── ?tab=updates
│
├── /participate/:roundId
│   ├── /participate/:roundId/presale
│   └── /participate/:roundId/fairlaunch
│
├── /vesting/:vestingId
│   └── /vesting/:vestingId/claim
│
├── /lp-lock/:lockId
│
└── /rewards
    ├── /rewards/referral
    └── /rewards/staking
```

#### Deep Link Rules

**Format**: `selsipad://resource/:id?params`

**Contoh**:

- `selsipad://project/abc123?tab=participation` → buka Project Detail tab Participation
- `selsipad://vesting/xyz789` → buka Vesting Detail
- `selsipad://rewards/referral` → buka Rewards Referral page

**Back Behavior**:

- Dari deep link langsung ke detail screen → back menuju **Home** (bukan exit app)
- Dari normal navigation → back ke layar sebelumnya dalam history stack
- Dari modal/bottom sheet → dismiss overlay, tetap di layar yang sama

#### Guard Rules (Route Protection)

| Route               | Condition                          | Jika Tidak Terpenuhi                                                                      |
| ------------------- | ---------------------------------- | ----------------------------------------------------------------------------------------- |
| `/feed` (composer)  | Blue Check ACTIVE                  | Show GatingNotice: "Verifikasi Blue Check untuk bisa posting" + CTA "Verifikasi Sekarang" |
| `/participate/*`    | Wallet connected                   | Redirect ke `/profile/wallets` dengan notice "Hubungkan wallet terlebih dahulu"           |
| `/vesting/*/claim`  | Vesting available                  | Disabled state dengan reason "Belum ada token yang bisa di-claim"                         |
| `/rewards/referral` | Blue Check ACTIVE + min 1 referral | Show eligibility card dengan progress indicator                                           |

#### User Journey Map (P0 Critical Path)

```
[Discover]
   ↓
Home/Explore → Lihat trending/featured projects
   ↓
[Select]
   ↓
Project Detail → Baca overview, safety, timeline
   ↓
[Participate]
   ↓
Participate Flow → Presale/Fairlaunch, input amount, confirm, sign tx
   ↓
[Track]
   ↓
Portfolio → Monitor status sale, lihat countdown finalize
   ↓
[Claim/Refund]
   ↓
IF SUCCESS → Vesting Detail → Claim schedule
IF FAILED → Refund screen → Klaim refund
   ↓
[Verify Safety]
   ↓
LP Lock Detail → Lihat proof lock, unlock date, tx hash
```

---

### A.2 Component Inventory + Component Spec v1

#### Daftar Komponen Inti

| Kategori                | Komponen        | Purpose                              | Dipakai Di                         |
| ----------------------- | --------------- | ------------------------------------ | ---------------------------------- |
| **Navigation & Layout** | BottomNav       | Tab navigasi utama                   | Semua screen utama                 |
|                         | PageHeader      | Header dengan title + back + actions | Semua detail screens               |
|                         | Tabs            | Tab horizontal (Project Detail)      | Project Detail, Portfolio          |
| **Data Display**        | ProjectCard     | Card project (compact & expanded)    | Home, Explore                      |
|                         | StatusBadge     | Tampilkan status dengan warna        | Project Detail, Portfolio, Cards   |
|                         | TimelineStepper | Progress timeline milestone          | Project Detail, Participate        |
|                         | SafetyCard      | Info KYC/Scan/LP/Vesting             | Project Detail (tab Safety)        |
|                         | InfoRow         | Label-value horizontal               | Detail screens semua               |
|                         | Countdown       | Timer countdown (sale end, unlock)   | Project Detail, Vesting            |
| **Forms & Actions**     | PrimaryButton   | CTA utama                            | Semua form, participate            |
|                         | SecondaryButton | CTA sekunder                         | Cancel, dismiss                    |
|                         | DangerButton    | Aksi berisiko                        | Refund claim                       |
|                         | AmountInput     | Input angka dengan max/min           | Participate, Claim                 |
|                         | ConfirmModal    | Modal 2-step konfirmasi              | Semua aksi money                   |
|                         | CheckboxConfirm | "I understand" checkbox              | Risk disclosure                    |
| **Feedback States**     | TxToast         | Toast info tx status                 | Post-transaction                   |
|                         | TxBanner        | Banner persisten tx status           | During & after tx                  |
|                         | Skeleton        | Loading placeholder                  | List load, detail load             |
|                         | EmptyState      | State kosong dengan CTA              | Empty list, no data                |
|                         | InlineError     | Error inline dengan retry            | Form errors, API fails             |
|                         | GatingNotice    | Notice syarat tidak terpenuhi        | Feed composer, restricted features |
|                         | DisabledReason  | Tooltip alasan CTA disabled          | Disabled buttons                   |

---

#### Component Spec Detail

##### `StatusBadge`

**Purpose**: Menampilkan status project/sale/transaction dengan semantic color

**Props**:

- `status` (required): string — Status code (LIVE, SUCCESS, FAILED, PENDING, dll)
- `variant` (optional): 'default' | 'compact' — Size variant
- `showIcon` (optional): boolean — Tampilkan icon atau tidak

**States**:

- Default: Full color badge dengan text
- Compact: Smaller badge untuk inline usage

**Semantic Mapping**:

```
LIVE → Green (#10B981)
SUCCESS → Green (#10B981)
UPCOMING → Blue (#3B82F6)
ENDED → Gray (#6B7280)
FINALIZING → Yellow (#F59E0B)
FAILED → Red (#EF4444)
PENDING → Yellow (#F59E0B)
```

**Do**:

- Gunakan untuk semua status indikator
- Pastikan contrast ratio min 4.5:1

**Don't**:

- Jangan pakai warna custom di luar mapping
- Jangan bergantung warna saja (selalu ada teks)

**Example Usage**:

```tsx
<StatusBadge status="LIVE" />
<StatusBadge status="SUCCESS" variant="compact" />
```

---

##### `ProjectCard`

**Purpose**: Card untuk menampilkan project di list (Home/Explore)

**Props**:

- `project` (required): Project object
- `variant` (optional): 'compact' | 'expanded' — Layout variant
- `onClick` (optional): callback — Handler klik card

**States**:

- Default: Hover dengan shadow elevation
- Loading: Skeleton placeholder
- Error: Fallback dengan retry

**Struktur Compact**:

- Logo (48x48)
- Name + Symbol
- Status badge
- Sale info (raised/target atau countdown)
- Chain badge (EVM/Solana)

**Struktur Expanded** (tambahan dari compact):

- Banner image (16:9)
- Description preview (2 lines)
- Safety indicators (KYC/Scan icons)
- Trending indicator (jika trending)

**Do**:

- Gunakan compact untuk grid/list padat
- Gunakan expanded untuk featured section
- Selalu tampilkan status

**Don't**:

- Jangan tampilkan data yang belum terverifikasi tanpa disclaimer
- Jangan sembunyikan status

**Example Usage**:

```tsx
<ProjectCard project={projectData} variant="compact" onClick={handleOpen} />
```

---

##### `TimelineStepper`

**Purpose**: Visualisasi progress milestone (linear timeline)

**Props**:

- `steps` (required): Array<Step> — List step dengan label, status, timestamp
- `orientation` (optional): 'vertical' | 'horizontal'
- `currentStep` (optional): number — Index step aktif

**States**:

- COMPLETED: Green check, line penuh
- ACTIVE: Highlight color, pulsing indicator
- UPCOMING: Gray, dotted line

**Do**:

- Gunakan untuk sale timeline (UPCOMING → LIVE → ENDED → FINALIZING → SUCCESS)
- Gunakan untuk vesting schedule
- Selalu tampilkan timestamp jika ada

**Don't**:

- Jangan skip step (harus linear)
- Jangan gunakan untuk navigasi (ini display-only)

**Example Usage**:

```tsx
<TimelineStepper steps={saleSteps} orientation="vertical" currentStep={2} />
```

---

##### `ConfirmModal`

**Purpose**: Modal 2-step confirmation untuk aksi financial

**Props**:

- `title` (required): string
- `description` (required): string
- `amount` (optional): string — Amount display
- `fee` (optional): string — Fee display
- `warnings` (optional): Array<string> — Warning messages
- `requireCheckbox` (optional): boolean — Butuh "I understand" checkbox
- `onConfirm` (required): callback
- `onCancel` (required): callback
- `confirmText` (optional): string — Override confirm button text
- `loading` (optional): boolean — Show loading state

**States**:

- Default: Show info + confirm button enabled
- RequireCheckbox: Confirm disabled until checkbox checked
- Loading: Button loading, prevent double submit
- Success: Auto close setelah confirmed
- Error: Show error inline, allow retry

**Do**:

- Gunakan untuk SEMUA aksi yang melibatkan uang (participate, claim, refund)
- Selalu tampilkan amount + fee jika ada
- Tampilkan warning jika ada risk (irreversible, vesting lock, dll)

**Don't**:

- Jangan skip modal ini untuk "cepet-cepet"
- Jangan simpan password/private key di props

**Example Usage**:

```tsx
<ConfirmModal
  title="Konfirmasi Partisipasi"
  description="Anda akan membeli 1000 TOKEN dengan 0.5 SOL"
  amount="0.5 SOL"
  fee="0.001 SOL"
  warnings={['Token akan di-vesting 6 bulan']}
  requireCheckbox={true}
  onConfirm={handleParticipate}
  onCancel={closeModal}
/>
```

---

##### `GatingNotice`

**Purpose**: Notice yang menjelaskan kenapa fitur tidak bisa diakses + CTA untuk fulfill requirement

**Props**:

- `reason` (required): string — Penjelasan 1 kalimat kenapa gated
- `ctaText` (required): string — Text CTA button
- `ctaAction` (required): callback — Handler CTA
- `variant` (optional): 'inline' | 'card' | 'banner'

**States**:

- Default: Show notice dengan CTA
- Dismissed: Hidden (jika dismissable)

**Do**:

- Gunakan di Feed composer (non-Blue Check)
- Gunakan di feature yang require wallet/verification
- Selalu berikan jalan keluar (CTA yang jelas)

**Don't**:

- Jangan pakai tone negatif ("Kamu tidak bisa...")
- Jangan sembunyikan requirement (harus transparan)

**Example Usage**:

```tsx
<GatingNotice
  reason="Verifikasi Blue Check diperlukan untuk posting"
  ctaText="Verifikasi Sekarang"
  ctaAction={() => navigate('/profile/blue-check')}
  variant="card"
/>
```

---

### A.3 Screen Spec Template

Template ini wajib dipakai untuk semua screen spec di Phase 1+.

```markdown
# [Screen Name]

## Goal

[1-2 kalimat: Apa yang user mau capai di screen ini]

## Actions

### Primary Action

- **Label**: [Teks CTA]
- **Trigger**: [Kondisi kapan muncul]
- **Flow**: [Kemana setelah aksi]

### Secondary Actions

- [List aksi sekunder jika ada]

## States

### Loading State

- [Tampilkan skeleton untuk elemen mana]
- [Estimasi durasi load]

### Empty State

- **Condition**: [Kapan muncul]
- **Message**: [Text empty state]
- **CTA**: [Aksi yang ditawarkan]

### Error State

- **Types**: [List error types yang mungkin]
- **Retry**: [Apakah ada retry? Bagaimana?]
- **Fallback**: [Alternatif jika error persist]

### Success State

- [Tampilan setelah aksi berhasil]

## Data Needed (API/State)

| Field Name | Source               | Required | Fallback if Missing |
| ---------- | -------------------- | -------- | ------------------- |
| [Field]    | [API endpoint/state] | Yes/No   | [Default/-]         |

## Gating Rules

| Feature   | Requirement | If Not Met     |
| --------- | ----------- | -------------- |
| [Feature] | [Condition] | [Notice + CTA] |

## Analytics Events

| Event Name | Trigger       | Properties     |
| ---------- | ------------- | -------------- |
| [Event]    | [User action] | [Data tracked] |

## Acceptance Checklist

- [ ] Semua states (loading/empty/error) implemented
- [ ] CTA disabled state punya reason tooltip
- [ ] Primary action punya confirmation jika money-related
- [ ] Deep link ke screen ini berfungsi
- [ ] Back navigation jelas
- [ ] Analytics event terimplementasi
```

---

### A.4 UX Pattern Wiring

#### Transaction Pattern (Semua Aksi Money)

**Applicable To**: Participate (Presale/Fairlaunch), Claim (Vesting/Refund), Stake, Unstake

**Flow Standard**:

```
Step 0: CTA Ready
  ↓
Step 1: Confirm Modal
  - Tampilkan: Amount, Fee, Warnings
  - Require: Checkbox "I understand" (untuk high-risk)
  - Action: "Konfirmasi"
  ↓
Step 2: Awaiting Signature
  - State: TX_AWAITING_SIGNATURE
  - Display: "Menunggu tanda tangan di wallet Anda..."
  - Action: "Batal" (jika user belum sign)
  ↓
Step 3: Submitted
  - State: TX_SUBMITTED
  - Display: TxBanner "Transaksi terkirim" + TX hash link
  - Action: "Lihat di Portfolio"
  ↓
Step 4A: Confirmed Success
  - State: TX_CONFIRMED
  - Display: TxToast success "Transaksi berhasil!" + summary
  - Action: "Tutup" atau auto-dismiss 5s
  ↓
Step 4B: Failed
  - State: TX_FAILED
  - Display: InlineError with reason + "Coba Lagi" button
  - Action: Reset ke Step 0
```

**Komponen Mapping**:

- Step 1 → `<ConfirmModal>`
- Step 2 → `<TxBanner state="awaiting">`
- Step 3 → `<TxBanner state="submitted" txHash={hash}>`
- Step 4A → `<TxToast variant="success">`
- Step 4B → `<InlineError retry={true}>`

**Layar Yang Wajib Pakai**:

- `/participate/:roundId/presale`
- `/participate/:roundId/fairlaunch`
- `/vesting/:vestingId/claim`
- `/rewards/referral` (claim)
- `/rewards/staking` (claim)

---

#### Gating Pattern (Restricted Feature Access)

**Applicable To**: Feed Composer, Rewards Claim, Verified-only Features

**Structure**:

```
IF (requirement NOT met):
  THEN show GatingNotice:
    - Reason: [1 kalimat kenapa tidak bisa]
    - CTA: [Aksi untuk memenuhi syarat]
    - Example: "Hubungkan wallet untuk berpartisipasi" + CTA "Hubungkan Wallet"
```

**Komponen**: `<GatingNotice>`

**Contoh Aplikasi**:

| Feature         | Requirement                 | Reason Text                                      | CTA Text                |
| --------------- | --------------------------- | ------------------------------------------------ | ----------------------- |
| Feed Composer   | Blue Check ACTIVE           | "Verifikasi Blue Check diperlukan untuk posting" | "Verifikasi Sekarang"   |
| Participate     | Wallet connected            | "Hubungkan wallet untuk berpartisipasi"          | "Hubungkan Wallet"      |
| Referral Claim  | Blue Check + min 1 referral | "Minimal 1 referral aktif diperlukan"            | "Bagikan Link Referral" |
| Rewards Staking | SBT ownership               | "SBT NFT diperlukan untuk staking"               | "Pelajari SBT"          |

---

#### Empty/Loading/Error States (Semua List/Detail Screen)

**Loading State**:

- **Gunakan**: `<Skeleton>` bukan spinner generik
- **Struktur**: Match struktur real content (card skeleton untuk card list, detail skeleton untuk detail screen)
- **Duration guidance**: Show skeleton min 300ms (avoid flash), max 5s before timeout

**Empty State**:

- **Struktur wajib**:
  - Icon/Illustration
  - Message (1 kalimat: "Belum ada [resource]")
  - CTA (Aksi yang bisa user lakukan)
- **Example**:
  - Portfolio kosong → "Belum ada investasi" + CTA "Jelajahi Project"
  - Feed kosong → "Belum ada post" + CTA "Refresh" (jangan paksa user posting)

**Error State**:

- **Types**:
  - Network error → "Koneksi bermasalah" + Retry
  - API error → "Gagal memuat data" + Retry
  - Permission error → "Akses ditolak" + Contact Support
- **Komponen**: `<InlineError retry={boolean}>`
- **Fallback**: Jika error persist setelah 3 retry → tampilkan "Contact Support" + error code

---

#### Trust Surface Pattern (Project Detail Safety Tab)

**Structure Wajib di Project Detail → Tab Safety**:

```
[SafetyCard: KYC Status]
  - Icon: Shield/Check
  - Status: VERIFIED / PENDING / NOT_SUBMITTED
  - CTA: "Lihat Detail KYC"

[SafetyCard: Smart Contract Scan]
  - Icon: Code/Scan
  - Status: PASS / WARNING / FAILED / NOT_SCANNED
  - CTA: "Lihat Laporan Audit"

[SafetyCard: LP Lock]
  - Icon: Lock
  - Status: LOCKED / PENDING / NOT_LOCKED
  - Lock Duration: "12 bulan"
  - Unlock Date: "15 Jan 2027"
  - CTA: "Lihat Proof Lock"

[SafetyCard: Vesting Schedule]
  - Icon: Calendar
  - Status: ACTIVE / ENDED / NOT_APPLICABLE
  - Schedule: "6 bulan cliff, 12 bulan vesting"
  - CTA: "Lihat Jadwal Lengkap"
```

**Komponen**: `<SafetyCard>`

**Rules**:

- Selalu tampilkan 4 safety aspects (meski "N/A")
- Jangan sembunyikan info negatif (transparency > marketing)
- Status WARNING/FAILED harus punya explanation

---

## B. Open Questions / Assumptions

### Assumptions (Tanpa Blocker)

1. **Dark Mode**: Asumsi Phase 0 ini light-only. Dark mode tokens bisa ditambah Phase 5.
2. **Internationalization**: Asumsi Bahasa Indonesia only untuk MVP. i18n bisa di Phase 5+.
3. **Chain Icons**: Asumsi ada icon resource untuk chain badges (ETH, BSC, Polygon, Solana).
4. **TX Manager Integration**: Asumsi TX Manager sudah expose API untuk tx status tracking (submitted/confirmed/failed).
5. **Analytics Events**: Asumsi FE pakai analytics library (Mixpanel/Amplitude), tinggal trigger events sesuai spec.

### Open Questions (Perlu Klarifikasi Sebelum Phase 1)

1. **Primary Wallet Logic**: Apakah user bisa participate dengan non-primary wallet? Atau wajib set primary dulu?
   - **Impact**: Gating logic di `/participate/*`
   - **Suggestion**: Wajib primary wallet untuk participate (cleaner UX)

2. **Failed Sale Refund Auto vs Manual**: Apakah refund otomatis atau user harus manually claim?
   - **Impact**: Portfolio screen CTA (apakah ada "Claim Refund" button atau just info)
   - **Suggestion**: Manual claim dengan button (untuk accounting clarity)

3. **Multi-Chain Wallet dalam 1 Akun**: Apakah 1 user bisa link wallet EVM + Solana sekaligus?
   - **Impact**: Wallet management screen complexity
   - **Suggestion**: Yes, bisa multiple wallets multi-chain (user flexibility)

4. **Vesting Claim Partial vs Full**: Apakah user bisa claim sebagian vested tokens atau harus full unlock?
   - **Impact**: Vesting Detail screen CTA design
   - **Suggestion**: Partial claim allowed (better UX)

5. **Feed Post Status Draft**: Apakah ada draft post (edit sebelum publish)? Atau langsung publish?
   - **Impact**: Composer flow (1-step vs 2-step)
   - **Suggestion**: Langsung publish (no draft) untuk Phase 1, draft bisa Phase 2+

---

## Definition of Done ✅

Phase 0 selesai jika:

- [x] Sitemap lengkap dengan semua routes Phase 1-4
- [x] Component inventory + spec untuk minimum 15 core components
- [x] Screen spec template ready untuk Phase 1
- [x] Transaction pattern documented + mapped ke layar
- [x] Gating pattern documented + mapped ke layar
- [x] Trust surface pattern specified untuk Project Detail
- [x] Open questions list max 10 items (focused, blocker-only)

**Handoff Ready**: Dokumen ini bisa langsung dipakai Gemini (visual design) dan FE (implementation) tanpa ambiguitas.
