/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    // Prevent clickjacking
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY'
                    },
                    // Prevent MIME type sniffing
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff'
                    },
                    // Referrer policy
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin'
                    },
                    // Disable potentially dangerous browser features
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=(), payment=()'
                    },
                    // Content Security Policy
                    {
                        key: 'Content-Security-Policy',
                        value: [
                            "default-src 'self'",
                            "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // TODO: Remove unsafe-* in production
                            "style-src 'self' 'unsafe-inline'",
                            "img-src 'self' data: https:",
                            "font-src 'self' data:",
                            "connect-src 'self' https://*.supabase.co",
                            "frame-ancestors 'none'"
                        ].join('; ')
                    },
                    // HSTS (HTTPS only) - uncomment for production
                    // {
                    //   key: 'Strict-Transport-Security',
                    //   value: 'max-age=31536000; includeSubDomains'
                    // }
                ]
            }
        ];
    },

    // CORS is handled at API route level for more granular control
    // async headers() for CORS would apply globally
};

module.exports = nextConfig;
