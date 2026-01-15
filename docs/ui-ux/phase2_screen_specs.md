# Phase 2 — P1 Social + Growth: Screen Specifications

## A. Screen Specs

### 1. Feed Timeline Screen

#### Goal

Semua user dapat membaca feed global untuk discover updates, trending posts, dan project-related content. Posting gated untuk eligible users (Blue Check).

#### Components Used

- `BottomNav` — Tab navigasi (Feed aktif)
- `PageHeader` — Header dengan title
- `FeedPostCard` — Card untuk post item
- `FAB` (Floating Action Button) — Composer entry
- `Skeleton`, `EmptyState`, `InlineError`
- `GatingNotice` — Untuk non-eligible user

#### Primary Actions

**Read Feed** (All Users):

- **Label**: Scroll feed list
- **Trigger**: Screen mount, pull-to-refresh
- **Flow**: Load posts dari API, display list

**Compose** (Eligible Users Only):

- **Label**: Tap FAB (+ icon)
- **Trigger**: User tap FAB button
- **Flow**: Navigate ke Composer screen/modal

**View Project** (From Post):

- **Label**: Tap project tag/link di post
- **Trigger**: User tap project reference
- **Flow**: Navigate ke `/project/:projectId`

#### Secondary Actions

- Tap post → View Post Detail (jika content panjang/media)
- Tap "Report" → Show report modal
- Tap "Hide" → Remove post dari feed (local state)
- Pull-to-refresh → Re-fetch feed

#### States

**Loading State**:

- Show `<Skeleton>` untuk 5-7 FeedPostCard (match real card layout)
- FAB always visible (no skeleton)

**Empty State**:

- **Condition**: Feed list = 0 (bukan error, tapi memang kosong)
- **Message**: "Feed belum ada postingan"
- **Submessage**: "Feed akan terisi dari project trending dan updates"
- **CTA**: `<PrimaryButton>` "Jelajahi Project" → Navigate `/explore`

**Error State**:

- **Type**: Network error / API fail
- **Component**: `<InlineError>` di top feed
- **Message**: "Gagal memuat feed"
- **CTA**: "Coba Lagi" (retry fetch)

**FAB Gating** (Non-Eligible User):

- FAB visible tapi saat tap → Show `<GatingNotice>` modal
- **Title**: "Posting memerlukan Blue Check"
- **Message**: "Verifikasi akun untuk bisa posting di feed"
- **CTA**: `<PrimaryButton>` "Verifikasi Sekarang" → Navigate `/profile/blue-check`

#### FeedPostCard Spec

**Minimum Content**:

```
┌────────────────────────────────────┐
│ [@Username] [✓ Badge]  [2h ago]    │ ← Author row
│ ───────────────────────────────────│
│ Post content text here. Multi-line │ ← Content (max 5 lines, "Read More")
│ is supported. Lorem ipsum dolor... │
│ ───────────────────────────────────│
│ [🏷️ Project Alpha]                │ ← Project tag (if linked, tappable)
│ ───────────────────────────────────│
│ [View Details] [Report] [Hide]     │ ← Actions row
└────────────────────────────────────┘
```

**Components Breakdown**:

- **Author**: Username + Blue Check badge (if verified)
- **Timestamp**: Relative time (e.g., "2h ago", "Yesterday")
- **Content**: Text content, line-clamp 5, "Read More" jika >5 lines
- **Project Tag** (Optional): `<Chip>` dengan project name, tap → navigate project
- **Media** (Optional, if backend support): Image thumbnail (aspect 16:9, tap enlarge)
- **Actions**:
  - "View Details" (jika content panjang atau ada media)
  - "Report" (open report modal)
  - "Hide" (remove dari feed)

**DO NOT INCLUDE** (jika backend belum siap):

- Like button (jangan tampilkan fake button)
- Comment button (jangan tampilkan fake button)
- Share button (opsional, boleh skip)

#### Layout Structure

```
┌─────────────────────────────────────┐
│ Feed                        [FAB +] │ ← PageHeader + FAB
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ <FeedPostCard />                │ │ ← Feed list (vertical scroll)
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ <FeedPostCard />                │ │
│ └─────────────────────────────────┘ │
│ ...                                 │
├─────────────────────────────────────┤
│  [Home] [Explore] [Portfolio] [Feed]│ ← BottomNav (Feed active)
└─────────────────────────────────────┘
```

#### Gating Rules

