const hre = require('hardhat');

async function main() {
  console.log('');
  console.log('═'.repeat(70));
  console.log('🔍 VERIFYING TOKEN & VESTING CONTRACTS');
  console.log('═'.repeat(70));
  console.log('');

  const tokenAddress = '0x45FEa629965CEd8805C003d7c524dcED84779775';
  const vestingAddress = '0x64f9af2c944479b84319e72ef6a5089072575b71';

  console.log('📋 Contracts:');
  console.log('  Token:', tokenAddress);
  console.log('  Vesting:', vestingAddress);
  console.log('');

  // VERIFY TOKEN
  console.log('═'.repeat(70));
  console.log('🪙 VERIFYING TOKEN CONTRACT');
  console.log('═'.repeat(70));

  const tokenAbi =
    require('../artifacts/contracts/fairlaunch/SimpleTokenFactory.sol/SimpleToken.json').abi;
  const token = new hre.ethers.Contract(tokenAddress, tokenAbi, hre.ethers.provider);

  const [name, symbol, totalSupply] = await Promise.all([
    token.name(),
    token.symbol(),
    token.totalSupply(),
  ]);

  console.log('  Name:', name);
  console.log('  Symbol:', symbol);
  console.log('  Supply:', hre.ethers.formatEther(totalSupply));
  console.log('');

  try {
    await hre.run('verify:verify', {
      address: tokenAddress,
      contract: 'contracts/fairlaunch/SimpleTokenFactory.sol:SimpleToken',
      constructorArguments: [name, symbol, totalSupply],
    });
    console.log('✅ Token verified!');
  } catch (error) {
    if (error.message.includes('Already Verified')) {
      console.log('✅ Token already verified');
    } else {
      console.error('❌ Failed:', error.message);
    }
  }
  console.log('');

  // VERIFY VESTING
  console.log('═'.repeat(70));
  console.log('📅 VERIFYING VESTING CONTRACT');
  console.log('═'.repeat(70));

  const vestingAbi =
    require('../artifacts/contracts/vesting/VestingContract.sol/VestingContract.json').abi;
  const vesting = new hre.ethers.Contract(vestingAddress, vestingAbi, hre.ethers.provider);

  const vestingToken = await vesting.token();
  console.log('  Token:', vestingToken);
  console.log('');

  try {
    await hre.run('verify:verify', {
      address: vestingAddress,
      contract: 'contracts/vesting/VestingContract.sol:VestingContract',
      constructorArguments: [vestingToken],
    });
    console.log('✅ Vesting verified!');
  } catch (error) {
    if (error.message.includes('Already Verified')) {
      console.log('✅ Vesting already verified');
    } else {
      console.error('❌ Failed:', error.message);
    }
  }
  console.log('');

  // SUMMARY
  console.log('═'.repeat(70));
  console.log('✅ VERIFICATION COMPLETE');
  console.log('═'.repeat(70));
  console.log('');
  console.log('📋 BSCScan Links:');
  console.log(
    '  Fairlaunch:',
    'https://testnet.bscscan.com/address/0xD1FC308D3261EFf6296f8aBd7B4C5AC68330c8a3#code'
  );
  console.log('  Token:', `https://testnet.bscscan.com/address/${tokenAddress}#code`);
  console.log('  Vesting:', `https://testnet.bscscan.com/address/${vestingAddress}#code`);
  console.log('');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
