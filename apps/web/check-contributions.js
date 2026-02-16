const fs = require('fs');
const env = {};
fs.readFileSync('/home/selsipad/final-project/selsipad/apps/web/.env.local', 'utf8')
  .split('\n')
  .forEach((l) => {
    const m = l.match(/^([^#=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim();
  });

const { createClient } = require('@supabase/supabase-js');
const { ethers } = require('ethers');

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const provider = new ethers.JsonRpcProvider(
  env.BSC_TESTNET_RPC_URL || 'https://bsc-testnet-rpc.publicnode.com'
);

const users = [
  {
    label: 'User 1 (NO REF)',
    wallet: '0xb27d0013d21ccdcec04e23adaa8fa9892c1741bb',
    tx: '0x866eac6357ad24e190cf98ff86e7ee0c06ed0d0654abcb366a0dfa9eb6ff8cdc',
  },
  {
    label: 'User 2 (ref=934E4359)',
    wallet: '0xeade61cfecbfc3b02c238dd5e6d3a08513d7a187',
    tx: '0x2045ed65ec39cd6a3f5ef40de17266920637da2adf67c50fecc3e94ab91fd1dd',
  },
  {
    label: 'User 3 (ref=User2)',
    wallet: '0x2cfc56850026e3a65405681552c48635ad57ca45',
    tx: '0x0c57d4217d340798e8a9c27e2f54cc19519c597576a1ddfd15c70f83426ed024',
  },
  {
    label: 'User 4 (ref=User3/026F4280)',
    wallet: '0x653ab47175266536e30c863bf9d9fb1af5a865a5',
    tx: '0x7403f0800f61b4f55d50686bf0f7c60f504e5cbbeb986f977f3e1e3179e84be9',
  },
];

const MASTER = env.NEXT_PUBLIC_MASTER_REFERRER || '';

// Contribute event ABI
const contributeEventAbi = [
  'event Contributed(address indexed contributor, uint256 amount, address indexed referrer)',
];
const iface = new ethers.Interface(contributeEventAbi);

async function main() {
  console.log('MASTER_REFERRER:', MASTER);
  console.log('');

  // Get the presale round info
  const { data: rounds } = await supabase
    .from('launch_rounds')
    .select('id, round_address, params, status')
    .eq('type', 'PRESALE')
    .order('created_at', { ascending: false })
    .limit(3);

  console.log('=== Recent Presale Rounds ===');
  for (const r of rounds || []) {
    console.log(
      `  ${r.id} | ${r.status} | ${r.round_address || 'not deployed'} | sc=${r.params?.softcap} hc=${r.params?.hardcap}`
    );
  }
  console.log('');

  for (const u of users) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`${u.label}`);
    console.log(`Wallet: ${u.wallet}`);
    console.log(`TX: ${u.tx}`);
    console.log(`${'='.repeat(60)}`);

    // 1. Check TX on-chain
    try {
      const receipt = await provider.getTransactionReceipt(u.tx);
      const tx = await provider.getTransaction(u.tx);
      console.log('\n[On-Chain]');
      console.log('  Status:', receipt.status === 1 ? '✅ SUCCESS' : '❌ FAILED');
      console.log('  Block:', receipt.blockNumber);
      console.log('  To (Contract):', receipt.to);
      console.log('  Value:', ethers.formatEther(tx.value), 'BNB');

      // Parse logs for Contributed event
      for (const log of receipt.logs) {
        try {
          const parsed = iface.parseLog({ topics: log.topics, data: log.data });
          if (parsed && parsed.name === 'Contributed') {
            console.log('  📢 Contributed Event:');
            console.log('    contributor:', parsed.args[0]);
            console.log('    amount:', ethers.formatEther(parsed.args[1]), 'BNB');
            console.log('    referrer:', parsed.args[2]);
            const ref = parsed.args[2];
            if (ref.toLowerCase() === MASTER.toLowerCase()) {
              console.log('    → 🏢 MASTER REFERRER (no ref code)');
            } else if (ref === ethers.ZeroAddress) {
              console.log('    → ⚫ ZERO ADDRESS');
            } else {
              console.log('    → 👤 ACTUAL REFERRER');
            }
          }
        } catch (e) {}
      }
    } catch (e) {
      console.log('[On-Chain] Error:', e.message?.substring(0, 100));
    }

    // 2. Check DB - wallet & profile
    const { data: walletData } = await supabase
      .from('wallets')
      .select('id, user_id, address')
      .ilike('address', u.wallet);

    if (walletData?.[0]) {
      const userId = walletData[0].user_id;
      console.log('\n[DB - Profile]');
      console.log('  user_id:', userId);

      const { data: profile } = await supabase
        .from('profiles')
        .select('username, referral_code')
        .eq('user_id', userId)
        .single();
      console.log('  username:', profile?.username);
      console.log('  referral_code:', profile?.referral_code);

      // 3. Check referral_relationships (as referee)
      const { data: asReferee } = await supabase
        .from('referral_relationships')
        .select('referrer_id, code, activated_at')
        .eq('referee_id', userId);

      if (asReferee?.length > 0) {
        console.log('\n[DB - Referred BY]');
        for (const rel of asReferee) {
          const { data: refProfile } = await supabase
            .from('profiles')
            .select('username')
            .eq('user_id', rel.referrer_id)
            .single();
          const { data: refWallet } = await supabase
            .from('wallets')
            .select('address')
            .eq('user_id', rel.referrer_id)
            .limit(1)
            .single();
          console.log(
            `  Referrer: ${refProfile?.username} (${refWallet?.address}) via code=${rel.code} | activated=${rel.activated_at ? 'YES' : 'NO'}`
          );
        }
      } else {
        console.log('\n[DB - Referred BY] None (no referral relationship)');
      }

      // 4. Check referral_relationships (as referrer)
      const { data: asReferrer } = await supabase
        .from('referral_relationships')
        .select('referee_id, code, activated_at')
        .eq('referrer_id', userId);

      if (asReferrer?.length > 0) {
        console.log('\n[DB - Referred OTHERS]');
        for (const rel of asReferrer) {
          const { data: refProfile } = await supabase
            .from('profiles')
            .select('username')
            .eq('user_id', rel.referee_id)
            .single();
          console.log(
            `  Referee: ${refProfile?.username} via code=${rel.code} | activated=${rel.activated_at ? 'YES' : 'NO'}`
          );
        }
      }

      // 5. Check contributions in DB
      const { data: contributions } = await supabase
        .from('presale_contributions')
        .select('*')
        .eq('wallet_address', u.wallet.toLowerCase());

      if (contributions?.length > 0) {
        console.log('\n[DB - Contributions]');
        for (const c of contributions) {
          console.log(
            `  Round: ${c.round_id} | Amount: ${c.amount} | TX: ${c.tx_hash?.substring(0, 20)}...`
          );
        }
      } else {
        console.log('\n[DB - Contributions] None found');
      }
    } else {
      console.log('\n[DB] Wallet not found in wallets table');
    }
  }

  // Check total raised on the latest round
  if (rounds?.[0]?.round_address) {
    const roundAddr = rounds[0].round_address;
    const c = new ethers.Contract(
      roundAddr,
      ['function totalRaised() view returns (uint256)', 'function status() view returns (uint8)'],
      provider
    );
    try {
      const [total, status] = await Promise.all([c.totalRaised(), c.status()]);
      console.log(`\n\n=== Contract State (${roundAddr}) ===`);
      console.log('totalRaised:', ethers.formatEther(total), 'BNB');
      console.log('status:', Number(status));
    } catch (e) {}
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
