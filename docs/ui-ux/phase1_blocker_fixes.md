# Phase 1 — Blocker Fixes Implementation Guide

Critical fixes untuk 3 blocker issues yang diidentifikasi oleh Opus review.

---

## B1: Double Submit Prevention (Idempotency Protection)

### Problem

User bisa rapid-tap button "Beli" sebelum state update, menyebabkan duplicate transaction attempts.

### Solution: Multi-Layer Protection

#### Layer 1: Client-Side Processing Lock

```typescript
// State management
const [processing, setProcessing] = useState(false);

const handleBuyClick = async () => {
  if (processing) return; // Guard clause
  setProcessing(true);

  try {
    await executeTransaction();
  } finally {
    setProcessing(false);
  }
};

// UI
<PrimaryButton
  disabled={processing || !isValid}
  onClick={handleBuyClick}
>
  {processing ? 'Processing...' : 'Beli'}
</PrimaryButton>
```

#### Layer 2: Cooldown Timer (Bypass Protection)

```typescript
const [lastAttemptTime, setLastAttemptTime] = useState(0);
const COOLDOWN_MS = 3000;

const handleBuyClick = async () => {
  const now = Date.now();
  if (now - lastAttemptTime < COOLDOWN_MS) {
    toast.error('Harap tunggu sebelum mencoba lagi');
    return;
  }

  setLastAttemptTime(now);
  setProcessing(true);
  // ... proceed
};
```

#### Layer 3: Unique Attempt ID (Backend Idempotency)

```typescript
import { v4 as uuidv4 } from 'uuid';

// Generate on Step 0 (button ready)
const [attemptId, setAttemptId] = useState(() => uuidv4());

const executeTransaction = async (amount: number) => {
  const tx = await buildTransaction(amount, attemptId);
  const signature = await wallet.signTransaction(tx);

  // Send to backend with attemptId
  await apiClient.post('/participate', {
    projectId,
    amount,
    signature,
    attemptId, // Backend checks for duplicate
  });
};

// On retry (Step 4B failed), generate new ID
const handleRetry = () => {
  setAttemptId(uuidv4()); // Fresh ID for new attempt
  setProcessing(false);
};
```

#### Backend Implementation (Reference)

```typescript
// Backend: Idempotency check
import { Redis } from 'ioredis';

const redis = new Redis();
const IDEMPOTENCY_WINDOW_SEC = 600; // 10 minutes

async function handleParticipate(req: Request) {
  const { attemptId, projectId, amount } = req.body;

  // Check if attemptId already processed
  const key = `tx:attempt:${attemptId}`;
  const exists = await redis.get(key);

  if (exists) {
    return res.status(409).json({
      error: 'DUPLICATE_REQUEST',
      message: 'Transaksi dengan attempt ID ini sudah diproses',
      originalTxHash: exists,
    });
  }

  // Process transaction
  const txHash = await processTransaction(projectId, amount);

  // Store attemptId → txHash mapping
  await redis.setex(key, IDEMPOTENCY_WINDOW_SEC, txHash);

  return res.json({ txHash, status: 'submitted' });
}
```

### UX Behavior Summary

1. User tap "Beli" → `processing=true` + generate `attemptId`
2. During TX flow (Step 1-3) → button disabled, inputs locked
3. If user somehow bypass and tap again → cooldown check rejects
4. If duplicate request reaches backend → 409 response, show existing tx
5. On failure/success → reset `processing=false`, generate new `attemptId` for retry

---

## B2: SUCCESS State CTA Logic (Clear Decision Tree)

### Problem

Spec says `"Lihat Vesting" atau "Claim"` without clear condition → FE engineer confused, might implement wrong logic.

### Solution: Explicit Decision Tree

#### Data Contract (Backend → Frontend)

```typescript
interface ProjectSaleOutcome {
  status: 'SUCCESS';
  vesting_enabled: boolean;
  instant_claim: boolean;
  vesting_id?: string; // Present if vesting_enabled=true
}
```

#### Frontend Logic

```typescript
const SuccessStateCTA = ({ outcome }: { outcome: ProjectSaleOutcome }) => {
  if (outcome.vesting_enabled) {
    return (
      <PrimaryButton onClick={() => navigate(`/vesting/${outcome.vesting_id}`)}>
        Lihat Vesting
      </PrimaryButton>
    );
  }

  if (outcome.instant_claim) {
    return (
      <PrimaryButton onClick={handleInstantClaim}>
        Klaim Sekarang
      </PrimaryButton>
    );
  }

  // Default: No CTA, just informational
  return (
    <InfoBox>
      Token Anda tersedia. Cek detail di Portfolio.
    </InfoBox>
  );
};
```

#### Visual State (Widget Update)

```
SUCCESS + vesting_enabled=true:
┌─────────────────────────────────┐
│ ✓ Penjualan berhasil!           │
│ Token akan di-vesting 6 bulan.  │
│ ┌─────────────────────────────┐ │
│ │    LIHAT VESTING            │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘

SUCCESS + instant_claim=true:
┌─────────────────────────────────┐
│ ✓ Penjualan berhasil!           │
│ Token siap di-claim.            │
│ ┌─────────────────────────────┐ │
│ │    KLAIM SEKARANG           │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘

SUCCESS + both false:
┌─────────────────────────────────┐
│ ✓ Penjualan berhasil!           │
│ Token Anda tersedia.            │
│ Cek detail di Portfolio.        │
└─────────────────────────────────┘
(No button, user navigate via Portfolio tab)
```

