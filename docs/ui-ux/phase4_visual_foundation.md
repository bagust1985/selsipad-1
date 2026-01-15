# Phase 4 — Visual Foundation: Gemini Execution

Visual direction & high-fidelity references untuk Identity & Profile (Profile, Wallet, KYC, Blue Check).
Fokus: **Trust**, **Clarity of Status**, dan **Safe Management**.

---

## A. Visual Rules (Identity & Trust)

### 1. Status Clarity without "Scare"

Menampilkan status (terutama Rejected/Pending) dengan jelas namun tidak membuat panik.

- **Verified / Active (Status Aman)**:
  - Gunakan **Emerald-500** (`#10B981`) untuk icon dan text.
  - Background card tetap neutral (`zinc-900`), hanya accent/badge yang berwarna.
  - _Feel_: Stabil, aman.

- **Pending (Status Menunggu)**:
  - Gunakan **Amber-500** (`#F59E0B`).
  - _Feel_: "Sedang diproses", bukan "Ada masalah". Gunakan icon Jam/Clock.

- **Rejected (Status Gagal/Masalah)**:
  - Gunakan **Red-500** (`#EF4444`) untuk Icon dan Title.
  - **CRITICAL**: Penjelasan alasan (Reason) dan langkah selanjutnya (Next Steps) gunakan warna **Netral** (`text-zinc-300`). Jangan gunakan teks merah paragraf penuh karena sulit dibaca dan intimidating.
  - _Feel_: "Perhatian dibutuhkan", "Bisa diperbaiki".

- **Inactive / Not Started**:
  - Gunakan **Zinc-500** (`#71717A`).
  - _Feel_: Passive, menunggu aksi user.

### 2. Primary Wallet Prominence

Menandai primary wallet tanpa membuat layout "ramai" atau seperti iklan.

- **Badge**: "PRIMARY" pill badge (`text-xs`, `font-bold`) dengan background `primary.soft` dan text `primary.light`.
- **Top Position**: Selalu di paling atas list (Logic-based, but visual reinforce).
- **Subtle Highlight**: Border card Primary wallet bisa diberikan warna `zinc-700` (sedikit lebih terang dari default `zinc-800`), opsional.

---

## B. High-Fidelity Layout Concepts

### B.1 Profile Overview (The "Passport" Card)

Screen ini berfungsi sebagai "ID Card" digital user.

