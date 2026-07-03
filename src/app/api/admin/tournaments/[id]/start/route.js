import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { supabase } from "@/lib/supabase"

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions)

    const isAuthorized = session && ['DEV', 'OWNER', 'STAFF'].includes(session.user.role)
    if (!isAuthorized) {
      return NextResponse.json({ message: "Unauthorized Deployment Clearance" }, { status: 401 })
    }

    // Await params for Next.js 15+
    const { id: tournamentId } = await params

    if (!tournamentId) {
      return NextResponse.json({ message: "Invalid Tournament ID received." }, { status: 400 })
    }

    // 1. Fetch participants
    const { data: participants, error: pError } = await supabase
      .from('Participant')
      .select('userId')
      .eq('tournamentId', tournamentId)

    if (pError) throw pError
    if (!participants || participants.length < 2) {
      return NextResponse.json({ message: `Inadequate assets for deployment (Min 2 Participants).` }, { status: 400 })
    }

    // 2. PURGE PREVIOUS DEPLOYMENTS
    await supabase.from('Match').delete().eq('tournamentId', tournamentId)

    // 3. Shuffle
    const shuffled = [...participants].sort(() => Math.random() - 0.5)

    // 4. Generate Round 1
    const matchesToCreate = []
    for (let i = 0; i < shuffled.length; i += 2) {
      const p1 = shuffled[i]
      const p2 = shuffled[i + 1]
      const p1Id = p1?.userId || p1?.user_id
      const p2Id = p2?.userId || p2?.user_id

      if (p2Id) {
        matchesToCreate.push({
          tournamentId,
          player1Id: p1Id,
          player2Id: p2Id,
          round: 1,
          bracketPosition: Math.floor(i / 2) + 1,
          // 'status' column is missing from DB schema, removing it
        })
      } else {
        // Bye
        matchesToCreate.push({
          tournamentId,
          player1Id: p1Id,
          player2Id: p1Id, // In this schema, we put the winner as P2 or just set winnerId
          winnerId: p1Id,
          round: 1,
          bracketPosition: Math.floor(i / 2) + 1,
        })
      }
    }

    // 5. Deploy Matches
    const { error: matchError } = await supabase
      .from('Match')
      .insert(matchesToCreate)

    if (matchError) {
      console.error('Match Deployment Error:', matchError)
      throw new Error(`Match Generation Failed: ${matchError.message}`)
    }

    // 6. Update status to LIVE
    const { error: updateError } = await supabase
      .from('Tournament')
      .update({ status: 'PLAYING' })
      .eq('id', tournamentId)

    if (updateError) throw updateError

    return NextResponse.json({ message: "Arena Operational", matchCount: matchesToCreate.length })
  } catch (error) {
    console.error('Error starting tournament:', error)
    return NextResponse.json({ 
      message: "Initialization Failed", 
      details: error.message 
    }, { status: 500 })
  }
}
