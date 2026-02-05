## Presale E2E — Task List Perubahan (Prioritized)

Tanggal: 2026-02-05  
Tujuan: menyelesaikan gap antara **spec presale** (docs/modul + UI/UX) vs implementasi saat ini (DB/API/UI/SC).

Referensi report: `.cursor/presale_e2e_flow_report.md`

---

### P0 (blocking end-to-end “minimal bisa jalan”)

#### P0-1 — Samakan status submit ↔ approve/reject
- **Problem**: submit endpoint set `SUBMITTED`, approve/reject endpoint expect `SUBMITTED_FOR_REVIEW`.
- **Change**:
  - Ubah `POST /api/rounds/[id]/submit` agar set `launch_rounds.status = 'SUBMITTED_FOR_REVIEW'`.
  - Pastikan semua query/filter/public-read juga konsisten memakai status tersebut.
- **Files**:
  - `apps/web/app/api/rounds/[id]/submit/route.ts`
  - (cek pemakai status) `apps/web/app/api/admin/rounds/[id]/approve/route.ts`, `apps/web/app/api/admin/rounds/[id]/reject/route.ts`, `apps/web/app/api/admin/rounds/route.ts`
  - UI list/detail filter: `apps/web/app/presales/page.tsx`, `apps/web/app/presales/[id]/page.tsx`, `apps/web/app/api/rounds/route.ts`
- **Acceptance**:
  - Round bisa submit → approve/reject tanpa 400 error status.

#### P0-2 — Fix bug `round_id` di contribute intent
- **Problem**: `contribute/intent` memakai `params.id` dari `PresaleParams` (undefined), bukan route param.
- **Change**:
  - Ganti semua `params.id` yang salah menjadi `route params.id`.
- **Files**:
  - `apps/web/app/api/rounds/[id]/contribute/intent/route.ts`
- **Acceptance**:
  - Intent insert `contributions.round_id` benar (UUID round), tidak lagi null/undefined.

#### P0-3 — Rapikan mismatch props di Presale Detail “Contribute”
- **Problem**: `PresaleDetailClient` memanggil `ContributionForm` dengan props yang tidak match; `ContributionForm` butuh `roundAddress` (on-chain).
- **Change**:
  - Tentukan single source of truth alamat kontrak presale:
    - pakai `launch_rounds.round_address` (untuk presale SC), atau
    - pakai `launch_rounds.contract_address` (kalau diseragamkan).
  - Update `PresaleDetailClient` untuk passing `roundAddress` yang benar.
  - Pastikan `ContributionForm` dan UI gating `enabled` berdasarkan DB + time state (bukan hard-coded).
- **Files**:
  - `apps/web/app/presales/[id]/PresaleDetailClient.tsx`
  - `apps/web/src/components/presale/ContributionForm.tsx`
- **Acceptance**:
  - Tab Contribute bisa render tanpa crash dan bisa trigger tx (minimal di testnet).

#### P0-4 — Admin review queue UI (unblock lifecycle)
- **Problem**: backend queue ada (`GET /api/admin/rounds`), tapi halaman admin review presale tidak ada.
- **Change**:
  - Buat page `/admin/presales/review`:
    - list queue (`status=SUBMITTED_FOR_REVIEW`)
    - detail panel
    - approve/reject (reason required)
  - Proteksi admin (minimal check `profiles.is_admin`).
- **Files** (baru + reuse existing endpoints):
  - (baru) `apps/web/app/admin/presales/review/page.tsx` + components/actions
  - `apps/web/app/api/admin/rounds/route.ts`
  - `apps/web/app/api/admin/rounds/[id]/approve/route.ts`
  - `apps/web/app/api/admin/rounds/[id]/reject/route.ts`
- **Acceptance**:
  - Admin bisa approve → round jadi `APPROVED_TO_DEPLOY`.
  - Admin bisa reject → round jadi `REJECTED` + reason tampil di owner dashboard.

#### P0-5 — Bersihkan Create Presale Wizard server-actions yang out-of-sync
- **Problem**: `submitPresale()` dan `createPresaleDraft()` di `create/presale/actions.ts` insert field yang tidak ada (`network`, `compliance_snapshot`) dan tidak mengisi `project_id` → berpotensi gagal total.
- **Change (disarankan)**:
  - Rute-kan wizard ke **API yang sudah benar**:
    - draft: `POST /api/rounds` + `PATCH /api/rounds/[id]`
    - submit: `POST /api/rounds/[id]/submit`
  - Atau, jika tetap server-action: pastikan insert memakai schema `launch_rounds` yang benar (`project_id`, `chain`, `type`, `token_address`, `raise_asset`, `start_at`, `end_at`, `params`, `status`).
- **Files**:
  - `apps/web/app/create/presale/actions.ts`
  - `apps/web/app/create/presale/CreatePresaleWizard.tsx`
  - `apps/web/app/api/rounds/route.ts`
  - `apps/web/app/api/rounds/[id]/route.ts`
  - `apps/web/app/api/rounds/[id]/submit/route.ts`
- **Acceptance**:
  - Owner bisa create draft → update → submit, dan record `launch_rounds` valid di DB.

---

### P1 (buat beneran “terhubung” ke SC: deploy + finalize + fee/vesting)

