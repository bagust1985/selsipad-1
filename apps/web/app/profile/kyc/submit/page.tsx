import { getUserProjects } from '../actions';
import { KYCSubmitForm } from '@/components/kyc/KYCSubmitForm';
import { PageHeader, PageContainer } from '@/components/layout';
import { redirect } from 'next/navigation';

export default async function KYCSubmitPage() {
  const { getSession } = await import('@/lib/auth/session');
  const session = await getSession();

  if (!session) {
    redirect('/');
  }

  const userProjects = await getUserProjects();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <PageHeader title="KYC Verification" backUrl="/profile/kyc" />

      <PageContainer className="py-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Submit KYC Documents</h2>
            <p className="text-gray-600 mb-6">Verify your identity to access all features</p>

            <KYCSubmitForm userProjects={userProjects} />
          </div>

          {/* Info */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-semibold text-blue-900 mb-2">📌 What Happens Next?</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Your documents are reviewed by our team</li>
              <li>• Review typically takes 2-5 business days</li>
              <li>• You'll receive an email notification</li>
              <li>• All data is encrypted and secure</li>
            </ul>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
