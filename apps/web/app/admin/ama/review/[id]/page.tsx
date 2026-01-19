import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { AMAReviewClient } from './AMAReviewClient';

async function getAMASession(id: string) {
  const supabase = createClient();

  const { data: ama, error } = await supabase
    .from('ama_sessions')
    .select(
      `
      *,
      profiles(wallet_address, username)
    `
    )
    .eq('id', id)
    .single();

  if (error || !ama) {
    return null;
  }

  return ama;
}

export default async function AMAReviewPage({ params }: { params: { id: string } }) {
  const ama = await getAMASession(params.id);

  if (!ama) {
    notFound();
  }

  // If already reviewed, redirect to management page
  if (ama.status !== 'SUBMITTED') {
    redirect('/admin/ama');
  }

  return <AMAReviewClient ama={ama} />;
}
