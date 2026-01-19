import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { KYCReviewClient } from './KYCReviewClient';

async function getSubmission(id: string) {
  const supabase = createClient();

  const { data: submission, error } = await supabase
    .from('kyc_submissions')
    .select(
      `
      *,
      profiles(wallet_address, username)
    `
    )
    .eq('id', id)
    .single();

  if (error || !submission) {
    return null;
  }

  return submission;
}

export default async function KYCReviewDetailPage({ params }: { params: { id: string } }) {
  const submission = await getSubmission(params.id);

  if (!submission) {
    notFound();
  }

  // If already reviewed, redirect back to list
  if (submission.status !== 'PENDING') {
    redirect('/admin/kyc');
  }

  return <KYCReviewClient submission={submission} />;
}
