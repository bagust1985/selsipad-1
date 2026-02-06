const hre = require('hardhat');

async function main() {
  const txHash = '0xd64471e1b82339469acc2bdc021749748d143a1e9dedb37b95a64d484c365953';

  console.log('🔍 Extracting Fairlaunch Contract from TX');
  console.log('TX:', txHash);
  console.log('');

  const receipt = await hre.ethers.provider.getTransactionReceipt(txHash);

  if (!receipt) {
    console.log('❌ Transaction not found');
    return;
  }

  console.log('✅ Transaction found');
  console.log('Status:', receipt.status === 1 ? 'SUCCESS' : 'FAILED');
  console.log('Logs count:', receipt.logs.length);
  console.log('');

  // Find FairlaunchCreated event
  // event FairlaunchCreated(address indexed fairlaunch, address indexed creator, address token)
  const factoryInterface = new hre.ethers.Interface([
    'event FairlaunchCreated(address indexed fairlaunch, address indexed creator, address token)',
  ]);

  const fairlaunchCreatedTopic = factoryInterface.getEvent('FairlaunchCreated').topicHash;

  console.log('Looking for FairlaunchCreated event...');
  console.log('Topic Hash:', fairlaunchCreatedTopic);
  console.log('');

  for (const log of receipt.logs) {
    if (log.topics[0] === fairlaunchCreatedTopic) {
      console.log('✅ Found FairlaunchCreated event!');
      const parsed = factoryInterface.parseLog(log);

      console.log('');
      console.log('📋 Event Data:');
      console.log('  Fairlaunch Contract:', parsed.args.fairlaunch);
      console.log('  Creator:', parsed.args.creator);
      console.log('  Token:', parsed.args.token);
      console.log('');

      // Now check the Fairlaunch contract
      const fairlaunchAddress = parsed.args.fairlaunch;
      console.log('🔍 Checking Fairlaunch Contract:', fairlaunchAddress);

      const code = await hre.ethers.provider.getCode(fairlaunchAddress);
      console.log('  Has code:', code !== '0x' ? '✅ YES' : '❌ NO');
      console.log('  Bytecode length:', code.length);

      return;
    }
  }

  console.log('❌ FairlaunchCreated event not found in logs');
  console.log('');
  console.log('Available events:');
  for (let i = 0; i < Math.min(5, receipt.logs.length); i++) {
    console.log(`  Log ${i}: ${receipt.logs[i].topics[0]}`);
  }
}

main().catch(console.error);
