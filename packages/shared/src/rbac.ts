import { getSupabaseServiceClient } from './auth';

/**
 * Check if user is admin
 */
export async function requireAdmin(userId: string): Promise<void> {
    const supabase = getSupabaseServiceClient();

    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin, mfa_enabled')
        .eq('user_id', userId)
        .single();

    if (!profile?.is_admin) {
        throw new Error('NOT_ADMIN: User does not have admin privileges');
    }

    if (!profile.mfa_enabled) {
        throw new Error('MFA_REQUIRED: MFA must be enabled for admin access');
    }
}

/**
 * Check if user has specific role(s)
 */
export async function requireRole(userId: string, roles: string[]): Promise<void> {
    await requireAdmin(userId);

    const supabase = getSupabaseServiceClient();

    const { data: userRoles } = await supabase
        .from('admin_roles')
        .select('role')
        .eq('user_id', userId);

    if (!userRoles || userRoles.length === 0) {
        throw new Error('NO_ROLES: User has no admin roles assigned');
    }

    const hasRole = userRoles.some(r => roles.includes(r.role));

    if (!hasRole) {
        throw new Error(
            `INSUFFICIENT_PERMISSIONS: User does not have required role(s): ${roles.join(', ')}`
        );
    }
}

/**
 * Check if user has specific permission
 */
export async function hasPermission(userId: string, permission: string): Promise<boolean> {
    try {
        await requireAdmin(userId);
    } catch {
        return false;
    }

    const supabase = getSupabaseServiceClient();

    // Get user roles
    const { data: userRoles } = await supabase
        .from('admin_roles')
        .select('role')
        .eq('user_id', userId);

    if (!userRoles || userRoles.length === 0) {
        return false;
    }

    // Check for super_admin (has all permissions)
    if (userRoles.some(r => r.role === 'super_admin')) {
        return true;
    }

    // Check specific permission
    const { data: permissions } = await supabase
        .from('admin_permissions')
        .select('*')
        .in('role', userRoles.map(r => r.role))
        .or(`permission.eq.${permission},permission.eq.*`);

    return !!permissions && permissions.length > 0;
}

/**
 * Get all roles for a user
 */
export async function getUserRoles(userId: string): Promise<string[]> {
    const supabase = getSupabaseServiceClient();

    const { data: roles } = await supabase
        .from('admin_roles')
        .select('role')
        .eq('user_id', userId);

    return roles?.map(r => r.role) || [];
}

/**
 * Get all permissions for a user (aggregated from all roles)
 */
export async function getUserPermissions(userId: string): Promise<string[]> {
    const roles = await getUserRoles(userId);

    if (roles.length === 0) {
        return [];
    }

    // Super admin has all permissions
    if (roles.includes('super_admin')) {
        return ['*'];
    }

    const supabase = getSupabaseServiceClient();

    const { data: permissions } = await supabase
        .from('admin_permissions')
        .select('permission')
        .in('role', roles);

    return permissions?.map(p => p.permission) || [];
}
