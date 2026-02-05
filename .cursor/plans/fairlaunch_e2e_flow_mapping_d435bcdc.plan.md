---
name: Fairlaunch E2E flow mapping
overview: Menyusun mapping end-to-end lifecycle Fairlaunch (EVM) dari submit → admin approve/deploy → upcoming/live/ended → finalize success/failed/cancelled → user claim/refund, termasuk status DB vs on-chain dan alur distribusi fee, tanpa melakukan perubahan kode.
todos:
  - id: assemble-onchain-state-machine
    content: Rangkum state machine on-chain Fairlaunch (states, transitions, access control, events) dari `Fairlaunch.sol` dan `FairlaunchFactory.sol`.
    status: completed
  - id: assemble-offchain-flow
    content: Rangkum flow submit→approve→admin deploy→status upcoming/live/ended→finalize dari API/worker/UI, termasuk mapping status DB vs on-chain.
    status: completed
  - id: fees-claims-refunds
    content: Rangkum fee distribution + claim/refund rules dan jalur UI yang mengeksekusi transaksi.
    status: completed
  - id: gaps-mismatches
    content: List gap/mismatch yang ketemu beserta dampaknya (operasional/UX/safety) dan rujukan file.
    status: completed
  - id: deliver-report
    content: Kirim laporan ringkas tapi lengkap di chat, termasuk 1-2 diagram mermaid dan pointer ke file kunci.
    status: completed
isProject: false
---

## Tujuan

- Memberikan gambaran **flow end-to-end Fairlaunch** yang dipakai sistem saat ini (UI + API + DB + smart contract).
- Menjelaskan **status** (off-chain DB) vs **status** (on-chain) dan bagaimana UI memutuskan label “upcoming/live/ended/failed/success”.
- Menjelaskan **claim/refund**, **success/fail**, dan **distribusi fee** (deployment fee, platform fee 5%, split vault).
- Menginventaris **mismatch / gap** yang bisa menyebabkan bug operasional (tanpa memperbaiki dulu).

## Sumber kode yang akan dijadikan rujukan

- On-chain lifecycle:
  - `[packages/contracts/contracts/fairlaunch/Fairlaunch.sol](packages/contracts/contracts/fairlaunch/Fairlaunch.sol)` (enum status, `contribute`, `finalize`, `claimTokens`, `refund`, fee & liquidity, pause/cancel)
  - `[packages/contracts/contracts/fairlaunch/FairlaunchFactory.sol](packages/contracts/contracts/fairlaunch/FairlaunchFactory.sol)` (deploy fee, constraints LP lock & liquidity, token transfer ke pool/vesting)
  - `[packages/contracts/contracts/std-presale/FeeSplitter.sol](packages/contracts/contracts/std-presale/FeeSplitter.sol)` (split 5% fee → vault)
- Submit/approve/deploy/admin ops:
  - `[apps/web/app/api/fairlaunch/submit/route.ts](apps/web/app/api/fairlaunch/submit/route.ts)` (submit + verifikasi escrowTx & feeTx + insert DB)
  - `[apps/web/app/admin/fairlaunch/review/actions.ts](apps/web/app/admin/fairlaunch/review/actions.ts)` (admin approve/reject)
  - `[apps/web/app/api/admin/fairlaunch/deploy/route.ts](apps/web/app/api/admin/fairlaunch/deploy/route.ts)` (admin deploy via Factory + release escrow + update DB)
  - `[apps/web/src/actions/admin/finalize-fairlaunch.ts](apps/web/src/actions/admin/finalize-fairlaunch.ts)` (admin finalize on-chain + update DB)
  - `[apps/web/app/api/admin/fairlaunch/pause/route.ts](apps/web/app/api/admin/fairlaunch/pause/route.ts)` (pause off-chain)
- User contribute/claim/refund UI:
  - `[apps/web/src/hooks/useFairlaunchContribute.ts](apps/web/src/hooks/useFairlaunchContribute.ts)` (call `contribute()` + simpan kontribusi ke DB)
  - `[apps/web/app/fairlaunch/[id]/FairlaunchDetail.tsx](apps/web/app/fairlaunch/[id]/FairlaunchDetail.tsx)` (tab contribute/claim/refund → contract calls)
  - `[apps/web/src/actions/fairlaunch/save-contribution.ts](apps/web/src/actions/fairlaunch/save-contribution.ts)` (insert `contributions` CONFIRMED)
  - `[apps/web/src/actions/fairlaunch/claim-tokens.ts](apps/web/src/actions/fairlaunch/claim-tokens.ts)` (hitung claimable + mark claimed)
  - `[apps/web/app/api/rounds/[id]/refund/claim/route.ts](apps/web/app/api/rounds/[id]/refund/claim/route.ts)` (refund request record)
- Status UI & listing:
  - `[apps/web/src/lib/data/projects.ts](apps/web/src/lib/data/projects.ts)` (filtering + `calculateRealTimeStatus()`)
  - `[apps/web/src/components/developer/ProjectStatusCard.tsx](apps/web/src/components/developer/ProjectStatusCard.tsx)` (badge status dynamic)
  - `[services/worker/jobs/round-state-scheduler.ts](services/worker/jobs/round-state-scheduler.ts)` (transition status DB berbasis waktu)
  - Schema checks: `[selsipad_schema.sql](selsipad_schema.sql)`

## Output yang akan aku hasilkan (di chat)

- Diagram state machine **on-chain** (Status enum) + siapa yang bisa call apa.
- Diagram flow **off-chain** (submit/approve/deploy/finalize) + tabel mapping status:
  - `projects.status` vs `launch_rounds.status` vs `launch_rounds.result` vs `Fairlaunch.Status`.
- Flow **user**:
  - contribute (tx on-chain) → save ke DB (`contributions`) → impact ke `total_raised`.
  - claim: precheck DB + tx `claimTokens()` + mark claimed.
  - refund: kondisi `FAILED/CANCELLED` on-chain + bagaimana endpoint refund request bekerja.
- Flow **fee & distribusi**:
  - Deployment fee (Factory → treasury)
  - Platform fee 5% saat `finalize()` → FeeSplitter → vault split (treasury/referral/sbt)
  - Sisa raised → liquidity + owner; token untuk LP & team vesting.
- Daftar **mismatch/gap yang terdeteksi** (high-signal):
  - Inkonistensi status submit (`SUBMITTED` vs `PENDING_DEPLOY`), scheduler vs status actual.
  - DB `result` vs `status` (refund endpoint mengecek `result` tapi finalize action update `status`).
  - `CANCELED` vs `CANCELLED`.
  - On-chain `lpLocker` wajib diset sebelum `finalize()` tapi belum terlihat di flow deploy.
  - ERC20 payment path fee splitter belum lengkap (di contract ada catatan).
  - Pause endpoint off-chain tidak memanggil `Fairlaunch.pause()`.

## Catatan batasan

- Tidak ada perubahan file/kode, tidak menjalankan deploy/test; hanya analisis dan mapping dari kode yang ada.
