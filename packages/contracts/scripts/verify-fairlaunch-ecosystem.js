const hre = require('hardhat');

/**
 * Verification script that can be called programmatically
 * Reads contract addresses from environment variables
 */
async function main() {
  // Get addresses from environment
  const fairlaunchAddress = process.env.FAIRLAUNCH_ADDRESS;
  const tokenAddress = process.env.TOKEN_ADDRESS;
  const vestingAddress = process.env.VESTING_ADDRESS;

  if (!fairlaunchAddress) {
    throw new Error('FAIRLAUNCH_ADDRESS environment variable required');
  }

  console.log('Starting contract verification...');
  console.log('Fairlaunch:', fairlaunchAddress);
  if (tokenAddress) console.log('Token:', tokenAddress);
  if (vestingAddress) console.log('Vesting:', vestingAddress);
  console.log('');

  // Use verification service
  const { verifyFairlaunchContracts } = require('../services/verifyFairlaunchContracts');

  const results = await verifyFairlaunchContracts({
    fairlaunchAddress,
    tokenAddress,
    vestingAddress,
    network: hre.network.name,
  });

  // Output results
  console.log('Verification complete!');
  console.log('');

  if (results.fairlaunch?.success) {
    console.log('✅ Fairlaunch verified!');
  } else if (results.fairlaunch?.error) {
    console.log('❌ Fairlaunch failed:', results.fairlaunch.error);
  }

  if (results.token?.success) {
    console.log('✅ Token verified!');
  } else if (results.token?.error) {
    console.log('❌ Token failed:', results.token.error);
  }

  if (results.vesting?.success) {
    console.log('✅ Vesting verified!');
  } else if (results.vesting?.error) {
    console.log('❌ Vesting failed:', results.vesting.error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
