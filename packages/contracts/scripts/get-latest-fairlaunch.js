const hre = require('hardhat');

async function main() {
  const factoryAddress = '0xe562b09225aFC94e254973f329bB25294Ef89c8F'; // New factory

  const factoryAbi = [
    'event FairlaunchCreated(address indexed fairlaunch, address indexed creator, address token)',
    'function getFairlaunchCount() view returns (uint256)',
    'function getAllFairlaunches() view returns (address[])',
  ];

  const factory = new hre.ethers.Contract(factoryAddress, factoryAbi, hre.ethers.provider);

  console.log('🔍 Checking Recent Fairlaunch Deployments');
  console.log('Factory:', factoryAddress);
  console.log('');

  try {
    const count = await factory.getFairlaunchCount();
    console.log('Total Fairlaunches:', count.toString());

    if (count > 0n) {
      const allFairlaunches = await factory.getAllFairlaunches();
      console.log('');
      console.log('📋 All Deployed Fairlaunches:');

      allFairlaunches.forEach((addr, idx) => {
        console.log(`  ${idx + 1}. ${addr}`);
      });

      // Get the latest one
      const latest = allFairlaunches[allFairlaunches.length - 1];
      console.log('');
      console.log('🆕 Latest Deployment:', latest);

      // Check its state
      const fairlaunchAbi =
        require('../artifacts/contracts/fairlaunch/Fairlaunch.sol/Fairlaunch.json').abi;
      const fairlaunch = new hre.ethers.Contract(latest, fairlaunchAbi, hre.ethers.provider);

      const [status, dexRouter, lpLocker, totalRaised, softcap, endTime, isFinalized] =
        await Promise.all([
          fairlaunch.status(),
          fairlaunch.dexRouter(),
          fairlaunch.lpLockerAddress(),
          fairlaunch.totalRaised(),
          fairlaunch.softcap(),
          fairlaunch.endTime(),
          fairlaunch.isFinalized(),
        ]);

      console.log('');
      console.log('📊 Contract State:');
      console.log('  Status:', status.toString(), '(1=LIVE, 2=ENDED, 3=SUCCESS)');
      console.log('  DEX Router:', dexRouter);
      console.log('  LP Locker:', lpLocker);
      console.log('  Total Raised:', hre.ethers.formatEther(totalRaised), 'BNB');
      console.log('  Softcap:', hre.ethers.formatEther(softcap), 'BNB');
      console.log('  End Time:', new Date(Number(endTime) * 1000).toISOString());
      console.log('  Is Finalized:', isFinalized);

      // Check router
      const expectedRouter = '0xD99D1c33F9fC3444f8101754aBC46c52416550D1';
      console.log('');
      console.log(
        '✅ Router Check:',
        dexRouter.toLowerCase() === expectedRouter.toLowerCase() ? 'CORRECT' : 'INCORRECT'
      );
    } else {
      console.log('⚠️  No Fairlaunches deployed yet from this factory');
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

main().catch(console.error);
