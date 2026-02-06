const hre = require('hardhat');

async function main() {
  const errorData =
    '0xe2517d3f00000000000000000000000095d94d86cfc550897d2b80672a3c94c12429a90da49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775';

  const fullAbi = require('../artifacts/contracts/fairlaunch/Fairlaunch.sol/Fairlaunch.json').abi;

  console.log('🔍 Decoding Custom Error');
  console.log('Error Data:', errorData);
  console.log('');

  try {
    const iface = new hre.ethers.Interface(fullAbi);
    const decoded = iface.parseError(errorData);

    console.log('✅ Decoded Error:');
    console.log('  Name:', decoded.name);
    console.log('  Signature:', decoded.signature);

    if (decoded.args && decoded.args.length > 0) {
      console.log('  Args:');
      for (let i = 0; i < decoded.args.length; i++) {
        console.log(`    [${i}]:`, decoded.args[i].toString());
      }
    }
  } catch (err) {
    console.error('❌ Could not decode:', err.message);
  }
}

main().catch(console.error);
