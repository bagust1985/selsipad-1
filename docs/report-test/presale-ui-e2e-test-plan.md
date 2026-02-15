# 🧪 Presale UI E2E Test Plan — Full Coverage

**Network:** BSC Testnet (Chain 97)
**App URL:** http://localhost:3000
**Date:** 2026-02-15

## Contracts On-Chain

| Contract        | Address                                      |
| --------------- | -------------------------------------------- |
| PresaleFactory  | `0x67c3DAE448B55C3B056C39B173118d69b7891866` |
| LPLocker (Real) | `0xc1B619737d5F11490868D9A96025f864d7441532` |
| FeeSplitter     | `0x9CE09C9e370a3974f4D0c55D6a15C4d9F186d161` |
| DEX Router      | `0xD99D1c33F9fC3444f8101754aBC46c52416550D1` |

## Wallet Requirements

| Role              | Wallet                                   | Purpose                                  |
| ----------------- | ---------------------------------------- | ---------------------------------------- |
| **Admin**         | Deployer wallet (has FACTORY_ADMIN_ROLE) | Create presale, finalize, admin controls |
| **Dev/Owner**     | Separate wallet                          | Token owner, receives BNB                |
| **User1**         | Separate wallet                          | Contribute, claim/refund                 |
| **User2**         | Separate wallet                          | Contribute with referral                 |
| **Team Wallet 1** | Separate wallet                          | Team vesting claim                       |
| **Team Wallet 2** | Separate wallet                          | Team vesting claim                       |

---

## 🟢 TEST 1: Lifecycle & Status (End-to-End)

**Route:** `/create/presale` → `/presales/[id]` → `/admin/presales`

### 1.1 Create Presale Wizard (10 Steps)

| Step | Page             | Action                                                       | ✅ Expected                                         |
| ---- | ---------------- | ------------------------------------------------------------ | --------------------------------------------------- |
| 0    | Contract Mode    | Pilih "Create Token" atau "External Token"                   | Form muncul sesuai mode                             |
| 1    | Basic Info       | Isi nama, deskripsi, logo, website, socials                  | Validasi URL dan required fields                    |
| 2    | Sale Params      | Isi hardcap, softcap, min/max contrib, start/end time, price | Validasi: softcap ≤ hardcap, end > start, max ≥ min |
| 3    | Anti-Bot         | Whitelist toggle, max wallet percentage                      | Optional step                                       |
| 4    | Investor Vesting | TGE unlock %, cliff, vesting duration                        | TGE + vesting ≤ 100%                                |
| 5    | Team Vesting     | Enable team %, add wallet addresses + share %                | Share must sum to 100%                              |
| 6    | LP Lock          | LP %, lock duration (min 12 months)                          | Validasi ≥ 12 months                                |
| 7    | Fees & Referral  | Fee preview (platform 5%)                                    | Read-only info                                      |
| 8    | Review           | Review semua input                                           | All data correct                                    |
| 9    | Submit           | Approve fee + submit                                         | Draft saved to DB                                   |

### 1.2 Test Input Values (Recommended)

```
Token Name:       TestPresale_QA
Token Symbol:     TPQA
Total Supply:     (auto-calculated by wizard)
Hardcap:          1 BNB  (kecil biar mudah isi)
Softcap:          0.5 BNB
Price:            0.001 BNB/token
Min Contribution: 0.01 BNB
Max Contribution: 1 BNB
Start Time:       +5 minutes dari sekarang
End Time:         +15 minutes dari sekarang (10 menit durasi)
LP %:             60%
LP Lock:          13 months
TGE Unlock:       20%
Cliff:            0
Vesting:          30 days
Team %:           10%
Team Wallet 1:    [alamat] — 70%
Team Wallet 2:    [alamat] — 30%
```

### 1.3 Status Transitions

| #   | Action                                | Expected Status                |
| --- | ------------------------------------- | ------------------------------ |
| 1   | Submit draft                          | `DRAFT` di DB                  |
| 2   | Admin approve                         | `APPROVED`                     |
| 3   | Admin deploy                          | `DEPLOYED` (contract on-chain) |
| 4   | Time reaches start                    | `ACTIVE` (on-chain sync)       |
| 5   | Users contribute                      | Still `ACTIVE`                 |
| 6   | Time reaches end                      | `ENDED`                        |
| 7   | Admin finalize (success)              | `FINALIZED_SUCCESS`            |
| Alt | Admin finalize (fail - below softcap) | `FINALIZED_FAILED`             |
| Alt | Admin cancel                          | `CANCELLED`                    |

