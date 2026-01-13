// Simple in-memory rate limiter (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export interface RateLimitConfig {
    maxRequests: number;
    windowMs: number;
}

/**
 * Check rate limit for identifier
 * @returns true if allowed, false if rate limited
 */
export function checkRateLimit(
    identifier: string,
    config: RateLimitConfig
): boolean {
    const now = Date.now();
    const key = identifier;

    const existing = rateLimitStore.get(key);

    if (!existing || existing.resetAt < now) {
        // New window or expired
        rateLimitStore.set(key, {
            count: 1,
            resetAt: now + config.windowMs
        });
        return true;
    }

    if (existing.count >= config.maxRequests) {
        // Rate limit exceeded
        return false;
    }

    // Increment count
    existing.count++;
    return true;
}

/**
 * Get remaining requests for identifier
 */
export function getRateLimitInfo(
    identifier: string,
    config: RateLimitConfig
): { remaining: number; resetAt: number } {
    const existing = rateLimitStore.get(identifier);

    if (!existing || existing.resetAt < Date.now()) {
        return {
            remaining: config.maxRequests,
            resetAt: Date.now() + config.windowMs
        };
    }

    return {
        remaining: Math.max(0, config.maxRequests - existing.count),
        resetAt: existing.resetAt
    };
}

/**
 * Clear rate limit for identifier (for testing/admin override)
 */
export function clearRateLimit(identifier: string): void {
    rateLimitStore.delete(identifier);
}

/**
 * Cleanup expired entries (run periodically)
 */
export function cleanupRateLimits(): void {
    const now = Date.now();
    for (const [key, value] of rateLimitStore.entries()) {
        if (value.resetAt < now) {
            rateLimitStore.delete(key);
        }
    }
}