### Backend API Response Example

```json
{
  "project_id": "abc123",
  "sale_status": "SUCCESS",
  "user_participation": {
    "amount": 1000,
    "token_allocation": 10000,
    "vesting": {
      "enabled": true,
      "vesting_id": "vest_xyz789",
      "schedule": "6mo cliff, 12mo linear"
    },
    "instant_claim": false
  }
}
```

---

## B3: Balance Re-Validation Before Sign (Step 1.5)

### Problem

User's balance validated at Step 0 (button tap), tapi bisa berubah antara confirm modal dan wallet sign:

- User transfer balance out di tab lain
- Gas estimate berubah (network congestion)
  → Result: TX fail di wallet dengan error "insufficient funds"

### Solution: Pre-Sign Validation Step

#### Implementation (Inside ConfirmModal `onConfirm`)

```typescript
const handleConfirm = async () => {
  try {
    // Disable button + show loading
    setConfirming(true);

    // Step 1.5: Re-fetch balance
    const currentBalance = await wallet.getBalance();
    const estimatedGas = await estimateGas(transactionParams);
    const totalRequired = amount + estimatedGas;

    // Validate
    if (currentBalance < totalRequired) {
      // Show inline error INSIDE modal (don't dismiss)
      setModalError({
        type: 'insufficient_balance',
        message: `Saldo tidak mencukupi. Dibutuhkan ${totalRequired} SOL (termasuk gas ~${estimatedGas} SOL). Saldo saat ini: ${currentBalance} SOL`,
      });
      setConfirming(false);
      return; // STOP here, modal stays open
    }

    // Validation passed → proceed to wallet sign
    setModalError(null);
    await triggerWalletSign();
  } catch (error) {
    setModalError({
      type: 'validation_error',
      message: 'Gagal memvalidasi transaksi. Coba lagi.',
    });
    setConfirming(false);
  }
};
```

#### Modal UI Update

```tsx
<ConfirmModal>
  <ModalHeader>Konfirmasi Pembelian</ModalHeader>

  <ModalBody>
    <InfoRow label="Jumlah" value="0.5 SOL" />
    <InfoRow label="Est. Gas" value="~0.001 SOL" />
    <Divider />
    <InfoRow label="Total" value="0.501 SOL" highlight />

    {/* NEW: Inline Error Display */}
    {modalError && <InlineError variant="error">{modalError.message}</InlineError>}

    {warnings.length > 0 && <WarningBox>{warnings.join(', ')}</WarningBox>}
  </ModalBody>

  <ModalFooter>
    <SecondaryButton onClick={onCancel}>Batal</SecondaryButton>
    <PrimaryButton onClick={handleConfirm} disabled={confirming} loading={confirming}>
      {confirming ? 'Memvalidasi...' : 'Konfirmasi'}
    </PrimaryButton>
  </ModalFooter>
</ConfirmModal>
```

#### UX Flow Visualization

```
User taps "Konfirmasi" in modal
  ↓
Button text: "Memvalidasi..." (spinner)
Button disabled: true
  ↓
Re-fetch balance & gas estimate (200-500ms)
  ↓
IF balance OK:
  ✓ Proceed to wallet.signTransaction()
  ↓ Modal stays open, shows "Menunggu signature..."

IF balance insufficient:
  ✗ Show inline error (red box in modal)
  ✗ Button re-enabled: "Konfirmasi"
  ✗ User can:
      - Adjust amount (close modal, change input)
      - Add funds (pause, top-up, retry)
      - Cancel (close modal)
```

### Gas Estimation Helper

```typescript
async function estimateGas(params: TransactionParams): Promise<number> {
  try {
    const gasEstimate = await provider.estimateGas(params);
    // Add 20% buffer untuk safety
    return gasEstimate * 1.2;
  } catch (error) {
    // Fallback to conservative estimate
    return 0.005; // 5000 lamports for Solana, or 0.005 ETH for EVM
  }
}
```

---

## Testing Checklist

### B1: Double Submit

- [ ] Rapid tap "Beli" → hanya 1 request terkirim
- [ ] Tap during TX_SUBMITTED → button disabled, no effect
- [ ] Retry after failure → new `attemptId` generated
- [ ] Backend reject duplicate `attemptId` → show existing tx hash

### B2: SUCCESS CTA

- [ ] Project dengan vesting → show "Lihat Vesting"
- [ ] Project dengan instant claim → show "Klaim Sekarang"
- [ ] Project tanpa keduanya → no button, show info text
- [ ] Navigate dari CTA → correct destination

### B3: Pre-Sign Validation

- [ ] Balance sufficient → proceed to wallet
- [ ] Balance insufficient → show error in modal, stay open
- [ ] Adjust amount after error → can retry
- [ ] Gas estimate change → re-validate before sign
- [ ] Network offline during validation → show error, allow retry

---

## Implementation Priority

1. **B1 (Highest)**: Critical untuk prevent financial loss (duplicate charges)
2. **B3 (High)**: Important untuk UX (prevent wasted user effort + confusion)
3. **B2 (Medium)**: Important untuk clarity (prevent wrong flow implementation)

All 3 must be implemented before FE work starts on Participation screens.