---

## 🟡 TEST 2: Kontribusi (Contribute)

**Route:** `/presales/[id]` — User wallet

### 2.1 Happy Path

| #   | Test                            | Expected                                         |
| --- | ------------------------------- | ------------------------------------------------ |
| 1   | Connect wallet User1            | Wallet terhubung                                 |
| 2   | Masukkan amount (misal 0.3 BNB) | Amount di-validate                               |
| 3   | Klik Contribute                 | MetaMask popup, confirm tx                       |
| 4   | Verify on-chain                 | `contributions(user1)` = 0.3 BNB                 |
| 5   | UI update                       | Progress bar naik, user contribution ditampilkan |

### 2.2 Edge Cases

| #   | Test                                | Expected                            |
| --- | ----------------------------------- | ----------------------------------- |
| 1   | Contribute < min (0.001 BNB)        | **Revert:** dibawah minimum         |
| 2   | Contribute > max (2 BNB)            | **Revert:** diatas maximum          |
| 3   | Contribute saat UPCOMING            | **Revert:** presale belum mulai     |
| 4   | Contribute saat ENDED               | **Revert:** presale sudah selesai   |
| 5   | Contribute > sisa hardcap           | **Revert** atau partial fill        |
| 6   | Double contribute (User1 0.3 + 0.2) | Total = 0.5 BNB, tidak melebihi max |

---

## 🔴 TEST 3: Finalisasi & Rumus

**Route:** `/admin/presales` → Finalize button

### 3.1 Success Path (softcap met)

| #   | Step                            | Action                                         |
| --- | ------------------------------- | ---------------------------------------------- |
| 1   | Pastikan total raised ≥ softcap | Check UI                                       |
| 2   | Klik "Prepare Finalize"         | API `/api/admin/presale/[id]/prepare-finalize` |
| 3   | Verify merkle tree generated    | Root displayed                                 |
| 4   | Klik "Finalize"                 | On-chain `finalizeSuccessEscrow()`             |
| 5   | Verify status                   | `FINALIZED_SUCCESS`                            |

### 3.2 Token Distribution Check

| Item                   | Formula                                   | Verify On-Chain   |
| ---------------------- | ----------------------------------------- | ----------------- |
| Investor tokens        | `contribution * tokensForSale / hardcap`  | Merkle allocation |
| Team tokens            | `(sale+lp) * teamBps / (10000 - teamBps)` | In merkle tree    |
| LP tokens              | `netBnb * lpBps / 10000 * 1/price`        | LP pair created   |
| Unsold burn            | `tokensForSale - sold - lpTokens`         | Sent to 0xdEaD    |
| Surplus burn (Phase 7) | `remaining balance after all phases`      | Round balance = 0 |

### 3.3 Fail Path (softcap NOT met)

| #   | Step                     | Expected                  |
| --- | ------------------------ | ------------------------- |
| 1   | Contribute below softcap | Total < softcap           |
| 2   | Wait for end time        | Status → ENDED            |
| 3   | Admin finalize failed    | Status → FINALIZED_FAILED |
| 4   | User claims refund       | Full BNB returned         |

---

## 🎁 TEST 4: Claim Token vs Refund

### 4.1 Claim (Success Path)

**Route:** `/presales/[id]` — User wallet

| #   | Test                    | Expected                         |
| --- | ----------------------- | -------------------------------- |
| 1   | Connect User1 wallet    | Post-finalize                    |
| 2   | Check claimable amount  | Should show TGE + vested         |
| 3   | Klik Claim              | Merkle proof submitted           |
| 4   | Verify token balance    | User receives tokens             |
| 5   | Wait for vesting period | Claimable amount increases       |
| 6   | Claim again             | Receive additional vested tokens |

### 4.2 Team Wallet Claim

