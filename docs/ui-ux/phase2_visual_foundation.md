# Phase 2 — Visual Foundation (Gemini)

High-fidelity layout concepts, visual rules, and component specifications for Social + Growth features, strictly adhering to Phase 0 Design System and Phase 2 Specs.

## A. High-Fidelity Layout Concepts

### 1. Feed Timeline Screen

**Concept**: Clean, trust-centric feed prioritizing content legibility and verification status.

```
┌─────────────────────────────────────────┐
│ [≡ Logo]                         [Filter]│
│ Feed                             [Search]│
├─────────────────────────────────────────┤
│ [FAB (+)] (Floating @ Bottom Right)     │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ ┌─────────────────────────────────┐ │ │
│ │ │ [Avatar] @cryptoid • 2h [✓]     │ │ │ ← Author (Bold, Blue Check)
│ │ │ ─────────────────────────────── │ │ │
│ │ │ $SOL bonding curve is live!     │ │ │ ← Body (base text, relaxed leading)
│ │ │ Check out Project Alpha now.    │ │ │
│ │ │ ─────────────────────────────── │ │ │
│ │ │ [🏷️ Project Alpha]             │ │ │ ← Project Chip (Primary Soft)
│ │ │ ─────────────────────────────── │ │ │
│ │ │ [View]     [Report]     [Hide]  │ │ │ ← Actions (Ghost, Text-XS)
│ │ └─────────────────────────────────┘ │ │
│ │                                     │ │
│ │ ┌─────────────────────────────────┐ │ │
│ │ │ [Avatar] @anon_user • 5h        │ │ │
│ │ │ ─────────────────────────────── │ │ │
│ │ │ Just bought the dip! #LFG       │ │ │
│ │ │ ─────────────────────────────── │ │ │
│ │ │ [View]     [Report]     [Hide]  │ │ │
│ │ └─────────────────────────────────┘ │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ [Home] [Explore] [Portfolio] [Feed]     │
└─────────────────────────────────────────┘
```

### 2. Composer (Gated)

**Concept**: Focused writing experience with clear eligibility feedback.

**Gating Modal (Non-Eligible)**:

```
┌─────────────────────────────────────────┐
│ [X]                                     │
│                                         │
│          [🔒 Icon Large]                │
│                                         │
│   Posting memerlukan verifikasi         │ ← Title (H3, Semibold)
│                                         │
│   Akun Anda perlu diverifikasi          │ ← Body (Text-SM, Styled)
│   (Blue Check) untuk bisa posting       │
│   di feed.                              │
│                                         │
│   [   Mulai Verifikasi   ]              │ ← Primary Button
│                                         │
└─────────────────────────────────────────┘
```

**Composer Modal (Eligible)**:

```
┌─────────────────────────────────────────┐
│ Buat Postingan                [X Close] │
├─────────────────────────────────────────┤
│ [Avatar] @username                      │
│                                         │
│ Tulis update terbaru...                 │ ← Placeholder (Text-LG)
│                                         │
│ (Min-height: 200px focus area)          │
│                                         │
│                                         │
└─────────────────────────────────────────┘
│ 240 / 500 characters                    │ ← Counter (Text-XS, Subs)
│                                         │
│ [Attachment Icon] [Project Tag Icon]    │
├─────────────────────────────────────────┤
│ [Batal]             [   Posting   ]     │ ← Primary Button
└─────────────────────────────────────────┘
```

### 3. Project Updates Tab

**Concept**: Information-dense list but scannable via badges.

