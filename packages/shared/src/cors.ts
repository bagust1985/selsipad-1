/**
 * CORS middleware for admin API routes
 * Only allow requests from admin domain
 */
export function checkAdminCors(request: Request): boolean {
    const origin = request.headers.get('origin');

    // Get allowed origins from env
    const allowedOrigins = process.env.ADMIN_CORS_ORIGINS?.split(',') || [
        'https://admin.selsipad.com',
        'http://localhost:3001' // Development
    ];

    return allowedOrigins.includes(origin || '');
}

/**
 * Apply CORS headers to response
 */
export function withCorsHeaders(response: Response, request: Request): Response {
    const origin = request.headers.get('origin');

    if (checkAdminCors(request)) {
        response.headers.set('Access-Control-Allow-Origin', origin || '');
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Idempotency-Key, x-user-id');
        response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours
    }

    return response;
}
