# Phase 5 — Visual Polish & Accessibility (Gemini)

Dokumen ini berisi checklist visual consistency, baseline accessibility, dan rekomendasi polish per screen untuk Phase 1-4, memastikan aplikasi terasa premium dan inklusif.

---

## A. Visual Consistency Checklist

Checklist ini wajib dipenuhi oleh semua UI implementation.

### 1. Typography Hierarchy

- [ ] **Page Header**: `text-2xl` (display.lg) atau `text-xl` (display.md), Semibold.
- [ ] **Section Header**: `text-lg` (heading.lg), Semibold.
- [ ] **Body Text**: `text-base` (body.md) untuk mobile readability standard.
- [ ] **Metadata/Caption**: `text-sm` (body.sm) atau `text-xs` (caption), always `text-zinc-400` (text.secondary).
- [ ] **Numbers**: Gunakan `tabular-nums` untuk angka sejajar (harga, countdown).
- [ ] **Line Height**: `leading-relaxed` untuk long-form text (feed, description).

### 2. Spacing System

- [ ] **Card Padding**: Consistently `p-4` (compact) atau `p-6` (standard). Jangan mix.
- [ ] **Section Gap**: `gap-6` (24px) antar section utama.
- [ ] **List Item Gap**: `gap-3` atau `gap-4` antar card/item.
- [ ] **Bottom Nav Offset**: `pb-[calc(env(safe-area-inset-bottom)+64px)]` untuk content di atas navbar.

### 3. Visual Status Hierarchy

- [ ] **Badges**:
  - `ACTIVE/LIVE/VERIFIED` → Emerald (`bg-emerald-900/50 text-emerald-400`)
  - `PENDING/UPCOMING` → Amber (`bg-amber-900/50 text-amber-400`) or Blue (`bg-blue-900/50 text-blue-400`) - _Decision: Use Amber for Pending Action, Blue for Scheduled._
  - `REJECTED/FAILED` → Red (`bg-red-900/50 text-red-400`)
  - `INACTIVE/ENDED` → Zinc (`bg-zinc-800 text-zinc-400`)
- [ ] **Cards**: Semantic border kiri (`border-l-4`) untuk status cards (Safety/Transactions).

### 4. Interactive States (Feedback)

- [ ] **Hover (Desktop)**: `brightness-110` atau `border-zinc-600` untuk cards/buttons.
- [ ] **Active/Press (Mobile)**: `scale-95` atau `opacity-80` micro-interaction.
- [ ] **Focus (Keyboard)**: `ring-2 ring-indigo-500 ring-offset-2 ring-offset-zinc-950` (Visible!).
- [ ] **Disabled**: `opacity-50` + `cursor-not-allowed` (jangan hide element, disable saja).

---

## B. Accessibility Baseline Notes (Mobile-First)

Aturan ini non-negotiable untuk usability dasar.

### 1. Touch Targets (The "Fat Finger" Rule)

- [ ] **Minimum Size**: Semua tombol/link/icon interaktif minimal **44x44px**.
  - _Tip_: Gunakan negative margin atau padding transparan pada icon kecil (kebab menu, close button) untuk memperluas hit area.
- [ ] **Spacing**: Jarak antar element interaktif minimal **8px**.

### 2. Color Contrast (WCAG AA)

- [ ] **Text Secondary**: Pastikan `text-zinc-400` di atas `bg-zinc-950` cukup kontras. Jika tidak, naikkan ke `text-zinc-300`.
- [ ] **Semantic Text**: Jangan gunakan warna semantic gelap di background gelap. Gunakan shade `400` atau `300` (e.g., `text-emerald-400` bukan `emerald-600`).
- [ ] **Input Borders**: Border input `zinc-700` agar visible (WCAG Non-text contrast 3:1).

### 3. Screen Reader Readiness