| Condition          | Not Met    | Action                                  |
| ------------------ | ---------- | --------------------------------------- |
| User authenticated | No (guest) | Hide FAB entirely (atau show login CTA) |
| Blue Check ACTIVE  | No         | FAB visible, tap → `<GatingNotice>`     |

#### Analytics Events

| Event                  | Trigger             | Properties                   |
| ---------------------- | ------------------- | ---------------------------- |
| `feed_viewed`          | Screen mount        | -                            |
| `feed_scroll_depth`    | Scroll past N posts | `depth` (e.g., 10, 20)       |
| `feed_post_clicked`    | Tap post card       | `post_id`, `has_project`     |
| `feed_project_clicked` | Tap project tag     | `project_id`, `source: feed` |
| `feed_compose_attempt` | Tap FAB             | `eligible: true/false`       |
| `feed_post_reported`   | Submit report       | `post_id`, `reason`          |
| `feed_post_hidden`     | Tap hide            | `post_id`                    |

#### Acceptance Checklist

- [ ] All users dapat scroll feed dan view posts
- [ ] Empty state punya CTA "Explore Projects"
- [ ] FAB gating show reason + CTA untuk non-eligible
- [ ] Tap project tag navigate ke Project Detail
- [ ] Report/Hide actions tersedia untuk moderation
- [ ] Loading skeleton match real card layout

---

### 2. Composer Screen/Modal

#### Goal

Eligible users (Blue Check) dapat membuat post, dengan feedback states yang jelas. Non-eligible users dapat tau alasan dan cara verify.

#### Components Used

- `Modal` atau Full Screen (depends on design choice)
- `TextArea` — Multi-line text input
- `PrimaryButton`, `SecondaryButton`
- `GatingNotice` — Untuk non-eligible (shown before composer open)
- `TxToast` — Post submission feedback

#### Primary Action (Eligible)

- **Label**: "Post"
- **Trigger**: User tulis text + tap "Post"
- **Flow**: Submit post → Show feedback → Close composer → Refresh feed

#### Secondary Actions

- Tap "Batal" → Dismiss modal (confirm jika ada draft text)
- (Optional) Attach media → Open media picker
- (Optional) Tag project → Open project picker modal

#### Composer States

**Entry Validation** (Before Open):

- IF user not eligible → Show `<GatingNotice>` modal:
  ```
  Title: "Posting memerlukan Blue Check"
  Message: "Verifikasi akun Anda untuk bisa posting di feed"
  CTA: "Verifikasi Sekarang" → /profile/blue-check
  ```
- IF eligible → Open composer

**Composer Open** (Active):

- Text input enabled, focus active
- Character counter (jika ada limit, e.g., "240 / 500")
- "Post" button disabled jika text empty

**Submitting**:

- State: `posting=true`
- Button text: "Posting..." + spinner
- Input disabled (prevent edit during submit)

**Success**:

- `<TxToast variant="success">` "Postingan berhasil dikirim!"
- Auto-dismiss after 3s
- Close composer
- Refresh feed (optimistic update atau re-fetch)

**Failed**:

- `<TxToast variant="error">` "Posting gagal. [Reason]"
- Button re-enabled: "Post"
- User can retry atau edit

#### Layout Structure (Modal)

```
┌─────────────────────────────────────┐
│ Buat Postingan            [X Close] │ ← Modal Header
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ Tulis sesuatu...                │ │ ← TextArea (auto-focus)
│ │                                 │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│ 240 / 500                           │ ← Character counter
│                                     │
│ [Optional: Attach Media] (if ready) │
│ [Optional: Tag Project] (if ready)  │
│                                     │
├─────────────────────────────────────┤
│ [Batal]        [Post (Primary)]     │ ← Footer buttons
└─────────────────────────────────────┘
```

#### Gating Rules

| Condition                | Not Met | Action                                                                                                            |
| ------------------------ | ------- | ----------------------------------------------------------------------------------------------------------------- |
| User Status != BANNED    | No      | Show `<GatingNotice>`: Title "Akun dinonaktifkan", Msg "Akun Anda tidak dapat melakukan tindakan ini.", CTA: None |
| User Status != SUSPENDED | No      | Show `<GatingNotice>`: Title "Akun ditangguhkan", Msg "Akun ditangguhkan sementara.", CTA: "Hubungi Support"      |
| User authenticated       | No      | Show login prompt                                                                                                 |
| Blue Check ACTIVE        | No      | `<GatingNotice>` before open                                                                                      |
| Text length > 0          | No      | Button "Post" disabled + reason "Tulis sesuatu"                                                                   |
| Text length <= max       | No      | Button disabled + reason "Maksimum [X] karakter"                                                                  |

