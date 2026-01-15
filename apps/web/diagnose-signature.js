// Test script to diagnose signature verification issues
// Run with: node diagnose-signature.js

const nacl = require('tweetnacl');
const { PublicKey } = require('@solana/web3.js');

// Test data - replace with actual values from browser console
const TEST_ADDRESS = '0x5bF3...01a4'; // From screenshot
const TEST_MESSAGE = 'Sign this message to authenticate with SELSIPAD\\n\\nWallet: ...';
const TEST_SIGNATURE = '...'; // Get from browser

console.log('=== Signature Verification Diagnostic ===\n');

// Test 1: Check message format
console.log('1. Message Format Check:');
console.log('Message:', TEST_MESSAGE);
console.log('Contains address?', TEST_MESSAGE.includes(TEST_ADDRESS));
console.log('Message length:', TEST_MESSAGE.length);
console.log('');

// Test 2: Check signature format
console.log('2. Signature Format Check:');
console.log('Signature:', TEST_SIGNATURE);
console.log('Starts with 0x?', TEST_SIGNATURE.startsWith('0x'));
console.log('Signature length:', TEST_SIGNATURE.length);
console.log('');

// Test 3: Try verification (EVM)
console.log('3. EVM Verification Test:');
try {
  // This would need viem library
  console.log('  - To test EVM, check browser console for actual signature');
  console.log('  - Message signed must exactly match verification message');
} catch (error) {
  console.error('  Error:', error.message);
}
console.log('');

// Test 4: Common issues
console.log('4. Common Issues to Check:');
console.log('  [ ] Message includes \\n (newlines) correctly?');
console.log('  [ ] Timestamp matches between sign and verify?');
console.log('  [ ] Address case-insensitive comparison for EVM?');
console.log('  [ ] Signature has correct prefix (0x for EVM)?');
console.log('');

console.log('=== Action Items ===');
console.log('1. Open browser console');
console.log('2. Add console.log in signMessageEVM:');
console.log('   console.log("Message to sign:", message);');
console.log('   console.log("Signature returned:", signature);');
console.log('3. Compare with backend logs');
console.log('4. Check if messages match EXACTLY');