```
┌─────────────────────────────────────────┐
│ [Avatar 64px]                           │
│ **@crypto_whale**                           │
│ ID: 8829...9912 [Copy]                  │
│                                         │
│ ┌STATUS ROW (Grid 2 col)─────────────┐  │
│ │ ┌Card (Active)──────────┐  ┌Card──┐│  │
│ │ │ [✓ Blue Badge]        │  │ [🛡️] ││  │
│ │ │ **Blue Check**            │  │ KYC  ││  │
│ │ │ Active (Exp 2026)     │  │ Verif││  │
│ │ └───────────────────────┘  └──────┘│  │
│ └──────────────────────────────────────┘  │
│                                         │
│ ┌WALLET SUMMARY──────────────────────┐  │
│ │ [EVM Icon] 0x12..34  [PRIMARY]     │  │
│ │ Balance: $1,240.50                 │  │
│ │ [Manage Wallets >]                 │  │
│ └──────────────────────────────────────┘  │
│                                         │
│ Settings Group                          │
│ ┌──────────────────────────────────────┐  │
│ │ [Wallet Icon] Wallets            >   │  │
│ │ [Shield Icon] Security           >   │  │
│ │ [Cog Icon]    Preferences        >   │  │
│ └──────────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

**Visual Notes:**

- **Status Cards**: Gunakan style "bento grid" (kotak-kotak rapi).
- **Blue Check Active**: Berikan subtle blue glow/border pada card Blue Check jika aktif.

### B.2 Wallet Management List

List design yang memudahkan scan primary vs secondary.

```
┌─────────────────────────────────────────┐
│ **Wallets** (3/5)                           │
│                                         │
│ ┌Card (Primary)───────────────────────┐ │
│ │ ┌Row──────────────────────────────┐ │ │
│ │ │ [EVM Icon] **0x1234...5678**        │ │ │
│ │ │ [PRIMARY] [Active Pill]     [⋮] │ │ │
│ │ └─────────────────────────────────┘ │ │
│ │ Use for: Claim, Transaction         │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌Card (Secondary)─────────────────────┐ │
│ │ ┌Row──────────────────────────────┐ │ │
│ │ │ [SOL Icon] ABC1...XYZ2          │ │ │
│ │ │                     [Make Pri] [⋮]│ │ │
│ │ └─────────────────────────────────┘ │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [ + Connect New Wallet (Dotted Border)] │
└─────────────────────────────────────────┘
```

**Visual Notes:**

- **Primary Card**: Background sedikit lebih terang (`zinc-800`) atau border active (`zinc-700`).
- **Network Icon**: Wajib ada branding warna (Eth Blue, Sol Purple/Green) untuk easy scanning.
- **Actions**: "Make Pri" (Make Primary) bisa jadi quick action button ghost di sebelah kebab menu untuk accessibility cepat.

### B.3 KYC Status (Rejected State)

Handling rejection dengan empati.

```
┌─────────────────────────────────────────┐
│ **KYC Verification**                        │
│                                         │
│ ┌Status Card (Error Theme)────────────┐ │
│ │ [X Circle Icon Red]                 │ │
│ │ **Verification Failed**                 │ │
│ │                                     │ │
│ │ **Reason:**                             │ │
│ │ Document photo is blurry or dark.   │ │
│ │                                     │ │
│ │ [ Resubmit Verification (Primary) ] │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ **Need Help?**                              │
│ Check our [Validation Guide] or contact │
│ [Support].                              │
└─────────────────────────────────────────┘
```

---

## C. Component Visual Variants

### 1. AccountStatusCard

Card kecil di profile overview.

- **Props**: `type` ('bluecheck' | 'kyc'), `status` (active, pending, etc).
- **Architecture**:
  - `padding`: 12px
  - `radius`: 12px
  - `border`: 1px solid `zinc-800`
  - **Active Variation**: Border color menjadi `blue-800` (untuk Blue Check) atau `emerald-900` (untuk KYC) 30% opacity.

### 2. WalletItemRow

Baris wallet dalam list.

- **Primary Variant**:
  - Bagian tanda "PRIMARY" menggunakan `bg-indigo-500/10` `text-indigo-400`.
  - Address font `mono` untuk clarity angka/huruf.
- **Secondary/Default**:
  - Background transparent, hover effect `bg-zinc-800`.

### 3. ActionMenu & ConfirmModal

Destructive actions warning.

- **ConfirmModal (Destructive)**:
  - **Header Icon**: ⚠️ Warning Triangle (Amber) atau Trash Can (Red).
  - **Title**: "Remove Wallet?" (Bold).
  - **Confirm Button**: `bg-red-600` hover `bg-red-700`.
  - **Cancel Button**: `bg-transparent` text `zinc-400` hover `text-white`.
  - **Background Overlay**: Backdrop blur (blur-sm) + Black opacity 50%.

---

## D. Accessibility Notes (Mobile First)

1.  **Touch Targets**:
    - Kebab menu (`⋮`) pada wallet row harus memiliki padding clickable area minimal 44x44px.
    - Status card di profile overview harus full-card clickable.

2.  **Color Blindness**:
    - Jangan hanya mengandalkan warna Merah/Hijau.
    - Sertakan Icon (Check vs Cross vs Clock) dan Teks Label ("Verified", "Rejected") selalu.
    - Untuk Primary Wallet, badge teks "PRIMARY" wajib ada, jangan hanya border warna.

3.  **Readability**:
    - Wallet Address gunakan font `Monospace` (e.g., _JetBrains Mono_ atau _Roboto Mono_) agar karakter seperti `0`, `O`, `l`, `1` terbedakan.
    - Kontras teks rejection reason harus tinggi (Zinc-300 on Zinc-900), jangan Zinc-600 (terlalu gelap).

4.  **Loading States**:
    - Skeleton loader untuk Profile Overview harus merefleksikan layout Grid 2 kolom status card agar tidak terjadi layout shift (CLS) saat data load.
