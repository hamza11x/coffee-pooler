import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { supabase } from "@/lib/supabase"

// Admin only: Remove a participant from a tournament
export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions)

    const isAuthorized = session && ['DEV', 'OWNER', 'STAFF'].includes(session.user.role)
    if (!isAuthorized) {
      return NextResponse.json({ message: "Unauthorized Action" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const tournamentId = searchParams.get('tournamentId')
    const userId = searchParams.get('userId')

    if (!tournamentId || !userId) {
      return NextResponse.json({ message: "Tournament ID and User ID required" }, { status: 400 })
    }

    const { error } = await supabase
      .from('Participant')
      .delete()
      .eq('tournamentId', tournamentId)
      .eq('userId', userId)

    if (error) throw error

    return NextResponse.json({ message: "Agent removed from roster successfully" })
  } catch (error) {
    console.error('Error removing participant:', error)
    return NextResponse.json({ message: "Failed to remove agent" }, { status: 500 })
  }
}
