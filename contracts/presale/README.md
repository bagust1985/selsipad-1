# Presale Smart Contracts

Secure, scalable presale contracts for SELSIPAD platform.

## Version: v2.1

**Critical Security Patches Applied:**

- ✅ Custom error revert syntax
- ✅ Status sync logic (prevents finalize deadlock)
- ✅ 3-way fee distribution (FeeSplitter)
- ✅ Fee config locked after start
- ✅ Vesting vault funding enforcement
- ✅ Merkle leaf salting (prevents replay attacks)
- ✅ SafeERC20 usage

## Contracts

### PresaleRound.sol

Main presale contract with refund-safe fee handling.

**Features:**

- Escrow-based contributions (fees deducted only at finalization)
- Auto status sync (UPCOMING → ACTIVE → ENDED)
- Locked fee configuration (cannot change mid-presale)
- Refunds always accessible (not blocked by pause)
- Integration with FeeSplitter and MerkleVesting

### MerkleVesting.sol

Scalable token vesting using Merkle tree.

**Features:**

- TGE + Cliff + Linear vesting
- Salted leaf encoding (address + chainid + salt)
- Vault funding check before enabling claims
- O(1) gas for finalization, O(log n) for claims

### FeeSplitter.sol

3-way fee distribution contract.

**Features:**

- Distributes to Treasury / Referral Pool / SBT Staking
- Supports native and ERC20 tokens
- Configurable splits (BPS-based)
- Safe transfers (.call{value} for native, SafeERC20 for ERC20)

## Setup

```bash
npm install --legacy-peer-deps
```

## Compile

```bash
npm run compile
```

## Test

```bash
npm test
```

## Deploy

```bash
# BSC Testnet
npm run deploy:bsc-testnet

# BSC Mainnet
npm run deploy:bsc
```

## Security

- ❌ No admin fund-drain paths
- ✅ Refunds always accessible
- ✅ Fees only extracted at finalization
- ✅ No emergencyWithdraw() function
- ✅ ReentrancyGuard on all state-changing functions

## Audit Status

⏳ Pending external audit (Certik/Hacken)