- [ ] **Images**: Semua `img` punya `alt` description yang bermakna (atau null jika dekoratif).
- [ ] **Icon Buttons**: Tombol icon (e.g., X, Arrow) punya `aria-label="Description"`.
- [ ] **States**: Toggle/Tabs menggunakan `aria-selected` atau `aria-pressed`.

### 4. Motion Reduction

- [ ] **Animations**: Support `prefers-reduced-motion` media query (disable complex transitions).
- [ ] **Autoplay**: Jangan autoplay video/carousel tanpa kontrol.

---

## C. Polish Suggestions per Core Screen

Rekomendasi visual spesifik untuk meningkatkan feel premium.

### 1. Home Screen

- **Hero Section**: Tambahkan subtle gradient glow di belakang "Featured" card untuk depth.
- **Trending Row**: Pastikan horizontal scrollbar hidden (`scrollbar-hide`) tapi functional.
- **Quick Actions**: Gunakan icon besar (24px) dengan background circle `bg-zinc-800`.

### 2. Project Detail

- **Header**: Sticky tab navigation transition (background become opaque when sticky).
- **Countdown**: Gunakan font monospace (`font-mono`) agar angka tidak bergeser saat tik-tok.
- **Safety Cards**: Align all height (flex stretch) agar rapi dalam grid.

### 3. Participation (Presale)

- **Amount Input**: Input text massive (`text-4xl`) saat fokus.
- **Result Preview**: Gunakan dotted line connector antara label dan value.
- **Confetti**: Tambahkan micro-confetti saat "Pembelian Berhasil" (Delight factor).

### 4. Portfolio

- **Empty State**: Ilustrasi vector minimalis (line art) dengan accent color primary.
- **Pending Banner**: Animasi pulse lembut pada icon jam pasir.

### 5. Rewards Dashboard

- **Eligibility Panel**: Transisi smooth antar states (jangan layout shift kaget).
- **Progress Bar**: Rounded caps (`rounded-full`) pada bar dan background track.
- **Copy Link**: Feedback "Tersalin!" muncul tooltip di atas tombol.

### 6. Profile Overview

- **Status Grid**: Tambahkan 1px border gradient halus pada Active Blue Check card.
- **Wallet List**: Network icon (ETH/SOL) full color (original brand colors) untuk visual anchor.

### 7. Feed Timeline

- **Post Card**: Border radius `rounded-xl` (lebih tumpul) agar terlihat modern friendly.
- **Avatar**: Border ring tipis `ring-1 ring-zinc-700` agar avatar gelap tidak blend ke background.
- **Gating Modal**: Backdrop blur (`backdrop-blur-sm`) agar fokus ke pesan lock, konten belakang samar.

---

## D. Component Polish Notes

### 1. Buttons

- **Primary**: Tambahkan subtle inner border (`border-t border-white/10`) untuk efek 3D glass tipis.
- **Ghost**: Hover state `bg-zinc-800` rounded.

### 2. Input Fields

- **Focus**: Jangan hanya border color, tambahkan `ring` shadow `ring-indigo-500/20` (glow).
- **Error**: Shake animation (X-axis) saat validasi gagal.

### 3. Modals / Bottom Sheets

- **Mobile**: Gunakan Bottom Sheet (slide up) di mobile, Modal (center) di desktop.
- **Handle**: Wajib ada "drag handle" pill di atas bottom sheet.

### 4. Toasts

- **Icon**: Gunakan icon solid dengan warna kontras background circle.
- **Timer**: Progress bar tipis di bawah toast untuk indikasi auto-dismiss.

### 5. Skeleton Loaders

- **Shimmer**: Gradient shimmer jangan terlalu terang (distracting). Gunakan `zinc-800` ke `zinc-700` base.
- **Shape matching**: Skeleton avatar bulat, skeleton text baris. Jangan satu kotak besar untuk satu card.

---

**Status**: Ready for implementation.
**Focus**: Consistency, Accessibility, Delight.
