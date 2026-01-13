EKSEKUSI — FASE 0 (Scope Lock & Baseline)
0.1 Kickoff & Alignment (Output: “Project Charter”)

Tujuan: semua stakeholder sepakat apa yang dibangun dan apa yang belum dibangun di MVP.

Langkah eksekusi

Tentukan tujuan MVP (1 paragraf) + target tanggal “public live”

Tentukan target user awal:

Creator/dev project

Investor/participant

Community (social feed)

Admin ops/finance/reviewer

Tentukan KPI awal:

Time to list project

Presale success rate

Claim success rate

Refund success rate

% stuck tx (harus rendah)

Tentukan definisi “Project Live” (go-live criteria)

Deliverables

1 halaman “Project Charter”

KPI baseline + target minimal

0.2 Scope Lock MVP (Output: “MVP Feature Switchboard”)

Tujuan: bikin daftar fitur ON/OFF biar jelas.

Yang HARUS diputuskan (contoh ON untuk MVP)
✅ Core: Auth + profile + wallet linking (Mod 8)
✅ Admin security + RBAC + MFA + audit log + two-man rule (Mod 12)
✅ Presale + Fairlaunch (Mod 2,3)
✅ Liquidity lock + Vesting (Mod 5,6)
✅ Referral + Reward pool + Patch eligibility (Mod 10 + Patch)
✅ Social feed + Blue Check + AMA (Mod 7 + update)
✅ Trending (Mod 17)
✅ Bonding curve (Mod 4) (boleh ON tapi staged rollout)
✅ SBT staking (Mod 9) (boleh ON tapi staged rollout)

Yang biasanya OFF dulu (biar MVP cepat)

Multi-language UI

Complex moderation automation (cukup manual + basic rate limit)

Advanced analytics dashboard

Deliverables

Daftar fitur: ON/OFF + alasan + owner

“Stage rollout plan”: fitur mana yang boleh live belakangan (Bonding/SBT misalnya)

0.3 Status & State Machine Lock (Output: “Canonical Status Dictionary”)

Tujuan: menyamakan status agar UI + worker + admin tidak salah interpretasi.

A. Status Project

DRAFT → SUBMITTED → IN_REVIEW → APPROVED → LIVE → ENDED

Outcome: SUCCESS / FAILED / CANCELED

B. Status Presale/Fairlaunch

UPCOMING → LIVE → ENDED

Result: SUCCESS / FAILED (refund enabled)

C. Status Tx (Tx Manager)

CREATED → SUBMITTED → PENDING → CONFIRMED → FAILED → REVERSED (opsional)

D. Status Vesting/Lock

PENDING_SETUP → ACTIVE → CLAIMED(partial) → COMPLETE

Lock: PENDING → LOCKED → UNLOCKABLE → UNLOCKED

Deliverables

1 dokumen state machine (diagram boleh simple)

Mapping: status → UI label → allowed actions

0.4 Gate Rules & Compliance Lock (Output: “Launch Eligibility Rules”)

Tujuan: aturan modul harus jadi “truth table” yang bisa dipakai code + QA.

A. Listing eligibility (Presale/Fairlaunch)

KYC: VERIFIED

SC Scan: PASS / OVERRIDDEN_PASS

Vesting schedule: wajib (investor + team sesuai modul)

Liquidity lock plan: wajib min 12 bulan

Admin approval (audit + role)

B. Success finalization

Tidak boleh mark SUCCESS kalau:

LP belum LOCKED (min 12 bulan)

Vesting belum created/active

C. Social/Referral

Posting feed: hanya Blue Check ACTIVE

Claim referral: Blue Check ACTIVE/VERIFIED + active_referral_count >= 1

Payout: selalu ke primary wallet

Deliverables

Truth table gating (kalimat “IF/THEN”)

“Hard fail reasons” yang harus muncul di UI (contoh: “LP belum locked”)

0.5 Fee & Treasury Rules Lock (Output: “Fee Rulebook v1”)

Tujuan: semua fee split disepakati dari awal supaya ledger & payout tidak berubah-ubah.

Yang dikunci

Presale/Fairlaunch success fee split (Treasury/Referral/SBT staking)

Bonding swap fee 1.5% split 50/50

Blue Check $10 split 70/30

Token creation fee 100% Treasury

Flat fee SBT claim $10

Deliverables

Tabel fee rules v1

“Change policy”: perubahan fee harus two-man rule + audit

0.6 Non-Functional Requirements (Output: “NFR & SLO v1”)

Tujuan: batas performa & reliability jelas.

Minimal NFR

UI read-only dari DB (no chain direct query client)

Endpoint sensitif wajib idempotency-key

RLS deny-by-default untuk tabel sensitif

Trending load <300ms

Incident response: pause/disable actions tanpa merusak refund rightful users

Deliverables

SLO/SLA internal v1

Daftar “P0 security requirements”

0.7 Release Gate & QA Strategy (Output: “Go/No-Go Checklist”)

Tujuan: sebelum live, apa yang harus hijau.

Release Gate (harus hijau)

E2E flow: Presale success + finalize + LP lock + vesting claim

E2E flow: Presale fail + refund

Double-claim protection (vesting & referral)

Admin two-man rule bekerja

Audit log lengkap

Tx manager tidak stuck (reconcile job lulus)

Secrets aman (tidak ada service role di client)

Deliverables

QA checklist v1

Test plan ringkas per flow kritis

0.8 RACI & Timeline Sprint (Output: “Execution Board”)

Tujuan: jelas siapa ngapain.

RACI minimal

Product owner: scope + acceptance

Tech lead: arsitektur + code standards

Backend: API + tx manager + worker

Frontend: web + admin UI

DevOps: CI/CD + secrets + infra

QA: test plan + execution

Security reviewer: checklist P0

Deliverables

RACI table

Timeline sprint untuk fase 1 (high-level)

Output Akhir Fase 0 (yang harus jadi dokumen)

Project Charter

MVP Feature Switchboard (ON/OFF)

Canonical Status Dictionary + state machine

Launch Eligibility Rules (truth table)

Fee Rulebook v1

NFR & SLO v1

Go/No-Go Checklist (QA Gate)

RACI + Sprint plan fase 1