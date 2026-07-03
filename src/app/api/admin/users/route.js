import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { supabase } from "@/lib/supabase"

// STRICT CLEARANCE: Only DEV and OWNER can manage agent hierarchy
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    const isMaster = session && ['DEV', 'OWNER'].includes(session.user.role)
    if (!isMaster) {
      return NextResponse.json({ message: "Inadequate Security Clearance" }, { status: 403 })
    }

    const { data: users, error } = await supabase
      .from('User')
      .select('id, username, email, role, createdAt')
      .order('createdAt', { ascending: false })

    if (error) throw error

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ message: "Hierarchy Sync Failure" }, { status: 500 })
  }
}

export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions)

    const isMaster = session && ['DEV', 'OWNER'].includes(session.user.role)
    if (!isMaster) {
      return NextResponse.json({ message: "Unauthorized Authority Override" }, { status: 403 })
    }

    const { id, role, username, email } = await req.json()

    if (!id) {
      return NextResponse.json({ message: "Target ID Required" }, { status: 400 })
    }

    const updateData = {}
    if (role) updateData.role = role
    if (username) updateData.username = username
    if (email) updateData.email = email

    const { data: user, error } = await supabase
      .from('User')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ message: "Agent Records Updated", user })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ message: "Synchronization Terminated" }, { status: 500 })
  }
}

export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions)

    const isMaster = session && ['DEV', 'OWNER'].includes(session.user.role)
    if (!isMaster) {
      return NextResponse.json({ message: "Decommissioning Unauthorized" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ message: "Target ID Required" }, { status: 400 })
    }

    const { error } = await supabase
      .from('User')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ message: "Agent Account Terminated" })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ message: "Termination Failed" }, { status: 500 })
  }
}
