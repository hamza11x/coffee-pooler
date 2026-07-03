import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

/**
 * SECURITY MIDDLEWARE
 * Runs on the server BEFORE any page or API route is rendered.
 * Unauthenticated users never even get the page HTML — they get redirected.
 */
export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // ── Already-authed users should not see login/register ──────────────────
    if (token && (pathname === '/login' || pathname === '/register')) {
      return NextResponse.redirect(new URL('/', req.url))
    }

    // ── Admin routes: must have elevated role ────────────────────────────────
    if (pathname.startsWith('/admin')) {
      const role = token?.role
      const allowedRoles = ['DEV', 'OWNER', 'STAFF']
      if (!role || !allowedRoles.includes(role)) {
        // Redirect non-admins to home with a clear denial signal
        return NextResponse.redirect(new URL('/?denied=1', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      // Return true = allow, false = redirect to signIn page
      authorized({ token, req }) {
        const { pathname } = req.nextUrl

        // Public pages — always allow
        const publicPaths = ['/', '/login', '/register', '/verified', '/tournaments']
        if (publicPaths.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
          return true
        }

        // Everything else requires a session token
        return !!token
      },
    },
    pages: {
      signIn: '/login',
    },
  }
)

/**
 * Matcher — runs middleware on these paths only.
 * Excludes Next.js internals, static files, and images.
 */
export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT:
     * - _next/static  (static files)
     * - _next/image   (image optimization)
     * - favicon.ico
     * - public folder files
     * - api/auth (NextAuth handles its own security)
     * - api/verify-email (must be publicly accessible from email links)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|api/auth|api/verify-email|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4|woff2?|ttf|otf)).*)',
  ],
}
