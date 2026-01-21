require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();

const DEPLOYER_PRIVATE_KEY =
  process.env.DEPLOYER_PRIVATE_KEY ||
  '0x0000000000000000000000000000000000000000000000000000000000000000';
const ADMIN_PRIVATE_KEY =
  process.env.ADMIN_PRIVATE_KEY ||
  '0x0000000000000000000000000000000000000000000000000000000000000000';
const TIMELOCK_PRIVATE_KEY = process.env.TIMELOCK_PRIVATE_KEY || ADMIN_PRIVATE_KEY;
const BUYER1_PRIVATE_KEY = process.env.BUYER1_PRIVATE_KEY || ADMIN_PRIVATE_KEY;
const BUYER2_PRIVATE_KEY = process.env.BUYER2_PRIVATE_KEY || ADMIN_PRIVATE_KEY;
const BUYER3_PRIVATE_KEY = process.env.BUYER3_PRIVATE_KEY || ADMIN_PRIVATE_KEY;
const BUYER4_PRIVATE_KEY = process.env.BUYER4_PRIVATE_KEY || ADMIN_PRIVATE_KEY;
const BUYER5_PRIVATE_KEY = process.env.BUYER5_PRIVATE_KEY || ADMIN_PRIVATE_KEY;
const BUYER6_PRIVATE_KEY = process.env.BUYER6_PRIVATE_KEY || ADMIN_PRIVATE_KEY;

// Filter valid keys only (must be 0x + 64 hex chars)
function getValidAccounts(...keys) {
  return keys.filter((k) => k && k.length === 66 && k.startsWith('0x'));
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: '0.8.20',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true, // Enable IR-based compilation to avoid stack too deep
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || '',
      accounts: getValidAccounts(
        DEPLOYER_PRIVATE_KEY,
        ADMIN_PRIVATE_KEY,
        TIMELOCK_PRIVATE_KEY,
        BUYER1_PRIVATE_KEY,
        BUYER2_PRIVATE_KEY,
        BUYER3_PRIVATE_KEY,
        BUYER4_PRIVATE_KEY,
        BUYER5_PRIVATE_KEY,
        BUYER6_PRIVATE_KEY
      ),
      chainId: 11155111,
    },
    bsc_testnet: {
      url: process.env.BSC_TESTNET_RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545',
      accounts: getValidAccounts(
        DEPLOYER_PRIVATE_KEY,
        ADMIN_PRIVATE_KEY,
        TIMELOCK_PRIVATE_KEY,
        BUYER1_PRIVATE_KEY,
        BUYER2_PRIVATE_KEY,
        BUYER3_PRIVATE_KEY,
        BUYER4_PRIVATE_KEY,
        BUYER5_PRIVATE_KEY,
        BUYER6_PRIVATE_KEY
      ),
      chainId: 97,
      gasPrice: 10000000000, // 10 gwei
    },
    bsc_mainnet: {
      url: process.env.BSC_MAINNET_RPC_URL || 'https://bsc-dataseed1.binance.org',
      accounts: [DEPLOYER_PRIVATE_KEY, ADMIN_PRIVATE_KEY],
      chainId: 56,
    },
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY || '',
      bscTestnet: process.env.BSCSCAN_API_KEY || '',
      bsc: process.env.BSCSCAN_API_KEY || '',
    },
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
};
