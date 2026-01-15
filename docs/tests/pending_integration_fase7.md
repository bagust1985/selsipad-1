# Pending Integration Tests: FASE 7 (Bonding Curve)

## 1. Transaction Manager Integration

**Current Status:** MOCKED
**Goal:** Replace internal mocks with actual Solana RPC signature verification.

### Pending Scenarios

1. **Deploy Fee Verification**
   - **File:** `apps/web/app/api/v1/bonding/[pool_id]/deploy/confirm/route.ts`
   - **Function:** `verifyDeploymentFee(txHash, recipient, amount)`
   - **Current Implementation:** Placeholder (`return txHash.length > 10`)
   - **Required Integration:**
     - Connect to `Tx Manager` service.
     - Verify signature on-chain via RPC.
     - Confirm recipient is `TREASURY_ADDRESS`.
     - Confirm amount is `0.5 SOL`.

2. **Swap Execution Verification**
   - **File:** `apps/web/app/api/v1/bonding/[pool_id]/swap/confirm/route.ts`
   - **Function:** `extractSwapFromTx(txHash)`
   - **Current Implementation:** Placeholder (Returns hardcoded `BUY`, `0.1 SOL`)
   - **Required Integration:**
     - Decode transaction logs to determine `swap_type` (BUY/SELL).
     - Extract exact input amount from transfer instructions.
     - Verify `tx_hash` is final and successful.

## 2. DEX SDK Integration

**Current Status:** PAUSED / NOT IMPLEMENTED
**Goal:** Automate liquidity migration to Raydium/Orca upon graduation.

### Pending Scenarios

1. **Graduation Trigger**
   - **Context:** When `bonding_pools` status updates to `GRADUATING`.
   - **Missing Component:** Async Worker / Cron Job.
   - **Action:**
     - Monitor `GRADUATING` pools.
     - Call Raydium SDK `Liquidity.computeCreatePoolAddress`.
     - Execute `Liquidity.makeCreatePoolTransaction`.
   - **Blockers:**
     - Requires Raydium Swap/Liquidity SDK.
     - Requires funded Admin Keypair for gas fees.

2. **DEX SDK Simulation**
   - **Test Case:** Simulate successful Raydium pool creation in `bonding.test.ts`.
   - **Requirement:** Mock Raydium SDK responses for `createPool`.

## 3. Infrastructure Requirements

To enable the above integration tests, the following infrastructure is required:

### Environment Variables

| Variable                | Description                                         | Required For    |
| ----------------------- | --------------------------------------------------- | --------------- |
| `SOLANA_RPC_URL`        | Mainnet/Devnet RPC Endpoint (e.g. Helius, Alchemy)  | Tx Verification |
| `TREASURY_SECRET_KEY`   | Private key for Treasury wallet (if refunds needed) | Admin Ops       |
| `RAYDIUM_PROGRAM_ID_V4` | Raydium AMM Program ID                              | DEX Migration   |
| `OPENBOOK_PROGRAM_ID`   | OpenBook Market ID (for Raydium)                    | DEX Migration   |

### Data Seed Requirements

- **Test Wallets:** 3-5 funded Keypairs (SOL) for end-to-end testing on Devnet.
- **Mock SPL Tokens:** Mint authority to create test tokens for bonding curves.
