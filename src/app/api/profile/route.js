import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { supabase } from "@/lib/supabase"
import bcrypt from "bcryptjs"

export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: "Unauthenticated" }, { status: 401 })
    }

    const { username, email, password } = await req.json()
    const userId = session.user.id

    const updateData = {}
    if (username) updateData.username = username
    if (email) updateData.email = email
    
    // Hash password if updating
    if (password && password.length > 0) {
      const salt = await bcrypt.genSalt(10)
      updateData.password = await bcrypt.hash(password, salt)
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: "No changes provided" }, { status: 400 })
    }

    updateData.updatedAt = new Date().toISOString()

    const { data, error } = await supabase
      .from('User')
      .update(updateData)
      .eq('id', userId)
      .select('id, username, email, role')
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ message: "Username or Email already in use" }, { status: 400 })
      }
      throw error
    }

    return NextResponse.json({ 
      message: "Profile updated successfully. Please re-login to see changes in all areas.", 
      user: data 
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
  }
}
