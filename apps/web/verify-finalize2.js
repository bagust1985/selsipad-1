const { createClient } = require('@supabase/supabase-js');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);

async function main() {
  const roundId = '4d7c541d-1e03-49d2-9fc5-0bde3e8b2133';
  const { ethers } = require('ethers');
  
  // 1. LP Locks (table might be liquidity_locks)
  console.log('=== LP LOCKS (liquidity_locks) ===');
  const { data: lpLocks, error: lpErr } = await supabase
    .from('liquidity_locks')
    .select('*')
    .eq('round_id', roundId);
  if (lpErr) {
    console.log('  liquidity_locks error:', lpErr.message);
  } else {
    console.log('  Total locks:', lpLocks?.length || 0);
    lpLocks?.forEach(l => {
      console.log(`  lock_id: ${l.lock_id}`);
      console.log(`  lp_token: ${l.lp_token_address}`);
      console.log(`  locker_contract: ${l.locker_contract_address}`);
      console.log(`  amount: ${l.lock_amount}`);
      console.log(`  locked_at: ${l.locked_at}`);
      console.log(`  locked_until: ${l.locked_until}`);
      console.log(`  status: ${l.status}`);
      console.log(`  chain: ${l.chain}`);
    });
  }

  // 2. Round allocations
  console.log('\n=== ROUND ALLOCATIONS ===');
  const { data: allocations, error: allocErr } = await supabase
    .from('round_allocations')
    .select('*')
    .eq('round_id', roundId);
  if (allocErr) {
    console.log('  Error:', allocErr.message);
  } else {
    console.log('  Total allocations:', allocations?.length || 0);
    allocations?.forEach(a => {
      console.log(`  - user: ${a.user_id?.slice(0,8)}... | contributed: ${a.contributed_amount} | tokens: ${a.allocation_tokens} | claim: ${a.claim_status}`);
    });
  }

  // 3. Vesting schedules
  console.log('\n=== VESTING SCHEDULE ===');
  const { data: schedules, error: schedErr } = await supabase
    .from('vesting_schedules')
    .select('*')
    .eq('round_id', roundId);
  if (schedErr) {
    console.log('  Error:', schedErr.message);
  } else {
    schedules?.forEach(s => {
      console.log(`  ID: ${s.id}`);
      console.log(`  Token: ${s.token_address}`);
      console.log(`  Total Tokens: ${s.total_tokens}`);
      console.log(`  TGE %: ${s.tge_percentage}`);
      console.log(`  TGE at: ${s.tge_at}`);
      console.log(`  Cliff months: ${s.cliff_months}`);
      console.log(`  Vesting months: ${s.vesting_months}`);
      console.log(`  Status: ${s.status}`);
    });
  }

  // 4. Vesting allocations
  console.log('\n=== VESTING ALLOCATIONS ===');
  const { data: vestAllocs, error: vestErr } = await supabase
    .from('vesting_allocations')
    .select('*')
    .eq('round_id', roundId);
  if (vestErr) {
    console.log('  Error:', vestErr.message);
  } else {
    console.log('  Total vesting allocations:', vestAllocs?.length || 0);
    vestAllocs?.forEach(v => {
      console.log(`  - user: ${v.user_id?.slice(0,8)}... | tokens: ${v.allocation_tokens} | claimed: ${v.claimed_tokens}`);
    });
  }

  // 5. Merkle proofs
  console.log('\n=== MERKLE PROOFS (presale_merkle_proofs) ===');
  const { data: proofs, error: proofErr } = await supabase
    .from('presale_merkle_proofs')
    .select('*')
    .eq('round_id', roundId);
  if (proofErr) {
    console.log('  Error:', proofErr.message);
  } else {
    console.log('  Total proofs:', proofs?.length || 0);
    proofs?.forEach(p => {
      const alloc = BigInt(p.allocation);
      const formattedAlloc = (Number(alloc) / 1e18).toFixed(4);
      console.log(`  - wallet: ${p.wallet_address?.slice(0,10)}... | allocation: ${formattedAlloc} TTS | proof_len: ${p.proof?.length || 0}`);
    });
  }

  // 6. Round finalization details
  console.log('\n=== ROUND FINALIZATION DETAILS ===');
  const { data: round } = await supabase
    .from('launch_rounds')
    .select('status, result, merkle_root, tge_timestamp, finalized_by, finalized_at, vesting_status, lock_status, pool_address')
    .eq('id', roundId)
    .single();
  if (round) {
    console.log(`  Status: ${round.status}`);
    console.log(`  Result: ${round.result}`);
    console.log(`  Merkle Root: ${round.merkle_root?.slice(0,20)}...`);
    console.log(`  TGE Timestamp: ${round.tge_timestamp}`);
    console.log(`  Finalized By: ${round.finalized_by}`);
    console.log(`  Finalized At: ${round.finalized_at}`);
    console.log(`  Vesting Status: ${round.vesting_status}`);
    console.log(`  Lock Status: ${round.lock_status}`);
    console.log(`  Pool Address: ${round.pool_address}`);
  }

  // 7. Fee split details (formatted in ether)
  console.log('\n=== FEE SPLIT BREAKDOWN ===');
  const { data: fees } = await supabase
    .from('fee_splits')
    .select('*')
    .eq('source_id', roundId);
  fees?.forEach(f => {
    const total = ethers.formatEther(BigInt(f.total_amount));
    const treasury = ethers.formatEther(BigInt(f.treasury_amount));
    const referral = ethers.formatEther(BigInt(f.referral_pool_amount));
    const staking = ethers.formatEther(BigInt(f.staking_pool_amount));
    console.log(`  Total Fee:     ${total} BNB (5% of 0.4 BNB raised)`);
    console.log(`  Treasury:      ${treasury} BNB (50%)`);
    console.log(`  Referral Pool: ${referral} BNB (40%)`);
    console.log(`  Staking Pool:  ${staking} BNB (10%)`);
  });
}

main().catch(console.error);
