'use server';

import { createClient } from '@/lib/supabase/server';

interface TemplateAuditStatusResponse {
  success: boolean;
  data?: {
    status: 'VALID' | 'NOT_AUDITED';
    audit_report_ref?: string;
    audit_provider?: string;
    audited_at?: string;
  };
  error?: string;
}

/**
 * Get template audit status for STRICT mode validation
 * GET /api/templates/audit-status?network=EVM&version=1.0.0
 */
export async function getTemplateAuditStatus(
  network: string,
  templateVersion: string
): Promise<TemplateAuditStatusResponse> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('template_audits')
      .select('status, audit_report_ref, audit_provider, audited_at')
      .eq('network', network)
      .eq('template_version', templateVersion)
      .eq('status', 'VALID')
      .single();

    if (error || !data) {
      return {
        success: true,
        data: { status: 'NOT_AUDITED' },
      };
    }

    return {
      success: true,
      data: {
        status: 'VALID',
        audit_report_ref: data.audit_report_ref,
        audit_provider: data.audit_provider || undefined,
        audited_at: data.audited_at || undefined,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to get template audit status',
    };
  }
}

/**
 * Check if template version has implementation hash match (for extra security)
 */
export async function verifyTemplateHash(
  network: string,
  templateVersion: string,
  implementationHash: string
): Promise<{ success: boolean; isValid: boolean; error?: string }> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('template_audits')
      .select('implementation_hash')
      .eq('network', network)
      .eq('template_version', templateVersion)
      .eq('status', 'VALID')
      .single();

    if (error || !data) {
      return { success: true, isValid: false };
    }

    return {
      success: true,
      isValid: data.implementation_hash === implementationHash,
    };
  } catch (error: any) {
    return {
      success: false,
      isValid: false,
      error: error.message,
    };
  }
}
