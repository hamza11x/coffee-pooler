/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Apply security headers to every route
        source: '/(.*)',
        headers: [
          // Prevent clickjacking — page cannot be iframed
          { key: 'X-Frame-Options', value: 'DENY' },
          // Force browsers to use the declared content type
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Don't leak the referrer URL cross-origin
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Disable browser features we don't use
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          // XSS protection for older browsers
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          // HSTS — force HTTPS (comment out if still on HTTP locally)
          // { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          // Content Security Policy — allows Supabase, Google Fonts, and your own origin
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-eval needed by Next.js dev mode
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              `connect-src 'self' https://*.supabase.co wss://*.supabase.co`,
              "img-src 'self' data: blob: https:",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

export default nextConfig

