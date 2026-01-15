import { Card, CardContent, EmptyState, EmptyIcon } from '@/components/ui';
import { PageHeader, PageContainer } from '@/components/layout';

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-bg-page pb-20">
      <PageHeader showBack title="Security & Sessions" />

      <PageContainer className="py-4 space-y-4">
        <Card>
          <CardContent>
            <EmptyState
              icon={<EmptyIcon />}
              title="Security Settings"
              description="Security & session management features will be implemented in future sprints."
            />
          </CardContent>
        </Card>

        {/* Placeholder for future features */}
        <Card>
          <CardContent className="space-y-3">
            <h3 className="text-heading-md text-text-secondary">Coming Soon</h3>
            <ul className="space-y-2 text-body-sm text-text-tertiary">
              <li>• Active sessions management</li>
              <li>• Login history</li>
              <li>• Two-factor authentication (2FA)</li>
              <li>• Password management</li>
              <li>• Email notifications settings</li>
            </ul>
          </CardContent>
        </Card>
      </PageContainer>
    </div>
  );
}
