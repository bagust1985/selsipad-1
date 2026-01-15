# Phase 1 — Visual Foundation: Gemini Execution

High-fidelity layout concepts dan visual rules untuk P0 Money Flows, mengikuti struktur Screen Specs dari Sonnet.

---

## A. High-Fidelity Layout Concepts

### A.1 Home Screen

**Visual Hierarchy**: Trending → Featured → Quick Actions

```
┌─────────────────────────────────────────┐
│ [Logo]              [Wallet: 2.5 SOL ▾] │ ← Header (h-16, sticky)
├─────────────────────────────────────────┤
│                                         │
│ 🔥 Trending                Lihat Semua→ │ ← Section Header (text-lg, semibold)
│ ┌─────────────────────────────────────┐ │
│ │ ╔═══════╗  ╔═══════╗  ╔═══════╗    │ │ ← Horizontal Scroll
│ │ ║ Logo  ║  ║ Logo  ║  ║ Logo  ║ …  │ │   ProjectCard Compact
│ │ ║ProjectA ║ ║ProjectB ║ ║ProjectC║   │ │   (w-40, h-48)
│ │ ║[LIVE]  ║  ║[UPCOMING ║[ENDED] ║   │ │
│ │ ║80% ██  ║  ║Countdown ║FinalizI║   │ │
│ │ ╚═══════╝  ╚═══════╝  ╚═══════╝    │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Featured Projects                       │ ← Section Header
│ ┌─────────────────────────────────────┐ │
│ │ ┌───────────────────────────────┐   │ │ ← ProjectCard Expanded
│ │ │ [Banner Image 16:9]           │   │ │   (Full width, aspect-16/9)
│ │ ├───────────────────────────────┤   │ │
│ │ │ [48px Logo] Project Delta     │   │ │
│ │ │             [LIVE Badge]      │   │ │
│ │ │ "DeFi protocol for..."        │   │ │ ← 2 lines desc
│ │ │ ───────────────────────────   │   │ │ ← Progress bar
│ │ │ 850/1000 SOL | 85%            │   │ │
│ │ │ [KYC✓][Audit✓][EVM]          │   │ │ ← Trust badges
│ │ └───────────────────────────────┘   │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────┬─────────────┐          │ ← Quick Actions Grid 2×1
│ │ 🔍 Jelajahi │ 📊 Portfolio│          │   (h-20 each)
│ │   Projects  │             │          │
│ └─────────────┴─────────────┘          │
│                                         │
├─────────────────────────────────────────┤
│  [Home] [Explore] [Portfolio] [Feed]  │ ← BottomNav (h-16)
└─────────────────────────────────────────┘

Design Notes:
- Background: bg.page (#09090B)
- Cards: bg.card (#18181B) + border.subtle
- Trending scroll: Snap scroll, padding-x untuk edge fade
- StatusBadge: radius-full, compact size
- Featured card hover: border.active + shadow-md
```

---

### A.2 Explore Screen

**Visual Focus**: Search → Filters → Results Grid

```
┌─────────────────────────────────────────┐
│ ┌───────────────────────┬─────┐        │ ← Search Bar (h-12)
│ │ 🔍 Search projects... │ ≡   │        │   + Filter Icon
│ └───────────────────────┴─────┘        │
│                                         │
│ ┌─────┬─────┬──────┬────────┐         │ ← Active Filter Pills
│ │LIVE×│ EVM×│Presale×│ [Reset]│         │   (scrollable row)
│ └─────┴─────┴──────┴────────┘         │
│                                         │
│ Sort: Trending ▾                        │ ← Sort Dropdown (text-sm)
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │┌──────────────────────────────────┐ │ │ ← ProjectCard Compact List
│ ││[Logo] Project Alpha    [LIVE]    │ │ │   (vertical stack, gap-3)
│ ││      Raised: 500/1000 SOL        │ │ │
│ ││      [EVM] Presale               │ │ │
│ │└──────────────────────────────────┘ │ │
│ │┌──────────────────────────────────┐ │ │
│ ││[Logo] Project Beta   [UPCOMING]  │ │ │
│ ││      Starts in 2d 14h            │ │ │
│ ││      [SOL] Fairlaunch            │ │ │
│ │└──────────────────────────────────┘ │ │
│ │ ...                                 │ │
│ └─────────────────────────────────────┘ │
│                                         │
├─────────────────────────────────────────┤
│  [Home] [Explore] [Portfolio] [Feed]  │
└─────────────────────────────────────────┘

Design Notes:
- Search: bg.input, border.subtle, focus:border.primary
- Filter Pills: bg.primary.soft + text.primary, dismiss × icon
- Cards: Compact layout, Logo 40px, 1-line desc max
- Empty state: Center align, illustration + CTA
```

