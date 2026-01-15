# Phase 0 — Visual Foundation: Gemini Execution

Visual direction, tokens, dan layout concepts untuk SELSIPAD v3. Fokus pada "Fintech-Grade" trust & clarity.

---

## A. Visual Direction

**Mood & Feel**:

1.  **Trustworthy (Terpercaya)**: Clean, structured, no clutter. Warna status jelas.
2.  **Premium Tech**: Deep dark backgrounds, subtle glow, crisp borders. Bukan "playful crypto" tapi "pro investment platform".
3.  **Action-Oriented**: CTA (Call to Action) sangat menonjol dengan contrast tinggi. Input fields besar dan jelas.

**Do:**

- Gunakan whitespace (spacing) untuk memisahkan grup informasi.
- Gunakan semantic color (Hijau/Merah/Kuning) HANYA untuk status/feedback.
- Gunakan font _Inter_ atau _Plus Jakarta Sans_ untuk readability angka.

**Don't:**

- Jangan gunakan gradien berlebihan yang mengganggu teks.
- Jangan gunakan icon dekoratif tanpa fungsi.
- Jangan gunakan pure black (#000000) untuk background, gunakan very dark gray (#0A0A0A atau #111111).

---

## B. Design Tokens v1

### B.1 Color Tokens

**Neutral (Background & Text)**

- `bg.page`: `#09090B` (Zinc-950)
- `bg.card`: `#18181B` (Zinc-900)
- `bg.elevated`: `#27272A` (Zinc-800)
- `bg.input`: `#18181B` (Zinc-900)
- `border.subtle`: `#27272A` (Zinc-800)
- `border.active`: `#3F3F46` (Zinc-700)
- `text.primary`: `#FAFAFA` (Zinc-50)
- `text.secondary`: `#A1A1AA` (Zinc-400)
- `text.tertiary`: `#52525B` (Zinc-600)

**Primary (Brand & CTA)**

- `primary.main`: `#6366F1` (Indigo-500)
- `primary.hover`: `#4F46E5` (Indigo-600)
- `primary.text`: `#FFFFFF`
- `primary.soft`: `#312E81` (Indigo-900, 20% opacity)

**Semantic Status**

- `status.success.bg`: `#064E3B` (Emerald-900)
- `status.success.text`: `#34D399` (Emerald-400)
- `status.warning.bg`: `#78350F` (Amber-900)
- `status.warning.text`: `#FBBF24` (Amber-400)
- `status.error.bg`: `#7F1D1D` (Red-900)
- `status.error.text`: `#F87171` (Red-400)
- `status.info.bg`: `#1E3A8A` (Blue-900)
- `status.info.text`: `#60A5FA` (Blue-400)

### B.2 Typography Scale (Desktop/Mobile responsive)

- `font.family`: "Inter, sans-serif"
- `display.lg`: 32px / 40px / SemiBold (Tracking: -0.02em)
- `display.md`: 24px / 32px / SemiBold
- `heading.lg`: 20px / 28px / SemiBold
- `heading.md`: 18px / 28px / Medium
- `heading.sm`: 16px / 24px / Medium
- `body.md`: 16px / 24px / Regular
- `body.sm`: 14px / 20px / Regular (Default UI text)
- `caption`: 12px / 16px / Regular (Label, Helper)

### B.3 Spacing & Radius

- `radius.sm`: 4px (Buttons compact, Badges)
- `radius.md`: 8px (Inputs, Standard Buttons)
- `radius.lg`: 12px (Cards, Modals)
- `radius.full`: 9999px (Pills, Avatars)

- `space.1`: 4px
- `space.2`: 8px
- `space.3`: 12px
- `space.4`: 16px (Standard padding)
- `space.6`: 24px (Section gap)
- `space.8`: 32px
- `space.12`: 48px

---

## C. Component Visual Spec

### 1. StatusBadge

- **Visual**: `radius.full`, `text.xs` (Caps/Semibold), `px-2 py-0.5`
- **Colors**: background pakai `status.*.bg` (opacity 50%), text pakai `status.*.text`.
- **Example**: LIVE badge = Hijau gelap bg + Hijau terang text.

### 2. Buttons

- **Primary**: Solid `primary.main`, `text.white`, `radius.md`, `h-10` (40px) `px-4`. Shadow minimal.
- **Secondary**: Border `border.active`, `bg.transparent`, `text.primary`. Hover `bg.elevated`.
- **Danger**: Border `status.error.text` (20%), `text.error`, hover `bg.error` (10%).

### 3. Cards (Project/Content)

- **Bg**: `bg.card`
- **Border**: 1px solid `border.subtle`
- **Hover**: Border `border.active` + Subtle Shadow
- **Radius**: `radius.lg`
- **Spacing**: `p-4` (compact) or `p-6` (comfy)

### 4. Inputs (Amount)

- **Bg**: `bg.input`
- **Border**: 1px solid `border.subtle`
- **Text**: `display.md` (Large numbers) for amounts.
- **Focus**: Border `primary.main` (1px) + Ring `primary.soft` (2px).
- **Helper**: `text.secondary` di kanan (e.g., "MAX").

### 5. Toast/Banner

- **Toast**: Floating `bg.elevated`, border `border.active`, shadow `lg`. Icon di kiri.
- **Banner**: Full width `bg.primary.soft` (10% opacity) border-b `primary.main` (20%).

### 6. Iconography

- **Style**: Outlined (Stroke 1.5px)
- **Size**: 16px (sm), 20px (md/default), 24px (lg).
- **Library Recommended**: Lucide React atau Heroicons.

---

## D. High-Fidelity Layout Concepts

### D.1 Home Screen (Dashboard)

```
[Top Bar]
Logo (Left) | [Search Icon] [Notif Icon] [Connect Wallet Btn] (Right)

[Hero Section / Quick Actions] -> Grid 2x2 or Scroll Row
+----------------+  +----------------+
| 🔥 Trending    |  | 🚀 Fairlaunch  |
| "Proj ABC +15%"|  | "3 Live Now"   |
+----------------+  +----------------+

[Section Header]
"Featured Projects"           "See All >"

[Featured Carousel (Expanded Cards)]
+------------------------------------------+
|  [ Banner Image 16:9                   ] |
|  +------------------------------------+  |
|  | Logo | Project Name      [LIVE]    |  |
|  +------------------------------------+  |
|  "DeFi protocol for..."                  |
|  [Target: 500 SOL]   [Progress: 80%--]   |
|  tags: [KYC] [Audit] [EVM]               |
+------------------------------------------+

[Section Header]
"Latest Projects"

[List View (Compact Cards)]
[Logo] Project Alpha  [UPCOMING]  [ETH]
[Logo] Beta Protocol  [ENDED]     [SOL]
```

### D.2 Project Detail Screen

```
[Nav Bar]
< Back    Project Detail      [Share]

[Header Info]
[ Logo 64px ]
**Project Gamma** [VERIFIED Badge]
$GAMMA • DeFi
[Social Icons Row]

[Tabs Sticky]
[OVERVIEW] [PARTICIPATE] [SAFETY] [UPDATES]
-------------------------------------------

[Tab Content: OVERVIEW]
+---------------------------------------+
| Sale Ends In: 02d 14h 20m 10s         |
| [===========================    ] 85% |
| 850 / 1000 SOL Raised                 |
+---------------------------------------+

**Description**
Lorem ipsum dolor sit amet... "Read More"

**Tokenomics** (InfoRow)
Total Supply ........ 1,000,000
Presale Rate ........ 1 SOL = 1,000
Listing Rate ........ 1 SOL = 900
Liquidity Lock ...... 12 Months

[Safety Highlights (Preview)]
[Shield Icon] KYC Verified
[Lock Icon]   Audit by Certik

[Bottom Fixed Bar (Mobile)]
+---------------------------------------+
| [ Balance: 2.5 SOL ]                  |
| [ BUY / PARTICIPATE (Primary Btn) ]   | (Disabled if wallet not connected)
+---------------------------------------+
```

---

**Selesai Phase 0 Visual Foundation.**
Dokumen ini siap digunakan oleh Frontend Engineer untuk setup `tailwind.config.js` dan membuat komponen dasar.
