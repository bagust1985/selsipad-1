import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { KYCReviewClient } from './KYCReviewClient';

async function getSubmission(id: string) {
  const supabase = createClient();

  const { data: submission, error } = await supabase
    .from('kyc_submissions')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !submission) {
    console.error('KYC submission not found:', error);
    return null;
  }

  // Fetch wallet for this user
  const { data: wallet } = await supabase
    .from('wallets')
    .select('address, chain')
    .eq('user_id', submission.user_id)
    .eq('is_primary', true)
    .single();

  // If no primary wallet, get any wallet
  if (!wallet) {
    const { data: anyWallet } = await supabase
      .from('wallets')
      .select('address, chain')
      .eq('user_id', submission.user_id)
      .limit(1)
      .single();

    return {
      ...submission,
      wallet_address: anyWallet?.address || 'N/A',
      chain: anyWallet?.chain || 'N/A',
    };
  }

  return {
    ...submission,
    wallet_address: wallet.address,
    chain: wallet.chain,
  };
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
