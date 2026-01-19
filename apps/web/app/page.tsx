import Link from 'next/link';
import {
  Card,
  CardContent,
  StatusBadge,
  ProgressBar,
  EmptyState,
  EmptyIcon,
} from '@/components/ui';
import { PageContainer } from '@/components/layout';
import { getTrendingProjects, getFeaturedProjects } from '@/lib/data/projects';
import { MultiChainConnectWallet } from '@/components/wallet/MultiChainConnectWallet';

export default async function HomePage() {
  // Fetch data (server component)
  const [trending, featured] = await Promise.all([getTrendingProjects(), getFeaturedProjects()]);

  return (
    <div className="min-h-screen bg-bg-page pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-bg-page border-b border-border-subtle safe-top">
        <PageContainer>
          <div className="flex items-center justify-between h-14">
            <h1 className="text-heading-lg text-text-primary">SELSIPAD</h1>

            <div className="flex items-center gap-2">
              {/* Rewards Link */}
              <Link
                href="/rewards"
                className="p-2 text-text-secondary hover:text-primary-main transition-colors"
                aria-label="Rewards"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </Link>

              {/* Profile Link */}
              <Link
                href="/profile"
                className="p-2 text-text-secondary hover:text-primary-main transition-colors"
                aria-label="Profile"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </Link>

              {/* Connect Wallet Button - Multi-chain Support (Solana + EVM) */}
              <MultiChainConnectWallet />
            </div>
          </div>
        </PageContainer>
      </header>

      <PageContainer className="py-6 space-y-8">
        {/* Trending Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-heading-lg text-text-primary">🔥 Trending</h2>
            <Link href="/explore" className="text-body-sm text-primary-main hover:underline">
              Lihat Semua
            </Link>
          </div>

          {trending.length === 0 ? (
            <Card>
              <CardContent>
                <EmptyState
                  icon={<EmptyIcon />}
                  title="Belum ada project trending"
                  description="Jelajahi project yang tersedia"
                />
              </CardContent>
            </Card>
          ) : (
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
              {trending.map((project) => (
                <Link
                  key={project.id}
                  href={`/project/${project.id}`}
                  className="flex-shrink-0 w-40"
                >
                  <Card hover className="h-full">
                    <CardContent className="space-y-2">
                      <div className="w-12 h-12 bg-bg-elevated rounded-lg flex items-center justify-center text-2xl">
                        {project.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <h3 className="text-heading-sm truncate">{project.name}</h3>
                        <StatusBadge status={project.status} />
                      </div>
                      <div className="text-caption text-text-secondary">
                        {project.raised}/{project.target} {project.network}
                      </div>
                      <ProgressBar
                        value={project.raised}
                        max={project.target}
                        showPercentage={false}
                        size="sm"
                      />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Featured Section */}
        <section>
          <h2 className="text-heading-lg text-text-primary mb-4">Featured Projects</h2>

          <div className="space-y-4">
            {featured.map((project) => (
              <Link key={project.id} href={`/project/${project.id}`}>
                <Card hover>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-bg-elevated rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                        {project.symbol.slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-heading-md">{project.name}</h3>
                          <StatusBadge status={project.status} />
                        </div>
                        <p className="text-body-sm text-text-secondary line-clamp-2">
                          {project.description}
                        </p>
                      </div>
                    </div>

                    <ProgressBar
                      value={project.raised}
                      max={project.target}
                      label={`${project.raised}/${project.target} ${project.network} Raised`}
                      showPercentage
                    />

                    <div className="flex gap-2">
                      {project.kyc_verified && (
                        <span className="px-2 py-1 bg-status-success-bg/50 text-status-success-text text-caption rounded-full border border-status-success-text/30">
                          ✓ KYC
                        </span>
                      )}
                      {project.audit_status === 'pass' && (
                        <span className="px-2 py-1 bg-status-success-bg/50 text-status-success-text text-caption rounded-full border border-status-success-text/30">
                          ✓ Audit
                        </span>
                      )}
                      {project.lp_lock && (
                        <span className="px-2 py-1 bg-status-success-bg/50 text-status-success-text text-caption rounded-full border border-status-success-text/30">
                          🔒 LP Lock
                        </span>
                      )}
                      <span className="px-2 py-1 bg-bg-elevated text-text-secondary text-caption rounded-full">
                        {project.network}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Link href="/feed">
            <Card hover className="h-full">
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <svg
                  className="w-12 h-12 text-primary-main mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  />
                </svg>
                <h3 className="text-heading-sm">SelsiFeed</h3>
                <p className="text-caption text-text-secondary mt-1">Social updates</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/presales">
            <Card hover className="h-full">
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <svg
                  className="w-12 h-12 text-primary-main mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
                <h3 className="text-heading-sm">Presales</h3>
                <p className="text-caption text-text-secondary mt-1">Token presales</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/fairlaunch">
            <Card hover className="h-full">
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <svg
                  className="w-12 h-12 text-emerald-500 mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
                <h3 className="text-heading-sm">Fairlaunch</h3>
                <p className="text-caption text-text-secondary mt-1">No hardcap sales</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/bonding-curve">
            <Card hover className="h-full">
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <svg
                  className="w-12 h-12 text-cyan-500 mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
                <h3 className="text-heading-sm">Bonding Curve</h3>
                <p className="text-caption text-text-secondary mt-1">Permissionless SOL pools</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/ama">
            <Card hover className="h-full">
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <svg
                  className="w-12 h-12 text-primary-main mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <h3 className="text-heading-sm">Developer AMA</h3>
                <p className="text-caption text-text-secondary mt-1">Ask developers</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/create/presale">
            <Card hover className="h-full">
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <svg
                  className="w-12 h-12 text-primary-main mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
                <h3 className="text-heading-sm">Create Presale</h3>
                <p className="text-caption text-text-secondary mt-1">Launch your token</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/explore">
            <Card hover className="h-full">
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <svg
                  className="w-12 h-12 text-primary-main mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <h3 className="text-heading-sm">Jelajahi Projects</h3>
                <p className="text-caption text-text-secondary mt-1">Browse all projects</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/portfolio">
            <Card hover className="h-full">
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <svg
                  className="w-12 h-12 text-primary-main mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <h3 className="text-heading-sm">Portfolio</h3>
                <p className="text-caption text-text-secondary mt-1">Your investments</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/rewards">
            <Card hover className="h-full">
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <svg
                  className="w-12 h-12 text-primary-main mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="text-heading-sm">Rewards</h3>
                <p className="text-caption text-text-secondary mt-1">Earn tokens</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/portfolio">
            <Card hover className="h-full">
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <svg
                  className="w-12 h-12 text-green-500 mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="text-heading-sm">Vesting</h3>
                <p className="text-caption text-text-secondary mt-1">Claim tokens</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/explore?filter=locked">
            <Card hover className="h-full">
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <svg
                  className="w-12 h-12 text-blue-500 mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <h3 className="text-heading-sm">LP Lock</h3>
                <p className="text-caption text-text-secondary mt-1">Lock transparency</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/staking/sbt">
            <Card hover className="h-full">
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <svg
                  className="w-12 h-12 text-purple-500 mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                <h3 className="text-heading-sm">SBT Staking</h3>
                <p className="text-caption text-text-secondary mt-1">Proof of Human</p>
              </CardContent>
            </Card>
          </Link>
        </section>
      </PageContainer>
    </div>
  );
}
