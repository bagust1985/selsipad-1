import { getServerSession } from '@/lib/auth/session';
import { createClient } from '@supabase/supabase-js';
import { PageHeader, PageContainer } from '@/components/layout';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function MyAMAsPage() {
  const session = await getServerSession();

  if (!session) {
    redirect('/');
  }

  // Use service role to bypass RLS
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  // Fetch without embedded relations (FK not set up)
  const { data: myAMAs, error } = await supabase
    .from('ama_requests')
    .select('*')
    .eq('developer_id', session.userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching AMA requests:', error);
  }

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-500/20 text-yellow-400',
    PINNED: 'bg-indigo-500/20 text-indigo-400',
    LIVE: 'bg-green-500/20 text-green-400',
    ENDED: 'bg-gray-500/20 text-gray-400',
    REJECTED: 'bg-red-500/20 text-red-400',
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] pb-20">
      <PageHeader title="My AMAs" />

      <PageContainer className="py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Your AMA Requests</h2>
          <Link
            href="/ama/submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            + New AMA
          </Link>
        </div>

        {/* AMA List */}
        {!myAMAs || myAMAs.length === 0 ? (
          <div className="bg-gradient-to-br from-[#14142b] to-[#0a0a0f] rounded-xl border border-white/10 p-12 text-center">
            <h3 className="text-xl font-semibold text-white mb-2">No AMAs Yet</h3>
            <p className="text-gray-400 mb-6">Create your first AMA session</p>
            <Link
              href="/ama/submit"
              className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Request AMA ($100)
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {myAMAs?.map((ama: any) => (
              <div key={ama.id} className="bg-gradient-to-br from-[#14142b] to-[#0a0a0f] rounded-xl border border-white/10 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{ama.project_name}</h3>
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-medium ${
                          statusColors[ama.status] || 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {ama.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">
                      Scheduled: {new Date(ama.scheduled_at).toLocaleString('en-US', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </p>
                    <p className="text-sm text-indigo-400 mt-1">
                      Payment: {Number(ama.payment_amount_bnb).toFixed(4)} BNB
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {ama.status === 'LIVE' && (
                      <Link
                        href={`/ama/${ama.id}`}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        🔴 Join Live
                      </Link>
                    )}
                    
                    {ama.status !== 'LIVE' && (
                      <Link
                        href={`/ama/${ama.id}`}
                        className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm font-medium"
                      >
                        View
                      </Link>
                    )}
                  </div>
                </div>

                {ama.description && (
                  <p className="text-gray-300 text-sm line-clamp-2">{ama.description}</p>
                )}

                {ama.rejection_reason && (
                  <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm">
                      <strong>Rejected:</strong> {ama.rejection_reason}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </PageContainer>
    </div>
  );
}
