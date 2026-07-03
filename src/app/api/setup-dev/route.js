import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    const username = process.env.DEV_USERNAME || "devUser"
    const email = process.env.DEV_EMAIL
    const password = process.env.DEV_PASSWORD
    const role = "DEV"

    if (!email || !password) {
      return NextResponse.json({ message: "DEV_EMAIL and DEV_PASSWORD must be set in .env" }, { status: 400 })
    }

    // 1. Check if user already exists
    const { data: existingUser } = await supabase
      .from('User')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json({ message: "DEV Account already exists. Please login." })
    }

    // 2. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10)

    // 3. Create Master Account
    const { data: user, error: insertError } = await supabase
      .from('User')
      .insert([
        { 
          username, 
          email, 
          password: hashedPassword, 
          role 
        }
      ])
      .select('username, email, role')
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json({ message: "Failed to create account. Did you run the SQL reset?", error: insertError }, { status: 500 })
    }

    return NextResponse.json({ 
      message: "MASTER DEV ACCOUNT CREATED SUCCESSFULLY",
      credentials: {
        username: user.username,
        email: user.email,
        role: user.role,
        password: "[ HIDDEN ]"
      },
      action: "You can now login at /login and DELETE this file for security."
    })
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}
