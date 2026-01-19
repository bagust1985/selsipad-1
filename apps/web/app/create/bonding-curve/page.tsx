import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { CreateBondingCurveWizard } from './CreateBondingCurveWizard';

export const metadata = {
  title: 'Create Bonding Curve | SELSIPAD',
  description: 'Launch your token with permissionless bonding curve on Solana',
};

export default async function CreateBondingCurvePage() {
  // Check authentication using custom session management (Pattern 68: Wallet-Only Auth)
  const session = await getSession();

  if (!session) {
    redirect('/');
  }

  const walletAddress = session.address;

  return (
    <div className="min-h-screen bg-gray-950 py-8">
      <div className="container mx-auto px-4">
        <CreateBondingCurveWizard walletAddress={walletAddress} />
      </div>
    </div>
  );
}
