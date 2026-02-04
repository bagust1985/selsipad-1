import { getUpcomingAMAs, getLiveAMAs } from './actions';
import { AMACard } from '@/components/ama/AMACard';
import { PageHeader, PageContainer } from '@/components/layout';
import Link from 'next/link';

// Force dynamic rendering for real-time AMA status
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AMAPage() {
  const [liveAMAs, upcomingAMAs] = await Promise.all([getLiveAMAs(), getUpcomingAMAs()]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] pb-20">
      <PageHeader title="AMA Sessions" />

      <PageContainer className="py-6 space-y-8">
        {/* Live AMAs */}
        {liveAMAs.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              Live Now
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveAMAs.map((ama: any) => (
                <AMACard
                  key={ama.id}
                  id={ama.id}
                  projectName={ama.project_name}
                  description={ama.description}
                  scheduledAt={ama.scheduled_at}
                  developerName="Developer"
                  status="LIVE"
                  isLive={true}
                />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming AMAs */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">📅 Upcoming</h2>
          {upcomingAMAs.length === 0 ? (
            <div className="bg-gradient-to-br from-[#14142b] to-[#0a0a0f] rounded-xl border border-white/10 p-12 text-center">
              <p className="text-gray-400 text-lg mb-2">No upcoming AMAs scheduled</p>
              <p className="text-gray-500 text-sm">Check back later for scheduled sessions</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingAMAs.map((ama: any) => (
                <AMACard
                  key={ama.id}
                  id={ama.id}
                  projectName={ama.project_name}
                  description={ama.description}
                  scheduledAt={ama.scheduled_at}
                  developerName="Developer"
                  status="PINNED"
                />
              ))}
            </div>
          )}
        </section>

        {/* CTA for Developers */}
        <section className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-2">Host Your Own AMA</h3>
          <p className="mb-2 opacity-90">Connect with your community through live Q&A sessions</p>
          <p className="mb-6 text-indigo-200 text-sm">
            ⏱️ 60 minutes session • 💰 $100 USD fee (paid in BNB via Chainlink pricing)
          </p>
          <Link
            href="/ama/submit"
            className="inline-block px-6 py-3 bg-white text-indigo-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            Submit AMA Request
          </Link>
        </section>
      </PageContainer>
    </div>
  );
}
