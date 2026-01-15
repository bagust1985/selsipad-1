# Phase 3 — Visual Foundation (Gemini)

High-fidelity layout concepts, visual rules, and component specifications for Rewards & Referral features. Focus on clarity, trust, and preventing frustration ("no false hope").

## A. High-Fidelity Layout Concepts

### 1. Rewards Dashboard (State Panel + Summary)

**Concept**: Dashboard yang clean dengan "Hero" panel yang dinamis berdasarkan state. Menghindari visual noise berlebihan.

```
┌─────────────────────────────────────────┐
│ [≡] Rewards                      [Help] │ ← "Help" icon opens education sheet
├─────────────────────────────────────────┤
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ ┌─┐                                 │ │
│ │ │✨│ Rewards Siap Diklaim!          │ │ ← State Panel (CLAIMABLE)
│ │ └─┘                                 │ │
│ │ claimable                           │ │
│ │ $125.50 USDC                        │ │ ← Big, Primary Color, Bold
│ │ ─────────────────────────────────── │ │
│ │ From 5 active referrals             │ │
│ │                                     │ │
│ │ [       Klaim Sekarang       ]      │ │ ← Full width Primary Button
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌SUMMARY CARDS────────────────────────┐ │
│ │ ┌─────────────┐  ┌─────────────┐    │ │
│ │ │ Lifetime    │  │ Active      │    │ │
│ │ │ Earned      │  │ Referrals   │    │ │
│ │ │ $450.00     │  │ 5           │    │ │
│ │ └─────────────┘  └─────────────┘    │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [Bagikan Referral]   [Lihat Riwayat]    │ ← Secondary Actions (Outline/Ghost)
│                                         │
└─────────────────────────────────────────┘
```

**Alternative State: ELIGIBLE_REWARD_ZERO (Below Threshold)**

```
┌─────────────────────────────────────┐
│ ┌─┐                                 │
│ │📊│ Hampir Bisa Diklaim            │
│ └─┘                                 │
│                                     │
│ Claimable: $7.50 / $10.00           │ ← Progress visualization
│ [████████████░░░░] 75%              │
│                                     │
│ Butuh $2.50 lagi untuk claim.       │
│                                     │
│ [       Mengapa $0?       ]         │ ← Secondary Button
└─────────────────────────────────────┘
```

### 2. Referral Share Sheet

**Concept**: Fokus pada kemudahan copy/share. Visual hierarchy menekankan bahwa share = earn.

```
┌─────────────────────────────────────────┐
│ Bagikan Referral                    [X] │
├─────────────────────────────────────────┤
│                                         │
│ 👋 Ajak teman, dapatkan rewards!        │ ← Friendly illustration/icon
│                                         │
│ Orang yang pakai link kamu akan jadi    │
│ referral aktif setelah transaksi        │
│ pertama mereka.                         │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ selsipad.app/r/ABC123      [Copy]   │ │ ← Input-like styling, read-only
│ └─────────────────────────────────────┘ │
│                                         │
│ [ Whatsapp ] [ Telegram ] [ Twitter ]   │ ← Social Share Row (Brand Colors)
│                                         │
│ ─────────────────────────────────────── │
│                                         │
│ Active Referrals: 5                     │ ← Contextual stat
│ [Lihat Detail Referral →]               │
│                                         │
└─────────────────────────────────────────┘
```

### 3. Rewards History

**Concept**: Audit trail yang mudah dibaca. Menggunakan iconography status yang jelas.

