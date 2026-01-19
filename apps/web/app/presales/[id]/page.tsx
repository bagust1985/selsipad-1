import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { PresaleDetailClient } from './PresaleDetailClient';

export default async function PresaleDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  // Fetch round details
  const { data: round, error } = await supabase
    .from('launch_rounds')
    .select(
      `
      *,
      projects (
        id,
        name,
        symbol,
        logo_url,
        description,
        kyc_status,
        sc_scan_status,
        owner_user_id
      )
    `
    )
    .eq('id', params.id)
    .single();

  if (error || !round) {
    notFound();
  }

  // Check if user has access (public rounds or owner)
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwner = user && round.projects.owner_user_id === user.id;
  const isPublic = ['APPROVED', 'LIVE', 'ENDED', 'FINALIZED'].includes(round.status);

  if (!isOwner && !isPublic) {
    notFound();
  }

  // Fetch user's contribution if logged in
  let userContribution = null;
  if (user) {
    const { data: contrib } = await supabase
      .from('contributions')
      .select('*')
      .eq('round_id', params.id)
      .eq('user_id', user.id)
      .in('status', ['PENDING', 'CONFIRMED'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    userContribution = contrib;
  }

  return (
    <PresaleDetailClient round={round} userContribution={userContribution} isOwner={isOwner} />
  );
}
