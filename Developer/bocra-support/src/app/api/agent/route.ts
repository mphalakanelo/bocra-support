//import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabase/server'

//const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const AGENTS = [
  { id: 'KM', name: 'Kagiso Molebatsi', role: 'Telecom Specialist', color: '#1a5ccc' },
  { id: 'NS', name: 'Naledi Seretse',   role: 'Billing & Disputes', color: '#16a34a' },
  { id: 'TK', name: 'Thabo Kgosi',      role: 'Consumer Rights',    color: '#d97706' },
  { id: 'MD', name: 'Mpho Dithebe',     role: 'Network Coverage',   color: '#7c3aed' },
]

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId, agentId, history } = await req.json()
    const agent = AGENTS.find(a => a.id === agentId) ?? AGENTS[0]

    const systemPrompt = `You are ${agent.name}, a human BOCRA support agent specialising in ${agent.role}. Live text chat with a consumer. Be professional, empathetic, concise (2-4 sentences). Stay in character as human — never mention AI. Reference BOCRA regulations when helpful. Context: ${(history || []).slice(-6).map((m: {role:string;content:string}) => `${m.role}: ${m.content}`).join(' | ')}`

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      system: systemPrompt,
      messages: [{ role: 'user', content: message }],
    })

    const reply = response.content.map(b => b.type === 'text' ? b.text : '').join('')

    if (sessionId) {
      const supabase = await createServiceSupabaseClient()
      await supabase.from('chat_messages').insert([
        { session_id: sessionId, role: 'user',  content: message },
        { session_id: sessionId, role: 'agent', content: reply   },
      ])
    }

    return NextResponse.json({ reply, agent })
  } catch (err) {
    console.error('Agent chat error:', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
