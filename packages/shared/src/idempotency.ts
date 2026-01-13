// Simple in-memory idempotency store (use Redis in production)
const idempotencyStore = new Map<string, { result: any; expiresAt: number }>();

export interface IdempotencyOptions {
    ttlMs?: number;
}

/**
 * Execute operation with idempotency key
 * If key exists, return cached result
 * Otherwise execute operation and cache result
 */
export async function withIdempotency<T>(
    key: string,
    operation: () => Promise<T>,
    options?: IdempotencyOptions
): Promise<T> {
    const ttlMs = options?.ttlMs || 24 * 60 * 60 * 1000; // 24 hours default

    // Check cache
    const cached = idempotencyStore.get(key);
    if (cached && cached.expiresAt > Date.now()) {
        return cached.result;
    }

    // Execute operation
    const result = await operation();

    // Store result
    idempotencyStore.set(key, {
        result,
        expiresAt: Date.now() + ttlMs
    });

    return result;
}

/**
 * Check if idempotency key exists
 */
export function hasIdempotencyKey(key: string): boolean {
    const cached = idempotencyStore.get(key);
    return !!cached && cached.expiresAt > Date.now();
}

/**
 * Get cached result for idempotency key
 */
export function getIdempotentResult<T>(key: string): T | null {
    const cached = idempotencyStore.get(key);
    if (cached && cached.expiresAt > Date.now()) {
        return cached.result;
    }
    return null;
}

/**
 * Clear idempotency key (for testing/admin override)
 */
export function clearIdempotencyKey(key: string): void {
    idempotencyStore.delete(key);
}

/**
 * Cleanup expired entries (run periodically)
 */
export function cleanupIdempotency(): void {
    const now = Date.now();
    for (const [key, value] of idempotencyStore.entries()) {
        if (value.expiresAt < now) {
            idempotencyStore.delete(key);
        }
    }
}

/**
 * Middleware to extract and validate idempotency key from header
 */
export function extractIdempotencyKey(headers: Headers): string | null {
    const key = headers.get('Idempotency-Key') || headers.get('idempotency-key');

    if (!key) {
        return null;
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(key)) {
        throw new Error('INVALID_IDEMPOTENCY_KEY: Must be a valid UUID');
    }

    return key;
}
