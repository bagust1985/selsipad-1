import { getServerSession } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { hasDevBadge } from '@/lib/auth/devAccess';
import { AMASubmitForm } from '@/components/ama/AMASubmitForm';
import { PageHeader, PageContainer } from '@/components/layout';
import { redirect } from 'next/navigation';

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
      <div className="min-h-screen bg-gray-50 pb-20">
        <PageHeader title="Submit AMA" backUrl="/ama" />
        <PageContainer className="py-12">
          <div className="max-w-2xl mx-auto bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Developer Verification Required</h2>
            <p className="text-gray-600 mb-6">
              Only verified developers can host AMA sessions. Please complete developer KYC verification to continue.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Why verification?</strong> This helps protect our community and ensures AMAs are hosted by legitimate project developers.
              </p>
            </div>

            <div className="flex gap-3 justify-center">
              <a
                href="/profile/kyc/submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Complete KYC Verification
              </a>
              <a
                href="/ama"
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Back to AMAs
              </a>
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

  // Get user's projects
  const { data: projects } = await supabase
    .from('projects')
    .select('id, name')
    .eq('creator_id', session.userId)
    .order('created_at', { ascending: false });

  if (!projects || projects.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <PageHeader title="Submit AMA" backUrl="/ama" />
        <PageContainer className="py-12">
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Projects Found</h2>
            <p className="text-gray-600 mb-6">You need to create a project before hosting an AMA</p>
            <a
              href="/explore"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Explore Projects
            </a>
          </div>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <PageHeader title="Submit AMA" backUrl="/ama" />

      <PageContainer className="py-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Create AMA Session</h2>
            <p className="text-gray-600 mb-6">Host a live Q&A session with your community</p>

            <AMASubmitForm userProjects={projects} />
          </div>

          {/* Info Card */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-semibold text-blue-900 mb-2">📌 Important Notes</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• AMAs require admin approval before going live</li>
              <li>• Schedule at least 24 hours in advance</li>
              <li>• TEXT AMAs are free, VOICE/VIDEO may require payment</li>
              <li>• You can edit or cancel before approval</li>
            </ul>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