```
┌─────────────────────────────────────────┐
│ [Overview] [Participation] [UPDATES]    │ ← Tab Active indicator
├─────────────────────────────────────────┤
│ Updates                                 │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ [⚠️ IMPORTANT]                      │ │ ← Status Badge (Top Left)
│ │                                     │ │
│ │ Vesting Schedule Update             │ │ ← Title (Text-LG, Bold)
│ │ 12 Jan • 3 min read                 │ │ ← Metadata (Text-XS, Subs)
│ │ ─────────────────────────────────── │ │
│ │ We have updated the vesting...      │ │ ← Preview (Line-clamp 2)
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ [🛠️ DEV UPDATE]                     │ │
│ │                                     │ │
│ │ Frontend Migration Complete         │ │
│ │ 10 Jan • 1 min read                 │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### 4. Update Detail Screen

**Concept**: Article-like readability. Maximum width container for text on desktop.

```
┌─────────────────────────────────────────┐
│ ← Update                                │
├─────────────────────────────────────────┤
│ [⚠️ IMPORTANT]                          │
│                                         │
│ Vesting Schedule Update                 │ ← Title (Display-SM)
│                                         │
│ [Avatar] Admin • 12 Jan 2026            │ ← Author Row
│ Project: [Project Alpha →]              │ ← Project Link (Chip)
│ ─────────────────────────────────────── │
│                                         │
│ Content goes here with comfortable      │ ← Body (Text-Base, Leading-Relaxed)
│ line length (60ch).                     │
│                                         │
│ • Bullet points for lists               │
│ • Clear hierarchy                       │
│                                         │
│ [Download PDF Attachment]               │ ← Attachment (Card Compact)
│                                         │
│ ─────────────────────────────────────── │
│ [Share]                                 │
└─────────────────────────────────────────┘
```

---

## B. Visual Rules

### 1. "Important" Hierarchy

**Goal**: Menarik perhatian tanpa terlihat seperti error fatal.

- **Badge**: Gunakan `StatusBadge` variant `warning` (Yellow/Orange bg-soft, text-strong).
- **Position**: Selalu di top-left card sebelum title.
- **Card**: Tambahkan border kiri berwarna (`border-l-4 border-yellow-500`) untuk "Important" cards saja.
- **Shadow**: Sedikit uplift (`shadow-md`) dibanding regular cards (`shadow-sm` or `none`).

### 2. Readability di Mobile

**Goal**: Mengurangi fatigue saat membaca feed/updates.

- **Line Height**: Gunakan `leading-relaxed` (1.625) untuk body text.
- **Font Size**: Minimum `text-base` (16px) untuk konten utama, `text-sm` (14px) untuk metadata.
- **Contrast**: Text color `gray-900` (dark mode: `gray-100`) untuk body, `gray-500` untuk metadata. Jangan absolute black/white.
- **Vertical Rhythm**: Spacing antar paragraf `mb-4`.

### 3. Feed Spacing Strategy

**Goal**: Memisahkan antar-post dengan jelas.

- **Container**: Post card inset (`mx-4` mobile, `max-w-xl mx-auto` desktop).
- **Separator**:
  - opsi A: `border-b` full width antar post (Flat design).
  - opsi B: Card style dengan `mb-4` gap antar card (Card design). **Decision**: Gunakan **Card Style** untuk visual separation yang lebih baik di feed padat.
- **Padding**: Internal card padding `p-4`.

---

## C. Component Visual Variants

### 1. FeedPostCard

- **Base**: `bg-white` (dark: `bg-slate-800`), `rounded-xl`, `border border-gray-100` (dark: `border-slate-700`).
- **Footer Actions**:
  - Text-only button (Ghost).
  - Size: `text-xs` uppercase tracking-wide.
  - Color: `text-gray-500` hover `text-primary`.
- **Project Chip**:
  - Small size, `rounded-full`.
  - `bg-primary-50` `text-primary-700`.

### 2. UpdateCard

- **Base**: Similar to `ProjectCard` regular.
- **Hover**: Scale up micro-interaction (1.01x) + shadow increase.
- **Badge Placement**: Floating inside padding top-left.

### 3. Report/Hide Menu (ActionSheet / Dropdown)

- **Concept**: Minimalist list.
- **Style**:
  - `bg-white`, `rounded-lg`, `shadow-xl`.
  - Item height: `48px` (touch friendly).
  - Danger action (Report): `text-red-600`.

### 4. GatingNotice (In-Context)

- **Variant A (Inline)**: Used in lists/places where we show "You allow" logic generally.
- **Variant B (Modal)**: Used when user explicitly interacts (tap FAB).
  - **Icon**: Lock illustration / `ShieldCheckIcon` (Heroicons).
  - **Color**: `text-primary-600` for branding "Blue Check".

---

## D. Accessibility Notes (Mobile-First)

1. **Touch Targets**:
   - Menu actions (View, Report, Hide) harus punya hit area 44x44px minimal, meskipun visual icon/text kecil. Gunakan negative margins pada touch container.
   - Project Chip pada post card harus mudah di-tap tanpa salah pencet ke post detail.

2. **Color Contrast**:
   - Metadata (`gray-500`) harus pass AA standard on white/dark backgrounds.
   - "Important" badge label (Yellow) sering fail contrast. → Gunakan `text-yellow-900` on `bg-yellow-100` (atau Orange) untuk ensure readability.

3. **Dynamic Type Support**:
   - Layout feed harus toleran jika user menaikkan font size system.
   - Text container tidak boleh fixed height (no `h-20`). Gunakan `min-h` atau auto grow.

4. **Screen Reader (VoiceOver/TalkBack)**:
   - **Post Card**: Group content. "Post by [Author], [Time], [Content]".
   - **Actions**: Label tombol "Report" harus "Report post by [Author]" agar jelas context-nya dalam list.
   - **Important Updates**: Bacakan "Important: [Title]" agar urgency tersampaikan via audio.

---

**Status**: Ready for implementation.
**Ref**: Phase 2 Specs & Opus Review incorporated.
