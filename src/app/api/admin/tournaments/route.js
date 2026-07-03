import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { supabase } from "@/lib/supabase"

// DEV, OWNER, and STAFF can view tournament registry
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    const isAuthorized = session && ['DEV', 'OWNER', 'STAFF'].includes(session.user.role)
    if (!isAuthorized) {
      return NextResponse.json({ message: "Unauthorized Access Level" }, { status: 403 })
    }

    const { data: tournaments, error } = await supabase
      .from('Tournament')
      .select(`
        *,
        creator:User!Tournament_creatorId_fkey(username),
        winner:User!Tournament_winnerId_fkey(username),
        participants:Participant(
          *,
          user:User(username)
        ),
        matches:Match(
          *,
          player1:User!Match_player1Id_fkey(username),
          player2:User!Match_player2Id_fkey(username),
          winner:User!Match_winnerId_fkey(username)
        )
      `)
      .neq('status', 'OFFLINE_INTERNAL')
      .order('createdAt', { ascending: false })

    if (error) throw error

    return NextResponse.json(tournaments)
  } catch (error) {
    console.error('Error fetching tournaments:', error)
    return NextResponse.json({ message: "Operational Failure" }, { status: 500 })
  }
}

// DEV, OWNER, and STAFF can deploy tournaments
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)

    const isAuthorized = session && ['DEV', 'OWNER', 'STAFF'].includes(session.user.role)
    if (!isAuthorized) {
      return NextResponse.json({ message: "Unauthorized Clearance" }, { status: 403 })
    }

    const { name, date, maxPlayers, prize, gameplayMode, roundsPerMatch, startTime } = await req.json()

    if (!name || !date || !maxPlayers || !prize) {
      return NextResponse.json({ message: "Incomplete Parameters" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('Tournament')
      .insert([
        { 
          name, 
          date, 
          maxPlayers, 
          prize, 
          gameplayMode: gameplayMode || 'TOURNAMENT',
          roundsPerMatch: roundsPerMatch || 1,
          startTime: startTime || null,
          creatorId: session.user.id,
          status: 'OPEN'
        }
      ])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ message: "Mission Deployed Successfully", tournament: data }, { status: 201 })
  } catch (error) {
    console.error('Error creating tournament:', error)
    return NextResponse.json({ message: "Deployment Failed" }, { status: 500 })
  }
}

// DEV, OWNER, and STAFF can update mission data
export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions)

    const isAuthorized = session && ['DEV', 'OWNER', 'STAFF'].includes(session.user.role)
    if (!isAuthorized) {
      return NextResponse.json({ message: "Unauthorized Modification" }, { status: 403 })
    }

    const { id, name, date, maxPlayers, prize, status, winnerId, gameplayMode, roundsPerMatch, startTime } = await req.json()

    if (!id) {
      return NextResponse.json({ message: "Target ID Required" }, { status: 400 })
    }

    const updateData = {}
    if (name) updateData.name = name
    if (date) updateData.date = date
    if (maxPlayers) updateData.maxPlayers = maxPlayers
    if (prize) updateData.prize = prize
    if (status) updateData.status = status
    if (winnerId) updateData.winnerId = winnerId
    if (gameplayMode) updateData.gameplayMode = gameplayMode
    if (roundsPerMatch) updateData.roundsPerMatch = roundsPerMatch
    if (startTime) updateData.startTime = startTime

    updateData.updatedAt = new Date().toISOString()

    const { data, error } = await supabase
      .from('Tournament')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ message: "Registry Updated Successfully", tournament: data })
  } catch (error) {
    console.error('Error updating tournament:', error)
    return NextResponse.json({ message: "Sync Failure" }, { status: 500 })
  }
}

// DEV, OWNER, and STAFF can delete tournaments (as per user request)
export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions)

    const isAuthorized = session && ['DEV', 'OWNER', 'STAFF'].includes(session.user.role)
    if (!isAuthorized) {
      return NextResponse.json({ message: "Deletion Unauthorized" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ message: "Target ID Required" }, { status: 400 })
    }

    // Cascade delete depends
    await supabase.from('Match').delete().eq('tournamentId', id)
    await supabase.from('Participant').delete().eq('tournamentId', id)

    const { error } = await supabase
      .from('Tournament')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ message: "Mission Terminated Successfully" })
  } catch (error) {
    console.error('Error deleting tournament:', error)
    return NextResponse.json({ message: "Termination Failed" }, { status: 500 })
  }
}
