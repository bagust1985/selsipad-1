// Data layer for Projects - REAL API INTEGRATION
// Replaces stub data with Supabase queries

import { createClient } from '@/lib/supabase/client';

export interface Project {
  id: string;
  name: string;
  symbol: string;
  logo: string; // Maps to logo_url in DB
  description: string;
  type: 'presale' | 'fairlaunch';
  network: 'SOL' | 'EVM';
  status: 'live' | 'upcoming' | 'ended';
  raised: number;
  target: number;
  kyc_verified: boolean;
  audit_status: 'pass' | 'pending' | null;
  lp_lock: boolean;
}

/**
 * Get Trending Projects
 *
 * Fetches top trending projects from the latest snapshot
 * Uses the trending_projects table populated by the worker
 */
export async function getTrendingProjects(): Promise<Project[]> {
  const supabase = createClient();

  try {
    // Get the latest snapshot
    const { data: latestSnapshot } = await supabase
      .from('trending_snapshots')
      .select('id')
      .order('computed_at', { ascending: false })
      .limit(1)
      .single();

    if (!latestSnapshot) {
      console.warn('No trending snapshots found');
      return [];
    }

    // Get trending projects for this snapshot
    const { data, error } = await supabase
      .from('trending_projects')
      .select(
        `
        project_id,
        rank,
        score,
        projects (
          id,
          name,
          symbol,
          description,
          logo_url,
          status,
          kyc_submission_id,
          scan_result_id,
          metadata
        )
      `
      )
      .eq('snapshot_id', latestSnapshot.id)
      .eq('category', 'ALL')
      .eq('chain_scope', 'ALL')
      .order('rank', { ascending: true })
      .limit(5);

    if (error) {
      console.error('Error fetching trending projects:', error);
      return [];
    }

    // Map database format to frontend format
    return (data || []).map((item: any) => {
      const project = item.projects;
      const metadata = project.metadata || {};

      return {
        id: project.id,
        name: project.name,
        symbol: project.symbol || 'TBD',
        logo: project.logo_url || '/placeholder-logo.png',
        description: project.description || '',
        type: metadata.type || 'presale',
        network: metadata.chain || 'SOL',
        status: mapProjectStatus(project.status),
        raised: metadata.raised || 0,
        target: metadata.target || 1000,
        kyc_verified: !!project.kyc_submission_id,
        audit_status: project.scan_result_id ? 'pass' : null,
        lp_lock: metadata.lp_lock || false,
      };
    });
  } catch (err) {
    console.error('Unexpected error in getTrendingProjects:', err);
    return [];
  }
}

/**
 * Get Featured Projects
 *
 * Fetches projects marked as featured in metadata
 * Fallback: Projects with highest raise ratio (raised/target)
 */
export async function getFeaturedProjects(): Promise<Project[]> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('status', 'LIVE')
      .contains('metadata', { featured: true })
      .limit(5);

    if (error) {
      console.error('Error fetching featured projects:', error);
      return [];
    }

    if (!data || data.length === 0) {
      // Fallback: Get high-performance projects
      const { data: fallbackData } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'LIVE')
        .order('created_at', { ascending: false })
        .limit(5);

      return mapProjectsToFrontend(fallbackData || []);
    }

    return mapProjectsToFrontend(data);
  } catch (err) {
    console.error('Unexpected error in getFeaturedProjects:', err);
    return [];
  }
}

/**
 * Get Project By ID
 *
 * Fetches a single project with full details
 */
export async function getProjectById(id: string): Promise<Project | null> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase.from('projects').select('*').eq('id', id).single();

    if (error) {
      console.error('Error fetching project:', error);
      return null;
    }

    if (!data) return null;

    const mapped = mapProjectsToFrontend([data]);
    return mapped[0] || null;
  } catch (err) {
    console.error('Unexpected error in getProjectById:', err);
    return null;
  }
}

/**
 * Search/Filter Projects
 *
 * Supports filtering by status, network, type, and search query
 */
export async function getAllProjects(filters?: {
  status?: Project['status'];
  network?: Project['network'];
  type?: Project['type'];
  search?: string;
}): Promise<Project[]> {
  const supabase = createClient();

  try {
    let query = supabase.from('projects').select('*');

    // Map frontend status to DB status
    if (filters?.status) {
      const dbStatus = mapFrontendStatusToDb(filters.status);
      query = query.eq('status', dbStatus);
    }

    // Note: network and type are in metadata, would need JSONB query
    // For now, fetch all and filter client-side
    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      return [];
    }

    let projects = mapProjectsToFrontend(data || []);

    // Client-side filtering
    if (filters?.network) {
      projects = projects.filter((p) => p.network === filters.network);
    }
    if (filters?.type) {
      projects = projects.filter((p) => p.type === filters.type);
    }
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      projects = projects.filter(
        (p) => p.name.toLowerCase().includes(search) || p.symbol.toLowerCase().includes(search)
      );
    }

    return projects;
  } catch (err) {
    console.error('Unexpected error in getAllProjects:', err);
    return [];
  }
}

// Helper functions

function mapProjectsToFrontend(dbProjects: any[]): Project[] {
  return dbProjects.map((project) => {
    const metadata = project.metadata || {};

    return {
      id: project.id,
      name: project.name,
      symbol: project.symbol || 'TBD',
      logo: project.logo_url || '/placeholder-logo.png',
      description: project.description || '',
      type: metadata.type || 'presale',
      network: metadata.chain || 'SOL',
      status: mapProjectStatus(project.status),
      raised: metadata.raised || 0,
      target: metadata.target || 1000,
      kyc_verified: !!project.kyc_submission_id,
      audit_status: project.scan_result_id ? 'pass' : null,
      lp_lock: metadata.lp_lock || false,
    };
  });
}

function mapProjectStatus(dbStatus: string): 'live' | 'upcoming' | 'ended' {
  switch (dbStatus) {
    case 'LIVE':
      return 'live';
    case 'APPROVED':
    case 'DRAFT':
    case 'SUBMITTED':
    case 'IN_REVIEW':
      return 'upcoming';
    case 'ENDED':
    case 'REJECTED':
      return 'ended';
    default:
      return 'upcoming';
  }
}

function mapFrontendStatusToDb(frontendStatus: 'live' | 'upcoming' | 'ended'): string {
  switch (frontendStatus) {
    case 'live':
      return 'LIVE';
    case 'upcoming':
      return 'APPROVED';
    case 'ended':
      return 'ENDED';
  }
}