---

### A.3 Project Detail Screen

#### Tab: Overview

```
┌─────────────────────────────────────────┐
│ ←  Project Detail            [Share 🔗] │ ← PageHeader
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ [64px Logo]  Project Gamma          │ │ ← Header Section
│ │              [LIVE Badge]           │ │   (bg.elevated, p-4)
│ │ [KYC✓][Audit✓][LP Lock✓][EVM]     │ │ ← Trust Badges Row
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌───────────────────────────────────┐  │ ← Tabs (Sticky, border-b)
│ │[OVERVIEW][PARTICIPATE][SAFETY]... │  │   Active: border-b-2 primary
│ └───────────────────────────────────┘  │
│                                         │
│ ╔═══════════════════════════════════╗  │ ← Sale Countdown Card
│ ║ Sale Ends In: 2d 14h 20m 10s      ║  │   (bg.card, prominent)
│ ║ ████████████████░░░░░ 85%         ║  │
│ ║ 850 / 1,000 SOL Raised            ║  │
│ ╚═══════════════════════════════════╝  │
│                                         │
│ About This Project                      │ ← Section Header
│ ───────────────────────────────────     │
│ Lorem ipsum dolor sit amet, consec-     │ ← Description (text.secondary)
│ tetur adipiscing elit. Sed do eiusmod   │   Line clamp 3, "Read More"
│ tempor incididunt...  [Read More ▾]     │
│                                         │
│ Key Highlights                          │
│ • Audited by CertiK                    │ ← Bullet list
│ • 12-month LP lock                     │
│ • Vesting: 6mo cliff, 12mo linear      │
│                                         │
├─────────────────────────────────────────┤
│  [Home] [Explore] [Portfolio] [Feed]  │
└─────────────────────────────────────────┘

Design Notes:
- Sale Countdown: Primary gradient bg (subtle), large text
- Progress bar: Thick (h-3), rounded, gradient fill
- Trust badges: Compact pills, green for verified
- Tabs: Underline active (not bg change), smooth scroll
```

#### Tab: Participation (Presale LIVE)

```
┌─────────────────────────────────────────┐
│ ←  Project Detail            [Share 🔗] │
├─────────────────────────────────────────┤
│ [Header + Badges same as Overview]      │
│ ┌───────────────────────────────────┐  │
│ │[OVERVIEW][PARTICIPATE][SAFETY]... │  │
│ └───────────────────────────────────┘  │
│                                         │
│ ╔═══════════════════════════════════╗  │ ← Sale Info Panel
│ ║ Progress: 850/1000 SOL (85%)      ║  │
│ ║ ████████████████████░░░           ║  │
│ ╚═══════════════════════════════════╝  │
│                                         │
│ ┌─────────────────────────────────────┐ │ ← Amount Input Card
│ │ Jumlah SOL                          │ │   (bg.card, p-4)
│ │ ┌─────────────────────────────────┐ │ │
│ │ │ 0.5                      [MAX]  │ │ │ ← Large input (text-2xl)
│ │ └─────────────────────────────────┘ │ │
│ │ Saldo: 2.5 SOL                      │ │ ← Helper text (text.tertiary)
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │ ← Preview Panel
│ │ Anda akan terima    10,000 TOKEN    │ │   (InfoRow style)
│ │ Harga per token     0.0001 SOL      │ │
│ │ Fee network         ~0.001 SOL      │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ⚠ Token akan di-vesting 6 bulan         │ ← Warning (amber bg soft)
│                                         │
│ ╔═══════════════════════════════════╗  │ ← CTA (fixed bottom or inline)
│ ║         BELI (Primary Button)     ║  │   (h-12, full width)
│ ╚═══════════════════════════════════╝  │
│                                         │
├─────────────────────────────────────────┤
│  [Home] [Explore] [Portfolio] [Feed]  │
└─────────────────────────────────────────┘

Design Notes:
- Amount Input: Borderless inside card, focus ring subtle
- MAX button: Secondary style, text-sm
- Preview: Subtle divider between rows, value right-align bold
- Warning: bg.warning.soft (20% opacity), icon left, text.warning
- CTA: Primary gradient (optional), shadow-lg, disabled:opacity-50
```

