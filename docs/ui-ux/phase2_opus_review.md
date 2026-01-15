# Phase 2 — UX QA Review (Opus)

Review hasil Phase 2 Screen Specifications dari Sonnet untuk safety, gating, moderation, dan konsistensi.

---

## A. Gating & Moderation Review

### A.1 Composer Gating Audit

**✅ PASS: Gating Pattern Correct**

| Check                             | Status | Notes                                         |
| --------------------------------- | ------ | --------------------------------------------- |
| Non-eligible attempt shows reason | ✅     | "Posting memerlukan Blue Check"               |
| CTA provided                      | ✅     | "Verifikasi Sekarang" → `/profile/blue-check` |
| Blocking before action            | ✅     | GatingNotice shown before composer opens      |
| Guest user handled                | ✅     | FAB hidden or login CTA                       |

**⚠️ POTENTIAL ISSUES:**

1. **Gating Message Too Technical** (MEDIUM)
   - Current: "Posting memerlukan Blue Check"
   - Problem: New users may not know what "Blue Check" means
   - Fix: Add brief explanation in message

2. **No Gating for Suspended Users** (HIGH)
   - Current spec only covers: Guest, Non-Blue Check
   - Missing: What if user is SUSPENDED or BANNED?
   - Fix: Add handling for suspended/banned state with different message

3. **Eligibility Status Unknown State** (MEDIUM)
   - What if eligibility check fails (API error)?
   - Recommendation: Show "Unable to verify. Try again" vs blocking entirely

### A.2 Moderation Flows Audit

**Report Flow**:
| Step | Specified | Notes |
|------|-----------|-------|
| Tap "Report" | ✅ | Listed in actions |
| Report modal opens | ⚠️ | Modal not specified in detail |
| Reason selection | ❌ | Not specified - what reasons? |
| Confirmation | ❌ | Not specified |
| Success feedback | ❌ | Not specified |
| Already reported handling | ❌ | Not specified |

**Hide Flow**:
| Step | Specified | Notes |
|------|-----------|-------|
| Tap "Hide" | ✅ | Listed |
| Immediate hide (local) | ✅ | "Remove post dari feed (local state)" |
| Undo option | ❌ | Not specified - can user undo? |
| Persist across sessions | ❌ | Not specified |

**⚠️ CRITICAL GAP: Report Modal Not Specified**

### A.3 Publish State Handling

**Current Assumption**: Posting langsung publish (instant)

**⚠️ MISSING SPEC for Pending Review Scenario:**

- If backend uses moderation queue, what happens?
- Recommendation: Add optional state handling

**Proposed States (If Moderation Queue Enabled):**

```
Post Submitted → "PENDING_REVIEW"
UI: Toast "Postingan sedang ditinjau. Akan muncul setelah disetujui."
Portfolio/History: Show post as "Pending" with badge
Success: Post appears in feed
Rejected: Notification "Postingan ditolak: [Reason]"
```

---

## B. Consistency Check

### B.1 Component Reuse (Phase 0 Compliance)

| Component      | Used In            | Phase 0 Defined   | Verdict |
| -------------- | ------------------ | ----------------- | ------- |
| `GatingNotice` | Composer           | ✅ Yes            | ✅      |
| `Skeleton`     | All screens        | ✅ Yes            | ✅      |
| `EmptyState`   | Feed, Updates      | ✅ Yes            | ✅      |
| `InlineError`  | Error states       | ✅ Yes            | ✅      |
| `StatusBadge`  | Update tags        | ✅ Yes            | ✅      |
| `TxToast`      | Post feedback      | ✅ Yes            | ✅      |
| `PageHeader`   | All detail screens | ✅ Yes            | ✅      |
| `Chip`         | Trending filters   | ✅ Yes            | ✅      |
| `FAB`          | Feed composer      | ⚠️ Not in Phase 0 | **NEW** |
| `FeedPostCard` | Feed               | ⚠️ New component  | **NEW** |
| `UpdateCard`   | Updates            | ⚠️ New component  | **NEW** |

**Assessment**: 3 new components introduced (FAB, FeedPostCard, UpdateCard). FAB was not defined in Phase 0 component inventory - should be added.

### B.2 Empty/Loading/Error States Completeness

| Screen        | Loading     | Empty         | Error      | 404/Deleted | Verdict |
| ------------- | ----------- | ------------- | ---------- | ----------- | ------- |
| Feed Timeline | ✅          | ✅            | ✅         | N/A         | ✅      |
| Composer      | ✅ (submit) | N/A           | ✅         | N/A         | ✅      |
| Post Detail   | ✅          | N/A           | ✅         | ✅          | ✅      |
| Updates Tab   | ✅          | ✅            | ✅         | N/A         | ✅      |
| Update Detail | ✅          | N/A           | ✅         | ✅          | ✅      |
| Trending      | ✅          | ✅ (fallback) | ⚠️ Missing | N/A         | **FIX** |

**⚠️ Trending Error State Missing**: No error handling if trending API fails

