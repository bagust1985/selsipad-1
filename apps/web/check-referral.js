const { createClient } = require('@supabase/supabase-js');
const { ethers } = require('ethers');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);

async function main() {
  const roundId = '4d7c541d-1e03-49d2-9fc5-0bde3e8b2133';
  const roundAddress = '0xf22BB547b70966026a1a219193e97009775da7b3';

  // 1. Check on-chain Contributed events
  console.log('=== ON-CHAIN: Contributed Events ===');
  const provider = new ethers.JsonRpcProvider('https://bsc-testnet-rpc.publicnode.com');
  const ABI = ['event Contributed(address indexed contributor, uint256 amount, address indexed referrer)'];
  const contract = new ethers.Contract(roundAddress, ABI, provider);
  
  const currentBlock = await provider.getBlockNumber();
  const fromBlock = Math.max(0, currentBlock - 50000);
  
  let allEvents = [];
  const MAX_RANGE = 9999;
  for (let start = fromBlock; start <= currentBlock; start += MAX_RANGE) {
    const end = Math.min(start + MAX_RANGE - 1, currentBlock);
    try {
      const chunk = await contract.queryFilter('Contributed', start, end);
      allEvents.push(...chunk);
    } catch (e) {
      console.log(`  Error querying ${start}-${end}:`, e.message);
    }
  }
  
  console.log(`  Found ${allEvents.length} Contributed events (blocks ${fromBlock}-${currentBlock})`);
  allEvents.forEach(e => {
    const args = e.args;
    console.log(`  - contributor: ${args[0]}`);
    console.log(`    amount: ${ethers.formatEther(args[1])} BNB`);
    console.log(`    referrer: ${args[2]} ${args[2] === ethers.ZeroAddress ? '(NO REFERRAL)' : '✅ HAS REFERRER'}`);
  });

  // 2. Check DB contributions for referral info 
  console.log('\n=== DB: Contributions ===');
  const { data: contribs } = await supabase
    .from('contributions')
    .select('wallet_address, amount, referral_code, referrer_user_id')
    .eq('round_id', roundId);
  contribs?.forEach(c => {
    console.log(`  - wallet: ${c.wallet_address?.slice(0,10)}... | amount: ${c.amount} | ref_code: ${c.referral_code || 'NONE'} | referrer_user: ${c.referrer_user_id || 'NONE'}`);
  });

  // 3. Check DB referral_relationships
  console.log('\n=== DB: Referral Relationships ===');
  const wallets = contribs?.map(c => c.wallet_address).filter(Boolean) || [];
  for (const wallet of wallets) {
    const { data: walletRow } = await supabase
      .from('wallets')
      .select('user_id')
      .ilike('address', wallet)
      .single();
    
    if (walletRow?.user_id) {
      const { data: rel } = await supabase
        .from('referral_relationships')
        .select('referrer_id, activated_at, referral_code')
        .eq('referee_id', walletRow.user_id)
        .single();
      console.log(`  - wallet: ${wallet?.slice(0,10)}... | user: ${walletRow.user_id.slice(0,8)}... | referrer: ${rel?.referrer_id?.slice(0,8) || 'NONE'}... | code: ${rel?.referral_code || 'NONE'} | activated: ${rel?.activated_at || 'N/A'}`);
    }
  }

  // 4. Check referral_earnings table
  console.log('\n=== DB: Referral Earnings ===');
  const { data: earnings, error: earnErr } = await supabase
    .from('referral_earnings')
    .select('*')
    .eq('source_id', roundId);
  if (earnErr) {
    console.log('  Error:', earnErr.message);
  } else {
    console.log(`  Total earnings entries: ${earnings?.length || 0}`);
    earnings?.forEach(e => {
      console.log(`  - referrer: ${e.referrer_id?.slice(0,8)}... | amount: ${e.amount} | status: ${e.status}`);
    });
  }

  // 5. Check deployment_block_number in round
  console.log('\n=== Round Deploy Block ===');
  const { data: round } = await supabase
    .from('launch_rounds')
    .select('deployment_block_number, created_at')
    .eq('id', roundId)
    .single();
  console.log(`  deployment_block_number: ${round?.deployment_block_number || 'NULL'}`);
  console.log(`  created_at: ${round?.created_at}`);
}

main().catch(console.error);
