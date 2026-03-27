'use client'
import { useState, useRef, useEffect } from 'react'
import { TypingBubble } from '@/components/ui'

const AGENTS = [
  { id: 'KM', name: 'Kagiso Molebatsi', role: 'Telecom Specialist', color: '#1a5ccc', status: 'online' },
  { id: 'NS', name: 'Naledi Seretse',   role: 'Billing & Disputes', color: '#16a34a', status: 'online' },
  { id: 'TK', name: 'Thabo Kgosi',      role: 'Consumer Rights',    color: '#d97706', status: 'busy'   },
  { id: 'MD', name: 'Mpho Dithebe',     role: 'Network Coverage',   color: '#7c3aed', status: 'online' },
  { id: 'KT', name: 'Keabetswe Tau',    role: 'Broadcasting',       color: '#64748b', status: 'offline'},
]

interface ChatMessage { role: 'user' | 'agent' | 'system'; content: string; time: string; agentId?: string }

export function LiveChatPanel() {
  const [phase, setPhase] = useState<'waiting' | 'queued' | 'connected'>('waiting')
  const [myPos, setMyPos] = useState<number | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [currentAgent, setCurrentAgent] = useState(AGENTS[0])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [agentTyping, setAgentTyping] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [queueStats, setQueueStats] = useState({ waiting: 4, active: 2, onlineAgents: 3 })
  const history = useRef<{ role: string; content: string }[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const taRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, agentTyping])

  useEffect(() => {
    fetch('/api/queue', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'stats' }) })
      .then(r => r.json()).then(setQueueStats).catch(() => {})
  }, [])

  async function joinQueue() {
    const res = await fetch('/api/queue', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'join' }),
    })
    const data = await res.json()
    setMyPos(data.position)
    setSessionId(data.session?.id ?? null)
    setPhase('queued')
    const waitSecs = data.estimatedWait * 60
    setCountdown(waitSecs)
    startCountdown(waitSecs)
  }

  function startCountdown(secs: number) {
    let s = secs
    timerRef.current = setInterval(() => {
      s--
      setCountdown(s)
      if (s % 90 === 0 && s > 0) setMyPos(p => Math.max(1, (p ?? 1) - 1))
      if (s <= 0) {
        clearInterval(timerRef.current!)
        connectToAgent()
      }
    }, 1000)
  }

  function connectToAgent() {
    const agent = AGENTS.find(a => a.status === 'online') ?? AGENTS[0]
    setCurrentAgent(agent)
    setPhase('connected')
    addSysMsg(`Connected to ${agent.name}`)
    setTimeout(() => addAgentMsg(agent, `Hello! I'm ${agent.name} from BOCRA's ${agent.role} team. Thank you for your patience — how can I assist you today?`), 800)
  }

  function addSysMsg(content: string) {
    setMessages(prev => [...prev, { role: 'system', content, time: now() }])
  }
  function addAgentMsg(agent: typeof AGENTS[0], content: string) {
    setMessages(prev => [...prev, { role: 'agent', content, time: now(), agentId: agent.id }])
    history.current.push({ role: 'assistant', content })
  }

  function now() { return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }

  async function sendMessage() {
    const text = input.trim(); if (!text) return
    setInput(''); if (taRef.current) taRef.current.style.height = 'auto'
    setMessages(prev => [...prev, { role: 'user', content: text, time: now() }])
    history.current.push({ role: 'user', content: text })
    setAgentTyping(true)

    try {
      const res = await fetch('/api/agent', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, sessionId, agentId: currentAgent.id, history: history.current.slice(-8) }),
      })
      const data = await res.json()
      setAgentTyping(false)
      addAgentMsg(currentAgent, data.reply)
    } catch {
      setAgentTyping(false)
      addAgentMsg(currentAgent, "I'm having a connection issue. Please bear with me.")
    }
  }

  async function leaveQueue() {
    if (timerRef.current) clearInterval(timerRef.current)
    if (sessionId) await fetch('/api/queue', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'leave', sessionId }) })
    setPhase('waiting'); setMyPos(null); setSessionId(null); setMessages([])
  }

  const fmtCountdown = (s: number) => { const m = Math.floor(s / 60); return m > 0 ? `${m}m ${s % 60}s` : `${s}s` }

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Queue Sidebar */}
      <div className="w-72 bg-white border-r border-[#dde3f0] flex flex-col overflow-hidden flex-shrink-0">
        <div className="p-4 border-b border-[#dde3f0]">
          <p className="text-[10px] font-bold text-[#0a3d8f] uppercase tracking-widest mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>Queue Dashboard</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Waiting', value: queueStats.waiting, cls: 'text-amber-600' },
              { label: 'Online Agents', value: queueStats.onlineAgents, cls: 'text-green-600' },
              { label: 'Avg Wait', value: '~6 min', cls: 'text-[#0a3d8f]' },
              { label: 'Resolved Today', value: 27, cls: 'text-green-600' },
            ].map(s => (
              <div key={s.label} className="bg-[#f0f4ff] border border-[#dde3f0] rounded-lg p-2.5">
                <p className="text-[10px] text-[#8895b0] uppercase tracking-wider">{s.label}</p>
                <p className={`text-lg font-bold mt-0.5 ${s.cls}`} style={{ fontFamily: 'Syne, sans-serif' }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {/* My position */}
          <p className="text-[10px] font-semibold text-[#8895b0] uppercase tracking-wider mb-2">Your Position</p>
          <div className="bg-gradient-to-br from-[#0a3d8f] to-[#1a5ccc] rounded-xl p-3.5 mb-3 text-white">
            <p className="text-[10px] opacity-70 uppercase tracking-widest">Queue Position</p>
            <p className="text-3xl font-bold mt-0.5 mb-0.5" style={{ fontFamily: 'Syne, sans-serif' }}>
              {phase === 'waiting' ? '—' : phase === 'connected' ? '✓' : `#${myPos}`}
            </p>
            <p className="text-xs opacity-80">
              {phase === 'waiting' ? 'Join the queue to get started' :
               phase === 'connected' ? 'Connected to agent' :
               `Est. wait: ~${fmtCountdown(countdown)}`}
            </p>
            <div className="mt-2.5 h-1 bg-white/20 rounded-full">
              <div className="h-full bg-[#00e5ff] rounded-full transition-all duration-1000"
                style={{ width: phase === 'connected' ? '100%' : phase === 'queued' ? `${Math.max(5, 100 - ((myPos ?? 5) / 5) * 100)}%` : '0%' }} />
            </div>
          </div>

          {/* Agent roster */}
          <p className="text-[10px] font-semibold text-[#8895b0] uppercase tracking-wider mb-2">Agents</p>
          {AGENTS.map(a => (
            <div key={a.id} className="flex items-center gap-2.5 p-2 rounded-lg mb-1">
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: a.color }}>{a.id}</div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${a.status === 'online' ? 'bg-green-500' : a.status === 'busy' ? 'bg-amber-400' : 'bg-[#8895b0]'}`} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#1a2540] truncate">{a.name}</p>
                <p className="text-[10.5px] text-[#8895b0]">{a.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 bg-white border-b border-[#dde3f0] flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ background: currentAgent.color }}>
            {currentAgent.id}
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1a2540]">{phase === 'connected' ? currentAgent.name : 'Support Queue'}</p>
            <p className={`text-xs mt-0.5 ${phase === 'connected' ? 'text-green-600' : 'text-[#0a3d8f]'}`}>
              {phase === 'connected' ? `● ${currentAgent.role} · Connected` :
               phase === 'queued' ? `● Position #${myPos} · Estimated wait ${fmtCountdown(countdown)}` :
               'Not yet joined'}
            </p>
          </div>
          <div className="ml-auto flex gap-2">
            {phase !== 'waiting' && <button onClick={leaveQueue} className="text-xs text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">✕ Leave</button>}
          </div>
        </div>

        {/* Waiting screen */}
        {phase === 'waiting' && (
          <div className="flex-1 flex flex-col items-center justify-center bg-[#f4f6fa] text-center p-8">
            <div className="relative w-24 h-24 mb-5">
              <div className="absolute inset-0 rounded-full border-3 border-white" />
              <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-[#0a3d8f]" style={{ animation: 'spin 1.8s linear infinite' }} />
              <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-[#0a3d8f]" style={{ fontFamily: 'Syne, sans-serif' }}>?</div>
            </div>
            <h3 className="text-lg font-bold text-[#1a2540] mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>Connect to a Live Agent</h3>
            <p className="text-sm text-[#8895b0] mb-1">Our agents handle billing disputes, coverage complaints, consumer rights, and more.</p>
            <p className="text-sm font-mono text-[#0a3d8f]">{queueStats.onlineAgents} agents online · {queueStats.waiting} in queue</p>
            <div className="flex gap-3 mt-5">
              <button onClick={joinQueue} className="bg-[#0a3d8f] hover:bg-[#1a5ccc] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">Join Queue</button>
              <button className="border border-[#dde3f0] text-[#3d5080] text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-white transition-colors">Ask AI Instead</button>
            </div>
          </div>
        )}

        {/* Queued waiting */}
        {phase === 'queued' && (
          <div className="flex-1 flex flex-col items-center justify-center bg-[#f4f6fa] text-center p-8">
            <div className="relative w-24 h-24 mb-5">
              <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-[#0a3d8f]" style={{ animation: 'spin 1.8s linear infinite' }} />
              <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-[#0a3d8f]" style={{ fontFamily: 'Syne, sans-serif' }}>#{myPos}</div>
            </div>
            <h3 className="text-lg font-bold text-[#1a2540] mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>You're #{myPos} in Queue</h3>
            <p className="text-sm text-[#8895b0]">Hang tight — a BOCRA agent will be with you shortly.</p>
            <p className="text-sm font-mono text-[#0a3d8f] mt-1">Estimated wait: {fmtCountdown(countdown)}</p>
          </div>
        )}

        {/* Active chat */}
        {phase === 'connected' && (
          <>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-[#f4f6fa]">
              {messages.map((msg, i) => (
                <div key={i} className={`animate-slide-up ${msg.role === 'system' ? 'self-center' : msg.role === 'user' ? 'self-end' : 'self-start'}`}>
                  {msg.role === 'system' && (
                    <span className="text-xs text-[#8895b0] bg-white border border-[#dde3f0] px-3 py-1 rounded-full">{msg.content}</span>
                  )}
                  {msg.role !== 'system' && (
                    <div className={`flex gap-2 max-w-[76%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-0.5"
                        style={{ background: msg.role === 'user' ? '#0a3d8f' : currentAgent.color }}>
                        {msg.role === 'user' ? 'You' : currentAgent.id}
                      </div>
                      <div>
                        <div className={`px-3.5 py-2.5 rounded-xl text-sm leading-relaxed ${
                          msg.role === 'user' ? 'bg-[#0a3d8f] text-white rounded-tr-sm' : 'bg-white border border-[#dde3f0] text-[#1a2540] rounded-tl-sm'
                        }`}>{msg.content}</div>
                        <p className={`text-[10px] text-[#8895b0] mt-1 ${msg.role === 'user' ? 'text-right' : ''}`}>
                          {msg.role === 'user' ? 'You' : currentAgent.name} · {msg.time}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {agentTyping && (
                <div className="flex gap-2 self-start">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0" style={{ background: currentAgent.color }}>{currentAgent.id}</div>
                  <div className="bg-white border border-[#dde3f0] rounded-xl rounded-tl-sm"><TypingBubble /></div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
            <div className="bg-white border-t border-[#dde3f0] p-3 flex gap-2 items-end">
              <div className="flex-1 bg-[#f0f4ff] border border-[#dde3f0] rounded-xl flex items-end px-3 py-1 focus-within:border-[#1a5ccc] focus-within:ring-2 focus-within:ring-[#0a3d8f]/10 transition-all">
                <textarea ref={taRef} rows={1} value={input}
                  onChange={e => { setInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 88) + 'px' }}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                  placeholder="Type your message…"
                  className="flex-1 bg-transparent text-sm text-[#1a2540] placeholder:text-[#8895b0] outline-none resize-none py-2 max-h-22 leading-relaxed"
                />
              </div>
              <button onClick={sendMessage} disabled={!input.trim()}
                className="w-9 h-9 bg-[#0a3d8f] hover:bg-[#1a5ccc] disabled:opacity-40 rounded-lg flex items-center justify-center flex-shrink-0 mb-0.5 transition-all">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
