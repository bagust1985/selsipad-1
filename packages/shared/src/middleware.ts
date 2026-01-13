/**
 * Standard API Response Structure
 */
export interface ApiResponse<T = any> {
    data: T | null;
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        cursor?: string;
    };
    error?: {
        code: string;
        message: string;
        details?: any;
    } | null;
}

/**
 * API Error Response
 */
export function errorResponse(
    code: string,
    message: string,
    details?: any
): ApiResponse {
    return {
        data: null,
        error: {
            code,
            message,
            details
        }
    };
}

/**
 * API Success Response
 */
export function successResponse<T>(data: T, meta?: any): ApiResponse<T> {
    return {
        data,
        meta,
        error: null
    };
}

/**
 * Pagination params
 */
export interface PaginationParams {
    limit?: number;
    cursor?: string;
}

/**
 * Idempotency check middleware
 * Stores result of operation with idempotency key to prevent duplicate execution
 */
export async function checkIdempotency(
    key: string,
    operation: () => Promise<any>
): Promise<any> {
    // TODO: Implementation in FASE 2
    // For now, just execute operation
    // In production, check if key exists in idempotency_log table
    // If exists, return cached result
    // If not, execute operation and store result
    return operation();
}

/**
 * Rate limit check
 */
export function rateLimit(
    identifier: string,
    maxRequests: number,
    windowMs: number
): boolean {
    // TODO: Implementation with Redis or in-memory store
    // For MVP, return true (no rate limiting yet)
    return true;
}
