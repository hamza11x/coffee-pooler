import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// Public GET route for active and upcoming tournaments
export async function GET() {
  try {
    const { data: tournaments, error } = await supabase
      .from('Tournament')
      .select(`
        *,
        creator:User!Tournament_creatorId_fkey(username),
        winner:User!Tournament_winnerId_fkey(username),
        participants:Participant(userId),
        matches:Match(
          *,
          player1:User!Match_player1Id_fkey(username),
          player2:User!Match_player2Id_fkey(username),
          winner:User!Match_winnerId_fkey(username)
        )
      `)
      .in('status', ['OPEN', 'PLAYING', 'FINISHED'])
      .neq('status', 'OFFLINE_INTERNAL')
      .order('date', { ascending: false })
      .limit(20)

    if (error) throw error

    return NextResponse.json(tournaments)
  } catch (error) {
    console.error('Error fetching tournaments:', error)
    return NextResponse.json({ message: "Failed to fetch tournaments" }, { status: 500 })
  }
}
