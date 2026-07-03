import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!serviceRoleKey) {
  console.warn('SUPABASE_SERVICE_ROLE_KEY is missing. Email verification will not work.')
}

/**
 * Admin client — has full database access, bypasses RLS.
 * NEVER import this in client components ('use client').
 * Only use inside API routes (server-side).
 */
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})
