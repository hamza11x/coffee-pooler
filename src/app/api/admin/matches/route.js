import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { supabase } from "@/lib/supabase"

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)
    const isAuthorized = session && ['DEV', 'OWNER', 'STAFF'].includes(session.user.role)
    
    if (!isAuthorized) {
      return NextResponse.json({ message: "Unauthorized Registry Search" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const tournamentId = searchParams.get('tournamentId')

    if (!tournamentId) {
      return NextResponse.json({ message: "Target ID Required" }, { status: 400 })
    }

    const { data: matches, error: mError } = await supabase
      .from('Match')
      .select(`
        *,
        player1:User!Match_player1Id_fkey(username),
        player2:User!Match_player2Id_fkey(username),
        winner:User!Match_winnerId_fkey(username)
      `)
      .eq('tournamentId', tournamentId)
      .order('round', { ascending: true })
      .order('bracketPosition', { ascending: true })

    if (mError) throw mError

    const { data: participants, error: pError } = await supabase
      .from('Participant')
      .select('userId')
      .eq('tournamentId', tournamentId)

    if (pError) throw pError

    return NextResponse.json({ matches, participants })
  } catch (error) {
    console.error('Error fetching matches:', error)
    return NextResponse.json({ message: "Data Synchronization Failed" }, { status: 500 })
  }
}

export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions)
    const isAuthorized = session && ['DEV', 'OWNER', 'STAFF'].includes(session.user.role)

    if (!isAuthorized) {
      return NextResponse.json({ message: "Unauthorized Result Override" }, { status: 401 })
    }

    const { matchId, winnerId, score1, score2, scheduledTime, player1Id, player2Id } = await req.json()

    const { data: currentMatch, error: getError } = await supabase
      .from('Match')
      .select('*')
      .eq('id', matchId)
      .single()

    if (getError) throw getError

    const updatePayload = {}
    if (winnerId !== undefined) updatePayload.winnerId = winnerId
    if (player1Id !== undefined) updatePayload.player1Id = player1Id
    if (player2Id !== undefined) updatePayload.player2Id = player2Id
    
    // We try to update these. If the DB lacks the columns, it will throw an explicit error.
    if (score1 !== undefined) updatePayload.score1 = score1
    if (score2 !== undefined) updatePayload.score2 = score2
    if (scheduledTime !== undefined) updatePayload.scheduledTime = scheduledTime

    const { error: updateError } = await supabase
      .from('Match')
      .update(updatePayload)
      .eq('id', matchId)

    if (updateError) {
      if (updateError.message.includes('Could not find')) {
        throw new Error(`DB Schema Error: You need to add missing columns to your Match table (e.g., score1, score2, scheduledTime text). Original Error: ${updateError.message}`)
      }
      throw updateError
    }

    const { data: tournament } = await supabase
      .from('Tournament')
      .select('gameplayMode, maxPlayers')
      .eq('id', currentMatch.tournamentId)
      .single()

    if (tournament?.gameplayMode === 'TOURNAMENT') {
      const maxRounds = Math.log2(tournament.maxPlayers || Infinity)
      const currentRoundNum = parseInt(currentMatch.round)

      if (currentRoundNum >= maxRounds) {
        // This is the Grand Final. We declare the Tournament Winner!
        await supabase
          .from('Tournament')
          .update({ winnerId, status: 'FINISHED' })
          .eq('id', currentMatch.tournamentId)
      } else {
        // Not the final yet, promote the player to the next bracket tier.
        const nextRound = currentRoundNum + 1
        const nextPosition = Math.ceil(currentMatch.bracketPosition / 2)
        const isPlayer1ForNext = currentMatch.bracketPosition % 2 !== 0

        const { data: nextMatch, error: nextError } = await supabase
          .from('Match')
          .select('*')
          .eq('tournamentId', currentMatch.tournamentId)
          .eq('round', nextRound)
          .eq('bracketPosition', nextPosition)
          .maybeSingle()

        if (nextMatch) {
          const updateData = isPlayer1ForNext ? { player1Id: winnerId } : { player2Id: winnerId }
          await supabase
            .from('Match')
            .update(updateData)
            .eq('id', nextMatch.id)
        } else {
          const insertData = {
            tournamentId: currentMatch.tournamentId,
            round: nextRound,
            bracketPosition: nextPosition,
            player1Id: isPlayer1ForNext ? winnerId : null,
            player2Id: isPlayer1ForNext ? null : winnerId
          }
          await supabase.from('Match').insert(insertData)
        }
      }
    }

    return NextResponse.json({ message: "Result Synchronized & Player Promoted" })
  } catch (error) {
    console.error('Error updating match:', error)
    return NextResponse.json({ message: "Arena Sync Failure", details: error.message }, { status: 500 })
  }
}
