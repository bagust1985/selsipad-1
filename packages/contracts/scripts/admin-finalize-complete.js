const hre = require('hardhat');

async function main() {
  const contractAddress = '0xD1FC308D3261EFf6296f8aBd7B4C5AC68330c8a3';
  const lpLockerAddress = '0x422293092c353abB6BEFaBAdBBEb1D6257F17298';

  console.log('');
  console.log('═'.repeat(70));
  console.log('🚀 COMPLETE ADMIN FINALIZE FLOW');
  console.log('═'.repeat(70));
  console.log('Contract:', contractAddress);
  console.log('LP Locker:', lpLockerAddress);
  console.log('');

  // Load contract ABI
  const fullAbi = require('../artifacts/contracts/fairlaunch/Fairlaunch.sol/Fairlaunch.json').abi;

  // Get admin executor wallet (has ADMIN_ROLE)
  const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY;
  if (!adminPrivateKey) {
    throw new Error('ADMIN_PRIVATE_KEY not found in environment');
  }

  const adminWallet = new hre.ethers.Wallet(adminPrivateKey, hre.ethers.provider);
  const contract = new hre.ethers.Contract(contractAddress, fullAbi, adminWallet);

  console.log('👤 Admin Executor:', adminWallet.address);
  console.log(
    '💰 Balance:',
    hre.ethers.formatEther(await hre.ethers.provider.getBalance(adminWallet.address)),
    'BNB'
  );
  console.log('');

  try {
    // STEP 1: Check current state
    console.log('═'.repeat(70));
    console.log('📊 STEP 1: CHECKING CONTRACT STATE');
    console.log('═'.repeat(70));

    const [status, currentLpLocker, totalRaised, softcap, endTime, isFinalized] = await Promise.all(
      [
        contract.status(),
        contract.lpLockerAddress(),
        contract.totalRaised(),
        contract.softcap(),
        contract.endTime(),
        contract.isFinalized(),
      ]
    );

    const latestBlock = await hre.ethers.provider.getBlock('latest');
    const blockTime = latestBlock.timestamp;

    console.log(
      '  Status:',
      status.toString(),
      status === 1n ? '(LIVE)' : status === 2n ? '(ENDED)' : status === 3n ? '(SUCCESS)' : '(OTHER)'
    );
    console.log('  Total Raised:', hre.ethers.formatEther(totalRaised), 'BNB');
    console.log('  Softcap:', hre.ethers.formatEther(softcap), 'BNB');
    console.log('  Softcap Met:', totalRaised >= softcap ? '✅ YES' : '❌ NO');
    console.log('  End Time:', new Date(Number(endTime) * 1000).toISOString());
    console.log('  Current Time:', new Date(Number(blockTime) * 1000).toISOString());
    console.log('  Time Passed:', blockTime >= endTime ? '✅ YES' : '❌ NO');
    console.log(
      '  LP Locker Set:',
      currentLpLocker !== '0x0000000000000000000000000000000000000000' ? '✅ YES' : '❌ NO'
    );
    console.log('  Is Finalized:', isFinalized ? '✅ YES' : '❌ NO');
    console.log('');

    // Check if already finalized
    if (isFinalized) {
      console.log('✅ Contract already finalized!');
      console.log('');
      return;
    }

    // STEP 2: Set LP Locker (if not set)
    if (currentLpLocker === '0x0000000000000000000000000000000000000000') {
      console.log('═'.repeat(70));
      console.log('🔒 STEP 2: SETTING LP LOCKER');
      console.log('═'.repeat(70));

      try {
        console.log('  Testing with staticCall...');
        await contract.setLPLocker.staticCall(lpLockerAddress);
        console.log('  ✅ staticCall succeeded');
        console.log('');

        console.log('  Executing setLPLocker transaction...');
        const setLpLockerTx = await contract.setLPLocker(lpLockerAddress);
        console.log('  📤 TX sent:', setLpLockerTx.hash);
        console.log('  ⏳ Waiting for confirmation...');

        const setLpLockerReceipt = await setLpLockerTx.wait();
        console.log('  ✅ Confirmed in block:', setLpLockerReceipt.blockNumber);
        console.log('  ⛽ Gas used:', setLpLockerReceipt.gasUsed.toString());
        console.log('');

        // Verify
        const newLpLocker = await contract.lpLockerAddress();
        if (newLpLocker.toLowerCase() === lpLockerAddress.toLowerCase()) {
          console.log('  ✅ LP Locker set successfully!');
        } else {
          console.log('  ❌ LP Locker verification failed!');
          throw new Error('LP Locker not set correctly');
        }
        console.log('');
      } catch (error) {
        console.error('  ❌ Failed to set LP Locker:', error.message);

        // Try to decode error
        if (error.data) {
          try {
            const iface = new hre.ethers.Interface(fullAbi);
            const decoded = iface.parseError(error.data);
            console.error('  🔍 Decoded error:', decoded?.name);
          } catch (e) {
            // Silent
          }
        }

        throw error;
      }
    } else {
      console.log('═'.repeat(70));
      console.log('✅ STEP 2: LP LOCKER ALREADY SET');
      console.log('═'.repeat(70));
      console.log('  Address:', currentLpLocker);
      console.log('');
    }

    // STEP 3: Execute Finalize
    console.log('═'.repeat(70));
    console.log('🎯 STEP 3: EXECUTING FINALIZE');
    console.log('═'.repeat(70));

    try {
      console.log('  Testing with staticCall...');
      await contract.finalize.staticCall();
      console.log('  ✅ staticCall succeeded - finalize will work!');
      console.log('');

      console.log('  Executing finalize transaction...');
      const finalizeTx = await contract.finalize();
      console.log('  📤 TX sent:', finalizeTx.hash);
      console.log('  ⏳ Waiting for confirmation...');

      const finalizeReceipt = await finalizeTx.wait();
      console.log('  ✅ Confirmed in block:', finalizeReceipt.blockNumber);
      console.log('  ⛽ Gas used:', finalizeReceipt.gasUsed.toString());
      console.log('');

      // Parse events
      console.log('  📋 Events emitted:');
      for (const log of finalizeReceipt.logs) {
        try {
          const parsed = contract.interface.parseLog({
            topics: log.topics,
            data: log.data,
          });
          if (parsed) {
            console.log('    -', parsed.name);
            if (parsed.name === 'FeeCollected') {
              console.log('      Fee:', hre.ethers.formatEther(parsed.args.amount), 'BNB');
            }
          }
        } catch (e) {
          // Not a contract event
        }
      }
      console.log('');
    } catch (error) {
      console.error('  ❌ Finalize failed:', error.message);

      // Try to decode error
      if (error.data) {
        try {
          const iface = new hre.ethers.Interface(fullAbi);
          const decoded = iface.parseError(error.data);
          console.error('  🔍 Decoded error:', decoded?.name);
          if (decoded?.args) {
            console.error('  📋 Error args:', decoded.args.toString());
          }
        } catch (e) {
          // Silent
        }
      }

      throw error;
    }

    // STEP 4: Verify Success
    console.log('═'.repeat(70));
    console.log('✅ STEP 4: VERIFYING SUCCESS');
    console.log('═'.repeat(70));

    const [newStatus, newIsFinalized] = await Promise.all([
      contract.status(),
      contract.isFinalized(),
    ]);

    console.log(
      '  Status:',
      newStatus.toString(),
      newStatus === 3n ? '(SUCCESS ✅)' : newStatus === 4n ? '(FAILED)' : '(OTHER)'
    );
    console.log('  Is Finalized:', newIsFinalized ? '✅ YES' : '❌ NO');
    console.log('');

    if (newIsFinalized && (newStatus === 3n || newStatus === 4n)) {
      console.log('  ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅');
      console.log('  ✅                                      ✅');
      console.log('  ✅   FINALIZE COMPLETED SUCCESSFULLY!  ✅');
      console.log('  ✅                                      ✅');
      console.log('  ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅');
      console.log('');

      if (newStatus === 3n) {
        console.log('  🎉 STATUS: SUCCESS');
        console.log('  ✅ Liquidity added to DEX');
        console.log('  ✅ LP tokens locked');
        console.log('  ✅ Fees distributed');
      } else {
        console.log('  ⚠️  STATUS: FAILED (softcap not met)');
        console.log('  💰 Users can now refund contributions');
      }
    } else {
      console.log('  ⚠️  Finalize may not have completed correctly');
      console.log('  Please check contract state manually');
    }

    console.log('');
    console.log('═'.repeat(70));
    console.log('🎉 FINALIZE FLOW COMPLETE!');
    console.log('═'.repeat(70));
    console.log('');
  } catch (err) {
    console.error('');
    console.error('❌ ERROR:', err.message);
    console.error('');
    throw err;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
