/**
 * Admin Dashboard: Blue Check Management
 *
 * Central hub for managing Blue Check users
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent } from '@/components/ui';
import { PageHeader, PageContainer } from '@/components/layout';
import { BlueCheckManagementClient } from './BlueCheckManagementClient';

export default async function AdminBlueCheckPage() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('user_id', user.id)
    .single();

  if (!profile?.is_admin) {
    redirect('/');
  }

  // Fetch statistics
  const { count: totalActive } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('bluecheck_status', 'ACTIVE');

  const { count: totalPurchases } = await supabase
    .from('bluecheck_audit_log')
    .select('*', { count: 'exact', head: true })
    .eq('action_type', 'PURCHASE');

  const { count: totalManualGrants } = await supabase
    .from('bluecheck_audit_log')
    .select('*', { count: 'exact', head: true })
    .eq('action_type', 'MANUAL_GRANT');

  const { count: totalRevoked } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('bluecheck_status', 'REVOKED');

  const { count: totalBanned } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('bluecheck_status', 'BANNED');

  // Fetch recent purchases
  const { data: recentPurchases } = await supabase
    .from('bluecheck_audit_log')
    .select(
      `
      *,
      target_user:profiles!bluecheck_audit_log_target_user_id_fkey(user_id, username, avatar_url)
    `
    )
    .eq('action_type', 'PURCHASE')
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div className="min-h-screen bg-bg-page pb-20">
      <PageHeader title="Blue Check Management" showBack />

      <PageContainer className="py-6 space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="py-4">
              <p className="text-caption text-text-secondary">Active</p>
              <p className="text-heading-lg font-bold text-success-main">{totalActive || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-4">
              <p className="text-caption text-text-secondary">Purchases</p>
              <p className="text-heading-lg font-bold text-primary-main">{totalPurchases || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-4">
              <p className="text-caption text-text-secondary">Manual Grants</p>
              <p className="text-heading-lg font-bold">{totalManualGrants || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-4">
              <p className="text-caption text-text-secondary">Revoked</p>
              <p className="text-heading-lg font-bold text-warning-main">{totalRevoked || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-4">
              <p className="text-caption text-text-secondary">Banned</p>
              <p className="text-heading-lg font-bold text-error-main">{totalBanned || 0}</p>
            </CardContent>
          </Card>
        </div>

        {/* Management UI */}
        <BlueCheckManagementClient recentPurchases={recentPurchases || []} />
      </PageContainer>
    </div>
  );
}