| #   | Test                  | Expected               |
| --- | --------------------- | ---------------------- |
| 1   | Connect Team Wallet 1 | Post-finalize          |
| 2   | Check claimable       | Team allocation × TGE% |
| 3   | Klik Claim            | Tokens received        |
| 4   | Verify amount         | 70% of team tokens     |

### 4.3 Refund (Fail Path)

| #   | Test                              | Expected                     |
| --- | --------------------------------- | ---------------------------- |
| 1   | Presale status = FINALIZED_FAILED | After admin finalize-fail    |
| 2   | Connect User1                     |                              |
| 3   | Klik "Claim Refund"               | BNB dikembalikan 100%        |
| 4   | Check contribution reset          | `contributions(user1)` = 0   |
| 5   | Try refund again                  | **Revert:** already refunded |

---

## 💰 TEST 5: Fee & Split

### 5.1 Fee Distribution

| Item           | Expected                       |
| -------------- | ------------------------------ |
| Platform fee   | 5% (500 BPS) dari total raised |
| Treasury split | Check FeeSplitter distribution |
| Dev receives   | totalRaised − fee − lpBnb      |

### 5.2 Verify on BscScan

- [ ] Check treasury BNB balance increase
- [ ] Check dev wallet BNB balance increase
- [ ] Check FeeSplitter events

---

## 👥 TEST 6: Vesting Investor + Team

### 6.1 Investor Vesting Schedule

| Time                     | Expected Claimable |
| ------------------------ | ------------------ |
| T+0 (TGE)                | 20% of allocation  |
| T+15 days (mid-vest)     | 20% + 40% = 60%    |
| T+30 days (fully vested) | 100%               |

### 6.2 Team Vesting Schedule

| Time      | Expected                |
| --------- | ----------------------- |
| T+0 (TGE) | 20% of team allocation  |
| T+30 days | 100% of team allocation |

### 6.3 Verify

- [ ] TeamWallet1 receives 70% of team tokens
- [ ] TeamWallet2 receives 30% of team tokens
- [ ] Vesting schedule matches investor schedule (same TGE, cliff, duration)

---

## 🔒 TEST 7: Likuiditas & LP Lock

### 7.1 LP Creation

| Check            | Expected               |
| ---------------- | ---------------------- |
| LP pair created  | PancakeSwap testnet    |
| LP tokens locked | In `LPLocker` contract |
| Lock duration    | ≥ 12 months (390 days) |
| Beneficiary      | Project owner address  |

### 7.2 Verify on LPLocker

```
LPLocker: 0xc1B619737d5F11490868D9A96025f864d7441532

Call getLock(lockId):
  - lpToken: LP pair address
  - owner: PresaleRound address
  - beneficiary: dev/projectOwner
  - amount: LP token amount
  - unlockTime: now + 390 days
  - withdrawn: false
```

### 7.3 LP Lock UI Check

- [ ] Lock info displayed on presale detail page
- [ ] "Locked 🔒" badge visible
- [ ] Countdown to unlock shown

---

## 🛡️ TEST 8: Admin Controls

### 8.1 Pause (if applicable)

| #   | Test                | Expected             |
| --- | ------------------- | -------------------- |
| 1   | Admin pause presale | Status changes       |
| 2   | User try contribute | **Revert**           |
| 3   | Admin unpause       | Contributions resume |

### 8.2 Cancel

| #   | Test                 | Expected           |
| --- | -------------------- | ------------------ |
| 1   | Admin cancel presale | Status → CANCELLED |
| 2   | User claim refund    | Full BNB returned  |
| 3   | User try contribute  | **Revert**         |

### 8.3 Dana User Aman

- [ ] Saat pause: BNB tetap di contract (bukan admin)
- [ ] Saat cancel: User bisa refund 100%
- [ ] Admin TIDAK bisa withdraw user funds

---

## 🔐 TEST 9: Security

### 9.1 Access Control

| #   | Test                           | Expected                              |
| --- | ------------------------------ | ------------------------------------- |
| 1   | Non-admin call finalize        | **Revert:** AccessControlUnauthorized |
| 2   | Non-admin call cancel          | **Revert**                            |
| 3   | Random wallet call setLPLocker | **Revert**                            |

### 9.2 Reentrancy

