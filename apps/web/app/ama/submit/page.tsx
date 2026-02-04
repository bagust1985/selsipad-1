import { getServerSession } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { hasDevBadge } from '@/lib/auth/devAccess';
import { AMASubmitForm } from '@/components/ama/AMASubmitForm';
import { PageHeader, PageContainer } from '@/components/layout';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AMASubmitPage() {
  const session = await getServerSession();

  if (!session) {
    redirect('/');
  }

  // ============================================
  // DEVELOPER ACCESS CONTROL
  // ============================================

  // Check if user has DEVELOPER_KYC_VERIFIED badge
  const hasAccess = await hasDevBadge(session.userId);

  if (!hasAccess) {
    // User does not have required badge - show error
    return (
      <div className="min-h-screen bg-[#0a0a0f] pb-20">
        <PageHeader title="Submit AMA" />
        <PageContainer className="py-12">
          <div className="max-w-2xl mx-auto bg-gradient-to-br from-[#14142b] to-[#0a0a0f] rounded-xl border border-white/10 p-12 text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">Developer Verification Required</h2>
            <p className="text-gray-400 mb-6">
              Only verified developers can host AMA sessions. Please complete developer KYC verification to continue.
            </p>

            <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-4 mb-6">
              <p className="text-sm text-indigo-300">
                <strong>Why verification?</strong> This helps protect our community and ensures AMAs are hosted by legitimate project developers.
              </p>
            </div>

            <div className="flex gap-3 justify-center">
              <Link
                href="/profile/kyc/submit"
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Complete KYC Verification
              </Link>
              <Link
                href="/ama"
                className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors font-medium"
              >
                Back to AMAs
              </Link>
            </div>
          </div>
        </PageContainer>
      </div>
    );
  }

  // ============================================
  // END DEVELOPER ACCESS CONTROL
  // ============================================

  const supabase = createClient();

  // Get user's projects (owner_user_id is the correct column name)
  const { data: projects } = await supabase
    .from('projects')
    .select('id, name')
    .eq('owner_user_id', session.userId)
    .order('created_at', { ascending: false });

  if (!projects || projects.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] pb-20">
        <PageHeader title="Submit AMA" />
        <PageContainer className="py-12">
          <div className="bg-gradient-to-br from-[#14142b] to-[#0a0a0f] rounded-xl border border-white/10 p-12 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">No Projects Found</h2>
            <p className="text-gray-400 mb-6">You need to create a project before hosting an AMA</p>
            <Link
              href="/explore"
              className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Explore Projects
            </Link>
          </div>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] pb-20">
      <PageHeader title="Request AMA" />

      <PageContainer className="py-6">
        <div className="max-w-2xl mx-auto">
          {/* Main Form */}
          <AMASubmitForm userProjects={projects} isDevVerified={true} />

          {/* Info Card */}
          <div className="mt-6 bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-6">
            <h3 className="font-semibold text-indigo-300 mb-2">📌 Important Notes</h3>
            <ul className="space-y-2 text-sm text-indigo-200">
              <li>• AMAs require $100 USD payment (paid in BNB)</li>
              <li>• Price calculated via Chainlink oracle</li>
              <li>• AMAs require admin approval before going live</li>
              <li>• Rejected requests get full refund</li>
            </ul>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
