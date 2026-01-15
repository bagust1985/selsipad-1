/**
 * Empty Stub Module for Optional Wallet SDKs
 *
 * This module is used as a webpack alias replacement for optional
 * wagmi connector dependencies that we don't use in our MVP.
 *
 * Prevents "Module not found" errors during bundling without
 * installing 20+ unused wallet SDK packages.
 *
 * Stubbed SDKs (not needed for MetaMask + WalletConnect + Coinbase):
 * - Porto wallet
 * - Safe global wallets
 * - Gemini wallet
 * - Ledger iframe provider
 * - MEW wallet
 * - Immutable X SDK
 */

// Export empty object to satisfy any imports
module.exports = {};

// Also export as ES module
export default {};

// Export common patterns that might be imported
export const createConnector = () => null;
export const connect = () => Promise.resolve(null);
export const disconnect = () => Promise.resolve();
