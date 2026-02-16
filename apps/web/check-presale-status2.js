const { createClient } = require('@supabase/supabase-js');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);

async function main() {
  const roundId = '4d7c541d-1e03-49d2-9fc5-0bde3e8b2133';
  
  // Check contributions table columns
  const { data: cols } = await supabase.rpc('to_jsonb', {}).catch(() => ({ data: null }));
  
  // Try round_id instead of launch_round_id
  const { data: contribs, error: contribErr } = await supabase
    .from('contributions')
    .select('*')
    .eq('round_id', roundId);
  
  if (contribErr) {
    console.log('round_id failed:', contribErr.message);
    // Try other column names
    const { data: c2, error: e2 } = await supabase
      .from('contributions')
      .select('*')
      .limit(1);
    if (c2 && c2.length > 0) {
      console.log('Contributions columns:', Object.keys(c2[0]));
    } else {
      console.log('No contributions found or error:', e2?.message);
    }
  } else {
    console.log('=== CONTRIBUTIONS (round_id match) ===');
    console.log('Count:', contribs.length);
    contribs.forEach(c => {
      console.log(JSON.stringify(c, null, 2));
    });
  }
  
  // Try fee_splits with round_id
  const { data: fees, error: feeErr } = await supabase
    .from('fee_splits')
    .select('*')
    .eq('round_id', roundId);
  
  if (feeErr) {
    console.log('\nfee_splits round_id failed:', feeErr.message);
    const { data: f2 } = await supabase.from('fee_splits').select('*').limit(1);
    if (f2 && f2.length > 0) {
      console.log('Fee splits columns:', Object.keys(f2[0]));
    }
  } else {
    console.log('\n=== FEE SPLITS ===');
    console.log('Count:', fees?.length || 0);
    fees?.forEach(f => console.log(JSON.stringify(f, null, 2)));
  }
}

main().catch(console.error);
