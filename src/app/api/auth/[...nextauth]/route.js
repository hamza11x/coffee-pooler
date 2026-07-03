import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import bcrypt from "bcryptjs"
import { rateLimit } from "@/lib/rateLimit"

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        // Rate limit: max 10 login attempts per IP per 10 minutes
        const { success } = rateLimit(req, { limit: 10, windowMs: 10 * 60 * 1000 })
        if (!success) {
          throw new Error('TOO_MANY_ATTEMPTS')
        }

        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials")
        }

        const { data: user, error } = await supabaseAdmin
          .from('User')
          .select('*')
          .eq('email', credentials.email)
          .single()

        if (error || !user) {
          throw new Error("User not found")
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)

        if (!isValid) {
          throw new Error("Invalid password")
        }

        // Block login for unverified accounts
        if (user.emailVerified === false) {
          throw new Error("EMAIL_NOT_VERIFIED")
        }

        return {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.username = user.username
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.username = token.username
      }
      return session
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    updateAge: 24 * 60 * 60,  // refresh token every 24 hours
  },
  jwt: {
    maxAge: 7 * 24 * 60 * 60, // match session maxAge
  },
  cookies: {
    sessionToken: {
      name: 'arnada.session-token',
      options: {
        httpOnly: true,   // JS cannot read the cookie
        sameSite: 'lax',  // CSRF protection
        path: '/',
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
