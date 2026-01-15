'use server';

import { createClient } from '@/lib/supabase/server';

export type KYCSubmissionType = 'INDIVIDUAL' | 'BUSINESS';
export type KYCStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface KYCSubmission {
  id: string;
  user_id: string;
  project_id?: string;
  submission_type: KYCSubmissionType;
  status: KYCStatus;
  documents_url: string;
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Submit KYC Documents
 */
export async function submitKYC(data: {
  submission_type: KYCSubmissionType;
  documents_url: string; // Upload handled separately
  project_id?: string;
}): Promise<KYCSubmission> {
  const { getSession } = await import('@/lib/auth/session');
  const session = await getSession();

  if (!session) {
    throw new Error('Authentication required');
  }

  const supabase = createClient();

  // Create KYC submission
  const { data: submission, error } = await supabase
    .from('kyc_submissions')
    .insert({
      user_id: session.userId,
      project_id: data.project_id,
      submission_type: data.submission_type,
      documents_url: data.documents_url,
      status: 'PENDING',
    })
    .select()
    .single();

  if (error) throw error;

  return submission;
}

/**
 * Get User's KYC Status
 */
export async function getKYCStatus(): Promise<KYCSubmission | null> {
  const { getSession } = await import('@/lib/auth/session');
  const session = await getSession();

  if (!session) {
    return null;
  }

  const supabase = createClient();

  // Get latest submission
  const { data: submission } = await supabase
    .from('kyc_submissions')
    .select('*')
    .eq('user_id', session.userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  return submission;
}

/**
 * Upload KYC Documents to Supabase Storage
 */
export async function uploadKYCDocuments(files: { name: string; data: string }[]): Promise<string> {
  const { getSession } = await import('@/lib/auth/session');
  const session = await getSession();

  if (!session) {
    throw new Error('Authentication required');
  }

  const supabase = createClient();
  const timestamp = Date.now();
  const uploadedUrls: string[] = [];

  for (const file of files) {
    const fileName = `${session.userId}/${timestamp}/${file.name}`;

    // Decode base64 to buffer
    const base64Data = file.data.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');

    const { data, error } = await supabase.storage.from('kyc-documents').upload(fileName, buffer, {
      contentType: file.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg',
      upsert: false,
    });

    if (error) throw error;

    uploadedUrls.push(data.path);
  }

  // Return JSON array of paths
  return JSON.stringify(uploadedUrls);
}

/**
 * Get User Projects (for KYC linking)
 */
export async function getUserProjects(): Promise<Array<{ id: string; name: string }>> {
  const { getSession } = await import('@/lib/auth/session');
  const session = await getSession();

  if (!session) {
    return [];
  }

  const supabase = createClient();

  const { data: projects } = await supabase
    .from('projects')
    .select('id, name')
    .eq('creator_id', session.userId)
    .order('created_at', { ascending: false });

  return projects || [];
}
