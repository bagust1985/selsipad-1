/**
 * Post-Finalization Distribution Audit for TPF Presale
 * Run: npx hardhat run scripts/audit-tpf-distribution.js --network bscTestnet
 */
const hre = require('hardhat');

const ROUND_ADDRESS = '0xD69fDdf11839b9df74fb09E9B4871B569d758A9d';
const LP_LOCKER = '0x2Ef59c47734cce73a0e88a4f0f003d0a1667d0d7'; // lowercase checksum
const ESCROW_VAULT = '0x6849A09c27F26fF0e58a2E36Dd5CAB2F9d0c617F';
const DEAD = '0x000000000000000000000000000000000000dEaD';
const ZERO = '0x0000000000000000000000000000000000000000';

const PRESALE_ABI = [
  'function projectToken() view returns (address)',
  'function paymentToken() view returns (address)',
  'function softCap() view returns (uint256)',
  'function hardCap() view returns (uint256)',
  'function minContribution() view returns (uint256)',
  'function maxContribution() view returns (uint256)',
  'function startTime() view returns (uint256)',
  'function endTime() view returns (uint256)',
  'function totalRaised() view returns (uint256)',
  'function burnedAmount() view returns (uint256)',
  'function vestingFunded() view returns (bool)',
  'function feePaid() view returns (bool)',
  'function lpCreated() view returns (bool)',
  'function ownerPaid() view returns (bool)',
  'function surplusBurned() view returns (bool)',
  'function lpLockId() view returns (uint256)',
  'function lpUsedBnb() view returns (uint256)',
  'function liquidityBps() view returns (uint256)',
  'function lpLockDuration() view returns (uint256)',
  'function feeSplitter() view returns (address)',
  'function vestingVault() view returns (address)',
  'function projectOwner() view returns (address)',
  'function dexRouter() view returns (address)',
  'function lpLocker() view returns (address)',
  'function tgeTimestamp() view returns (uint256)',
  'function contributions(address) view returns (uint256)',
  'function referrers(address) view returns (address)',
  'function feeConfig() view returns (uint16 totalBps, address treasury, bool active)',
];

const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function decimals() view returns (uint8)',
];

