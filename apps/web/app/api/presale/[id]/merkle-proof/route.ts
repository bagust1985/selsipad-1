/**
 * API: Get Merkle Proof
 * GET /api/presale/[id]/merkle-proof?wallet=0x...
 *
 * PUBLIC - Returns merkle proof for a specific wallet
 *
 * SECURITY: Never accept client-supplied allocation.
 * Always fetch from DB.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
    }

    const supabase = createClient();

    // Lookup proof from DB
    const { data, error } = await supabase
      .from('presale_merkle_proofs')
      .select('allocation, proof')
      .eq('round_id', params.id)
      .eq('wallet_address', wallet.toLowerCase())
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'No allocation found for this wallet' }, { status: 404 });
    }

    // Return allocation + proof
    // Client CANNOT override these values
    return NextResponse.json({
      totalAllocation: data.allocation, // Stored as TEXT to avoid precision loss
      proof: data.proof, // JSONB array of hex strings
      message: 'Proof retrieved from server. Do not modify allocation value.',
    });
  } catch (error: any) {
    console.error('Merkle proof error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