#### Tab: Safety (Trust Surface)

```
┌─────────────────────────────────────────┐
│ ←  Project Detail            [Share 🔗] │
├─────────────────────────────────────────┤
│ [Header + Tabs same]                    │
│                                         │
│ ╔═══════════════════════════════════╗  │ ← SafetyCard 1: KYC
│ ║ 🛡️ KYC Status                      ║  │   (bg.card, border.subtle)
│ ║ [VERIFIED Badge (Green)]           ║  │
│ ║ Verified by: Sumsub                ║  │
│ ║ [Lihat Detail KYC →]               ║  │
│ ╚═══════════════════════════════════╝  │
│                                         │
│ ╔═══════════════════════════════════╗  │ ← SafetyCard 2: Audit
│ ║ 📝 Smart Contract Audit            ║  │
│ ║ [PASS Badge (Green)]               ║  │
│ ║ Audited by: CertiK                 ║  │
│ ║ [Lihat Laporan →]                  ║  │
│ ╚═══════════════════════════════════╝  │
│                                         │
│ ╔═══════════════════════════════════╗  │ ← SafetyCard 3: LP Lock
│ ║ 🔒 LP Lock                         ║  │
│ ║ [LOCKED Badge (Green)]             ║  │
│ ║ Duration: 12 months                ║  │
│ ║ Unlock: 15 Jan 2027                ║  │
│ ║ [Lihat Proof →]                    ║  │
│ ╚═══════════════════════════════════╝  │
│                                         │
│ ╔═══════════════════════════════════╗  │ ← SafetyCard 4: Vesting
│ ║ 📅 Vesting Schedule                ║  │
│ ║ [ACTIVE Badge (Blue)]              ║  │
│ ║ 6mo cliff, 12mo linear vesting     ║  │
│ ║ [Lihat Jadwal →]                   ║  │
│ ╚═══════════════════════════════════╝  │
│                                         │
├─────────────────────────────────────────┤
│  [Home] [Explore] [Portfolio] [Feed]  │
└─────────────────────────────────────────┘

Design Notes:
- SafetyCard: Uniform size, gap-4 between cards
- Icon: 24px, left-aligned dengan title
- Status Badge: Top-right atau after title, semantic color
- Info rows: text.secondary, concise
- CTA Link: text.primary, arrow icon, hover:underline
- If WARNING/FAILED: border-l-4 (red/amber), bg tinted
```

---

### A.4 Portfolio Screen (Claimable Tab)

```
┌─────────────────────────────────────────┐
│ Portfolio                                │ ← PageHeader (text-2xl)
├─────────────────────────────────────────┤
│ ┌───────────────────────────────────┐  │
│ │ [ACTIVE][CLAIMABLE][HISTORY]      │  │ ← Tabs
│ └───────────────────────────────────┘  │
│                                         │
│ ╔═══════════════════════════════════╗  │ ← Portfolio Item Card
│ ║ [Logo] Project Gamma              ║  │   (bg.card, p-4)
│ ║        [SUCCESS Badge]            ║  │
│ ║        Vesting aktif              ║  │ ← 1-line status
│ ║        Next unlock: 12 Feb 2026   ║  │
│ ║ ─────────────────────────────────  ║  │ ← Divider
│ ║ Claimable: 1,000 TOKEN            ║  │ ← Highlight (text.success)
│ ║ ┌───────────────────────────────┐ ║  │
│ ║ │       CLAIM (Primary)         │ ║  │ ← CTA Button (full width)
│ ║ └───────────────────────────────┘ ║  │
│ ╚═══════════════════════════════════╝  │
│                                         │
│ ╔═══════════════════════════════════╗  │ ← Another Item (Refund)
│ ║ [Logo] Project Delta              ║  │
│ ║        [FAILED Badge]             ║  │
│ ║        Penjualan gagal            ║  │
│ ║ ─────────────────────────────────  ║  │
│ ║ Refund: 0.5 SOL                   ║  │
│ ║ ┌───────────────────────────────┐ ║  │
│ ║ │  KLAIM REFUND (Danger)        │ ║  │
│ ║ └───────────────────────────────┘ ║  │
│ ╚═══════════════════════════════════╝  │
│                                         │
├─────────────────────────────────────────┤
│  [Home] [Explore] [Portfolio] [Feed]  │
└─────────────────────────────────────────┘

Design Notes:
- Logo: 40px, consistent positioning
- Status Badge: After project name, inline
- Claimable amount: Large, semibold, color matched to action
- CTA: Matches action type (Primary for claim, Danger for refund)
- Card spacing: gap-3 between cards
- Empty state: Centered, icon + message + CTA (outline button)
```