### B.3 Navigation Dead-End Audit

**✅ All Screens Have Back Links:**

| Screen        | Back Link                   | Additional Nav      | Verdict |
| ------------- | --------------------------- | ------------------- | ------- |
| Feed Timeline | N/A (root tab)              | BottomNav           | ✅      |
| Post Detail   | "← Back" to Feed            | -                   | ✅      |
| Updates Tab   | Part of Project Detail tabs | Switch tab, Back    | ✅      |
| Update Detail | "← Back" to Project         | "View Project" link | ✅      |

**No Dead-Ends Identified ✅**

### B.4 Cross-Screen Consistency

| Pattern                | Feed              | Post Detail | Updates            | Verdict             |
| ---------------------- | ----------------- | ----------- | ------------------ | ------------------- |
| Report action location | Bottom row        | Bottom row  | N/A (no report)    | ✅                  |
| Hide action location   | Bottom row        | Bottom row  | N/A                | ✅                  |
| Project link style     | Chip              | Chip        | Text link          | ⚠️ **Inconsistent** |
| Author display         | @Username + badge | Same        | "Posted by: Admin" | ⚠️ **Different**    |

**⚠️ Minor Inconsistency**: Project link in Updates uses "Project: [Name →]" vs Chip in Feed. Consider unifying.

---

## C. Microcopy Pack v1 (Phase 2)

### C.1 Gating Reasons

**Composer Gating:**

- **Title**: "Posting memerlukan verifikasi"
- **Message**: "Akun Anda perlu diverifikasi (Blue Check) untuk bisa posting di feed. Proses verifikasi hanya beberapa menit."
- **CTA**: "Mulai Verifikasi"

**Suspended User** (NEW):

- **Title**: "Akun ditangguhkan"
- **Message**: "Akun Anda sedang ditangguhkan sementara. Hubungi support untuk info lebih lanjut."
- **CTA**: "Hubungi Support"

**Banned User** (NEW):

- **Title**: "Akun dinonaktifkan"
- **Message**: "Akun Anda tidak dapat melakukan tindakan ini."
- **CTA**: (No CTA, informational only)

**Eligibility Check Failed:**

- **Title**: "Tidak dapat memverifikasi status"
- **Message**: "Gagal memeriksa status akun. Coba lagi nanti."
- **CTA**: "Coba Lagi"

### C.2 Posting Submit/Fail Copy

**Submit States:**

- Button (submitting): "Mengirim..."
- Toast (success): "Postingan berhasil dikirim!"
- Toast (failed - generic): "Gagal mengirim postingan. Coba lagi."
- Toast (failed - network): "Tidak ada koneksi. Periksa jaringan dan coba lagi."
- Toast (failed - content policy): "Postingan ditolak: Konten melanggar kebijakan."
- Toast (failed - rate limit): "Terlalu banyak postingan. Tunggu beberapa menit."

**Draft Autosave:**

- Restored notice: "Draft tersimpan dipulihkan"
- Discard confirm: "Buang draft yang belum dikirim?"
  - Buttons: "Buang" | "Simpan Draft"

**Pending Review (If Applicable):**

- Toast: "Postingan sedang ditinjau"
- Subtext: "Akan muncul di feed setelah disetujui"

### C.3 Report/Hide Confirmation Copy

**Report Modal:**

- **Title**: "Laporkan Postingan"
- **Subtitle**: "Mengapa Anda melaporkan konten ini?"
- **Options**:
  - "Spam atau iklan"
  - "Konten menyesatkan"
  - "Ujaran kebencian"
  - "Penipuan atau scam"
  - "Lainnya"
- **Selected placeholder**: "Detail tambahan (opsional)"
- **Submit**: "Kirim Laporan"
- **Cancel**: "Batal"
- **Success Toast**: "Laporan dikirim. Terima kasih atas masukannya."
- **Already Reported**: "Anda sudah melaporkan postingan ini"

**Hide Confirmation:**

- **Inline Toast**: "Postingan disembunyikan"
- **Undo CTA**: "Urungkan" (appears for 5s)
- **After Undo**: "Postingan ditampilkan kembali"

### C.4 Updates Empty State Copy

- **Empty Title**: "Belum ada update"
- **Empty Message**: "Project ini belum memposting update apapun."
- **CTA**: "Lihat Overview" (switch tab)

**Update Not Found (404):**

- **Title**: "Update tidak ditemukan"
- **Message**: "Update ini mungkin sudah dihapus atau tidak tersedia."
- **CTA**: "Kembali ke Project"

### C.5 Feed Empty State Copy

- **Title**: "Feed masih kosong"
- **Message**: "Belum ada postingan di feed. Jelajahi project untuk menemukan update terbaru."
- **CTA**: "Jelajahi Project"

### C.6 Trending Fallback Copy

- **Fallback Notice**: "Menampilkan project terbaru"
- **Empty Filter Notice**: "Tidak ada project trending di kategori ini"
  - Subtext: "Coba kategori lain atau lihat semua project"

---

## D. Fix List untuk Sonnet

