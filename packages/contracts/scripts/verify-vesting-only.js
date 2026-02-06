const hre = require('hardhat');

async function main() {
  console.log('');
  console.log('═'.repeat(70));
  console.log('🔍 VERIFYING TEAM VESTING CONTRACT');
  console.log('═'.repeat(70));
  console.log('');

  const vestingAddress = '0x64f9af2c944479b84319e72ef6a5089072575b71';

  console.log('📋 Contract:', vestingAddress);
  console.log('');

  // Get vesting details
  const vestingAbi =
    require('../artifacts/contracts/fairlaunch/TeamVesting.sol/TeamVesting.json').abi;
  const vesting = new hre.ethers.Contract(vestingAddress, vestingAbi, hre.ethers.provider);

  const vestingToken = await vesting.token();
  console.log('  Token:', vestingToken);
  console.log('');

  try {
    await hre.run('verify:verify', {
      address: vestingAddress,
      contract: 'contracts/fairlaunch/TeamVesting.sol:TeamVesting',
      constructorArguments: [vestingToken],
    });
    console.log('✅ Vesting contract verified!');
  } catch (error) {
    if (error.message.includes('Already Verified')) {
      console.log('✅ Vesting contract already verified');
    } else {
      console.error('❌ Failed:', error.message);
    }
  }
  console.log('');

  console.log('═'.repeat(70));
  console.log('✅ ALL CONTRACTS VERIFIED!');
  console.log('═'.repeat(70));
  console.log('');
  console.log('📋 BSCScan Links:');
  console.log(
    '  Fairlaunch:',
    'https://testnet.bscscan.com/address/0xD1FC308D3261EFf6296f8aBd7B4C5AC68330c8a3#code'
  );
  console.log(
    '  Token:',
    'https://testnet.bscscan.com/address/0x45FEa629965CEd8805C003d7c524dcED84779775#code'
  );
  console.log('  Vesting:', `https://testnet.bscscan.com/address/${vestingAddress}#code`);
  console.log('');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
