import { getSupabaseServiceClient } from './auth';

export interface AuditLogParams {
    actor: string;
    action: string;
    entityType?: string;
    entityId?: string;
    beforeData?: any;
    afterData?: any;
    ip?: string;
    userAgent?: string;
    traceId?: string;
}

/**
 * Write audit log entry
 */
export async function writeAuditLog(params: AuditLogParams): Promise<void> {
    const supabase = getSupabaseServiceClient();

    await supabase.from('audit_logs').insert({
        actor_admin_id: params.actor,
        action: params.action,
        entity_type: params.entityType,
        entity_id: params.entityId,
        before_data: params.beforeData,
        after_data: params.afterData,
        ip_address: params.ip,
        user_agent: params.userAgent,
        trace_id: params.traceId || crypto.randomUUID()
    });
}

/**
 * Get audit logs with filters
 */
export async function getAuditLogs(filters?: {
    actor?: string;
    action?: string;
    entityType?: string;
    entityId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
}) {
    const supabase = getSupabaseServiceClient();

    let query = supabase
        .from('audit_logs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

    if (filters?.actor) {
        query = query.eq('actor_admin_id', filters.actor);
    }

    if (filters?.action) {
        query = query.eq('action', filters.action);
    }

    if (filters?.entityType) {
        query = query.eq('entity_type', filters.entityType);
    }

    if (filters?.entityId) {
        query = query.eq('entity_id', filters.entityId);
    }

    if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate);
    }

    if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate);
    }

    if (filters?.limit) {
        query = query.limit(filters.limit);
    }

    if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
    }

    const { data, error, count } = await query;

    if (error) {
        throw new Error(`Failed to fetch audit logs: ${error.message}`);
    }

    return { data: data || [], count: count || 0 };
}
