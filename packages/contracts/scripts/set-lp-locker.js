const hre = require('hardhat');

async function main() {
  const contractAddress = '0xD1FC308D3261EFf6296f8aBd7B4C5AC68330c8a3';
  const lpLockerAddress = '0x422293092c353abB6BEFaBAdBBEb1D6257F17298'; // New LP Locker

  const fullAbi = require('../artifacts/contracts/fairlaunch/Fairlaunch.sol/Fairlaunch.json').abi;
  const [signer] = await hre.ethers.getSigners();
  const contract = new hre.ethers.Contract(contractAddress, fullAbi, signer);

  console.log('');
  console.log('🔒 SETTING LP LOCKER FOR FAIRLAUNCH');
  console.log('═'.repeat(70));
  console.log('Contract:', contractAddress);
  console.log('LP Locker:', lpLockerAddress);
  console.log('Admin:', signer.address);
  console.log('');

  try {
    // Check current LP Locker
    const currentLpLocker = await contract.lpLockerAddress();
    console.log('Current LP Locker:', currentLpLocker);

    if (currentLpLocker !== '0x0000000000000000000000000000000000000000') {
      console.log('⚠️  LP Locker already set!');
      if (currentLpLocker.toLowerCase() === lpLockerAddress.toLowerCase()) {
        console.log('✅ Already set to correct address');
        return;
      }
    }

    // Test with staticCall first
    console.log('');
    console.log('Testing setLPLocker with staticCall...');
    try {
      await contract.setLPLocker.staticCall(lpLockerAddress);
      console.log('✅ staticCall succeeded - safe to proceed');
    } catch (error) {
      console.log('❌ staticCall failed:', error.message);
      throw error;
    }

    // Execute actual transaction
    console.log('');
    console.log('Executing setLPLocker transaction...');
    const tx = await contract.setLPLocker(lpLockerAddress);

    console.log('✅ Transaction sent:', tx.hash);
    console.log('⏳ Waiting for confirmation...');

    const receipt = await tx.wait();

    console.log('✅ Transaction confirmed!');
    console.log('   Block:', receipt.blockNumber);
    console.log('   Gas used:', receipt.gasUsed.toString());
    console.log('');

    // Verify
    const newLpLocker = await contract.lpLockerAddress();
    console.log('═'.repeat(70));
    console.log('✅ LP LOCKER SET SUCCESSFULLY!');
    console.log('   Address:', newLpLocker);
    console.log(
      '   Match:',
      newLpLocker.toLowerCase() === lpLockerAddress.toLowerCase() ? '✅' : '❌'
    );
    console.log('');
    console.log('🎉 Contract ready for finalization!');
    console.log('═'.repeat(70));
  } catch (err) {
    console.error('');
    console.error('❌ ERROR:', err.message);
    if (err.reason) {
      console.error('   Reason:', err.reason);
    }
  }
}

main().catch(console.error);
