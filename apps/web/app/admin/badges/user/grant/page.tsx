import { createClient } from '@/lib/supabase/server';
import { GrantUserBadgeClient } from './GrantUserBadgeClient';

async function getUserBadges() {
  const supabase = createClient();

  const { data: badges, error } = await supabase
    .from('badge_definitions')
    .select('*')
    .eq('scope', 'USER')
    .order('name', { ascending: true });

  if (error) {
    console.error('Failed to fetch user badges:', error);
    return [];
  }

  return badges || [];
}

async function getUsers() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Get all wallets with their user info
  const { data: wallets, error } = await supabase
    .from('wallets')
    .select('user_id, address, chain, is_primary')
    .eq('is_primary', true)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('Failed to fetch wallets:', error);
    return [];
  }

  if (!wallets || wallets.length === 0) {
    console.log('No wallets found in database');
    return [];
  }

  // Get profile info for these users
  const userIds = wallets.map((w) => w.user_id);
  const { data: profiles } = await supabase
    .from('profiles')
    .select('user_id, username')
    .in('user_id', userIds);

  // Merge wallet and profile data
  const users = wallets.map((wallet) => {
    const profile = profiles?.find((p) => p.user_id === wallet.user_id);
    return {
      user_id: wallet.user_id,
      username: profile?.username || null,
      wallets: [
        {
          address: wallet.address,
          chain: wallet.chain,
          is_primary: wallet.is_primary,
        },
      ],
    };
  });

  console.log(`Found ${users.length} users with wallets`);
  return users;
}

export default async function GrantUserBadgePage() {
  const [badges, users] = await Promise.all([getUserBadges(), getUsers()]);

  return <GrantUserBadgeClient badges={badges} users={users} />;
}