#### Draft Autosave (Optional, Recommended)

- Save draft to localStorage every 3s
- On re-open composer → restore draft (with notice "Draft restored")
- Clear draft after successful post

#### Analytics Events

| Event             | Trigger              | Properties                           |
| ----------------- | -------------------- | ------------------------------------ |
| `composer_opened` | Composer mount       | `eligible: true/false`               |
| `composer_gated`  | Non-eligible attempt | `reason: no_blue_check`              |
| `post_submitted`  | Tap "Post"           | `length`, `has_media`, `has_project` |
| `post_success`    | Post success         | `post_id`                            |
| `post_failed`     | Post fail            | `reason`                             |

#### Acceptance Checklist

- [ ] Non-eligible user see gating notice + CTA
- [ ] Eligible user can compose + submit
- [ ] Success feedback show toast + refresh feed
- [ ] Failed submission allow retry
- [ ] Draft autosave prevent data loss (optional but recommended)

---

### 3. Post Detail Screen (Optional)

#### Goal

Display full post content jika content di feed ter-truncate atau ada media. Provide same moderation actions.

#### Components Used

- `PageHeader` — Back + "Post Detail"
- `FeedPostCard` (expanded variant) — Full content tanpa truncate
- `SecondaryButton` — Report/Hide actions

#### Primary Action

- Tap "Back" → Navigate back to feed

#### Secondary Actions

- Same as feed: Report, Hide
- (Optional) Tap project tag → navigate

#### States

**Loading**: `<Skeleton>` match FeedPostCard layout
**Error**: `<InlineError>` + "Coba Lagi"
**404 (Post Deleted)**: EmptyState "Postingan tidak ditemukan" + CTA "Kembali ke Feed"

#### Layout Structure

