'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  Tabs,
  StatusBadge,
  Banner,
  ProgressBar,
  EmptyState,
  EmptyIcon,
  SkeletonCard,
} from '@/components/ui';
import { PageHeader, PageContainer } from '@/components/layout';
import type { Transaction, Allocation } from '@/lib/data/transactions';
import { formatDistance } from 'date-fns';

interface PortfolioClientContentProps {
  initialPendingTx: Transaction[];
  initialClaimableAllocations: Allocation[];
  initialActiveAllocations: Allocation[];
  initialAllTransactions: Transaction[];
}

export function PortfolioClientContent({
  initialPendingTx,
  initialClaimableAllocations,
  initialActiveAllocations,
  initialAllTransactions,
}: PortfolioClientContentProps) {
  const [pendingTx] = useState<Transaction[]>(initialPendingTx);
  const [claimableAllocations] = useState<Allocation[]>(initialClaimableAllocations);
  const [activeAllocations] = useState<Allocation[]>(initialActiveAllocations);
  const [allTransactions] = useState<Transaction[]>(initialAllTransactions);

  const hasPendingTx = pendingTx.length > 0;

  return (
    <div className="min-h-screen bg-bg-page pb-20">
      <PageHeader title="Portfolio" />

      <PageContainer className="py-4 space-y-4">
        {/* Pending Transaction Banner */}
        {hasPendingTx && (
          <Banner
            type="warning"
            message={`${pendingTx.length} transaksi menunggu konfirmasi`}
            submessage="Refresh halaman untuk update status"
            action={{
              label: 'Refresh',
              onClick: () => window.location.reload(),
            }}
          />
        )}

        {/* Tabs */}
        <Tabs
          tabs={[
            {
              id: 'claimable',
              label: 'Claimable',
              content: (
                <div className="space-y-4">
                  {claimableAllocations.length === 0 ? (
                    <Card>
                      <CardContent>
                        <EmptyState
                          icon={<EmptyIcon />}
                          title="Tidak ada token untuk di-claim"
                          description="Partisipasi di project untuk mendapatkan alokasi"
                          action={{
                            label: 'Jelajahi Projects',
                            onClick: () => (window.location.href = '/explore'),
                          }}
                        />
                      </CardContent>
                    </Card>
                  ) : (
                    claimableAllocations.map((alloc) => {
                      const claimableAmount = alloc.vesting_total - alloc.vesting_claimed;
                      const claimablePercentage = (claimableAmount / alloc.vesting_total) * 100;

                      return (
                        <Card key={alloc.id} hover>
                          <CardContent className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="text-heading-md">{alloc.project_name}</h3>
                                <p className="text-caption text-text-secondary">
                                  {alloc.project_symbol}
                                </p>
                              </div>
                              <StatusBadge status="active" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-caption text-text-secondary">Claimable</p>
                                <p className="text-heading-sm">
                                  {claimableAmount.toLocaleString()} {alloc.project_symbol}
                                </p>
                              </div>
                              <div>
                                <p className="text-caption text-text-secondary">Total Allocated</p>
                                <p className="text-heading-sm">
                                  {alloc.tokens_allocated.toLocaleString()}
                                </p>
                              </div>
                            </div>

                            <ProgressBar
                              value={alloc.vesting_claimed}
                              max={alloc.vesting_total}
                              label="Vesting Progress"
                              showPercentage
                              size="sm"
                              variant="success"
                            />

                            {claimablePercentage > 0 && (
                              <button className="w-full bg-primary-main text-primary-text py-2 rounded-md text-body-sm font-medium hover:bg-primary-hover transition-colors">
                                Claim {claimableAmount.toLocaleString()} {alloc.project_symbol}
                              </button>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              ),
            },
            {
              id: 'active',
              label: 'Active',
              content: (
                <div className="space-y-4">
                  {activeAllocations.length === 0 ? (
                    <Card>
                      <CardContent>
                        <EmptyState
                          icon={<EmptyIcon />}
                          title="Tidak ada alokasi aktif"
                          description="Partisipasi di project untuk mendapatkan token"
                        />
                      </CardContent>
                    </Card>
                  ) : (
                    activeAllocations.map((alloc) => (
                      <Card key={alloc.id} hover>
                        <CardContent className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-heading-md">{alloc.project_name}</h3>
                              <p className="text-caption text-text-secondary">
                                {alloc.project_symbol}
                              </p>
                            </div>
                            <StatusBadge status="active" />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-caption text-text-secondary">Contributed</p>
                              <p className="text-body-sm font-semibold">
                                {alloc.amount_contributed} SOL
                              </p>
                            </div>
                            <div>
                              <p className="text-caption text-text-secondary">Allocated</p>
                              <p className="text-body-sm font-semibold">
                                {alloc.tokens_allocated.toLocaleString()}
                              </p>
                            </div>
                          </div>

                          <ProgressBar
                            value={alloc.vesting_claimed}
                            max={alloc.vesting_total}
                            showPercentage
                            size="sm"
                          />
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              ),
            },
            {
              id: 'history',
              label: 'History',
              content: (
                <div className="space-y-4">
                  {allTransactions.length === 0 ? (
                    <Card>
                      <CardContent>
                        <EmptyState
                          icon={<EmptyIcon />}
                          title="Belum ada transaksi"
                          description="Riwayat transaksi akan muncul di sini"
                        />
                      </CardContent>
                    </Card>
                  ) : (
                    allTransactions.map((tx) => (
                      <Card key={tx.id}>
                        <CardContent>
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-heading-sm">{tx.project_name}</h3>
                              <p className="text-caption text-text-secondary capitalize">
                                {tx.type}
                              </p>
                            </div>
                            <StatusBadge status={tx.status} />
                          </div>

                          <div className="flex items-center justify-between text-body-sm">
                            <span className="font-semibold">
                              {tx.amount} {tx.currency}
                            </span>
                            <span className="text-caption text-text-secondary">
                              {formatDistance(new Date(tx.created_at), new Date(), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>

                          {tx.tx_hash && (
                            <p className="text-caption text-text-tertiary mt-2">Tx: {tx.tx_hash}</p>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              ),
            },
          ]}
          defaultTab="claimable"
        />
      </PageContainer>
    </div>
  );
}
