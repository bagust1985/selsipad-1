# Environment Configuration Guide

## Quick Start

1. **Copy the example file:**

   ```bash
   cp .env.example .env
   ```

2. **Configure network RPC URLs:**

   - Get free Sepolia RPC: https://www.alchemy.com
   - BSC Testnet RPC is public (already configured)

3. **Generate deployment wallets:**
   ```bash
   npx hardhat run scripts/generate-wallets.js
   ```
4. **Fund your wallets with testnet tokens:**

   - Sepolia ETH: https://sepoliafaucet.com
   - BSC Testnet BNB: https://testnet.binance.org/faucet-smart

5. **Configure vault addresses:**
   - Use your treasury wallet addresses for fee collection

## Required Parameters

### 🔑 Private Keys (CRITICAL - NEVER SHARE!)

**DEPLOYER_PRIVATE_KEY:**

- Account that deploys all contracts
- Needs gas tokens on target network
- Format: `0x` + 64 hex characters

**ADMIN_PRIVATE_KEY:**

- Gets DEFAULT_ADMIN_ROLE on all contracts
- Can configure fee percentages
- Recommended: Use hardware wallet or multisig in production

**TIMELOCK_ADDRESS:**

- Critical admin for finalizing presales
- Can set Merkle roots on vesting contracts
- **Production:** MUST be Gnosis Safe multisig

### 🌐 Network Configuration

**Sepolia Testnet:**

- Chain ID: 11155111
- Native Token: ETH
- Explorer: https://sepolia.etherscan.io
- Faucet: https://sepoliafaucet.com

**BSC Testnet:**

- Chain ID: 97
- Native Token: BNB
- Explorer: https://testnet.bscscan.com
- Faucet: https://testnet.binance.org/faucet-smart

### 💰 Fee Configuration

**FEE_TOTAL_BPS:** Total fee percentage (500 = 5%)

- Min: 0 (0%)
- Max: 1000 (10%)
- Default: 500 (5%)

**Vault BPS Distribution:**

- Sum MUST equal FEE_TOTAL_BPS
- Treasury: Platform revenue
- Referral Pool: Referrer rewards
- SBT Staking: Token holder rewards

**Example Configurations:**

5% Total Fee (Default):

```bash
FEE_TOTAL_BPS=500
FEE_TREASURY_BPS=250    # 2.5%
FEE_REFERRAL_POOL_BPS=200  # 2%
FEE_SBT_STAKING_BPS=50     # 0.5%
```

7% Total Fee:

```bash
FEE_TOTAL_BPS=700
FEE_TREASURY_BPS=350    # 3.5%
FEE_REFERRAL_POOL_BPS=280  # 2.8%
FEE_SBT_STAKING_BPS=70     # 0.7%
```

### 📍 Vault Addresses

**TREASURY_VAULT_ADDRESS:**

- Receives platform fees
- Should be controlled by team multisig

**REFERRAL_POOL_VAULT_ADDRESS:**

- Holds referral rewards
- Needs smart contract or manual distribution

**SBT_STAKING_VAULT_ADDRESS:**

- Distributes to token stakers
- Integrate with staking contract

## Optional Parameters

### 🔍 Contract Verification

**VERIFY_CONTRACTS=true:**

- Auto-verify on Etherscan/BSCScan after deployment
- Requires API keys
- Makes contracts publicly readable

**ETHERSCAN_API_KEY / BSCSCAN_API_KEY:**

- Get free keys from respective explorer sites
- Etherscan: https://etherscan.io/myapikey
- BSCScan: https://bscscan.com/myapikey

### ⛽ Gas Configuration

**GAS_PRICE_GWEI:**

- Manual gas price override
- Leave empty for automatic (recommended)
- Check current gas: https://etherscan.io/gastracker

**GAS_LIMIT_MULTIPLIER:**

- Safety buffer for gas estimation
- Default: 1.2 (20% extra)
- Increase if transactions fail

**CONFIRMATIONS:**

- Block confirmations before considering tx final
- Sepolia: 5 recommended
- BSC: 3-5 recommended

## Security Best Practices

### ⚠️ DO NOT:

- ❌ Commit .env file to git
- ❌ Share private keys with anyone
- ❌ Use same keys for testnet and mainnet
- ❌ Store private keys in plaintext in production

### ✅ DO:

- ✅ Use different wallets for deployer and admin
- ✅ Use hardware wallet or multisig for TIMELOCK_ADDRESS
- ✅ Keep .env file permissions restricted (chmod 600)
- ✅ Use environment-specific .env files (.env.sepolia, .env.bsc)
- ✅ Backup your private keys securely (encrypted vault)

## Production Deployment Checklist

Before deploying to mainnet:

1. **Security Audit:**

   - [ ] External audit completed
   - [ ] All critical issues resolved
   - [ ] Test coverage ≥ 95%

2. **Wallet Setup:**

   - [ ] Hardware wallet for admin key
   - [ ] Gnosis Safe for timelock
   - [ ] Separate deployer account

3. **Configuration:**

   - [ ] Vault addresses verified
   - [ ] Fee percentages approved
   - [ ] Gas limits tested

4. **Testing:**

   - [ ] All unit tests passing
   - [ ] E2E tests on testnet successful
   - [ ] Manual testing completed

5. **Backup:**
   - [ ] Private keys backed up securely
   - [ ] Deployment addresses documented
   - [ ] Recovery procedures in place

## Troubleshooting

### "Insufficient funds for gas"

**Solution:** Fund deployer wallet with native tokens

### "Nonce too low"

**Solution:** Increase DEPLOYMENT_DELAY_MS or reset Hardhat cache

### "Contract verification failed"

**Solution:** Check API key and ensure contract matches deployed bytecode

### "Invalid private key format"

**Solution:** Ensure format is `0x` + 64 hex characters

## Network-Specific Notes

### Sepolia:

- Faster block times (~12s)
- More stable than Goerli
- Official Ethereum testnet

### BSC Testnet:

- Very fast blocks (~3s)
- Compatible with Ethereum tooling
- Free BNB from faucet

## Support

For deployment issues:

- Check Hardhat docs: https://hardhat.org/docs
- Ethers.js docs: https://docs.ethers.org
- OpenZeppelin docs: https://docs.openzeppelin.com
