import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

/**
 * GET /api/verify-email?token=TOKEN&email=EMAIL
 *
 * Supabase sends the user a magic link that points here.
 * We look up the token, mark the user verified, then redirect.
 */
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')
  const email = searchParams.get('email')
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  if (!token || !email) {
    return NextResponse.redirect(`${appUrl}/verified?error=missing_token`)
  }

  try {
    // Find the user with matching token and email
    const { data: user, error: findError } = await supabaseAdmin
      .from('User')
      .select('id, emailVerified, verificationToken, verificationExpiry')
      .eq('email', email)
      .eq('verificationToken', token)
      .single()

    if (findError || !user) {
      return NextResponse.redirect(`${appUrl}/verified?error=invalid_token`)
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.redirect(`${appUrl}/verified?already=true`)
    }

    // Check token expiry (24 hours)
    if (user.verificationExpiry && new Date(user.verificationExpiry) < new Date()) {
      return NextResponse.redirect(`${appUrl}/verified?error=expired_token`)
    }

    // Mark user as verified and clear the token
    const { error: updateError } = await supabaseAdmin
      .from('User')
      .update({
        emailVerified: true,
        verificationToken: null,
        verificationExpiry: null,
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Failed to verify user:', updateError)
      return NextResponse.redirect(`${appUrl}/verified?error=server_error`)
    }

    return NextResponse.redirect(`${appUrl}/verified?success=true`)
  } catch (err) {
    console.error('Verify email error:', err)
    return NextResponse.redirect(`${appUrl}/verified?error=server_error`)
  }
}
