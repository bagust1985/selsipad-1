import { createClient } from '@/lib/supabase/server';
import { BondingCurveList } from './BondingCurveList';

export const metadata = {
  title: 'Bonding Curve | SELSIPAD',
  description: 'Permissionless token launch with bonding curve pricing',
};

export default async function BondingCurvePage() {
  const supabase = createClient();

  // Fetch all bonding curve pools (public data)
  const { data: pools, error } = await supabase
    .from('bonding_pools')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch bonding pools:', error);
  }

  return (
    <div className="min-h-screen bg-gray-950 py-8">
      <div className="container mx-auto px-4">
        <BondingCurveList pools={pools || []} />
      </div>
    </div>
  );
}
