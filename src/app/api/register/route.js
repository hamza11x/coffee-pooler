import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import nodemailer from "nodemailer"
import { rateLimit } from "@/lib/rateLimit"

// ─── Email transporter (configured via .env.local) ───────────────────────────
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for port 465, false for 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

// ─── HTML email template ──────────────────────────────────────────────────────
function buildEmailHtml(username, verifyUrl) {
  return `<!DOCTYPE html>
<html>
  <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
  <body style="margin:0;padding:0;background:#050505;font-family:Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#050505;padding:40px 20px;">
      <tr><td align="center">
        <table width="520" cellpadding="0" cellspacing="0"
               style="background:#0a0a0a;border:1px solid #1a1a1a;border-top:2px solid #D4AF37;">
          <tr>
            <td align="center" style="padding:48px 40px 24px;">
              <p style="color:#D4AF37;font-size:22px;letter-spacing:0.4em;font-weight:900;margin:0;">ARNADA</p>
              <p style="color:rgba(255,255,255,0.2);font-size:9px;letter-spacing:0.5em;text-transform:uppercase;margin:4px 0 0;">Pool Cafe</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:0 40px 40px;">
              <h1 style="color:#fff;font-size:20px;font-weight:900;letter-spacing:0.2em;text-transform:uppercase;margin:0 0 16px;">
                Verify Your Email
              </h1>
              <p style="color:rgba(255,255,255,0.4);font-size:14px;line-height:1.6;margin:0 0 32px;">
                Welcome to ARNADA POOL, <strong style="color:#D4AF37;">${username}</strong>.<br/>
                Click the button below to verify your email address and activate your account.
              </p>
              <a href="${verifyUrl}"
                 style="display:inline-block;background:#D4AF37;color:#000;font-weight:900;
                        font-size:11px;letter-spacing:0.4em;text-transform:uppercase;
                        text-decoration:none;padding:18px 40px;">
                VERIFY EMAIL &rarr;
              </a>
              <p style="color:rgba(255,255,255,0.15);font-size:11px;margin:28px 0 0;">
                This link expires in 24&nbsp;hours. If you did not create this account, ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #1a1a1a;">
              <p style="color:rgba(255,255,255,0.1);font-size:10px;margin:0;text-align:center;
                         letter-spacing:0.2em;text-transform:uppercase;">
                &copy; ARNADA POOL &mdash; Elite Billiards
              </p>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`
}

// ─── Route handler ────────────────────────────────────────────────────────────
export async function POST(req) {
  // Rate limit: max 5 registrations per IP per 15 minutes
  const { success } = rateLimit(req, { limit: 5, windowMs: 15 * 60 * 1000 })
  if (!success) {
    return NextResponse.json(
      { message: 'Too many registration attempts. Please try again later.' },
      { status: 429 }
    )
  }

  try {
    const { username, email, password, role = "USER" } = await req.json()

    if (!username || !email || !password) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 })
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('User')
      .select('id')
      .or(`email.eq.${email},username.eq.${username}`)
      .single()

    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // Generate a secure random verification token (valid 24 hours)
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    // Create user — unverified by default
    const { data: user, error: insertError } = await supabaseAdmin
      .from('User')
      .insert([
        {
          username,
          email,
          password: hashedPassword,
          role: role.toUpperCase(),
          emailVerified: false,
          verificationToken,
          verificationExpiry,
        }
      ])
      .select('id')
      .single()

    if (insertError) {
      console.error('Error inserting user:', insertError)
      return NextResponse.json({ message: "Failed to create user" }, { status: 500 })
    }

    // Build and send the verification email
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const verifyUrl = `${appUrl}/api/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`

    try {
      const transporter = createTransporter()
      await transporter.sendMail({
        from: `"ARNADA POOL" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: email,
        subject: 'ARNADA POOL — Verify Your Email',
        html: buildEmailHtml(username, verifyUrl),
      })
    } catch (emailErr) {
      // Account is created — log the error but don't block the response.
      // The user can contact support for a re-send.
      console.error('Verification email failed to send:', emailErr)
    }

    return NextResponse.json(
      { message: "Account created. Check your email to verify your account." },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