#### P1-1 — Implement deploy presale on-chain via `PresaleFactory`
- **Problem**: SC factory siap, tapi tidak ada endpoint/flow deploy yang mengisi `round_address`/`vesting_vault_address`.
- **Change**:
  - Tambah endpoint `POST /api/admin/rounds/[id]/deploy` (atau owner-trigger tapi eksekusi admin):
    - validasi `status == APPROVED_TO_DEPLOY`
    - call `PresaleFactory.createPresale(...)`
    - parse event `PresaleCreated(...)`
    - update DB: `round_address`, `vesting_vault_address`, `schedule_salt`, `status='DEPLOYED'` (atau `APPROVED`→`LIVE` via scheduler/time)
  - Tambah UI untuk “Deploy on-chain” (route yang sudah di-link di owner dashboard).
- **Files**:
  - (baru) `apps/web/app/api/admin/rounds/[id]/deploy/route.ts`
  - (baru) `apps/web/app/presales/[id]/deploy/page.tsx` (atau modal/owner dashboard action)
  - SC ABI usage: `apps/web/src/lib/web3/presale-contracts.ts` (atau artifacts)
- **Acceptance**:
  - Deploy menghasilkan `round_address` & `vesting_vault_address` terisi di DB.

#### P1-2 — Contribute: verifikasi tx sebelum `CONFIRMED`
- **Problem**: confirm endpoint menerima `tx_hash` tanpa verifikasi receipt.
- **Change**:
  - Di `contribute/confirm`, fetch receipt via RPC (sesuai chain), verify:
    - tx sukses
    - `to == round_address`
    - event `Contributed(...)` match amount/wallet (opsional minimal)
  - Baru set `status='CONFIRMED'`.
- **Files**:
  - `apps/web/app/api/rounds/[id]/contribute/confirm/route.ts`
- **Acceptance**:
  - DB totals tidak bisa dimanipulasi dengan tx_hash palsu.

#### P1-3 — Finalize on-chain jadi sumber kebenaran
- **Problem**: `/api/admin/rounds/[id]/finalize` hanya update DB; SC finalize mengatur fee split, funding vesting, refund enable.
- **Change**:
  - Tambah endpoint finalize on-chain:
    - jika success: call `PresaleRound.finalizeSuccess(merkleRoot, totalVestingAllocation)`
    - jika fail: call `PresaleRound.finalizeFailed(reason)`
  - Generate `merkleRoot` + isi `presale_merkle_proofs` dari allocations.
  - Update DB `status/result/merkle_root/tge_timestamp/finalized_at` berdasarkan on-chain event.
- **Files**:
  - `apps/web/app/api/admin/rounds/[id]/finalize/route.ts` (refactor / split endpoint)
  - `apps/web/app/api/presale/[id]/merkle-proof/route.ts` (shape consistency)
  - SC reference: `packages/contracts/contracts/std-presale/*`
- **Acceptance**:
  - Setelah finalize success:
    - fee split terjadi (vault balances berubah)
    - merkle root set di `MerkleVesting`
    - claim on-chain bekerja untuk user yang punya proof.

---

### P2 (hardening + success gating + lock/vesting ops)

#### P2-1 — Vesting claim: end-to-end (UI → chain → DB)
- **Change**:
  - Fix mismatch response `merkle-proof` vs `VestingClaimer`.
  - Wire UI claim untuk memanggil `MerkleVesting.claim(totalAllocation, proof)`.
  - Setelah tx confirmed, panggil `/api/rounds/[id]/vesting/claim-confirm` untuk membuat record dan worker memverifikasi.
- **Files**:
  - `apps/web/src/components/presale/VestingClaimer.tsx`
  - `apps/web/app/api/presale/[id]/merkle-proof/route.ts`
  - `apps/web/app/api/rounds/[id]/vesting/claim-confirm/route.ts`
  - `apps/web/src/lib/web3/presale-hooks.ts`

#### P2-2 — Refund: pilih jalur resmi (on-chain vs request/tx-manager)
- **Rekomendasi**:
  - Untuk presale SC: gunakan on-chain `claimRefund()` sebagai jalur utama, dan DB hanya untuk tracking.
  - Kalau tetap “refund request”, implement tx intent + verify receipt sebelum mark `COMPLETED`.
- **Files**:
  - UI refund: `apps/web/app/presales/[id]/PresaleDetailClient.tsx` (+ `RefundCard.tsx`)
  - API: `apps/web/app/api/rounds/[id]/refund/*`

#### P2-3 — Liquidity lock orchestration + success gating
- **Change**:
  - Setelah finalize success, jalankan `vesting/setup` dan `lock/setup`, lalu `mark-success` ketika gates passed.
  - Tambah worker verifier untuk `vesting_claims` dan `liquidity_locks` tx_hash.
- **Files**:
  - `apps/web/app/api/admin/rounds/[id]/vesting/setup/route.ts`
  - `apps/web/app/api/admin/rounds/[id]/lock/setup/route.ts`
  - `apps/web/app/api/admin/rounds/[id]/mark-success/route.ts`
  - Worker baru di `services/worker/` (verifier jobs)

---

### Urutan implementasi yang aman (recommended)
1) P0-1, P0-2 (status + bug fix backend)  
2) P0-4 (admin review UI) + P0-5 (wizard wiring benar)  
3) P1-1 (deploy on-chain)  
4) P1-2 (confirm tx verification)  
5) P1-3 (finalize on-chain + merkle root/proofs)  
6) P2 items (claim/refund UX + success gating + lock/vesting verifiers)