---

## B. Visual Rules untuk Trust Surface

### B.1 Badges & Status Chips

**StatusBadge Anatomy**:

```
┌────────────┐
│ • LIVE     │  ← Dot indicator (8px) + Text (12px, semibold, uppercase)
└────────────┘
Padding: px-2 py-0.5
Radius: full
Background: status.*.bg (opacity 50%)
Text: status.*.text
Border: 1px status.*.text (opacity 30%)
```

**Semantic Colors (Applied Consistently)**:

- LIVE / SUCCESS / VERIFIED → Green (#34D399 text, #064E3B bg)
- UPCOMING / PENDING / ACTIVE → Blue (#60A5FA text, #1E3A8A bg)
- ENDED / N_A → Gray (#A1A1AA text, #27272A bg)
- FINALIZING / WARNING → Amber (#FBBF24 text, #78350F bg)
- FAILED / REJECTED → Red (#F87171 text, #7F1D1D bg)

**Trust Badges (KYC/Audit/LP Lock)**:

```
[✓ KYC]   ← Icon (12px) + Text (11px, medium)
Compact pill, green if verified, gray if pending
Hover: Show tooltip "Verified by Sumsub"
```

### B.2 SafetyCard Design System

**Structure**:

1. Icon (24px) + Title (text-lg, semibold)
2. StatusBadge (right-aligned or after title)
3. Info rows (2-3 lines max, text.secondary)
4. CTA link (text.primary, arrow, bottom)

**Visual States**:

- **PASS / VERIFIED / LOCKED**: border-l-4 green (#10B981), bg tint green (5%)
- **WARNING / PENDING**: border-l-4 amber (#F59E0B), bg tint amber (5%)
- **FAILED / NOT\_\***: border-l-4 red (#EF4444), bg tint red (5%)

**Spacing**: p-4, gap-2 between elements

### B.3 Timeline Stepper

**Vertical Orientation** (untuk Project Detail Timeline tab):

```
┌─────────────────────────────────────┐
│ ● UPCOMING         [✓]              │ ← Completed (green dot, check)
│ │ 1 Jan 2026 10:00                 │
│ │                                   │
│ ● LIVE             [Active]         │ ← Active (pulsing blue dot)
│ │ 5 Jan 2026 10:00                 │
│ │                                   │
│ ○ ENDED            [Upcoming]       │ ← Upcoming (gray hollow dot)
│ ┆ Est: 20 Jan 2026                 │
│ ┆                                   │
│ ○ SUCCESS          [Locked]         │
│   TBD                               │
└─────────────────────────────────────┘

Connector line: Solid (completed), dotted (upcoming)
Dot size: 12px, positioned left
Text: Label (semibold), timestamp (text-sm, text.tertiary)
Active state: Pulsing animation (CSS), highlight bg
```

**Horizontal Bars** (untuk Vesting Schedule):

```
[████████][████████][░░░░░░░░][░░░░░░░░]
  25%       25%       25%       25%
Jan 2026  Feb 2026  Mar 2026  Apr 2026
✓ Claimed ✓ Claimed → Next    Locked
```

- Filled: primary.main, Unfilled: border.subtle
- Labels below: Date (text-sm), Status (text-xs)

---

## C. Component Visual Variants for Phase 1

### C.1 ProjectCard

**Compact Variant** (Trending/Explore):

```
┌────────────────────────────┐
│ [48px] Project Alpha       │
│  Logo  [LIVE Badge]        │
│        Raised: 500/1000 SOL│
│        [EVM] Presale       │
└────────────────────────────┘
Width: 160px (trending scroll) or full (explore list)
Height: auto (min-h-24)
Hover: border.active + shadow-md + scale-102
```

**Expanded Variant** (Featured):

```
┌──────────────────────────────────┐
│ [Banner 16:9 aspect ratio]       │
├──────────────────────────────────┤
│ [64px Logo] Project Beta         │
│             [UPCOMING Badge]     │
│ "DeFi protocol for traders..."   │ ← 2 lines max
│ ──────────────────────── 80%     │ ← Progress bar
│ 800/1000 SOL raised              │
│ [KYC✓][Audit✓][Solana]         │
└──────────────────────────────────┘
Width: Full (min-w-full)
Padding: p-4
Banner: object-cover, gradient overlay bottom
```

### C.2 Buttons (CTA States)

**Primary Button**:

```
Default:   bg.primary + text.white + shadow-sm
Hover:     bg.primary.hover + shadow-md + scale-102
Pressed:   bg.primary.hover + shadow-inner
Disabled:  bg.primary + opacity-50 + cursor-not-allowed
Loading:   bg.primary + spinner (right) + text "Processing..."
```

**Danger Button** (Refund):

```
Default:   border-2 error + bg.transparent + text.error
Hover:     bg.error.soft (10%) + border-error
```

**Disabled with Reason** (AmountInput validation):

```
Button disabled + Tooltip trigger (hover/tap)
┌────────────────────────────┐
│   BELI (grayed out)        │ ← Disabled visual
└────────────────────────────┘
      ↓ (on hover)
   ┌─────────────────────┐
   │ Minimum 0.1 SOL     │ ← Tooltip (bg.elevated, text-sm)
   └─────────────────────┘
```

### C.3 TxBanner & TxToast

**TxBanner** (Persistent):

```
STATE: Awaiting Signature
┌─────────────────────────────────────┐
│ ⏳ Menunggu tanda tangan wallet...  │ ← Icon + Message
│    Konfirmasi di aplikasi wallet    │ ← Subtext (text.tertiary)
└─────────────────────────────────────┘
bg.info.soft, border-l-4 info, p-3, rounded

STATE: Submitted
┌─────────────────────────────────────┐
│ ✓ Transaksi terkirim                │
│   TX: 0x1a2b3c... [Copy] [Explorer]│ ← Hash (monospace, truncate)
│   [Lihat di Portfolio →]            │ ← CTA Link
└─────────────────────────────────────┘
bg.success.soft, border-l-4 success

STATE: Failed
┌─────────────────────────────────────┐
│ ✗ Transaksi gagal                   │
│   Gas tidak cukup                   │ ← Reason
│   [Coba Lagi]                       │ ← Retry button (secondary)
└─────────────────────────────────────┘
bg.error.soft, border-l-4 error
```

**TxToast** (Auto-dismiss):

```
┌─────────────────────────────────┐
│ [✓] Pembelian berhasil!         │ ← Icon + Message (text-lg)
│     1000 TOKEN telah dibeli     │ ← Detail (text-sm)
│                        [Tutup]  │ ← Close button (text-xs)
└─────────────────────────────────┘
Position: Top-right (mobile: top-center)
bg.elevated + shadow-xl + border.active
Auto-dismiss: 5s (with progress bar bottom)
Animation: Slide in from right, fade out
```

### C.4 AmountInput

```
┌─────────────────────────────────────┐
│ Jumlah SOL                          │ ← Label (text-sm, semibold)
│ ┌─────────────────────────────────┐ │
│ │ 0.5                      [MAX]  │ │ ← Input (text-2xl) + Helper button
│ └─────────────────────────────────┘ │
│ Saldo: 2.5 SOL                      │ ← Helper text (text-xs, text.tertiary)
└─────────────────────────────────────┘

States:
- Default: border.subtle
- Focus: border.primary + ring-2 primary.soft
- Error: border.error + helper text red
- Disabled: opacity-50 + cursor-not-allowed

MAX button: text-sm, text.primary, hover:bg.primary.soft, tap:scale-95
```

### C.5 ConfirmModal

```
┌─────────────────────────────────────┐
│           [Modal Backdrop]          │ ← Semi-transparent overlay
│   ┌───────────────────────────┐    │
│   │ Konfirmasi Pembelian      │    │ ← Title (text-xl, semibold)
│   ├───────────────────────────┤    │
│   │ Anda akan membeli 1000    │    │ ← Description
│   │ TOKEN dengan 0.5 SOL      │    │
│   │                           │    │
│   │ Jumlah:  0.5 SOL          │    │ ← InfoRow (large, semibold)
│   │ Fee:     ~0.001 SOL       │    │
│   │ ─────────────────────────  │    │
│   │ Total:   0.501 SOL        │    │ ← Total (highlighted)
│   │                           │    │
│   │ ⚠ Token di-vesting 6 bln  │    │ ← Warning box
│   │                           │    │
│   │ □ I understand risks      │    │ ← Checkbox (if requireCheckbox)
│   │                           │    │
│   │ ┌─────────┬─────────────┐ │    │
│   │ │  Batal  │ Konfirmasi  │ │    │ ← Secondary | Primary
│   │ └─────────┴─────────────┘ │    │
│   └───────────────────────────┘    │
│                                     │
└─────────────────────────────────────┘

Modal: bg.elevated, rounded-lg, shadow-2xl, max-w-md
Backdrop: bg-black/50, blur-sm (backdrop-filter)
Buttons: Side-by-side (grid-cols-2, gap-3)
Warning: bg.warning.soft, p-3, rounded, text-sm
```

---

## D. Accessibility & Readability Notes (Mobile-First)

### D.1 Touch Targets

**Minimum Size**: 44×44px (W3C WCAG)

- All buttons, tap areas must meet size
- Increase padding if visual size smaller (e.g., icon-only buttons)

**Spacing Between Targets**: Min 8px gap

- Bottom nav items: distributed evenly, min 44px each
- Filter pills: gap-2 (8px) untuk easy tap

### D.2 Typography Readability

**Body Text**: Min 16px on mobile (14px acceptable untuk captions)

- Line height: 1.5× font size (24px for 16px text)
- Paragraph max-width: 65ch (characters) untuk readability

**Contrast Ratios** (WCAG AA):

- Normal text: Min 4.5:1
- Large text (18px+): Min 3:1
- Disabled text: 3:1 (acceptable untuk non-critical)

**Number Display** (Amounts, Prices):

- Use tabular-nums (monospace numbers) untuk alignment
- Large amounts: text-2xl or text-3xl, semibold
- Decimals: text.tertiary untuk distinguish (e.g., 0.5 SOL → "0" bold, ".5" tertiary)

### D.3 Color Independence

**Never Rely on Color Alone**:

- Status badges: Always include text + icon (not just color)
- Success/Error: Use ✓/✗ icons alongside green/red
- Disabled states: Reduce opacity + show reason (not just gray)

**Color Blind Safe**:

- Green/Red distinction: Use blue for neutral states (UPCOMING/PENDING)
- Progress bars: Add percentage text (not rely on fill color)

### D.4 Focus States (Keyboard Navigation)

**All Interactive Elements**:

```
focus:ring-2 focus:ring-primary focus:ring-offset-2
Visible outline, not hidden (outline:none is forbidden)
```

**Skip Links** (Accessibility):

```
<a href="#main-content" class="sr-only focus:not-sr-only">
  Skip to main content
</a>
```

### D.5 Loading & Skeleton States

**Skeleton Animation**: Subtle pulse (not flash)

```
animate-pulse opacity-50 → opacity-100 (1s duration, ease-in-out)
Background: gradient shimmer (optional, low contrast)
```

**Spinner Alternatives**:

- For lists: Use skeleton cards (match layout)
- For buttons: Inline spinner (16px) + "Loading..." text
- Avoid full-screen spinners (show partial content + skeleton)

### D.6 Safe Area (Mobile Notch/Bottom Bar)

**Padding**:

- Top: safe-area-inset-top + 16px
- Bottom: safe-area-inset-bottom + 16px (for bottom nav)
- Horizontal: px-4 (16px) minimum

**Fixed Elements**:

- Bottom nav: pb-safe-bottom
- Modals: Avoid full-height (leave top/bottom margin)

---

## Summary & Handoff Notes

**Visual Consistency Achieved**:

- ✅ All screens follow Phase 0 tokens (colors, spacing, typography)
- ✅ Trust surface (badges, safety cards, timeline) clear hierarchy
- ✅ Transaction feedback (banner, toast, modal) distinct states
- ✅ Mobile-first, accessibility standards met

**Implementation Ready**:

- Use Tailwind config with Phase 0 tokens
- Component library matches specs (StatusBadge, SafetyCard, TxBanner, etc.)
- Visual variants documented untuk conditional rendering

**Next Steps**:

- FE implement screens dengan visual specs ini
- QA visual consistency dengan design review
- User testing untuk readability & trust perception
