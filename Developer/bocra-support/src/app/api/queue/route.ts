import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { action, sessionId, userId } = await req.json()
    const supabase = await createServiceSupabaseClient()

    if (action === 'join') {
      const { count } = await supabase
        .from('chat_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'queued')
      const position = (count ?? 0) + 1
      const { data: session, error } = await supabase
        .from('chat_sessions')
        .insert({ user_id: userId ?? null, status: 'queued', queue_position: position, session_type: 'live' })
        .select().single()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      await supabase.from('chat_messages').insert({ session_id: session.id, role: 'system', content: `You joined the queue at position #${position}` })
      return NextResponse.json({ session, position, estimatedWait: position * 2 })
    }

    if (action === 'leave' && sessionId) {
      await supabase.from('chat_sessions').update({ status: 'abandoned', ended_at: new Date().toISOString() }).eq('id', sessionId)
      return NextResponse.json({ success: true })
    }

    if (action === 'stats') {
      const { count: waiting } = await supabase.from('chat_sessions').select('*', { count: 'exact', head: true }).eq('status', 'queued')
      const { count: active }  = await supabase.from('chat_sessions').select('*', { count: 'exact', head: true }).eq('status', 'active')
      return NextResponse.json({ waiting: waiting ?? 0, active: active ?? 0, onlineAgents: 3 })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err) {
    console.error('Queue error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
