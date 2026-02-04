'use server';
import { getServerSession } from '@/lib/auth/session';
import { createClient } from '@supabase/supabase-js';

export type AMAStatus = 'PENDING' | 'PINNED' | 'LIVE' | 'ENDED' | 'REJECTED';

export interface AMARequest {
  id: string;
  project_id: string;
  developer_id: string;
  project_name: string;
  description: string;
  scheduled_at: string;
  payment_tx_hash: string;
  payment_amount_bnb: number;
  status: AMAStatus;
  is_pinned: boolean;
  created_at: string;
}

export interface SubmitAMAData {
  projectId: string;
  projectName: string;
  scheduledAt: string;
  description: string;
  paymentTxHash: string;
  paymentAmountBnb: string;
  requestIdBytes32: string;
  chainId: number;
}

/**
 * Submit AMA Request after on-chain payment
 */
export async function submitAMARequest(data: SubmitAMAData) {
  const session = await getServerSession();

  if (!session) {
    return { success: false, error: 'Authentication required' };
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Verify user is Dev Verified
  const { data: profile } = await supabase
    .from('profiles')
    .select('kyc_status')
    .eq('user_id', session.userId)
    .single();

  if (profile?.kyc_status !== 'APPROVED') {
    return { success: false, error: 'Developer verification required' };
  }

  // Create AMA request
  const { data: ama, error } = await supabase
    .from('ama_requests')
    .insert({
      developer_id: session.userId,
      project_id: data.projectId,
      project_name: data.projectName,
      scheduled_at: data.scheduledAt,
      description: data.description,
      payment_tx_hash: data.paymentTxHash,
      payment_amount_bnb: parseFloat(data.paymentAmountBnb),
      request_id_bytes32: data.requestIdBytes32,
      chain_id: data.chainId,
      status: 'PENDING',
    })
    .select()
    .single();

  if (error) {
    console.error('AMA submission error:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data: ama };
}

/**
 * Get Pinned AMAs (for homepage display)
 */
export async function getPinnedAMAs(): Promise<any[]> {
  // Use service role to bypass RLS
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: requests, error } = await supabase
    .from('ama_requests')
    .select('*')
    .in('status', ['PINNED', 'LIVE'])
    .order('scheduled_at', { ascending: true })
    .limit(20);

  if (error) {
    console.error('[AMA] Error fetching pinned AMAs:', error);
  }

  return requests || [];
}

/**
 * Get Live AMAs
 */
export async function getLiveAMAs(): Promise<any[]> {
  // Use service role to bypass RLS
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: requests, error } = await supabase
    .from('ama_requests')
    .select('*')
    .eq('status', 'LIVE')
    .order('scheduled_at', { ascending: false });

  if (error) {
    console.error('[AMA] Error fetching live AMAs:', error);
  }

  console.log('[AMA] Live AMAs found:', requests?.length || 0);
  return requests || [];
}

/**
 * Get Upcoming AMAs (PINNED status, future scheduled)
 */
export async function getUpcomingAMAs(): Promise<any[]> {
  // Use service role to bypass RLS
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: requests, error } = await supabase
    .from('ama_requests')
    .select('*')
    .eq('status', 'PINNED')
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(20);

  if (error) {
    console.error('[AMA] Error fetching upcoming AMAs:', error);
  }

  console.log('[AMA] Upcoming AMAs found:', requests?.length || 0);
  return requests || [];
}

/**
 * Get My AMA Requests (Developer)
 */
export async function getMyAMARequests(): Promise<any[]> {
  const session = await getServerSession();

  if (!session) {
    return [];
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: requests } = await supabase
    .from('ama_requests')
    .select(
      `
      *,
      projects:project_id (name, token_symbol, logo_url)
    `
    )
    .eq('developer_id', session.userId)
    .order('created_at', { ascending: false });

  return requests || [];
}

/**
 * Get AMA by ID with full details
 */
export async function getAMAById(amaId: string): Promise<any> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: ama, error } = await supabase
    .from('ama_requests')
    .select(
      `
      *,
      profiles:developer_id (wallet_address, nickname, avatar_url, kyc_status),
      projects:project_id (name, token_symbol, logo_url)
    `
    )
    .eq('id', amaId)
    .single();

  if (error) {
    console.error('Error fetching AMA:', error);
    return null;
  }

  return ama;
}

/**
 * Get AMA Messages
 */
export async function getAMAMessages(amaId: string): Promise<any[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: messages, error } = await supabase
    .from('ama_messages')
    .select('*')
    .eq('ama_id', amaId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }

  return messages || [];
}

/**
 * Send AMA Message
 */
export async function sendAMAMessage(amaId: string, content: string) {
  const session = await getServerSession();

  if (!session) {
    return { success: false, error: 'Authentication required' };
  }

  if (!content.trim()) {
    return { success: false, error: 'Message cannot be empty' };
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get profile info
  const { data: profile } = await supabase
    .from('profiles')
    .select('nickname, avatar_url, kyc_status')
    .eq('user_id', session.userId)
    .single();

  // Check if user is the developer
  const { data: ama } = await supabase
    .from('ama_requests')
    .select('developer_id')
    .eq('id', amaId)
    .single();

  const isDeveloper = ama?.developer_id === session.userId;

  const { error } = await supabase.from('ama_messages').insert({
    ama_id: amaId,
    user_id: session.userId,
    content: content.trim(),
    message_type: isDeveloper ? 'DEVELOPER' : 'USER',
    username: profile?.nickname || 'Anonymous',
    avatar_url: profile?.avatar_url,
    is_developer: isDeveloper,
    is_verified: profile?.kyc_status === 'APPROVED',
  });

  if (error) {
    console.error('Error sending message:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Pin a message (Developer only)
 */
export async function pinMessage(messageId: string, amaId: string) {
  const session = await getServerSession();

  if (!session) {
    return { success: false, error: 'Authentication required' };
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Verify user is the developer
  const { data: ama } = await supabase
    .from('ama_requests')
    .select('developer_id')
    .eq('id', amaId)
    .single();

  if (ama?.developer_id !== session.userId) {
    return { success: false, error: 'Only the developer can pin messages' };
  }

  const { error } = await supabase
    .from('ama_messages')
    .update({ is_pinned_message: true })
    .eq('id', messageId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Delete a message (Moderator)
 */
export async function deleteMessage(messageId: string) {
  const session = await getServerSession();

  if (!session) {
    return { success: false, error: 'Authentication required' };
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Check if admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('wallet_address', session.address)
    .single();

  if (!profile?.is_admin) {
    return { success: false, error: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('ama_messages')
    .update({ is_deleted: true, deleted_by: session.userId })
    .eq('id', messageId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
