import { Card, CardContent, StatusBadge, Banner } from '@/components/ui';
import { PageHeader, PageContainer } from '@/components/layout';
import { getUserProfile } from '@/lib/data/profile';
import { formatDistance } from 'date-fns';

export default async function KYCStatusPage() {
  const profile = await getUserProfile();

  if (!profile) {
    return <div>Profile not found</div>;
  }

  const isVerified = profile.kyc_status === 'verified';
  const isPending = profile.kyc_status === 'pending';
  const isRejected = profile.kyc_status === 'rejected';
  const notStarted = profile.kyc_status === 'not_started';

  return (
    <div className="min-h-screen bg-bg-page pb-20">
      <PageHeader showBack title="KYC Verification" />

      <PageContainer className="py-4 space-y-6">
        {/* Status Header Card */}
        <Card
          variant="bordered"
          className={`border-l-4 ${
            isVerified
              ? 'border-status-success-text'
              : isPending
                ? 'border-status-warning-text'
                : isRejected
                  ? 'border-status-error-text'
                  : 'border-border-subtle'
          }`}
        >
          <CardContent className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-bg-elevated rounded-full flex items-center justify-center text-2xl">
                  {isVerified ? '✓' : isPending ? '⏳' : isRejected ? '✗' : '📋'}
                </div>
                <div>
                  <h2 className="text-heading-lg">KYC Verification</h2>
                  <p className="text-caption text-text-secondary">Identity verification</p>
                </div>
              </div>
              <StatusBadge
                status={
                  isVerified
                    ? 'verified'
                    : isPending
                      ? 'pending'
                      : isRejected
                        ? 'rejected'
                        : 'inactive'
                }
              />
            </div>

            {isVerified && profile.kyc_submitted_at && (
              <p className="text-body-sm text-text-secondary">
                Verified{' '}
                {formatDistance(new Date(profile.kyc_submitted_at), new Date(), {
                  addSuffix: true,
                })}
              </p>
            )}
          </CardContent>
        </Card>

        {/* State-specific content */}
        {isVerified && (
          <Card>
            <CardContent className="space-y-3">
              <h3 className="text-heading-md">Verification Complete</h3>
              <p className="text-body-sm text-text-secondary">
                Your identity has been verified. You now have access to all features requiring KYC.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border-subtle">
                <div>
                  <p className="text-caption text-text-secondary">Status</p>
                  <p className="text-body-sm font-semibold text-status-success-text">Verified</p>
                </div>
                <div>
                  <p className="text-caption text-text-secondary">Verified On</p>
                  <p className="text-body-sm font-semibold">
                    {profile.kyc_submitted_at &&
                      new Date(profile.kyc_submitted_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isPending && (
          <>
            <Banner
              type="warning"
              message="Verification in Progress"
              submessage="Your KYC documents are being reviewed. This usually takes 2-5 business days."
            />

            <Card>
              <CardContent className="space-y-2">
                <h3 className="text-heading-md">What's Next?</h3>
                <p className="text-body-sm text-text-secondary">
                  Our team is reviewing your submitted documents. You'll receive an email
                  notification once the review is complete.
                </p>
                <ul className="mt-3 space-y-1 text-body-sm text-text-tertiary">
                  <li>• Estimated time: 2-5 business days</li>
                  <li>• Check your email for updates</li>
                  <li>• No action required from you</li>
                </ul>
              </CardContent>
            </Card>
          </>
        )}

        {isRejected && (
          <>
            <Banner
              type="error"
              message="Verification Rejected"
              submessage="Your KYC submission was rejected. Please review the reason and resubmit."
            />

            <Card>
              <CardContent className="space-y-3">
                <h3 className="text-heading-md">Rejection Reason</h3>
                <p className="text-body-sm text-text-secondary">
                  Document quality too low. Please ensure your ID photo is clear, well-lit, and all
                  text is readable.
                </p>

                <div className="mt-4 p-3 bg-status-info-bg/50 border border-status-info-text/30 rounded-md">
                  <p className="text-caption text-text-secondary">
                    💡 <strong>Tips for resubmission:</strong> Use good lighting, avoid glare,
                    ensure all corners of the document are visible.
                  </p>
                </div>

                <a
                  href="/profile/kyc/submit"
                  className="block w-full mt-4 px-4 py-2 bg-primary-main text-primary-text rounded-md text-body-sm font-medium hover:bg-primary-hover transition-colors text-center"
                >
                  Resubmit Documents
                </a>
              </CardContent>
            </Card>
          </>
        )}

        {notStarted && (
          <>
            <Card>
              <CardContent className="space-y-3">
                <h3 className="text-heading-md">Why Verify Your Identity?</h3>
                <p className="text-body-sm text-text-secondary leading-relaxed">
                  KYC verification is required for certain features and helps protect the community
                  from fraud. Your information is encrypted and secure.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-3">
                <h3 className="text-heading-md">What You'll Need</h3>
                <ul className="space-y-2 text-body-sm text-text-secondary">
                  <li className="flex items-start gap-2">
                    <span>📄</span>
                    <span>Government-issued ID (Passport, National ID, or Driver's License)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>📸</span>
                    <span>Clear photo of your ID (both sides if applicable)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>🤳</span>
                    <span>Selfie holding your ID next to your face</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>⏱️</span>
                    <span>5-10 minutes to complete the process</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card variant="bordered" className="border-l-4 border-status-success-text">
              <CardContent>
                <p className="text-body-sm text-text-secondary mb-4">
                  🔒 Your data is encrypted and securely stored. We never share your information
                  with third parties.
                </p>
                <a
                  href="/profile/kyc/submit"
                  className="block w-full px-4 py-2 bg-primary-main text-primary-text rounded-md text-body-sm font-medium hover:bg-primary-hover transition-colors text-center"
                >
                  Start KYC Verification
                </a>
              </CardContent>
            </Card>
          </>
        )}
      </PageContainer>
    </div>
  );
}
