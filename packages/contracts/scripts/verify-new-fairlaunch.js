const hre = require('hardhat');

async function main() {
  const contractAddress = '0xD1FC308D3261EFf6296f8aBd7B4C5AC68330c8a3';

  const fullAbi = require('../artifacts/contracts/fairlaunch/Fairlaunch.sol/Fairlaunch.json').abi;
  const contract = new hre.ethers.Contract(contractAddress, fullAbi, hre.ethers.provider);

  console.log('');
  console.log('═'.repeat(70));
  console.log('🔍 VERIFYING FRESH FAIRLAUNCH DEPLOYMENT');
  console.log('═'.repeat(70));
  console.log('Contract:', contractAddress);
  console.log('Factory: 0xe562b09225aFC94e254973f329bB25294Ef89c8F (Fresh bytecode)');
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

    console.log('📊 CONTRACT STATE:');
    console.log('─'.repeat(70));
    console.log(
      '  Status:',
      status.toString(),
      status === 1n ? '(LIVE)' : status === 2n ? '(ENDED)' : status === 3n ? '(SUCCESS)' : '(OTHER)'
    );
    console.log('  Total Raised:', hre.ethers.formatEther(totalRaised), 'BNB');
    console.log('  Softcap:', hre.ethers.formatEther(softcap), 'BNB');
    console.log('  Softcap Met:', totalRaised >= softcap ? '✅ YES' : '❌ NO');
    console.log('  Is Finalized:', isFinalized ? '✅ YES' : '❌ NO');
    console.log('');

    console.log('⏰ TIMING:');
    console.log('─'.repeat(70));
    console.log('  Start Time:', new Date(Number(startTime) * 1000).toISOString());
    console.log('  End Time:', new Date(Number(endTime) * 1000).toISOString());
    console.log('  Current Time:', new Date(Number(blockTime) * 1000).toISOString());
    console.log('  Time Passed End:', blockTime >= endTime ? '✅ YES' : '❌ NO');
    if (blockTime >= endTime) {
      const elapsed = Number(blockTime - endTime);
      console.log(`  Elapsed since end: ${elapsed}s (${Math.floor(elapsed / 60)}m)`);
    }
    console.log('');

    // Check router
    const expectedRouter = '0xD99D1c33F9fC3444f8101754aBC46c52416550D1';
    console.log('🔧 ROUTER CONFIGURATION:');
    console.log('─'.repeat(70));
    console.log('  Expected (Testnet V2):', expectedRouter);
    console.log('  Actual:', dexRouter);
    console.log(
      '  Match:',
      dexRouter.toLowerCase() === expectedRouter.toLowerCase() ? '✅ CORRECT!' : '❌ INCORRECT!'
    );
    console.log('');

    // Check LP Locker
    console.log('🔒 LP LOCKER:');
    console.log('─'.repeat(70));
    console.log('  Address:', lpLocker);
    console.log(
      '  Configured:',
      lpLocker !== '0x0000000000000000000000000000000000000000' ? '✅ YES' : '❌ NO'
    );
    console.log('');

    // Check bytecode
    console.log('🧬 BYTECODE VERIFICATION:');
    console.log('─'.repeat(70));
    const deployedBytecode = await hre.ethers.provider.getCode(contractAddress);
    const compiledBytecode =
      require('../artifacts/contracts/fairlaunch/Fairlaunch.sol/Fairlaunch.json').deployedBytecode;

    const deployed = deployedBytecode.slice(0, -106);
    const compiled = compiledBytecode.slice(0, -106);

    console.log('  Deployed length:', deployed.length, 'chars');
    console.log('  Compiled length:', compiled.length, 'chars');

    if (deployed === compiled) {
      console.log('  Match: ✅ ✅ ✅ PERFECT MATCH! ✅ ✅ ✅');
      console.log('  ✅ Factory deployed FRESH bytecode!');
    } else {
      console.log('  Match: ❌ MISMATCH!');
      console.log('  Difference:', deployed.length - compiled.length, 'chars');
    }
    console.log('');

    // Try finalize if conditions met
    console.log('═'.repeat(70));
    if (blockTime >= endTime && totalRaised >= softcap && !isFinalized) {
      console.log('🎯 FINALIZE TEST:');
      console.log('─'.repeat(70));
      console.log('  Conditions:');
      console.log('    ✅ Time passed end');
      console.log('    ✅ Softcap met');
      console.log('    ✅ Not finalized yet');
      console.log('');
      console.log('  Testing finalize with staticCall...');

      try {
        await contract.finalize.staticCall();
        console.log('');
        console.log('  ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅');
        console.log('  ✅  FINALIZE WILL SUCCEED!  ✅');
        console.log('  ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅');
        console.log('');
        console.log('  🎉 Ready for admin to finalize on-chain!');
      } catch (error) {
        console.log('');
        console.log('  ❌ ❌ ❌ FINALIZE WILL FAIL ❌ ❌ ❌');
        console.log('');
        console.log('  Error:', error.message);

        if (error.data) {
          try {
            const iface = new hre.ethers.Interface(fullAbi);
            const decoded = iface.parseError(error.data);
            console.log('  Decoded error:', decoded?.name);
            if (decoded?.args) {
              console.log('  Args:', decoded.args);
            }
          } catch (e) {
            // Silent
          }
        }
      }
    } else {
      console.log('⏳ FINALIZE CONDITIONS NOT MET:');
      console.log('─'.repeat(70));
      if (blockTime < endTime) {
        const remaining = Number(endTime - blockTime);
        console.log(
          `  ⏰ End time not reached (${remaining}s / ${Math.floor(remaining / 60)}m remaining)`
        );
      }
      if (totalRaised < softcap) {
        console.log('  💰 Softcap not met');
      }
      if (isFinalized) {
        console.log('  ✅ Already finalized');
      }
    }

    console.log('═'.repeat(70));
    console.log('');
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

main().catch(console.error);
