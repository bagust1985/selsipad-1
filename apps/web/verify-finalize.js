const { createClient } = require('@supabase/supabase-js');
const { ethers } = require('ethers');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);

const RPC = 'https://data-seed-prebsc-1-s1.bnbchain.org:8545';
const provider = new ethers.JsonRpcProvider(RPC);

const PRESALE_ABI = [
  'function status() view returns (uint8)',
  'function totalRaised() view returns (uint256)',
  'function softCap() view returns (uint256)',
  'function hardCap() view returns (uint256)',
  'function token() view returns (address)',
  'function projectOwner() view returns (address)',
];

const VESTING_ABI = [
  'function merkleRoot() view returns (bytes32)',
  'function token() view returns (address)',
  'function totalAllocated() view returns (uint256)',
];

const ERC20_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
];

const STATUS_MAP = {0:'PENDING',1:'ACTIVE',2:'SUCCESS',3:'FAILED',4:'CANCELLED',5:'FINALIZED'};

async function main() {
  const roundId = '4d7c541d-1e03-49d2-9fc5-0bde3e8b2133';
  const roundAddr = '0xf22BB547b70966026a1a219193e97009775da7b3';
  const tokenAddr = '0x72B282A267Fc42EbC6C72e9AcD29EEdFacD59fe3';
  const vestingAddr = '0x0535804839f1955dd64593D7B89692ad8e6271eC';
  
  console.log('╔══════════════════════════════════════════╗');
  console.log('║  PRESALE TTS FINALIZATION VERIFICATION   ║');
  console.log('╚══════════════════════════════════════════╝\n');

  // ═══ 1. ON-CHAIN STATE ═══
  console.log('=== 1. ON-CHAIN CONTRACT STATE ===');
  try {
    const presale = new ethers.Contract(roundAddr, PRESALE_ABI, provider);
    const [status, totalRaised, softCap, hardCap] = await Promise.all([
      presale.status(),
      presale.totalRaised(),
      presale.softCap(),
      presale.hardCap(),
    ]);
    console.log(`  Contract Status: ${STATUS_MAP[Number(status)] || status} (${status})`);
    console.log(`  Total Raised:    ${ethers.formatEther(totalRaised)} BNB`);
    console.log(`  Softcap:         ${ethers.formatEther(softCap)} BNB`);
    console.log(`  Hardcap:         ${ethers.formatEther(hardCap)} BNB`);
    console.log(`  Above Softcap:   ${totalRaised >= softCap ? '✅ YES' : '❌ NO'}`);
  } catch(e) { console.log('  ❌ Error reading presale contract:', e.message); }

  // ═══ 2. TOKEN BALANCES ═══
  console.log('\n=== 2. TOKEN DISTRIBUTION CHECK ===');
  try {
    const token = new ethers.Contract(tokenAddr, ERC20_ABI, provider);
    const [symbol, decimals] = await Promise.all([token.symbol(), token.decimals()]);
    
    const [balRound, balVesting] = await Promise.all([
      token.balanceOf(roundAddr),
      token.balanceOf(vestingAddr),
    ]);
    
    console.log(`  Token: $${symbol} (${Number(decimals)} decimals)`);
    console.log(`  Balance in Presale Contract: ${ethers.formatUnits(balRound, decimals)} ${symbol}`);
    console.log(`  Balance in Vesting Vault:    ${ethers.formatUnits(balVesting, decimals)} ${symbol}`);
  } catch(e) { console.log('  ❌ Error:', e.message); }

  // ═══ 3. VESTING VAULT STATE ═══
  console.log('\n=== 3. VESTING VAULT (MERKLE) STATE ===');
  try {
    const vesting = new ethers.Contract(vestingAddr, VESTING_ABI, provider);
    const [merkleRoot, vToken, totalAlloc] = await Promise.all([
      vesting.merkleRoot(),
      vesting.token(),
      vesting.totalAllocated(),
    ]);
    const token = new ethers.Contract(tokenAddr, ERC20_ABI, provider);
    const decimals = await token.decimals();
    console.log(`  Merkle Root:      ${merkleRoot}`);
    console.log(`  Merkle Set:       ${merkleRoot !== '0x0000000000000000000000000000000000000000000000000000000000000000' ? '✅ YES' : '⏳ NOT YET'}`);
    console.log(`  Token:            ${vToken}`);
    console.log(`  Total Allocated:  ${ethers.formatUnits(totalAlloc, decimals)}`);
  } catch(e) { console.log('  ❌ Error:', e.message); }

  // ═══ 4. DB: ROUND STATUS ═══
  console.log('\n=== 4. DB: ROUND STATUS ===');
  const { data: round } = await supabase
    .from('launch_rounds')
    .select('status, total_raised, total_participants')
    .eq('id', roundId)
    .single();
  console.log(`  DB Status:       ${round?.status}`);
  console.log(`  DB Raised:       ${round?.total_raised}`);
  console.log(`  DB Participants: ${round?.total_participants}`);

  // ═══ 5. DB: CONTRIBUTIONS ═══
  console.log('\n=== 5. DB: CONTRIBUTIONS ===');
  const { data: contribs } = await supabase
    .from('contributions')
    .select('wallet_address, amount, status, claimed_at, claim_tx_hash')
    .eq('round_id', roundId);
  console.log(`  Total: ${contribs?.length || 0}`);
  contribs?.forEach(c => {
    console.log(`  - ${c.wallet_address.slice(0,10)}... | ${c.amount} BNB | ${c.status} | claimed: ${c.claimed_at ? '✅' : '⏳ no'}`);
  });

  // ═══ 6. DB: FEE SPLITS ═══
  console.log('\n=== 6. DB: FEE SPLITS ===');
  const { data: fees } = await supabase
    .from('fee_splits')
    .select('*')
    .eq('source_id', roundId);
  console.log(`  Total splits: ${fees?.length || 0}`);
  fees?.forEach(f => {
    console.log(`  - source: ${f.source_type} | total: ${f.total_amount} | treasury: ${f.treasury_amount} | referral: ${f.referral_pool_amount} | staking: ${f.staking_pool_amount} | processed: ${f.processed ? '✅' : '⏳'}`);
  });

  // ═══ 7. DB: FINALIZATION LOGS ═══
  console.log('\n=== 7. DB: FINALIZATION LOGS ===');
  const { data: finLogs } = await supabase
    .from('finalization_logs')
    .select('*')
    .eq('launch_round_id', roundId)
    .order('created_at', { ascending: true });
  console.log(`  Total logs: ${finLogs?.length || 0}`);
  finLogs?.forEach(l => {
    console.log(`  - ${l.step || l.action}: ${l.status} | tx: ${l.tx_hash?.slice(0,15) || 'N/A'}... | ${l.created_at}`);
  });

  // ═══ 8. DB: LP LOCKS ═══
  console.log('\n=== 8. DB: LP LOCKS ===');
  const { data: lpLocks } = await supabase
    .from('lp_locks')
    .select('*')
    .eq('launch_round_id', roundId);
  console.log(`  Total locks: ${lpLocks?.length || 0}`);
  lpLocks?.forEach(l => {
    console.log(`  - pair: ${l.lp_pair_address} | locked: ${l.locked_until} | tx: ${l.tx_hash?.slice(0,15)}...`);
  });

  console.log('\n═══════════════════════════════════════');
  console.log('  Run this script again after finalize!');
  console.log('═══════════════════════════════════════');
}

main().catch(console.error);