```
┌─────────────────────────────────────┐
│ ← Back   Post Detail                │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ [@Username] [✓]    [2h ago]     │ │
│ ├─────────────────────────────────┤ │
│ │ Full post content here without  │ │ ← Full content (no truncate)
│ │ truncation. All text visible.   │ │
│ │ Lorem ipsum dolor sit amet...   │ │
│ ├─────────────────────────────────┤ │
│ │ [Media if any]                  │ │
│ ├─────────────────────────────────┤ │
│ │ [🏷️ Project Alpha]            │ │
│ ├─────────────────────────────────┤ │
│ │ [Report] [Hide]                 │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

#### Acceptance Checklist

- [ ] Full content visible tanpa truncate
- [ ] Back navigation works
- [ ] Report/Hide consistent dengan feed

---

### 4. Project Updates Tab (in Project Detail)

#### Goal

User dapat view semua updates dari project untuk transparansi dan trust. Important updates menonjol.

#### Components Used

- `Tabs` — Tab "Updates" di Project Detail
- `UpdateCard` — Update item component
- `StatusBadge` — "Important" badge
- `Skeleton`, `EmptyState`, `InlineError`

#### Primary Action

- **Label**: Tap UpdateCard
- **Trigger**: User tap update item
- **Flow**: Navigate ke `/update/:updateId`

#### Secondary Actions

- (Optional) Filter by tag (Important/Dev/Security)
- Pull-to-refresh → fetch latest updates

#### States

**Loading**: `<Skeleton>` untuk 3-5 UpdateCard

**Empty State**:

- **Message**: "Belum ada update dari project ini"
- **CTA**: `<SecondaryButton>` "Kembali ke Overview" → Switch tab

**Error**: `<InlineError>` + "Coba Lagi"

#### UpdateCard Spec

**Minimum Content**:

```
┌────────────────────────────────────┐
│ [IMPORTANT Badge (if flagged)]     │ ← Tag badge (optional)
│ Update Title Here                  │ ← Title (text-lg, semibold)
│ 12 Jan 2026 • 3 min read           │ ← Date + read time estimate
│ ───────────────────────────────────│
│ Snippet preview of the update      │ ← Preview (2 lines max)
│ content. Lorem ipsum dolor...      │
└────────────────────────────────────┘
```

**Components**:

- **Badge** (Optional): "IMPORTANT" (Status.warning), "DEV UPDATE" (Status.info), "SECURITY" (Status.error)
- **Title**: Update headline
- **Metadata**: Date + read time (optional)
- **Preview**: First 2 lines of body content
- **Tap Area**: Full card tappable

**Sorting Logic** (Assumption):

- Important updates di top
- Lalu sort by date DESC (newest first)

#### Layout Structure (Inside Project Detail Tab)

```
┌─────────────────────────────────────┐
│ [OVERVIEW][PARTICIPATION][UPDATES]  │ ← Tabs (Updates active)
├─────────────────────────────────────┤
│ Updates                             │ ← Section header
│ ┌─────────────────────────────────┐ │
│ │ <UpdateCard important />        │ │ ← Important update (top)
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ <UpdateCard />                  │ │ ← Regular update
│ └─────────────────────────────────┘ │
│ ...                                 │
└─────────────────────────────────────┘
```

#### Analytics Events

| Event                | Trigger         | Properties                  |
| -------------------- | --------------- | --------------------------- |
| `updates_tab_viewed` | Tab mount       | `project_id`                |
| `update_clicked`     | Tap update card | `update_id`, `is_important` |

#### Acceptance Checklist

- [ ] Updates list load dengan skeleton
- [ ] Empty state show CTA back to overview
- [ ] Important updates clearly visible (badge + top position)
- [ ] Tap update navigate to detail

---

### 5. Update Detail Screen

#### Goal

Display full update content dengan formatting, attachments, dan clear author info untuk trust.

#### Components Used

- `PageHeader` — Back + "Update"
- `InfoRow` — Metadata display
- `SecondaryButton` — Share (optional), Back to Project

#### Primary Action

- **Label**: Read update content
- **Trigger**: Screen mount
- **Flow**: Load update data, display content

#### Secondary Actions

- Tap "Back" → Navigate back to Project Detail (Updates tab)
- (Optional) Tap "Share" → Open share sheet
- Tap "View Project" → Navigate `/project/:projectId`

#### States

**Loading**: `<Skeleton>` untuk title + body
**Error**: `<InlineError>` + "Coba Lagi"
**404 (Update Deleted)**: EmptyState "Update tidak ditemukan" + CTA "Kembali ke Project"

#### Layout Structure

```
┌─────────────────────────────────────┐
│ ← Back   Update                     │
├─────────────────────────────────────┤
│ [IMPORTANT Badge (if flagged)]      │
│ Update Title Here (Large)           │ ← Title (text-2xl)
│                                     │
│ Posted by: Admin • 12 Jan 2026      │ ← Author + Date
│ Project: [Project Alpha →]          │ ← Project link (tappable)
│ ─────────────────────────────────── │
│                                     │
│ Update body content here. Full      │ ← Body (rich text simple)
│ markdown/rich text supported.       │   (paragraphs, lists, bold)
│ Lorem ipsum dolor sit amet...       │
│                                     │
│ [Attachment if any: Image/Link]     │
│                                     │
│ ─────────────────────────────────── │
│ [View Project] [Share (optional)]   │ ← Actions
└─────────────────────────────────────┘
```

#### Content Spec

**Required Fields**:

- Title (text-2xl, semibold)
- Author label (e.g., "Admin", "Project Team") — **Assumption**: Display generic "Admin" jika backend tidak provide specific author
- Timestamp (full date, e.g., "12 Jan 2026, 10:30 AM")
- Body (rich text: paragraphs, bold, italic, lists — keep simple, no complex formatting)

**Optional Fields**:

- Important badge (if flagged)
- Attachments (image, file download link)
- Tags (Important/Dev/Security)

#### Analytics Events

| Event                    | Trigger          | Properties                |
| ------------------------ | ---------------- | ------------------------- |
| `update_detail_viewed`   | Screen mount     | `update_id`, `project_id` |
| `update_project_clicked` | Tap project link | `project_id`              |
| `update_shared`          | Tap share        | `update_id`               |

#### Acceptance Checklist

- [ ] Full content readable pada mobile
- [ ] Author + timestamp visible untuk trust
- [ ] "View Project" link clearly visible
- [ ] Back navigation to Project Detail works
- [ ] Rich text rendering (bold, list, paragraphs)

---

### 6. Trending UI Refinement (Light)

#### Goal

Polish trending section di Home/Explore dengan category chips dan clear empty states.

#### Components Used

- Existing `ProjectCard` (compact)
- `Chip` — Category filter chips
- `Tooltip` (optional) — "Why trending" info

#### Primary Action

- Tap ProjectCard → Navigate `/project/:projectId`

#### Secondary Actions

- Tap category chip → Filter trending by category
- (Optional) Hover/tap info icon → Show tooltip "Trending based on activity last 24h"

#### Refinement Spec

**Category Chips** (Horizontal scroll):

```
[All] [Presale] [Fairlaunch] [Verified Only]
```

- **All**: Default, no filter
- **Presale**: Filter type=presale
- **Fairlaunch**: Filter type=fairlaunch
- **Verified Only**: Filter KYC/Audit verified projects

**Chip Visual**:

- Default (inactive): `bg.card`, `border.subtle`, `text.secondary`
- Active: `bg.primary.soft`, `border.primary`, `text.primary`

**States**

**Loading**: Skeleton untuk chips + cards

**Empty (After Filter)**:

- **Message**: "Tidak ada project trending di kategori ini"
- **CTA**: Reset filter (tap "All" chip automatically)

**Fallback (0 Trending Projects)**:

- **Assumption**: Jika trending engine tidak return data, fallback ke "Newest" atau "Featured"
- **Notice**: `<InfoBox>` "Menampilkan project terbaru" (subtle info, bukan error)

#### Layout (Home Screen Integration)

```
┌─────────────────────────────────────┐
│ 🔥 Trending          Lihat Semua →  │ ← Section header
│ ┌───────────────────────────────┐   │
│ │[All][Presale][Fairlaunch][✓] │   │ ← Category chips (scrollable)
│ └───────────────────────────────┘   │
│ ┌───────────────────────────────┐   │
│ │ <ProjectCard compact />       │   │ ← Trending list
│ │ <ProjectCard compact />       │   │
│ └───────────────────────────────┘   │
└─────────────────────────────────────┘
```

#### "Why Trending" Tooltip (Optional)

- Icon: Info icon (ⓘ) next to "Trending" header
- Tap/Hover → Show tooltip:
  ```
  "Project trending berdasarkan aktivitas
  dan engagement dalam 24 jam terakhir"
  ```

#### Analytics Events

| Event                   | Trigger           | Properties                          |
| ----------------------- | ----------------- | ----------------------------------- |
| `trending_chip_clicked` | Tap category chip | `chip: presale/fairlaunch/verified` |
| `trending_info_viewed`  | Tap info icon     | -                                   |

#### Acceptance Checklist

- [ ] Category chips implemented dan functional
- [ ] Empty state untuk filtered trending
- [ ] Fallback ke "Newest" jika trending kosong
- [ ] (Optional) Tooltip show "why trending"

---

### 7. Report Modal Screen/Dialog

#### Goal

User dapat melaporkan konten yang melanggar aturan komunitas dengan alasan yang jelas.

#### Components Used

- `Modal`
- `RadioGroup` — Pilihan alasan
- `TextArea` — Detail tambahan (optional)
- `PrimaryButton` (Kirim), `SecondaryButton` (Batal)
- `TxToast` — Feedback

#### Options (Reasons)

1. Spam atau iklan
2. Konten menyesatkan
3. Ujaran kebencian
4. Penipuan atau scam
5. Lainnya

#### States

- **Default**: "Kirim Laporan" disabled until reason selected.
- **Submitting**: Button "Mengirim..." + spinner, inputs disabled.
- **Success**: Close modal + Toast "Laporan dikirim. Terima kasih atas masukannya."
- **Failure**: Toast "Gagal mengirim laporan. Coba lagi."
- **Already Reported**: Button di feed grayed out + tooltip "Anda sudah melaporkan postingan ini" (Client-side check).

#### Layout Structure

```
┌─────────────────────────────────────┐
│ Laporkan Postingan        [X Close] │
├─────────────────────────────────────┤
│ Pilih alasan pelaporan:             │
│ [ ] Spam atau iklan                 │
│ [ ] Konten menyesatkan              │
│ [ ] Ujaran kebencian                │
│ [ ] Penipuan atau scam              │
│ [ ] Lainnya                         │
│                                     │
│ Detail tambahan (opsional):         │
│ [ TextArea (max 200 chars)        ] │
│                                     │
├─────────────────────────────────────┤
│ [Batal]      [Kirim Laporan]        │
└─────────────────────────────────────┘
```

---

## B. Component Specs Tambahan

### B.1 FeedPostCard

**Props**:

```typescript
interface FeedPostCardProps {
  post: {
    id: string;
    author: {
      username: string;
      verified: boolean;
    };
    content: string;
    project?: {
      id: string;
      name: string;
    };
    media?: {
      type: 'image' | 'video';
      url: string;
    };
    createdAt: Date;
  };
  onTapPost?: () => void;
  onTapProject?: (projectId: string) => void;
  onReport?: (postId: string) => void;
  onHide?: (postId: string) => void;
}
```

**Visual Variants**:

- **Compact** (Feed list): Content max 5 lines, "Read More" link
- **Expanded** (Post Detail): Full content, no truncate

**States**:

- Default
- Hidden (opacity-50, strikethrough, "Post hidden")

---

### B.2 UpdateCard

**Props**:

```typescript
interface UpdateCardProps {
  update: {
    id: string;
    title: string;
    preview: string;
    important: boolean;
    tag?: 'IMPORTANT' | 'DEV' | 'SECURITY';
    createdAt: Date;
    readTime?: number; // minutes
  };
  onTap: () => void;
}
```

**Visual**:

- Card: `bg.card`, `border.subtle`, `p-4`, `radius.lg`
- Important badge: Top-left, `StatusBadge` with warning color
- Hover: `border.active` + `shadow-sm`

---

### B.3 ComposerModal

**Props**:

```typescript
interface ComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string, projectId?: string, media?: File) => Promise<void>;
  eligibile: boolean;
  maxLength?: number; // default 500
}
```

**Features**:

- Auto-focus textarea
- Character counter
- Draft autosave (localStorage)
- Submit loading state

---

## C. Assumptions Made (Safe Defaults)

1. **Posting Eligibility**: Asumsi hanya Blue Check ACTIVE yang bisa post. Jika ada syarat lain (e.g., min wallet balance), tambahkan di gating check.

2. **Post Moderation**: Asumsi posting langsung publish (tidak pending review). Jika ada moderation queue, tambahkan status "Pending Review" dan disable edit.

3. **Media Upload**: Support image only (video skip untuk Phase 2). Jika backend support video, tambahkan video player di FeedPostCard.

4. **Update Author**: Display generic label "Admin" atau "Project Team" jika backend tidak provide specific author info.

5. **Update Tags**: Asumsi backend provide tag field (IMPORTANT/DEV/SECURITY). Jika belum, skip tag dan hanya sort by date.

6. **Feed Source**: Asumsi global feed (bukan per-project feed). Jika ada per-project feed, tambahkan tab di Project Detail.

7. **Like/Comment**: DO NOT display jika backend belum ready (sesuai constraint). Hanya show View/Report/Hide.

8. **Trending Fallback**: Jika trending 0 results, fallback ke "Newest" projects dengan subtle notice.

---

## D. Global UX Rules Applied

1. **Gating Pattern**: Semua gated features (Composer) show `<GatingNotice>` dengan reason + CTA (bukan error).

2. **No Fake Buttons**: Like/Comment tidak ditampilkan jika backend belum siap (avoid user frustration).

3. **Loading/Empty/Error**: Semua screens punya 3 states ini dengan CTA yang jelas.

4. **Project Linkback**: Semua content yang terkait project (FeedPost, Update) punya link ke Project Detail.

5. **Moderation Affordance**: Report + Hide tersedia di semua user-generated content untuk safety.

---

## Definition of Done Phase 2 ✅

Phase 2 complete jika:

- [x] Feed timeline screen spec lengkap (read for all, composer gated)
- [x] Composer spec dengan gating + submission feedback
- [x] Post detail spec (optional tapi recommended)
- [x] Project Updates tab + detail spec
- [x] Trending refinement spec (category chips + fallback)
- [x] Component specs (FeedPostCard, UpdateCard, ComposerModal)
- [x] Semua screens punya loading/empty/error states
- [x] Gating rules documented dengan reason + CTA
- [x] Moderation actions (Report/Hide) tersedia
- [x] Analytics events defined

**Handoff Ready**: Dokumen ini siap untuk FE implementation. Visual design dari Gemini dan edge case review dari Opus akan follow.

---

## Open Questions (Documented)

1. **Posting Eligibility**: Hanya Blue Check atau ada syarat tambahan? → **Assumption**: Blue Check only
2. **Post Moderation**: Publish langsung atau pending review? → **Assumption**: Publish langsung
3. **Media Upload**: Image only atau juga video? → **Assumption**: Image only untuk Phase 2
4. **Update Author**: Specific author info atau generic "Admin"? → **Assumption**: Generic "Admin"
5. **Update Tags**: Backend provide tags atau FE hardcode? → **Assumption**: Backend provide
6. **Feed Source**: Global feed atau per-project feed? → **Assumption**: Global feed only
