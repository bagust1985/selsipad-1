const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);

async function main() {
  const roundId = '4d7c541d-1e03-49d2-9fc5-0bde3e8b2133';
  
  // 1. Get round data
  const { data: round, error: roundErr } = await supabase
    .from('launch_rounds')
    .select('id, status, type, chain, contract_address, round_address, token_address, total_raised, total_participants, start_at, end_at, params, project_id, vesting_vault_address')
    .eq('id', roundId)
    .single();
  
  if (roundErr) { console.error('Round error:', roundErr); return; }
  
  console.log('=== ROUND STATUS ===');
  console.log('ID:', round.id);
  console.log('Status:', round.status);
  console.log('Type:', round.type); 
  console.log('Chain:', round.chain);
  console.log('Round Address:', round.round_address);
  console.log('Contract Address:', round.contract_address);
  console.log('Token Address:', round.token_address);
  console.log('Vesting Vault:', round.vesting_vault_address);
  console.log('Total Raised:', round.total_raised);
  console.log('Total Participants:', round.total_participants);
  console.log('Start:', round.start_at);
  console.log('End:', round.end_at);
  console.log('Project ID:', round.project_id);
  console.log('Hardcap:', round.params?.hardcap);
  console.log('Softcap:', round.params?.softcap);
  console.log('Token for sale:', round.params?.token_for_sale);
  console.log('Price:', round.params?.price);
  
  // 2. Get contributions
  const { data: contribs, error: contribErr } = await supabase
    .from('contributions')
    .select('*')
    .eq('launch_round_id', roundId);
  
  console.log('\n=== CONTRIBUTIONS ===');
  if (contribErr) { console.error('Contrib error:', contribErr); }
  else {
    console.log('Total contributions:', contribs.length);
    let totalAmount = 0;
    contribs.forEach(c => {
      console.log(`  - wallet: ${c.wallet_address}`);
      console.log(`    amount: ${c.amount}, status: ${c.status}`);
      console.log(`    tx: ${c.tx_hash}`);
      console.log(`    referrer: ${c.referrer_address || 'none'}`);
      totalAmount += Number(c.amount);
    });
    console.log('Sum of contributions:', totalAmount);
  }
  
  // 3. Get fee_splits
  const { data: fees, error: feeErr } = await supabase
    .from('fee_splits')
    .select('*')
    .eq('launch_round_id', roundId);
  
  console.log('\n=== FEE SPLITS ===');
  if (feeErr) { console.error('Fee splits error:', feeErr); }
  else {
    console.log('Total fee splits:', fees?.length || 0);
    fees?.forEach(f => {
      console.log(`  - type: ${f.type}, amount: ${f.amount}, wallet: ${f.wallet_address}`);
    });
  }
  
  // 4. Check finalization status
  const { data: finLogs } = await supabase
    .from('finalization_logs')
    .select('*')
    .eq('launch_round_id', roundId);
  
  console.log('\n=== FINALIZATION LOGS ===');
  console.log('Total logs:', finLogs?.length || 0);
  finLogs?.forEach(l => {
    console.log(`  - step: ${l.step}, status: ${l.status}, tx: ${l.tx_hash || 'N/A'}`);
  });

  // 5. Check LP locks
  const { data: lpLocks } = await supabase
    .from('lp_locks')
    .select('*')
    .eq('launch_round_id', roundId);
  
  console.log('\n=== LP LOCKS ===');
  console.log('Total LP locks:', lpLocks?.length || 0);
  lpLocks?.forEach(l => {
    console.log(`  - pair: ${l.lp_pair_address}, locked_until: ${l.locked_until}`);
  });
}

main().catch(console.error);