| #   | Test                      | Expected                            |
| --- | ------------------------- | ----------------------------------- |
| 1   | Double finalize           | **Revert:** AlreadyFinalized        |
| 2   | Contribute after finalize | **Revert**                          |
| 3   | Double claim same user    | Second claim only gets newly vested |

### 9.3 Merkle Proof

| #   | Test                     | Expected                   |
| --- | ------------------------ | -------------------------- |
| 1   | Claim with wrong proof   | **Revert:** InvalidProof   |
| 2   | Claim with wrong amount  | **Revert:** InvalidProof   |
| 3   | Cross-round proof replay | **Revert** (salted leaves) |

---

## 🔗 TEST 10: Referral

### 10.1 Referral Flow

| #   | Step                                | Expected                               |
| --- | ----------------------------------- | -------------------------------------- |
| 1   | User2 gets referral link from User1 | Link contains referrer address         |
| 2   | User2 contribute via referral link  | `Contributed` event has referrer field |
| 3   | Check DB referral record            | `contributions.referrer` = User1       |

### 10.2 Fee Split (if referral active)

- [ ] Referral pool receives designated %
- [ ] Referrer can claim rewards post-finalize

---

## 📊 TEST 11: Event Log & Indexer

### 11.1 Key Events to Check (BscScan)

| Event                                  | When                  |
| -------------------------------------- | --------------------- |
| `PresaleCreated(round, vesting, salt)` | Deploy                |
| `Contributed(user, amount, referrer)`  | Each contribution     |
| `StatusSynced(oldStatus, newStatus)`   | Status changes        |
| `LiquidityAdded(...)`                  | LP creation           |
| `LPLocked(lockId, ...)`                | LP lock               |
| `ExcessBurned(amount)`                 | Phase 7 burn          |
| `FinalizedSuccessEscrow(...)`          | Finalization complete |

### 11.2 DB Sync

- [ ] `presale_contributions` table updated on each contribute
- [ ] `presale_rounds` table status matches on-chain
- [ ] Event indexer captures all events correctly

---

## ⛽ TEST 12: Gas & DoS

### 12.1 Gas Benchmarks (from E2E test)

| Operation                | Expected Gas    |
| ------------------------ | --------------- |
| Create Presale           | ~3,600,000      |
| Contribute               | ~60,000-100,000 |
| Finalize (Real LPLocker) | ~712,000        |
| Claim (Merkle)           | ~87,000         |

### 12.2 DoS Resistance

| #   | Test                             | Expected                          |
| --- | -------------------------------- | --------------------------------- |
| 1   | Many small contributions (10+)   | All succeed, gas stays reasonable |
| 2   | Max contributors on claim        | Each claim independent            |
| 3   | Large merkle tree (100+ entries) | Proof still fits in gas limit     |

---

## 📝 Test Execution Checklist

### Phase 1: Setup

- [ ] App running on localhost:3000
- [ ] MetaMask on BSC Testnet
- [ ] Admin wallet with BNB
- [ ] 2+ user wallets with BNB
- [ ] 2 team wallets (can be any address)

### Phase 2: Create

- [ ] Complete wizard (Steps 0-9)
- [ ] Draft saved to DB
- [ ] Admin approves
- [ ] Admin deploys → contract on-chain
- [ ] Tokens deposited to escrow

### Phase 3: Contribute

- [ ] Wait for start time
- [ ] User1 contribute
- [ ] User2 contribute (with referral)
- [ ] Verify amounts on-chain

### Phase 4: Finalize

- [ ] Wait for end time
- [ ] Admin prepare-finalize (merkle tree)
- [ ] Admin finalize on-chain
- [ ] Verify all phase flags: vestingFunded, feePaid, lpCreated, ownerPaid, surplusBurned

### Phase 5: Claim

- [ ] User1 claim tokens
- [ ] Team wallets claim tokens
- [ ] Verify vesting schedule

### Phase 6: Verify

- [ ] LP locked in real LPLocker
- [ ] Fee split correct
- [ ] Round balance = 0
- [ ] All events emitted
- [ ] DB status synced

---

> **Tip:** Use small amounts (1 BNB hardcap) and short durations (10 min) for fast iteration.
> Start time = +5 min, End time = +15 min to give yourself time to contribute.
