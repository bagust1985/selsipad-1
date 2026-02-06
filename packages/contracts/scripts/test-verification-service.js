const { verifyFairlaunchContracts } = require('../services/verifyFairlaunchContracts');

/**
 * Test script to verify existing Fairlaunch ecosystem contracts
 */
async function main() {
  console.log('');
  console.log('═'.repeat(70));
  console.log('🧪 TESTING AUTO-VERIFICATION SERVICE');
  console.log('═'.repeat(70));
  console.log('');

  // Use existing deployed contracts
  const contracts = {
    fairlaunch: '0xD1FC308D3261EFf6296f8aBd7B4C5AC68330c8a3',
    token: '0x45FEa629965CEd8805C003d7c524dcED84779775',
    vesting: '0x64f9af2c944479b84319e72ef6a5089072575b71',
  };

  console.log('Testing with contracts:');
  console.log('  Fairlaunch:', contracts.fairlaunch);
  console.log('  Token:', contracts.token);
  console.log('  Vesting:', contracts.vesting);
  console.log('');

  try {
    const results = await verifyFairlaunchContracts({
      fairlaunchAddress: contracts.fairlaunch,
      tokenAddress: contracts.token,
      vestingAddress: contracts.vesting,
      network: 'bscTestnet',
    });

    console.log('═'.repeat(70));
    console.log('📊 VERIFICATION RESULTS');
    console.log('═'.repeat(70));
    console.log('');

    // Fairlaunch
    console.log('Fairlaunch:', contracts.fairlaunch);
    if (results.fairlaunch.success) {
      console.log('  ✅ Verified!');
      if (results.fairlaunch.alreadyVerified) {
        console.log('  (Already verified)');
      }
      console.log('  Link:', results.fairlaunch.url);
    } else {
      console.log('  ❌ Failed:', results.fairlaunch.error);
    }
    console.log('');

    // Token
    console.log('Token:', contracts.token);
    if (results.token.success) {
      console.log('  ✅ Verified!');
      if (results.token.alreadyVerified) {
        console.log('  (Already verified)');
      }
      console.log('  Link:', results.token.url);
    } else {
      console.log('  ❌ Failed:', results.token.error);
    }
    console.log('');

    // Vesting
    console.log('Vesting:', contracts.vesting);
    if (results.vesting.success) {
      console.log('  ✅ Verified!');
      if (results.vesting.alreadyVerified) {
        console.log('  (Already verified)');
      }
      console.log('  Link:', results.vesting.url);
    } else {
      console.log('  ❌ Failed:', results.vesting.error);
    }
    console.log('');

    // Summary
    const successCount = [results.fairlaunch, results.token, results.vesting].filter(
      (r) => r.success
    ).length;

    console.log('═'.repeat(70));
    console.log(`✅ ${successCount}/3 contracts verified successfully`);
    console.log('═'.repeat(70));
    console.log('');
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
