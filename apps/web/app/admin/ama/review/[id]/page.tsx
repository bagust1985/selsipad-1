import { createClient } from '@supabase/supabase-js';
import { notFound, redirect } from 'next/navigation';
import { AMAReviewClient } from './AMAReviewClient';

async function getAMARequest(id: string) {
  // Use service role to bypass RLS
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Fetch without embedded relations (FK not set up)
  const { data: ama, error } = await supabase
    .from('ama_requests')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !ama) {
    console.error('Failed to fetch AMA request:', error);
    return null;
  }

  return ama;
}

export default async function AMAReviewPage({ params }: { params: { id: string } }) {
  const ama = await getAMARequest(params.id);

  if (!ama) {
    notFound();
  }

  return <AMAReviewClient ama={ama} />;
}
