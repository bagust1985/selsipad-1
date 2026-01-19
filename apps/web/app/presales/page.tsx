import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { PresaleList } from './PresaleList';

export const metadata = {
  title: 'Presales | Selsipad',
  description: 'Browse active and upcoming presale rounds on Selsipad',
};

export default async function PresalesPage() {
  const supabase = createClient();

  // Fetch initial presales (server-side)
  const { data: rounds } = await supabase
    .from('launch_rounds')
    .select(
      `
      *,
      projects (
        name,
        symbol,
        logo_url,
        kyc_status,
        sc_scan_status
      )
    `
    )
    .in('status', ['APPROVED', 'LIVE', 'ENDED', 'FINALIZED'])
    .order('created_at', { ascending: false })
    .limit(20);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Presale Rounds</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Participate in token presales on EVM and Solana networks
          </p>
        </div>

        {/* Client Component with filters */}
        <PresaleList initialRounds={rounds || []} />
      </div>
    </div>
  );
}