async function main() {
  const { ethers } = hre;

  console.log('='.repeat(70));
  console.log('  TPF PRESALE — POST-FINALIZATION DISTRIBUTION AUDIT');
  console.log('='.repeat(70));

  const presale = await ethers.getContractAt(PRESALE_ABI, ROUND_ADDRESS);

  // ── 1. PRESALE CONTRACT STATE ──
  console.log('\n📋 PRESALE CONTRACT:', ROUND_ADDRESS);

  const tokenAddr = await presale.projectToken();
  const payToken = await presale.paymentToken();
  const softCap = await presale.softCap();
  const hardCap = await presale.hardCap();
  const totalRaised = await presale.totalRaised();
  const burnedAmt = await presale.burnedAmount();
  const vestingFunded = await presale.vestingFunded();
  const feePaid = await presale.feePaid();
  const lpCreated = await presale.lpCreated();
  const ownerPaid = await presale.ownerPaid();
  const surplusBurned = await presale.surplusBurned();
  const lpLockId = await presale.lpLockId();
  const lpUsedBnb = await presale.lpUsedBnb();
  const liquidityBps = await presale.liquidityBps();
  const lpLockDur = await presale.lpLockDuration();
  const owner = await presale.projectOwner();
  const dexRouter = await presale.dexRouter();
  const lpLockerAddr = await presale.lpLocker();
  const vestingVault = await presale.vestingVault();
  const tge = await presale.tgeTimestamp();

  let feeConfig;
  try {
    feeConfig = await presale.feeConfig();
  } catch {
    feeConfig = null;
  }

  console.log('   Project Token:', tokenAddr);
  console.log('   Payment Token:', payToken === ZERO ? 'NATIVE (BNB)' : payToken);
  console.log('   Project Owner:', owner);
  console.log('');
  console.log('   Soft Cap:', ethers.formatEther(softCap), 'BNB');
  console.log('   Hard Cap:', ethers.formatEther(hardCap), 'BNB');
  console.log('   Total Raised:', ethers.formatEther(totalRaised), 'BNB');
  console.log('   Fill Rate:', ((Number(totalRaised) / Number(hardCap)) * 100).toFixed(2) + '%');
  console.log('');
  console.log('   Liquidity BPS:', liquidityBps.toString(), `(${Number(liquidityBps) / 100}%)`);
  console.log('   LP Used BNB:', ethers.formatEther(lpUsedBnb));
  console.log('   LP Lock Duration:', (Number(lpLockDur) / 86400).toFixed(0), 'days');
  console.log('   LP Lock ID:', lpLockId.toString());
  console.log('');
  console.log('   ✅ Finalization Steps:');
  console.log('      Fee Paid:       ', feePaid);
  console.log('      LP Created:     ', lpCreated);
  console.log('      Owner Paid:     ', ownerPaid);
  console.log('      Vesting Funded: ', vestingFunded);
  console.log('      Surplus Burned: ', surplusBurned);
  console.log(
    '      TGE Timestamp:  ',
    tge > 0n ? new Date(Number(tge) * 1000).toISOString() : 'Not set'
  );
  console.log('');
  if (feeConfig) {
    console.log(
      '   Fee Config: BPS=' +
        feeConfig.totalBps.toString() +
        ', Treasury=' +
        feeConfig.treasury +
        ', Active=' +
        feeConfig.active
    );
  }
  console.log('   Burned Amount:', ethers.formatEther(burnedAmt));
  console.log('   DEX Router:', dexRouter);
  console.log('   LP Locker:', lpLockerAddr);
  console.log('   Vesting Vault:', vestingVault);

  // ── 2. TOKEN BALANCE DISTRIBUTION ──
  if (tokenAddr && tokenAddr !== ZERO) {
    const token = await ethers.getContractAt(ERC20_ABI, tokenAddr);
    const name = await token.name();
    const symbol = await token.symbol();
    const decimals = Number(await token.decimals());
    const totalSupply = await token.totalSupply();

    console.log('\n' + '─'.repeat(70));
    console.log('🪙 TOKEN:', name, `(${symbol})`);
    console.log('   Address:', tokenAddr);
    console.log('   Total Supply:', ethers.formatUnits(totalSupply, decimals));
    console.log('   Decimals:', decimals);

    const addresses = {
      'Presale Contract': ROUND_ADDRESS,
      'Escrow Vault': ESCROW_VAULT,
      'Vesting Vault': vestingVault,
      'Dead (burned)': DEAD,
      'Zero Address': ZERO,
      'Project Owner': owner,
      'LP Locker': lpLockerAddr,
    };

    console.log('\n' + '─'.repeat(70));
    console.log('💰 TOKEN BALANCE DISTRIBUTION:');
    console.log('─'.repeat(70));

    let accounted = 0n;
    for (const [label, addr] of Object.entries(addresses)) {
      if (!addr || (addr === ZERO && label !== 'Zero Address')) continue;
      try {
        const bal = await token.balanceOf(addr);
        const formatted = ethers.formatUnits(bal, decimals);
        const pct =
          totalSupply > 0n ? (Number((bal * 10000n) / totalSupply) / 100).toFixed(2) : '0';
        console.log(`   ${label.padEnd(25)} ${formatted.padStart(25)} (${pct}%)`);
        accounted += bal;
      } catch {
        console.log(`   ${label.padEnd(25)} (error reading)`);
      }
    }

    // Check PancakeSwap LP pair (factory lookup)
    try {
      const factory = await ethers.getContractAt(
        ['function getPair(address,address) view returns (address)'],
        '0x6725F303b657a9451d8BA641348b6761A6CC7a17' // PCS V2 factory on BSC testnet
      );
      const wbnb = '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd'; // WBNB testnet
      const lpPair = await factory.getPair(tokenAddr, wbnb);
      if (lpPair && lpPair !== ZERO) {
        const lpBal = await token.balanceOf(lpPair);
        const formatted = ethers.formatUnits(lpBal, decimals);
        const pct =
          totalSupply > 0n ? (Number((lpBal * 10000n) / totalSupply) / 100).toFixed(2) : '0';
        console.log(`   ${'LP Pair (PCS)'.padEnd(25)} ${formatted.padStart(25)} (${pct}%)`);
        accounted += lpBal;

        // LP reserves
        const pair = await ethers.getContractAt(
          [
            'function getReserves() view returns (uint112,uint112,uint32)',
            'function token0() view returns (address)',
            'function token1() view returns (address)',
            'function totalSupply() view returns (uint256)',
          ],
          lpPair
        );
        const [r0, r1] = await pair.getReserves();
        const t0 = await pair.token0();
        const lpSupply = await pair.totalSupply();
        console.log(`\n   🔄 LP Pair: ${lpPair}`);
        console.log(
          `      Reserve0 (${t0 === tokenAddr ? symbol : 'WBNB'}): ${ethers.formatEther(r0)}`
        );
        console.log(
          `      Reserve1 (${t0 === tokenAddr ? 'WBNB' : symbol}): ${ethers.formatEther(r1)}`
        );
        console.log(`      LP Total Supply: ${ethers.formatEther(lpSupply)}`);
      } else {
        console.log('   LP Pair: not found on PCS');
      }
    } catch (e) {
      console.log('   LP Pair lookup error:', e.message?.substring(0, 80));
    }

    const unaccounted = totalSupply - accounted;
    console.log(`\n   📊 Accounted:   ${ethers.formatUnits(accounted, decimals)}`);
    if (unaccounted > 0n) {
      console.log(`   📊 Unaccounted: ${ethers.formatUnits(unaccounted, decimals)}`);
    }
  }

  // ── 3. BNB BALANCES ──
  console.log('\n' + '─'.repeat(70));
  console.log('💎 BNB BALANCES:');
  console.log('─'.repeat(70));
  for (const [label, addr] of Object.entries({
    'Presale Contract': ROUND_ADDRESS,
    'Fee Splitter': await presale.feeSplitter(),
    'Project Owner': owner,
    'Escrow Vault': ESCROW_VAULT,
  })) {
    const bal = await ethers.provider.getBalance(addr);
    console.log(`   ${label.padEnd(25)} ${ethers.formatEther(bal).padStart(15)} BNB`);
  }

  // ── 4. LP LOCK ──
  console.log('\n' + '─'.repeat(70));
  console.log('🔒 LP LOCK STATUS:');
  console.log('─'.repeat(70));

  if (Number(lpLockId) > 0) {
    try {
      const locker = await ethers.getContractAt(
        [
          'function getLock(uint256) view returns (address lpToken,address owner,address beneficiary,uint256 amount,uint256 unlockTime,bool withdrawn)',
        ],
        lpLockerAddr
      );
      const lock = await locker.getLock(lpLockId);
      console.log(`   Lock ID: ${lpLockId}`);
      console.log(`   LP Token:    ${lock[0]}`);
      console.log(`   Owner:       ${lock[1]}`);
      console.log(`   Beneficiary: ${lock[2]}`);
      console.log(`   Amount:      ${ethers.formatEther(lock[3])}`);
      console.log(`   Unlock:      ${new Date(Number(lock[4]) * 1000).toISOString()}`);
      console.log(`   Withdrawn:   ${lock[5]}`);
    } catch (e) {
      console.log('   LP Lock read error:', e.message?.substring(0, 100));
    }
  } else {
    console.log('   No LP lock recorded (lpLockId = 0)');
  }

  console.log('\n' + '='.repeat(70));
  console.log('  AUDIT COMPLETE');
  console.log('='.repeat(70));
}

main().catch(console.error);
