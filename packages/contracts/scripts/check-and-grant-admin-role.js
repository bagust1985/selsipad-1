const hre = require('hardhat');

async function main() {
  const contractAddress = '0xD1FC308D3261EFf6296f8aBd7B4C5AC68330c8a3';

  const fullAbi = require('../artifacts/contracts/fairlaunch/Fairlaunch.sol/Fairlaunch.json').abi;
  const [signer] = await hre.ethers.getSigners();
  const contract = new hre.ethers.Contract(contractAddress, fullAbi, signer);

  console.log('');
  console.log('🔍 CHECKING ADMIN ROLE STATUS');
  console.log('═'.repeat(70));
  console.log('Contract:', contractAddress);
  console.log('Caller:', signer.address);
  console.log('');

  try {
    // Get ADMIN_ROLE hash
    const ADMIN_ROLE = await contract.ADMIN_ROLE();
    const DEFAULT_ADMIN_ROLE = hre.ethers.ZeroHash; // 0x00...00

    console.log('Role Hashes:');
    console.log('  ADMIN_ROLE:', ADMIN_ROLE);
    console.log('  DEFAULT_ADMIN_ROLE:', DEFAULT_ADMIN_ROLE);
    console.log('');

    // Check who has roles
    const hasAdminRole = await contract.hasRole(ADMIN_ROLE, signer.address);
    const hasDefaultAdminRole = await contract.hasRole(DEFAULT_ADMIN_ROLE, signer.address);

    console.log('Current Signer Roles:');
    console.log('  Has ADMIN_ROLE:', hasAdminRole ? '✅ YES' : '❌ NO');
    console.log('  Has DEFAULT_ADMIN_ROLE:', hasDefaultAdminRole ? '✅ YES' : '❌ NO');
    console.log('');

    // Check admin executor (from deployment)
    const adminExecutor = '0x178cf582e811B30205CBF4Bb7bE45A9dF31AaC4A';
    const adminHasAdminRole = await contract.hasRole(ADMIN_ROLE, adminExecutor);
    const adminHasDefaultRole = await contract.hasRole(DEFAULT_ADMIN_ROLE, adminExecutor);

    console.log('Admin Executor (' + adminExecutor + '):');
    console.log('  Has ADMIN_ROLE:', adminHasAdminRole ? '✅ YES' : '❌ NO');
    console.log('  Has DEFAULT_ADMIN_ROLE:', adminHasDefaultRole ? '✅ YES' : '❌ NO');
    console.log('');

    // Solution
    console.log('═'.repeat(70));
    console.log('💡 SOLUTION:');
    console.log('');

    if (hasDefaultAdminRole) {
      console.log('✅ Current signer HAS DEFAULT_ADMIN_ROLE');
      console.log('   Can grant ADMIN_ROLE to self:');
      console.log('   └─> contract.grantRole(ADMIN_ROLE, signer.address)');
      console.log('');

      // Grant role
      console.log('Granting ADMIN_ROLE to self...');
      try {
        const tx = await contract.grantRole(ADMIN_ROLE, signer.address);
        console.log('✅ TX sent:', tx.hash);
        await tx.wait();
        console.log('✅ Role granted!');

        // Verify
        const nowHasRole = await contract.hasRole(ADMIN_ROLE, signer.address);
        console.log('✅ Verification:', nowHasRole ? 'SUCCESS' : 'FAILED');
      } catch (err) {
        console.error('❌ Failed to grant role:', err.message);
      }
    } else if (adminHasDefaultRole || adminHasAdminRole) {
      console.log('⚠️  Current signer does NOT have DEFAULT_ADMIN_ROLE');
      console.log('   But admin executor DOES have admin access');
      console.log('');
      console.log('   Options:');
      console.log('   1. Use admin executor wallet to call setLPLocker');
      console.log('   2. Ask admin executor to grant ADMIN_ROLE to deployer');
      console.log('');
      console.log('   Admin executor private key needed!');
    } else {
      console.log('❌ Neither current signer NOR admin executor has admin roles!');
      console.log('   This is a configuration issue - contract may be locked!');
    }

    console.log('═'.repeat(70));
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

main().catch(console.error);
