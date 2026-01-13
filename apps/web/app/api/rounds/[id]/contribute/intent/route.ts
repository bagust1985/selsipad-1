import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  validateContributionIntent,
  PoolValidationError,
  isPoolLive,
  type LaunchRound,
} from '@selsipad/shared';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/rounds/[id]/contribute/intent
 * Create contribution intent (pre-transaction)
 */
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get authenticated user
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate request body
    const body = await request.json();
    let intentData;
    try {
      intentData = validateContributionIntent({
        ...body,
        round_id: params.id,
      });
    } catch (err) {
      if (err instanceof PoolValidationError) {
        return NextResponse.json({ error: err.message, field: err.field }, { status: 400 });
      }
      throw err;
    }

    // Get round
    const { data: round, error: roundError } = await supabase
      .from('launch_rounds')
      .select('*')
      .eq('id', params.id)
      .single();

    if (roundError || !round) {
      return NextResponse.json({ error: 'Round not found' }, { status: 404 });
    }

    // Check if round is live
    if (!isPoolLive(round as LaunchRound)) {
      return NextResponse.json({ error: 'Round is not currently live' }, { status: 400 });
    }

    // Generate intent ID (simple random ID for MVP)
    const intentId = `intent_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Calculate expiry (10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // Return intent response
    // Note: In production, this would include contract address or deposit address
    // For MVP, we return a placeholder
    return NextResponse.json({
      intent_id: intentId,
      round_id: params.id,
      amount: intentData.amount,
      expires_at: expiresAt,
      // TODO: Add actual contract/deposit address based on chain
      contract_address: round.chain.startsWith('0x') ? '0x...' : undefined,
      deposit_address: round.chain === 'SOLANA' ? 'SOL...' : undefined,
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
