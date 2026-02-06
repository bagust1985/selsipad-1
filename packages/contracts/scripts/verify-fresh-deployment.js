const hre = require('hardhat');

async function main() {
  const contractAddress = '0x64f9af2c944479b84319e72ef6a5089072575b71';

  const fullAbi = require('../artifacts/contracts/fairlaunch/Fairlaunch.sol/Fairlaunch.json').abi;
  const contract = new hre.ethers.Contract(contractAddress, fullAbi, hre.ethers.provider);

  console.log('🔍 Verifying Fresh Deployment');
  console.log('Contract:', contractAddress);
  console.log('Factory: 0xe562b09225aFC94e254973f329bB25294Ef89c8F (New with fresh bytecode)');
  console.log('');

  try {
    // Get basic state
    const [status, dexRouter, lpLocker, totalRaised, softcap, endTime, startTime, isFinalized] =
      await Promise.all([
        contract.status(),
        contract.dexRouter(),
        contract.lpLockerAddress(),
        contract.totalRaised(),
        contract.softcap(),
        contract.endTime(),
        contract.startTime(),
        contract.isFinalized(),
      ]);

    const latestBlock = await hre.ethers.provider.getBlock('latest');
    const blockTime = latestBlock.timestamp;

    console.log('📊 Contract State:');
    console.log('  Status:', status.toString(), '(1=LIVE, 2=ENDED, 3=SUCCESS)');
    console.log('  Total Raised:', hre.ethers.formatEther(totalRaised), 'BNB');
    console.log('  Softcap:', hre.ethers.formatEther(softcap), 'BNB');
    console.log('  Softcap Met:', totalRaised >= softcap ? '✅ YES' : '❌ NO');
    console.log('  Start Time:', new Date(Number(startTime) * 1000).toISOString());
    console.log('  End Time:', new Date(Number(endTime) * 1000).toISOString());
    console.log('  Current Time:', new Date(Number(blockTime) * 1000).toISOString());
    console.log('  Time Passed End:', blockTime >= endTime ? '✅ YES' : '❌ NO');
    console.log('  Is Finalized:', isFinalized ? 'YES' : 'NO');
    console.log('');

    // Check router
    const expectedRouter = '0xD99D1c33F9fC3444f8101754aBC46c52416550D1';
    console.log('🔧 Router Configuration:');
    console.log('  Expected (Testnet V2):', expectedRouter);
    console.log('  Actual:', dexRouter);
    console.log(
      '  Match:',
      dexRouter.toLowerCase() === expectedRouter.toLowerCase() ? '✅ CORRECT' : '❌ INCORRECT'
    );
    console.log('');

    // Check LP Locker
    console.log('🔒 LP Locker:');
    console.log('  Address:', lpLocker);
    console.log(
      '  Set:',
      lpLocker !== '0x0000000000000000000000000000000000000000' ? '✅ YES' : '❌ NO'
    );
    console.log('');

    // Check bytecode
    console.log('🧬 Bytecode Verification:');
    const deployedBytecode = await hre.ethers.provider.getCode(contractAddress);
    const compiledBytecode =
      require('../artifacts/contracts/fairlaunch/Fairlaunch.sol/Fairlaunch.json').deployedBytecode;

    const deployed = deployedBytecode.slice(0, -106);
    const compiled = compiledBytecode.slice(0, -106);

    console.log('  Deployed length:', deployed.length);
    console.log('  Compiled length:', compiled.length);
    console.log('  Match:', deployed === compiled ? '✅ PERFECT MATCH!' : '❌ MISMATCH');
    console.log('');

    // Try finalize if conditions met
    if (blockTime >= endTime && totalRaised >= softcap && !isFinalized) {
      console.log('🎯 Testing Finalize...');
      console.log('  Conditions for finalize:');
      console.log('    - Time passed:', blockTime >= endTime ? '✅' : '❌');
      console.log('    - Softcap met:', totalRaised >= softcap ? '✅' : '❌');
      console.log('    - Not finalized:', !isFinalized ? '✅' : '❌');
      console.log('');

      try {
        await contract.finalize.staticCall();
        console.log('  ✅ ✅ ✅ FINALIZE WILL SUCCEED! ✅ ✅ ✅');
        console.log('  Ready for admin to finalize on-chain!');
      } catch (error) {
        console.log('  ❌ FINALIZE WILL FAIL');
        console.log('  Error:', error.message);

        if (error.data) {
          try {
            const iface = new hre.ethers.Interface(fullAbi);
            const decoded = iface.parseError(error.data);
            console.log('  Decoded error:', decoded?.name);
          } catch (e) {
            console.log('  Could not decode error');
          }
        }
      }
    } else {
      console.log('⏳ Finalize Conditions Not Met Yet:');
      if (blockTime < endTime) {
        const remaining = Number(endTime - blockTime);
        console.log(`  ⏰ End time not reached (${remaining}s remaining)`);
      }
      if (totalRaised < softcap) {
        console.log('  💰 Softcap not met');
      }
      if (isFinalized) {
        console.log('  ✅ Already finalized');
      }
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

main().catch(console.error);
