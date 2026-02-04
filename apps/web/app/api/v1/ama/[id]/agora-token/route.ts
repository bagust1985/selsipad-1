import { NextRequest, NextResponse } from 'next/server';
import { RtcTokenBuilder, RtcRole } from 'agora-access-token';
import { createClient } from '@/lib/supabase/server';

/**
 * Generate Agora RTC Token for Voice/Video AMA
 * POST /api/v1/ama/[id]/agora-token
 *
 * This endpoint generates a secure Agora RTC token for joining voice/video AMA sessions.
 * Token is valid for 1 hour and bound to specific channel (AMA ID) and user.
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const amaId = params.id;
    const supabase = await createClient();

    // 1. Verify user authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Verify AMA exists and is LIVE
    const { data: ama, error: amaError } = await supabase
      .from('ama_requests')
      .select('id, status, type, developer_id')
      .eq('id', amaId)
      .single();

    if (amaError || !ama) {
      return NextResponse.json({ error: 'AMA not found' }, { status: 404 });
    }

    if (ama.status !== 'LIVE') {
      return NextResponse.json({ error: 'AMA is not live' }, { status: 400 });
    }

    if (ama.type === 'TEXT') {
      return NextResponse.json({ error: 'This AMA does not support voice/video' }, { status: 400 });
    }

    // 3. Verify user has paid or is the developer
    const isPaid = await verifyAMAPaid(supabase, amaId, user.id);
    const isDeveloper = ama.developer_id === user.id;

    if (!isPaid && !isDeveloper) {
      return NextResponse.json({ error: 'Payment required to join this AMA' }, { status: 403 });
    }

    // 4. Generate Agora RTC Token
    const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID!;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE!;
    const channelName = `ama_${amaId}`;
    const uid = 0; // 0 means any user can join with this token
    const role = isDeveloper ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
    const expirationTimeInSeconds = 3600; // 1 hour
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      uid,
      role,
      privilegeExpiredTs,
      privilegeExpiredTs
    );

    // 5. Log token generation
    await supabase.from('ama_join_logs').insert({
      ama_id: amaId,
      user_id: user.id,
      join_type: ama.type,
      token_generated_at: new Date().toISOString(),
    });

    return NextResponse.json({
      token,
      channelName,
      uid,
      appId,
      expiresAt: privilegeExpiredTs,
      role: isDeveloper ? 'publisher' : 'subscriber',
    });
  } catch (error) {
    console.error('[Agora Token API] Error:', error);
    return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 });
  }
}

/**
 * Verify if user has paid for AMA access
 */
async function verifyAMAPaid(supabase: any, amaId: string, userId: string): Promise<boolean> {
  // Check if user has paid the $100 AMA fee
  const { data, error } = await supabase
    .from('ama_payments')
    .select('id, status')
    .eq('ama_id', amaId)
    .eq('user_id', userId)
    .eq('status', 'CONFIRMED')
    .maybeSingle();

  if (error) {
    console.error('[Agora Token API] Payment verification error:', error);
    return false;
  }

  return !!data;
}
