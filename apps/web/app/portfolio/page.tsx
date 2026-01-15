import { PageHeader, PageContainer } from '@/components/layout';
import {
  getUserTransactions,
  getClaimableAllocations,
  getUserAllocations,
} from '@/lib/data/transactions';
import { PortfolioClientContent } from './PortfolioClientContent';

export default async function PortfolioPage() {
  // Fetch data server-side
  const [pendingTx, claimableAllocations, activeAllocations, allTransactions] = await Promise.all([
    getUserTransactions('pending'),
    getClaimableAllocations(),
    getUserAllocations('active'),
    getUserTransactions(),
  ]);

  return (
    <PortfolioClientContent
      initialPendingTx={pendingTx}
      initialClaimableAllocations={claimableAllocations}
      initialActiveAllocations={activeAllocations}
      initialAllTransactions={allTransactions}
    />
  );
}