```
┌─────────────────────────────────────────┐
│ ← Riwayat Rewards                       │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ ┌─┐                                 │ │
│ │ │✓│ Klaim Berhasil                  │ │ ← Green Icon
│ │ └─┘ 12 Jan 2026 • 10:30             │ │
│ │                                     │ │
│ │ +$125.50 USDC                       │ │ ← Positive (Green) Text
│ │ ─────────────────────────────────── │ │
│ │ [View TX]                           │ │ ← Small link
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ ┌─┐                                 │ │
│ │ │⏳│ Klaim Pending                   │ │ ← Orange/Animation
│ │ └─┘ 14 Jan 2026 • 09:00             │ │
│ │                                     │ │
│ │ +$75.00 USDC                        │ │ ← Muted/Default Text
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## B. Visual Rules

### 1. Menampilkan "Claimable" (Clarity vs Spammy)

**Goal**: Memberi tahu user ada uang, tapi tetap terlihat profesional (fintech-clean).

- **Typography**: Gunakan font size terbesar di halaman untuk angka amount, tapi weight `Semibold` (bukan Black/Heavy).
- **Color**: Gunakan `Primary-600` (atau Brand Color). Jangan gunakan warna merah/kuning alarmist kecuali error.
- **Context**: Selalu sertakan label currency (USDC) dengan size lebih kecil atau weight lebih ringan untuk readability.
- **Anti-Pattern**: Jangan gunakan animasi berkedip atau tombol yang "shake" untuk menarik perhatian. Kepercayaan adalah kunci.

### 2. Menampilkan State "Reward $0" (Frustration Management)

**Goal**: Menjelaskan "kenapa" secara visual tanpa perlu user membaca paragraf panjang.

- **Icon**: Gunakan icon informatif (Chart/Hourglass) bukan icon error (X/Warning).
- **Progress Bar**: Jika kasusnya adalah "Below Threshold", **WAJIB** tampilkan progress bar. Ini mengubah persepsi dari "Gagal" menjadi "Sedang Berjalan".
- **Color Palette**: Gunakan `Warning-50` (Background) dan `Warning-700` (Text) yang lembut (Yellow/Orange soft). Jangan merah.

---

## C. Component Visual Variants

### 1. EligibilityStatePanel

Component ini adalah "Hero" dari dashboard. Variant berdasarkan state gating 4-step.

- **Props**: `state`, `title`, `content`, `cta`
- **Visuals**:
  - **NOT_ELIGIBLE**:
    - Bg: `Slate-50` (Neutral)
    - Icon: `LockClosed` (`Slate-400`)
    - Border: `Slate-200` details
  - **ELIGIBLE_NO_REFERRALS**:
    - Bg: `Blue-50` (Info)
    - Icon: `UserAdd` (`Blue-500`)
    - CTA: Primary
  - **ELIGIBLE_REWARD_ZERO**:
    - Bg: `Orange-50` (Warning/Pending)
    - Icon: `ChartBar` (`Orange-500`)
    - CTA: Secondary/Outline
  - **CLAIMABLE**:
    - Bg: `Green-50` (Success/Money)
    - Icon: `Sparkles` (`Green-600`)
    - CTA: Primary Large

### 2. ReferralLinkCard

Fokus pada fungsi "Copy".

- **Container**: `bg-slate-100` rounded-lg.
- **Text**: Monospace font untuk kode/link (optional, tapi bagus untuk scanability).
- **Copy Button**: Icon only atau Text "Salin" di sebelah kanan dalam container yang sama.

### 3. RewardHistoryItem

- **Layout**: Row with Flexbox.
- **Left**: Status Icon (Circle container).
- **Middle**: Title (Status/Type) + Date (Subtext).
- **Right**: Amount (Right aligned).
- **Spacing**: `py-4` `border-b` `border-slate-100`.

### 4. TxBanner (Reuse Phase 0)

- **Pending**: `bg-blue-600` text-white with Spinner. Sticky top atau inline top.
- **Success**: `bg-green-600` text-white.
- **Failed**: `bg-red-600` text-white.

---

## D. Accessibility Notes (Mobile-First)

1. **Touch Targets for Claim**:
   - Tombol "Claim" di dashboard harus menjadi element yang paling mudah ditekan. Minimum height `48px`, full width pada mobile.

2. **Contrast pada State Colors**:
   - Hati-hati dengan background pastel (e.g., `Orange-50`). Pastikan text di atasnya (`Orange-800` atau `Gray-900`) memiliki contrast ratio > 4.5:1. Jangan gunakan text warna orange muda di atas background orange muda.

3. **Screen Reader Focus**:
   - Ketika modal claim terbuka, focus harus trap di dalam modal.
   - Status perubahan (e.g., dari Pending ke Success) harus di-announce (`aria-live="polite"`).

4. **Dynamic Type layout**:
   - Layout dashboard harus accommodate jika user menaikkan font size. Summary cards bisa stack vertikal (1 kolom) jika layar sempit atau text besar, daripada text terpotong.

---

**Status**: Ready for implementation.
**Ref**: Phase 3 Specs & Opus Review incorporated.