### BLOCKER (Must Fix)

| #   | Issue                                | Location     | Fix                                                                      |
| --- | ------------------------------------ | ------------ | ------------------------------------------------------------------------ |
| B1  | Report modal flow not specified      | FeedPostCard | Add complete Report Modal spec: reasons, submission, success/fail states |
| B2  | Suspended/Banned user gating missing | Composer     | Add handling for user_status=SUSPENDED/BANNED with appropriate messaging |

### HIGH (Fix Before Implementation)

| #   | Issue                              | Location            | Fix                                                                     |
| --- | ---------------------------------- | ------------------- | ----------------------------------------------------------------------- |
| H1  | Hide undo not specified            | FeedPostCard        | Add undo mechanism: Toast with "Urungkan" for 5s, then persist hide     |
| H2  | Trending error state missing       | Trending Refinement | Add error handling: InlineError + "Coba Lagi" if API fails              |
| H3  | Eligibility check failure handling | Composer            | Add fallback: if eligibility API fails, show "Unable to verify" + retry |
| H4  | Project link style inconsistent    | Feed vs Updates     | Unify: use Chip component for project references everywhere             |
| H5  | FAB not in Phase 0 inventory       | Phase 0 Components  | Add FAB to Phase 0 component inventory with spec                        |

### MEDIUM (Nice to Have)

| #   | Issue                        | Location              | Fix                                                            |
| --- | ---------------------------- | --------------------- | -------------------------------------------------------------- |
| M1  | Gating message too technical | Composer GatingNotice | Improve copy: explain what Blue Check is briefly               |
| M2  | Already reported handling    | Report flow           | Add state: gray out Report button + "Sudah dilaporkan" tooltip |
| M3  | Hide persistence unclear     | FeedPostCard          | Clarify: persists server-side or local session only?           |
| M4  | Pending Review state missing | Composer              | If moderation queue exists, add PENDING_REVIEW UI state        |
| M5  | Rate limit feedback missing  | Composer              | Add rate limit error handling with countdown                   |
| M6  | Author display inconsistent  | Feed vs Updates       | Unify author display: "@Username" or "Posted by:" consistently |

### LOW (Polish)

| #   | Issue                              | Location     | Fix                                                                      |
| --- | ---------------------------------- | ------------ | ------------------------------------------------------------------------ |
| L1  | Draft discard confirmation missing | Composer     | Add confirm modal if text exists when closing                            |
| L2  | Character limit feedback missing   | Composer     | Add visual warning when approaching limit (e.g., red counter at 480/500) |
| L3  | Trending info icon accessibility   | Trending     | Ensure tooltip accessible via keyboard/tap, not just hover               |
| L4  | Time relative format not specified | FeedPostCard | Specify: "2h", "Yesterday", ">7d show full date"                         |

---

## E. Report Modal Spec (Missing - BLOCKER FIX)

**Proposed Complete Spec:**

```
┌─────────────────────────────────────┐
│ Laporkan Postingan        [X Close] │
├─────────────────────────────────────┤
│ Mengapa Anda melaporkan ini?        │
│                                     │
│ ○ Spam atau iklan                   │
│ ○ Konten menyesatkan                │
│ ○ Ujaran kebencian                  │
│ ○ Penipuan atau scam                │
│ ○ Lainnya                           │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Detail tambahan (opsional)      │ │ ← TextArea (max 200 chars)
│ └─────────────────────────────────┘ │
│                                     │
├─────────────────────────────────────┤
│ [Batal]          [Kirim Laporan]    │
└─────────────────────────────────────┘
```

**States:**

- Default: Reason not selected → "Kirim Laporan" disabled
- Selected: Button enabled
- Submitting: "Mengirim..." + spinner
- Success: Close modal + Toast "Laporan dikirim"
- Failed: Toast "Gagal mengirim. Coba lagi"
- Already Reported: Show inline notice, hide form

---

## Summary & Recommendations

**Overall Assessment**: 🟡 **GOOD with Critical Fixes Required**

**Strengths:**

- ✅ Core gating pattern correctly applied (Blue Check)
- ✅ All screens have loading/empty/error states
- ✅ No navigation dead-ends
- ✅ Good component reuse from Phase 0
- ✅ "No fake buttons" rule respected (Like/Comment omitted)

**Critical Gaps:**

- ⚠️ Report modal completely unspecified (BLOCKER)
- ⚠️ Suspended/Banned user handling missing (BLOCKER)
- ⚠️ Hide undo mechanism missing (HIGH)
- ⚠️ Trending error state missing (HIGH)

**Recommended Actions:**

1. Sonnet fix B1-B2 (BLOCKER) immediately
2. Sonnet fix H1-H5 (HIGH) before FE handoff
3. Use Microcopy Pack C as reference for copy implementation
4. Add FAB to Phase 0 component inventory

**Microcopy Ready**: Section C provides complete copy for all Phase 2 social interactions.

**Next Step**: Sonnet address Blocker + High fixes → Gemini visual review → FE implementation.
