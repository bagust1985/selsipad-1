'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  StatusBadge,
  ProgressBar,
  FilterPills,
  EmptyState,
  EmptyIcon,
  SkeletonCard,
} from '@/components/ui';
import { PageHeader, PageContainer, BottomSheet } from '@/components/layout';
import { getAllProjects, Project } from '@/lib/data/projects';
import type { FilterPill } from '@/components/ui';

export default function ExplorePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<FilterPill[]>([]);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  // Load initial data
  useState(() => {
    getAllProjects().then((data) => {
      setProjects(data);
      setLoading(false);
    });
  });

  const handleSearch = (value: string) => {
    setSearch(value);
    // TODO: Debounce and re-fetch
  };

  const removeFilter = (id: string) => {
    setFilters(filters.filter((f) => f.id !== id));
    // TODO: Re-fetch with updated filters
  };

  const clearFilters = () => {
    setFilters([]);
    // TODO: Re-fetch
  };

  return (
    <div className="min-h-screen bg-bg-page pb-20">
      <PageHeader
        title="Explore Projects"
        actions={
          <button
            onClick={() => setFilterSheetOpen(true)}
            className="p-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
          </button>
        }
      />

      <PageContainer className="py-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <input
            type="search"
            placeholder="Cari project..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full bg-bg-input border border-border-subtle rounded-md px-4 py-2 pl-10 text-text-primary placeholder:text-text-tertiary focus:border-primary-main focus:ring-2 focus:ring-primary-main/20 transition-all"
          />
          <svg
            className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
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
        </div>

        {/* Active Filters */}
        {filters.length > 0 && (
          <FilterPills filters={filters} onRemove={removeFilter} onClearAll={clearFilters} />
        )}

        {/* Results */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <Card>
            <CardContent>
              <EmptyState
                icon={<EmptyIcon />}
                title="Tidak ada project ditemukan"
                description="Coba ubah filter atau kata kunci pencarian"
              />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => (
              <Link key={project.id} href={`/project/${project.id}`}>
                <Card hover>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-bg-elevated rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                        {project.symbol.slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-heading-sm truncate">{project.name}</h3>
                          <StatusBadge status={project.status} />
                        </div>
                        <p className="text-caption text-text-secondary line-clamp-1">
                          {project.description}
                        </p>
                      </div>
                    </div>

                    <ProgressBar
                      value={project.raised}
                      max={project.target}
                      showPercentage
                      size="sm"
                    />

                    <div className="flex gap-2">
                      {project.kyc_verified && (
                        <span className="px-2 py-0.5 bg-status-success-bg/50 text-status-success-text text-caption rounded-full">
                          ✓ KYC
                        </span>
                      )}
                      <span className="px-2 py-0.5 bg-bg-elevated text-text-secondary text-caption rounded-full">
                        {project.network}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </PageContainer>

      {/* Filter Bottom Sheet */}
      <BottomSheet
        isOpen={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        title="Filter Projects"
      >
        <div className="space-y-6">
          {/* Status Filter */}
          <div>
            <h3 className="text-heading-sm mb-3">Status</h3>
            <div className="grid grid-cols-3 gap-2">
              {(['live', 'upcoming', 'ended'] as const).map((status) => (
                <button
                  key={status}
                  className="px-3 py-2 bg-bg-card border border-border-subtle rounded-md text-caption hover:border-primary-main transition-colors"
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Network Filter */}
          <div>
            <h3 className="text-heading-sm mb-3">Network</h3>
            <div className="grid grid-cols-2 gap-2">
              {(['SOL', 'EVM'] as const).map((network) => (
                <button
                  key={network}
                  className="px-3 py-2 bg-bg-card border border-border-subtle rounded-md text-caption hover:border-primary-main transition-colors"
                >
                  {network}
                </button>
              ))}
            </div>
          </div>

          <button className="w-full bg-primary-main text-primary-text py-3 rounded-md font-medium hover:bg-primary-hover transition-colors">
            Terapkan Filter
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}
