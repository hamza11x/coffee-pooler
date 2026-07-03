import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // 1. Fetch Match History
    const { data: matches, error: matchError } = await supabase
      .from('Match')
      .select(`
        *,
        player1:User!Match_player1Id_fkey(username),
        player2:User!Match_player2Id_fkey(username),
        winner:User!Match_winnerId_fkey(username)
      `)
      .or(`player1Id.eq.${userId},player2Id.eq.${userId}`)
      .order('createdAt', { ascending: false })

    if (matchError) throw matchError

    // 2. Fetch Tournament Wins
    const { count: wins, error: winError } = await supabase
      .from('Tournament')
      .select('id', { count: 'exact', head: true })
      .eq('winnerId', userId)

    if (winError) throw winError

    // 3. Fetch Last Tournament Ranking (Simplification: round of last match)
    const { data: lastTournamentMatch, error: rankError } = await supabase
      .from('Match')
      .select('round, tournamentId')
      .or(`player1Id.eq.${userId},player2Id.eq.${userId}`)
      .order('createdAt', { ascending: false })
      .limit(1)
      .maybeSingle()

    let ranking = 'N/A'
    if (lastTournamentMatch) {
      ranking = lastTournamentMatch.round || 'Participant'
    }

    // 4. Fetch Upcoming Tournaments (where user is registered)
    const { data: registrations, error: regError } = await supabase
      .from('Participant')
      .select(`
        tournament:Tournament(*)
      `)
      .eq('userId', userId)

    const upcoming = (registrations || [])
      .map(r => r.tournament)
      .filter(t => t.status === 'OPEN')

    return NextResponse.json({
      stats: {
        matches: matches?.length || 0,
        wins: wins || 0,
        rank: ranking,
        level: Math.floor((matches?.length || 0) / 5) + 1 // Basic level-up logic
      },
      matchHistory: matches || [],
      upcomingTournaments: upcoming
    })
  } catch (error) {
    console.error('Error fetching profile stats:', error)
    return NextResponse.json({ message: "Failed to fetch profile stats" }, { status: 500 })
  }
}
