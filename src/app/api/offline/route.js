import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { supabase } from "@/lib/supabase"

/**
 * OFFLINE TOURNAMENT SYNC (FIXED)
 * We use the existing 'Tournament' table with a special status 'OFFLINE_INTERNAL'
 * to store global offline state without needing new tables.
 * 
 * FIELD MAPPING:
 * - name: matches (JSON string)
 * - prize: players (JSON string)
 * - maxPlayers: round (current phase)
 * - status: 'OFFLINE_INTERNAL'
 */

const OFFLINE_SIG = 'OFFLINE_INTERNAL'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('Tournament')
      .select('*')
      .eq('status', OFFLINE_SIG)
      .maybeSingle()

    if (error) {
      console.error('Fetch error:', error)
      return NextResponse.json({ players: [], matches: [], round: 1 })
    }

    if (!data) {
      return NextResponse.json({ players: [], matches: [], round: 1 })
    }

    return NextResponse.json({
      players: JSON.parse(data.prize || '[]'),
      matches: JSON.parse(data.name || '[]'),
      round: data.maxPlayers || 1
    })
  } catch (error) {
    console.error('Error fetching offline state:', error)
    return NextResponse.json({ players: [], matches: [], round: 1 })
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    const isAuthorized = session && ['STAFF', 'OWNER', 'DEV'].includes(session.user.role)

    if (!isAuthorized) {
      return NextResponse.json({ message: "Unauthorized Administrative Action" }, { status: 403 })
    }

    const { players, matches, round } = await req.json()

    // 1. Check if the offline tournament placeholder exists
    const { data: existing } = await supabase
      .from('Tournament')
      .select('id')
      .eq('status', OFFLINE_SIG)
      .maybeSingle()

    let result;
    if (existing) {
      // Update
      const { data, error } = await supabase
        .from('Tournament')
        .update({
          name: JSON.stringify(matches || []),
          prize: JSON.stringify(players || []),
          maxPlayers: round || 1,
          updatedAt: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()

      if (error) throw error
      result = data[0]
    } else {
      // Create - Find any existing user ID to be the creator
      const { data: user } = await supabase.from('User').select('id').limit(1).single()

      const { data, error } = await supabase
        .from('Tournament')
        .insert([{
          name: JSON.stringify(matches || []),
          prize: JSON.stringify(players || []),
          maxPlayers: round || 1,
          status: OFFLINE_SIG,
          date: new Date().toISOString(),
          creatorId: user?.id || session.user.id
        }])
        .select()

      if (error) throw error
      result = data[0]
    }

    return NextResponse.json({
      message: "Arena Intelligence Synced",
      state: {
        players: JSON.parse(result.prize),
        matches: JSON.parse(result.name),
        round: result.maxPlayers
      }
    })
  } catch (error) {
    console.error('Sync Error:', error)
    return NextResponse.json({ message: "Global Sync Failure" }, { status: 500 })
  }
}
