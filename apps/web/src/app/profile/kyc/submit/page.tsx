import { getServerSession } from '@/lib/auth/session';
import { getUserProjects } from '../actions';
import { KYCSubmitForm } from '@/components/kyc/KYCSubmitForm';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function KYCSubmitPage() {
  const session = await getServerSession();

  if (!session) {
    redirect('/');
  }

  // Check if user already submitted KYC
  const { getUserProfile } = await import('@/lib/data/profile');
  const profile = await getUserProfile();

  // Prevent duplicate submissions - redirect if already pending or verified
  if (profile?.kyc_status === 'pending' || profile?.kyc_status === 'verified') {
    redirect('/profile/kyc');
  }

  const userProjects = await getUserProjects();

  return (
    <div className="min-h-screen bg-black text-white pb-20 font-sans selection:bg-cyan-500/30">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-3">
          <Link href="/profile/kyc" className="text-gray-400 hover:text-white transition-colors">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-lg font-bold">Submit KYC</h1>
            <p className="text-xs text-gray-500">Developer Identity Verification</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Main Form Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
              <span className="text-lg">🛡️</span>
            </div>
            <div>
              <h2 className="text-xl font-bold">Submit Developer KYC Documents</h2>
              <p className="text-sm text-gray-500">
                Verify your identity to create launchpad projects
              </p>
            </div>
          </div>

          <KYCSubmitForm userProjects={userProjects} />
        </div>

        {/* Info Card */}
        <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-lg">📌</span>
            <h3 className="font-bold text-cyan-400">What Happens Next?</h3>
          </div>
          <div className="space-y-3">
            {[
              'Your documents are reviewed by our team',
              'Review typically takes 2-5 business days',
              "You'll receive a notification upon completion",
              'All data is encrypted and secure',
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-xl border border-white/5"
              >
                <div className="w-6 h-6 rounded-full bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-cyan-400 text-[10px] font-bold">{i + 1}</span>
                </div>
                <span className="text-sm text-gray-400">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
