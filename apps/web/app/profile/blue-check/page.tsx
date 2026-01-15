import { Card, CardContent, StatusBadge, Banner } from '@/components/ui';
import { PageHeader, PageContainer } from '@/components/layout';
import { getUserProfile } from '@/lib/data/profile';
import { formatDistance } from 'date-fns';

export default async function BlueCheckStatusPage() {
  const profile = await getUserProfile();

  if (!profile) {
    return <div>Profile not found</div>;
  }

  const isActive = profile.bluecheck_status === 'active';
  const isPending = profile.bluecheck_status === 'pending';
  const isRejected = profile.bluecheck_status === 'rejected';

  return (
    <div className="min-h-screen bg-bg-page pb-20">
      <PageHeader showBack title="Blue Check Status" />

      <PageContainer className="py-4 space-y-6">
        {/* Status Header Card */}
        <Card
          variant="bordered"
          className={`border-l-4 ${
            isActive
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
                  {isActive ? '✓' : isPending ? '⏳' : isRejected ? '✗' : '○'}
                </div>
                <div>
                  <h2 className="text-heading-lg">Blue Check</h2>
                  <p className="text-caption text-text-secondary">Enhanced trust badge</p>
                </div>
              </div>
              <StatusBadge
                status={
                  profile.bluecheck_status === 'none'
                    ? 'inactive'
                    : profile.bluecheck_status === 'active'
                      ? 'verified'
                      : (profile.bluecheck_status as any)
                }
              />
            </div>

            {isActive && profile.bluecheck_expires_at && (
              <p className="text-body-sm text-text-secondary">
                Expires{' '}
                {formatDistance(new Date(profile.bluecheck_expires_at), new Date(), {
                  addSuffix: true,
                })}
              </p>
            )}
          </CardContent>
        </Card>

        {/* State-specific content */}
        {isActive && (
          <>
            <Card>
              <CardContent className="space-y-3">
                <h3 className="text-heading-md">Benefits</h3>
                <ul className="space-y-2 text-body-sm text-text-secondary">
                  <li className="flex items-start gap-2">
                    <span className="text-status-success-text">✓</span>
                    <span>Enhanced trust across the platform</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-status-success-text">✓</span>
                    <span>Priority access to exclusive presales</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-status-success-text">✓</span>
                    <span>Reduced trading fees (5% discount)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-status-success-text">✓</span>
                    <span>Blue check badge on your profile</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-2">
                <h3 className="text-heading-md">Renewal</h3>
                <p className="text-body-sm text-text-secondary">
                  Your Blue Check will expire on{' '}
                  {profile.bluecheck_expires_at &&
                    new Date(profile.bluecheck_expires_at).toLocaleDateString()}
                  . You'll receive a notification 30 days before expiry.
                </p>
                <button className="mt-2 px-4 py-2 bg-primary-main text-primary-text rounded-md text-body-sm font-medium hover:bg-primary-hover transition-colors">
                  Renew Now
                </button>
              </CardContent>
            </Card>
          </>
        )}

        {isPending && (
          <Banner
            type="info"
            message="Review in Progress"
            submessage="Your Blue Check application is being reviewed. This usually takes 24-48 hours."
          />
        )}

        {isRejected && (
          <>
            <Banner
              type="error"
              message="Application Rejected"
              submessage="Your Blue Check application was not approved. See details below."
            />

            <Card>
              <CardContent className="space-y-2">
                <h3 className="text-heading-md">Rejection Reason</h3>
                <p className="text-body-sm text-text-secondary">
                  Insufficient trading history. You need at least 3 successful contributions and 30
                  days of account age.
                </p>
                <button className="mt-2 px-4 py-2 bg-primary-main text-primary-text rounded-md text-body-sm font-medium hover:bg-primary-hover transition-colors">
                  Reapply
                </button>
              </CardContent>
            </Card>
          </>
        )}

        {profile.bluecheck_status === 'none' && (
          <>
            <Card>
              <CardContent className="space-y-3">
                <h3 className="text-heading-md">What is Blue Check?</h3>
                <p className="text-body-sm text-text-secondary leading-relaxed">
                  Blue Check is a premium verification badge that shows you're a trusted member of
                  the SELSIPAD community. It provides exclusive benefits and enhanced credibility.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-3">
                <h3 className="text-heading-md">Requirements</h3>
                <ul className="space-y-2 text-body-sm text-text-secondary">
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Account age: Minimum 30 days</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Trading history: At least 3 successful contributions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Payment: 0.5 SOL (one-time fee for 1 year)</span>
                  </li>
                </ul>

                <button className="w-full mt-4 px-4 py-2 bg-primary-main text-primary-text rounded-md text-body-sm font-medium hover:bg-primary-hover transition-colors">
                  Apply for Blue Check
                </button>
              </CardContent>
            </Card>
          </>
        )}
      </PageContainer>
    </div>
  );
}
