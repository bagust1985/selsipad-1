const hre = require('hardhat');

async function main() {
  const contractAddress = '0xD1FC308D3261EFf6296f8aBd7B4C5AC68330c8a3';

  const fullAbi = require('../artifacts/contracts/fairlaunch/Fairlaunch.sol/Fairlaunch.json').abi;
  const [signer] = await hre.ethers.getSigners();
  const contract = new hre.ethers.Contract(contractAddress, fullAbi, signer);

  console.log('');
  console.log('═'.repeat(70));
  console.log('🎯 FINALIZE VERIFICATION - FRESH BYTECODE CONTRACT');
  console.log('═'.repeat(70));
  console.log('Contract:', contractAddress);
  console.log('Admin/Caller:', signer.address);
  console.log('');

  try {
    // Get state
    const [status, lpLocker, totalRaised, softcap, endTime, isFinalized] = await Promise.all([
      contract.status(),
      contract.lpLockerAddress(),
      contract.totalRaised(),
      contract.softcap(),
      contract.endTime(),
      contract.isFinalized(),
    ]);

    const latestBlock = await hre.ethers.provider.getBlock('latest');
    const blockTime = latestBlock.timestamp;

    console.log('📊 PRE-FINALIZE STATE:');
    console.log('─'.repeat(70));
    console.log(
      '  Status:',
      status.toString(),
      status === 1n
        ? '(LIVE)'
        : status === 2n
        ? '(ENDED)'
        : status === 3n
        ? '(SUCCESS)'
        : status === 0n
        ? '(UPCOMING)'
        : '(OTHER)'
    );
    console.log('  Total Raised:', hre.ethers.formatEther(totalRaised), 'BNB');
    console.log('  Softcap:', hre.ethers.formatEther(softcap), 'BNB');
    console.log('  Softcap Met:', totalRaised >= softcap ? '✅ YES' : '❌ NO');
    console.log('  LP Locker:', lpLocker);
    console.log(
      '  LP Locker Set:',
      lpLocker !== '0x0000000000000000000000000000000000000000' ? '✅ YES' : '❌ NO'
    );
    console.log('  Is Finalized:', isFinalized ? '✅ YES' : '❌ NO');
    console.log('');

    console.log('⏰ TIMING:');
    console.log('─'.repeat(70));
    console.log('  End Time:', new Date(Number(endTime) * 1000).toISOString());
    console.log('  Current Time:', new Date(Number(blockTime) * 1000).toISOString());
    console.log('  Time Passed End:', blockTime >= endTime ? '✅ YES' : '❌ NO');
    if (blockTime >= endTime) {
      const elapsed = Number(blockTime - endTime);
      console.log(
        `  Elapsed since end: ${elapsed}s (${Math.floor(elapsed / 60)}m ${elapsed % 60}s)`
      );
    }
    console.log('');

    // Check finalize conditions
    console.log('═'.repeat(70));
    console.log('🔍 FINALIZE CONDITIONS CHECK:');
    console.log('─'.repeat(70));

    const timeOk = blockTime >= endTime;
    const softcapOk = totalRaised >= softcap;
    const notFinalized = !isFinalized;
    const lpLockerOk = lpLocker !== '0x0000000000000000000000000000000000000000';

    console.log('  1. Time passed end:', timeOk ? '✅' : '❌');
    console.log('  2. Softcap met:', softcapOk ? '✅' : '❌');
    console.log('  3. Not finalized:', notFinalized ? '✅' : '❌');
    console.log('  4. LP Locker set:', lpLockerOk ? '✅' : '❌');
    console.log('');

    if (!softcapOk) {
      console.log('⚠️  WARNING: Softcap NOT MET!');
      console.log('   This means finalize will set status to FAILED');
      console.log('   Users can refund their contributions');
      console.log('');
    }

    if (!lpLockerOk) {
      console.log('⚠️  WARNING: LP Locker NOT SET!');
      console.log('   Admin must call setLPLocker() before finalize');
      console.log('   Expected LP Locker: 0x422293092c353abB6BEFaBAdBBEb1D6257F17298');
      console.log('');
    }

    // Test finalize
    console.log('═'.repeat(70));
    console.log('🧪 TESTING FINALIZE WITH STATICCALL...');
    console.log('─'.repeat(70));

    try {
      await contract.finalize.staticCall();
      console.log('');
      console.log('  ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅');
      console.log('  ✅                                      ✅');
      console.log('  ✅   FINALIZE WILL SUCCEED!!! 🎉       ✅');
      console.log('  ✅                                      ✅');
      console.log('  ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅');
      console.log('');
      console.log('  🚀 Ready to execute actual finalize transaction!');
      console.log('  💡 Admin can now call finalize() from UI');
      console.log('');
    } catch (error) {
      console.log('');
      console.log('  ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌');
      console.log('  ❌                                      ❌');
      console.log('  ❌   FINALIZE WILL FAIL! ⚠️            ❌');
      console.log('  ❌                                      ❌');
      console.log('  ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌');
      console.log('');
      console.log('  Error Message:', error.message);
      console.log('');

      if (error.data) {
        try {
          const iface = new hre.ethers.Interface(fullAbi);
          const decoded = iface.parseError(error.data);
          console.log('  🔍 Decoded Error:', decoded?.name);
          if (decoded?.args && decoded.args.length > 0) {
            console.log('  📋 Error Args:', decoded.args.toString());
          }
        } catch (e) {
          console.log('  ⚠️  Could not decode error');
        }
      }

      // Suggestions
      console.log('');
      console.log('  💡 TROUBLESHOOTING:');
      if (!lpLockerOk) {
        console.log('     → Call setLPLocker(0x422293092c353abB6BEFaBAdBBEb1D6257F17298)');
      }
      if (status !== 2n && timeOk) {
        console.log('     → Status should update to ENDED automatically');
        console.log('     → Try calling contribute() with 0 to trigger _updateStatus()');
      }
      if (!softcapOk) {
        console.log('     → Softcap not met - finalize will mark as FAILED (expected)');
      }
    }

    console.log('═'.repeat(70));
    console.log('');
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

main().catch(console.error);
