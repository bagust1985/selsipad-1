import { getSupabaseServiceClient } from './auth';
import { writeAuditLog } from './audit';

export interface AdminAction {
    id: string;
    type: string;
    payload: any;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED' | 'EXECUTED';
    requested_by: string;
    requested_at: string;
    expires_at: string;
    executed_at?: string;
}

/**
 * Request a two-man rule action
 */
export async function requestAction(params: {
    type: string;
    payload: any;
    requestedBy: string;
    expiresInHours?: number;
}): Promise<AdminAction> {
    const supabase = getSupabaseServiceClient();

    const expiresAt = new Date(
        Date.now() + (params.expiresInHours || 24) * 60 * 60 * 1000
    );

    const { data, error } = await supabase
        .from('admin_actions')
        .insert({
            type: params.type,
            payload: params.payload,
            requested_by: params.requestedBy,
            expires_at: expiresAt.toISOString()
        })
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to create action request: ${error.message}`);
    }

    await writeAuditLog({
        actor: params.requestedBy,
        action: 'TWO_MAN_ACTION_REQUESTED',
        entityType: 'admin_action',
        entityId: data.id,
        afterData: data
    });

    return data;
}

/**
 * Approve or reject an action
 */
export async function approveOrRejectAction(params: {
    actionId: string;
    approvedBy: string;
    decision: 'APPROVE' | 'REJECT';
    reason?: string;
}): Promise<void> {
    const supabase = getSupabaseServiceClient();

    // Get action
    const { data: action, error: fetchError } = await supabase
        .from('admin_actions')
        .select('*')
        .eq('id', params.actionId)
        .single();

    if (fetchError || !action) {
        throw new Error('ACTION_NOT_FOUND');
    }

    if (action.status !== 'PENDING') {
        throw new Error(`ACTION_NOT_PENDING: Current status is ${action.status}`);
    }

    if (new Date(action.expires_at) < new Date()) {
        throw new Error('ACTION_EXPIRED');
    }

    // Prevent self-approval
    if (action.requested_by === params.approvedBy) {
        throw new Error('CANNOT_APPROVE_OWN_REQUEST: Requester and approver must be different');
    }

    // Record approval/rejection
    const { error: approvalError } = await supabase
        .from('admin_action_approvals')
        .insert({
            action_id: params.actionId,
            approved_by: params.approvedBy,
            decision: params.decision,
            reason: params.reason
        });

    if (approvalError) {
        throw new Error(`Failed to record approval: ${approvalError.message}`);
    }

    if (params.decision === 'APPROVE') {
        // Execute the action
        const executionResult = await executeAction(action);

        // Mark as executed
        await supabase
            .from('admin_actions')
            .update({
                status: 'EXECUTED',
                executed_at: new Date().toISOString(),
                execution_result: executionResult
            })
            .eq('id', params.actionId);

        await writeAuditLog({
            actor: params.approvedBy,
            action: 'TWO_MAN_ACTION_APPROVED_AND_EXECUTED',
            entityType: 'admin_action',
            entityId: params.actionId,
            afterData: { decision: params.decision, result: executionResult }
        });
    } else {
        // Mark as rejected
        await supabase
            .from('admin_actions')
            .update({ status: 'REJECTED' })
            .eq('id', params.actionId);

        await writeAuditLog({
            actor: params.approvedBy,
            action: 'TWO_MAN_ACTION_REJECTED',
            entityType: 'admin_action',
            entityId: params.actionId,
            afterData: { decision: params.decision, reason: params.reason }
        });
    }
}

/**
 * Execute approved action (internal)
 */
async function executeAction(action: AdminAction): Promise<any> {
    const supabase = getSupabaseServiceClient();

    switch (action.type) {
        case 'role_grant':
            await supabase.from('admin_roles').insert({
                user_id: action.payload.userId,
                role: action.payload.role,
                granted_by: action.requested_by
            });
            return { success: true, role_granted: action.payload.role };

        case 'role_revoke':
            await supabase
                .from('admin_roles')
                .delete()
                .eq('user_id', action.payload.userId)
                .eq('role', action.payload.role);
            return { success: true, role_revoked: action.payload.role };

        case 'scan_override':
            await supabase
                .from('sc_scans')
                .update({
                    status: 'OVERRIDDEN_PASS',
                    overridden_by: action.requested_by,
                    overridden_at: new Date().toISOString(),
                    override_reason: action.payload.reason
                })
                .eq('id', action.payload.scanId);
            return { success: true, scan_overridden: action.payload.scanId };

        case 'payout':
            // Implement payout execution logic
            return { success: true, payout_executed: action.payload };

        case 'fee_change':
            // Implement fee change logic
            return { success: true, fee_changed: action.payload };

        default:
            throw new Error(`Unknown action type: ${action.type}`);
    }
}

/**
 * Get pending actions for approval queue
 */
export async function getPendingActions(filters?: {
    type?: string;
    requestedBy?: string;
}): Promise<AdminAction[]> {
    const supabase = getSupabaseServiceClient();

    let query = supabase
        .from('admin_actions')
        .select('*')
        .eq('status', 'PENDING')
        .order('created_at', { ascending: false });

    if (filters?.type) {
        query = query.eq('type', filters.type);
    }

    if (filters?.requestedBy) {
        query = query.eq('requested_by', filters.requestedBy);
    }

    const { data, error } = await query;

    if (error) {
        throw new Error(`Failed to fetch pending actions: ${error.message}`);
    }

    return data || [];
}
