import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { supabase } from "@/lib/supabase"

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Login required to join tournament" }, { status: 401 })
    }

    const { tournamentId } = await req.json()

    if (!tournamentId) {
      return NextResponse.json({ message: "Tournament ID is required" }, { status: 400 })
    }

    const { data: tournament, error: tournamentError } = await supabase
      .from('Tournament')
      .select('status, maxPlayers')
      .eq('id', tournamentId)
      .single()

    if (tournamentError || !tournament) {
      return NextResponse.json({ message: "Tournament not found" }, { status: 404 })
    }

    if (tournament.status !== 'OPEN') {
      return NextResponse.json({ message: "Tournament is not open for registration" }, { status: 400 })
    }

    const { data: existingParticipant } = await supabase
      .from('Participant')
      .select('id')
      .eq('userId', session.user.id)
      .eq('tournamentId', tournamentId)
      .maybeSingle()

    if (existingParticipant) {
      return NextResponse.json({ message: "Already joined this tournament" }, { status: 400 })
    }

    const { count } = await supabase
      .from('Participant')
      .select('id', { count: 'exact', head: true })
      .eq('tournamentId', tournamentId)

    if (count >= tournament.maxPlayers) {
      return NextResponse.json({ message: "Tournament is full" }, { status: 400 })
    }

    const { error: joinError } = await supabase
      .from('Participant')
      .insert([
        { 
          userId: session.user.id, 
          tournamentId 
        }
      ])

    if (joinError) throw joinError

    return NextResponse.json({ message: "Successfully joined tournament" }, { status: 201 })
  } catch (error) {
    console.error('Error joining tournament:', error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

// DELETE: Allow users to leave an OPEN tournament
export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Login required" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const tournamentId = searchParams.get('tournamentId')

    if (!tournamentId) {
      return NextResponse.json({ message: "Tournament ID is required" }, { status: 400 })
    }

    // Check if tournament is still OPEN
    const { data: tournament, error: tournamentError } = await supabase
      .from('Tournament')
      .select('status')
      .eq('id', tournamentId)
      .single()

    if (tournamentError || !tournament) {
      return NextResponse.json({ message: "Tournament not found" }, { status: 404 })
    }

    if (tournament.status !== 'OPEN') {
      return NextResponse.json({ message: "Cannot leave a tournament that has already started." }, { status: 400 })
    }

    const { error: deleteError } = await supabase
      .from('Participant')
      .delete()
      .eq('userId', session.user.id)
      .eq('tournamentId', tournamentId)

    if (deleteError) throw deleteError

    return NextResponse.json({ message: "Successfully left the tournament" })
  } catch (error) {
    console.error('Error leaving tournament:', error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}
