const { createClient } = require('@supabase/supabase-js');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);

async function main() {
  const roundId = '4d7c541d-1e03-49d2-9fc5-0bde3e8b2133';
  
  // Get 1 row to see column names
  const { data: sample } = await supabase.from('contributions').select('*').limit(1);
  if (sample && sample.length > 0) {
    console.log('Contributions columns:', Object.keys(sample[0]).join(', '));
  }
  
  // Try round_id
  let { data: contribs, error } = await supabase
    .from('contributions')
    .select('*')
    .eq('round_id', roundId);
  
  if (error) {
    console.log('round_id error:', error.message);
  } else if (contribs.length === 0) {
    // Maybe different FK: try project_id via looking up from launch_rounds
    console.log('No contribs with round_id. Trying project_id...');
    const { data: c2 } = await supabase
      .from('contributions')
      .select('*')
      .eq('project_id', '79700eb8-d9fa-4982-aa5c-e5d4afede8d8');
    console.log('Contribs by project_id:', c2?.length);
    if (c2?.length > 0) c2.forEach(c => console.log(JSON.stringify(c)));
  } else {
    console.log('Contributions found:', contribs.length);
    let total = 0;
    contribs.forEach(c => {
      total += Number(c.amount);
      console.log(`  wallet: ${c.wallet_address}, amount: ${c.amount}, status: ${c.status}, ref: ${c.referrer_address || 'N/A'}`);
    });
    console.log('Total contributed:', total);
  }

  // Fee splits columns  
  const { data: fSample } = await supabase.from('fee_splits').select('*').limit(1);
  if (fSample && fSample.length > 0) {
    console.log('\nFee splits columns:', Object.keys(fSample[0]).join(', '));
  }

  // Fee splits by round_id
  const { data: fees, error: fErr } = await supabase
    .from('fee_splits')
    .select('*')
    .eq('round_id', roundId);
  if (fErr) console.log('Fee splits round_id error:', fErr.message);
  else console.log('Fee splits for round:', fees?.length || 0);
}

main().catch(console.error);
