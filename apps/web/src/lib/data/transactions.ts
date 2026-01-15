// Data layer for Transactions and Allocations - REAL API INTEGRATION
// Replaces stub data with Supabase queries

import { createClient } from '@/lib/supabase/client';

export interface Transaction {
  id: string;
  project_id: string;
  project_name: string;
  project_symbol: string;
  type: 'contribution' | 'claim' | 'refund';
  amount: number;
  currency: string;
  status: 'pending' | 'success' | 'failed' | 'finalizing';
  tx_hash?: string;
  created_at: string;
  updated_at: string;
}

export interface Allocation {
  id: string;
  project_id: string;
  project_name: string;
  project_symbol: string;
  amount_contributed: number;
  tokens_allocated: number;
  vesting_claimed: number;
  vesting_total: number;
  status: 'active' | 'completed' | 'cancelled';
}

/**
 * Get User Transactions
 *
 * Fetches transactions for authenticated user
 * Optionally filter by status (pending, success, failed, finalizing)
 */
export async function getUserTransactions(status?: Transaction['status']): Promise<Transaction[]> {
  const supabase = createClient();

  try {
    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      console.warn('User not authenticated');
      return [];
    }

    // Build query
    let query = supabase
      .from('transactions')
      .select(
        `
        id,
        type,
        status,
        tx_hash,
        metadata,
        created_at,
        updated_at,
        project_id,
        projects (
          id,
          name,
          symbol
        )
      `
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Filter by status if provided
    if (status) {
      const dbStatus = mapFrontendStatusToDb(status);
      query = query.eq('status', dbStatus);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }

    // Map database format to frontend format
    return (data || []).map((tx: any) => {
      const metadata = tx.metadata || {};
      const project = tx.projects || {};

      return {
        id: tx.id,
        project_id: tx.project_id || 'unknown',
        project_name: project.name || 'Unknown Project',
        project_symbol: project.symbol || 'N/A',
        type: mapTransactionType(tx.type),
        amount: metadata.amount || 0,
        currency: metadata.currency || 'SOL',
        status: mapDbStatusToFrontend(tx.status),
        tx_hash: tx.tx_hash,
        created_at: tx.created_at,
        updated_at: tx.updated_at,
      };
    });
  } catch (err) {
    console.error('Unexpected error in getUserTransactions:', err);
    return [];
  }
}

/**
 * Get User Allocations
 *
 * Fetches vesting allocations for authenticated user
 * Optionally filter by status (active, completed, cancelled)
 */
export async function getUserAllocations(status?: Allocation['status']): Promise<Allocation[]> {
  const supabase = createClient();

  try {
    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      console.warn('User not authenticated');
      return [];
    }

    // Fetch vesting allocations
    const { data, error } = await supabase
      .from('vesting_allocations')
      .select(
        `
        id,
        allocation_tokens,
        claimed_tokens,
        created_at,
        updated_at,
        round_id,
        vesting_schedules!schedule_id (
          id,
          total_tokens,
          tge_percentage,
          round_id,
          launch_rounds!round_id (
            id,
            project_id,
            projects (
              id,
              name,
              symbol
            )
          )
        )
      `
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching allocations:', error);
      return [];
    }

    // Map database format to frontend format
    const allocations = (data || []).map((alloc: any) => {
      const schedule = alloc.vesting_schedules || {};
      const round = schedule.launch_rounds || {};
      const project = round.projects || {};

      const allocationTokens = parseFloat(alloc.allocation_tokens || '0');
      const claimedTokens = parseFloat(alloc.claimed_tokens || '0');

      // Determine status based on claimed vs allocated
      let allocStatus: 'active' | 'completed' | 'cancelled' = 'active';
      if (claimedTokens >= allocationTokens && allocationTokens > 0) {
        allocStatus = 'completed';
      }

      return {
        id: alloc.id,
        project_id: project.id || 'unknown',
        project_name: project.name || 'Unknown Project',
        project_symbol: project.symbol || 'N/A',
        amount_contributed: 0, // TODO: Calculate from contribution records
        tokens_allocated: allocationTokens,
        vesting_claimed: claimedTokens,
        vesting_total: allocationTokens,
        status: allocStatus,
      };
    });

    // Filter by status if provided
    if (status) {
      return allocations.filter((alloc) => alloc.status === status);
    }

    return allocations;
  } catch (err) {
    console.error('Unexpected error in getUserAllocations:', err);
    return [];
  }
}

/**
 * Get Claimable Allocations
 *
 * Fetches active allocations that have tokens available to claim
 */
export async function getClaimableAllocations(): Promise<Allocation[]> {
  const allocations = await getUserAllocations('active');

  // Filter to only those with claimable tokens
  return allocations.filter((alloc) => {
    return alloc.vesting_claimed < alloc.vesting_total;
  });
}

// Helper functions

function mapTransactionType(dbType: string): 'contribution' | 'claim' | 'refund' {
  switch (dbType) {
    case 'CONTRIBUTE':
      return 'contribution';
    case 'CLAIM':
      return 'claim';
    case 'REFUND':
      return 'refund';
    default:
      return 'contribution';
  }
}

function mapDbStatusToFrontend(dbStatus: string): 'pending' | 'success' | 'failed' | 'finalizing' {
  switch (dbStatus) {
    case 'CREATED':
    case 'SUBMITTED':
      return 'pending';
    case 'PENDING':
      return 'finalizing';
    case 'CONFIRMED':
      return 'success';
    case 'FAILED':
      return 'failed';
    default:
      return 'pending';
  }
}

function mapFrontendStatusToDb(
  frontendStatus: 'pending' | 'success' | 'failed' | 'finalizing'
): string {
  switch (frontendStatus) {
    case 'pending':
      return 'SUBMITTED';
    case 'finalizing':
      return 'PENDING';
    case 'success':
      return 'CONFIRMED';
    case 'failed':
      return 'FAILED';
  }
}
