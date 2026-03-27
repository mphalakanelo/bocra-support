'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { TypingBubble } from '@/components/ui'
import { KB_SIDEBAR_DATA } from '@/components/kb/kbData'
import type { Tab } from '@/types'

interface Message {
  role: 'user' | 'assistant'
  content: string
  complaintData?: Record<string, string>
  refNumber?: string
}

const QUICK_REPLIES_INIT = [
  { label: '📝 File a complaint', text: 'I want to file a complaint' },
  { label: '⚖️ My rights',        text: 'What are my consumer rights as a telecom user?' },
  { label: '❓ Complaint process', text: 'How does the BOCRA complaint process work?' },
  { label: '💳 Billing dispute',   text: 'I have a billing dispute with my operator' },
]

interface AIChatPanelProps {
  onNavigate: (tab: Tab) => void
}

export function AIChatPanel({ onNavigate }: AIChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sidebarQuery, setSidebarQuery] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const taRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    // Greeting message
    setMessages([{
      role: 'assistant',
      content: `Welcome to **BOCRA Support Centre** 👋\n\nI'm your AI assistant, backed by BOCRA's full knowledge base on regulations, consumer rights, complaint procedures, and all licensed operators in Botswana.\n\nHow can I help you today?`,
    }])
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  function autoResize(el: HTMLTextAreaElement) {
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 88) + 'px'
  }

  function extractComplaintJSON(text: string) {
    const match = text.match(/```json\n([\s\S]*?)\n```/)
    if (!match) return null
    try { return JSON.parse(match[1]) } catch { return null }
  }

  function cleanContent(text: string) {
    return text.replace(/```json\n[\s\S]*?\n```/g, '').trim()
  }

  const sendMessage = useCallback(async (text?: string) => {
    const content = (text ?? input).trim()
    if (!content || loading) return
    setInput('')
    if (taRef.current) { taRef.current.style.height = 'auto' }

    const userMsg: Message = { role: 'user', content }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }))

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      })

      if (!res.ok || !res.body) throw new Error('Stream failed')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''
      const assistantId = Date.now()

      setMessages(prev => [...prev, { role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '))
        for (const line of lines) {
          const data = line.slice(6)
          if (data === '[DONE]') break
          try {
            const { text } = JSON.parse(data)
            fullText += text
            setMessages(prev => {
              const updated = [...prev]
              updated[updated.length - 1] = { role: 'assistant', content: fullText }
              return updated
            })
          } catch {}
        }
      }

      // Check for complaint JSON
      const complaintData = extractComplaintJSON(fullText)
      if (complaintData) {
        const ds = new Date().toISOString().slice(0, 10).replace(/-/g, '')
        const ref = `BCR-${ds}-${Math.floor(1000 + Math.random() * 9000)}`
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            role: 'assistant',
            content: cleanContent(fullText),
            complaintData,
            refNumber: ref,
          }
          return updated
        })
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Connection error. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }, [input, messages, loading])

  function injectKBArticle(title: string, body: string, source: string) {
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: `**📚 Knowledge Base: ${title}**\n\n${body}\n\n*Source: ${source}*`,
    }])
  }

  const filteredSidebar = KB_SIDEBAR_DATA.map(cat => ({
    ...cat,
    articles: cat.articles.filter(a =>
      !sidebarQuery || a.title.toLowerCase().includes(sidebarQuery.toLowerCase())
    ),
  })).filter(cat => !sidebarQuery || cat.articles.length > 0)

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* KB Sidebar */}
      <div className="w-64 bg-white border-r border-[#dde3f0] flex flex-col overflow-hidden flex-shrink-0">
        <div className="p-3 border-b border-[#dde3f0]">
          <p className="text-[10px] font-bold text-[#0a3d8f] uppercase tracking-widest mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>📚 Quick Reference</p>
          <div className="flex items-center gap-2 bg-[#f0f4ff] border border-[#dde3f0] rounded-lg px-2.5 py-1.5">
            <span className="text-[#8895b0] text-xs">🔍</span>
            <input
              type="text"
              placeholder="Search articles…"
              value={sidebarQuery}
              onChange={e => setSidebarQuery(e.target.value)}
              className="flex-1 bg-transparent text-xs text-[#1a2540] placeholder:text-[#8895b0] outline-none"
            />
          </div>
        </div>
        <div className="overflow-y-auto flex-1 p-2">
          {filteredSidebar.map(cat => (
            <KBCategoryAccordion
              key={cat.id}
              cat={cat}
              onSelect={(title, body, source) => injectKBArticle(title, body, source)}
            />
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 bg-white border-b border-[#dde3f0] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0a3d8f] to-[#00b4d8] flex items-center justify-center text-white text-sm flex-shrink-0">🤖</div>
          <div>
            <p className="text-sm font-semibold text-[#1a2540]">BOCRA AI Assistant</p>
            <p className="text-xs text-[#8895b0]">Knowledge base · Complaint filing · Regulations</p>
          </div>
          <div className="ml-auto flex gap-2">
            <button onClick={() => onNavigate('live')} className="text-xs text-[#3d5080] border border-[#dde3f0] px-3 py-1.5 rounded-lg hover:bg-[#f0f4ff] transition-colors">👤 Live Agent</button>
            <button onClick={() => onNavigate('complaint')} className="text-xs text-[#3d5080] border border-[#dde3f0] px-3 py-1.5 rounded-lg hover:bg-[#f0f4ff] transition-colors">📋 File Complaint</button>
            <button onClick={() => { setMessages([]); setTimeout(() => setMessages([{ role: 'assistant', content: 'Welcome back! How can I help you today?' }]), 50) }} className="text-xs text-[#8895b0] border border-[#dde3f0] px-2.5 py-1.5 rounded-lg hover:bg-[#f0f4ff]">🗑</button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-[#f4f6fa]">
          {messages.map((msg, i) => (
            <ChatMessage key={i} msg={msg} onNavigate={onNavigate} />
          ))}
          {loading && (
            <div className="flex gap-2 max-w-[80%]">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#0a3d8f] to-[#00b4d8] flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">AI</div>
              <div className="bg-white border border-[#dde3f0] rounded-xl rounded-tl-sm shadow-sm">
                <TypingBubble />
              </div>
            </div>
          )}
          {/* Initial quick replies */}
          {messages.length === 1 && !loading && (
            <div className="flex flex-wrap gap-2 mt-1">
              {QUICK_REPLIES_INIT.map(qr => (
                <button key={qr.text} onClick={() => sendMessage(qr.text)}
                  className="text-xs border border-[#1a5ccc] text-[#0a3d8f] px-3 py-1.5 rounded-full hover:bg-[#0a3d8f] hover:text-white transition-colors">
                  {qr.label}
                </button>
              ))}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="bg-white border-t border-[#dde3f0] p-3 flex gap-2 items-end">
          <div className="flex-1 bg-[#f0f4ff] border border-[#dde3f0] rounded-xl flex items-end px-3 py-1 focus-within:border-[#1a5ccc] focus-within:ring-2 focus-within:ring-[#0a3d8f]/10 transition-all">
            <textarea
              ref={taRef}
              rows={1}
              value={input}
              onChange={e => { setInput(e.target.value); autoResize(e.target) }}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
              placeholder="Ask about regulations, complaints, consumer rights…"
              className="flex-1 bg-transparent text-sm text-[#1a2540] placeholder:text-[#8895b0] outline-none resize-none py-2 max-h-22 leading-relaxed"
            />
          </div>
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="w-9 h-9 bg-[#0a3d8f] hover:bg-[#1a5ccc] disabled:opacity-40 rounded-lg flex items-center justify-center flex-shrink-0 transition-all hover:scale-105 disabled:hover:scale-100 mb-0.5"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </div>
      </div>
    </div>
  )
}

function KBCategoryAccordion({ cat, onSelect }: { cat: any; onSelect: (t: string, b: string, s: string) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="mb-1">
      <button onClick={() => setOpen(!open)} className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${open ? 'bg-[#f0f4ff] text-[#0a3d8f]' : 'text-[#3d5080] hover:bg-[#f0f4ff]'}`}>
        <span>{cat.icon} {cat.title}</span>
        <span className="text-[#8895b0]">{open ? '▾' : '›'}</span>
      </button>
      {open && (
        <div className="pl-2 mt-1 space-y-0.5">
          {cat.articles.map((a: any) => (
            <button key={a.id} onClick={() => onSelect(a.title, a.body, a.source)}
              className="w-full text-left text-[11.5px] text-[#3d5080] px-2.5 py-1.5 rounded-md hover:bg-[#e8f4ff] hover:text-[#0a3d8f] border-l-2 border-transparent hover:border-[#00b4d8] transition-all">
              {a.title}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function renderMarkdown(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '</p><p class="mt-2">')
    .replace(/\n/g, '<br />')
}

function ChatMessage({ msg, onNavigate }: { msg: Message; onNavigate: (tab: Tab) => void }) {
  const isUser = msg.role === 'user'

  return (
    <div className={`flex gap-2 max-w-[82%] animate-slide-up ${isUser ? 'self-end flex-row-reverse' : 'self-start'}`}>
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5 ${
        isUser ? 'bg-[#f0f4ff] border border-[#dde3f0] text-[#8895b0]' : 'bg-gradient-to-br from-[#0a3d8f] to-[#00b4d8] text-white'
      }`}>
        {isUser ? 'You' : 'AI'}
      </div>
      <div className={`rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
        isUser
          ? 'bg-[#0a3d8f] text-white rounded-tr-sm'
          : 'bg-white border border-[#dde3f0] text-[#1a2540] rounded-tl-sm shadow-sm'
      }`}>
        <div dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />

        {/* Complaint summary card */}
        {msg.complaintData && (
          <div className="mt-3 bg-white border border-[#dde3f0] border-l-4 border-l-[#0a3d8f] rounded-xl p-3">
            <p className="text-[10px] font-bold text-[#0a3d8f] uppercase tracking-widest mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>📋 Complaint Summary</p>
            {Object.entries(msg.complaintData).filter(([, v]) => v).map(([k, v]) => (
              <div key={k} className="flex justify-between py-1 border-b border-[#f0f4ff] last:border-0 gap-3">
                <span className="text-xs text-[#8895b0] capitalize flex-shrink-0">{k.replace(/_/g, ' ')}</span>
                <span className="text-xs text-[#1a2540] text-right">{v as string}</span>
              </div>
            ))}
            <div className="mt-2.5 flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5">
              <span className="text-green-600 text-xs">✓</span>
              <span className="font-mono text-xs text-green-700 font-medium">{msg.refNumber}</span>
            </div>
            <div className="flex gap-1.5 mt-2.5 flex-wrap">
              {['Collected', 'Filed', 'Under Review', 'Resolution'].map((s, i) => (
                <span key={s} className={`text-[10px] px-2 py-0.5 rounded border uppercase tracking-wider ${
                  i < 2 ? 'bg-green-50 border-green-200 text-green-700' :
                  i === 2 ? 'bg-blue-50 border-blue-200 text-blue-700' :
                  'border-[#dde3f0] text-[#8895b0]'
                }`}>{s}</span>
              ))}
            </div>
            <button onClick={() => onNavigate('complaint')} className="mt-3 w-full text-xs bg-[#0a3d8f] text-white py-1.5 rounded-lg hover:bg-[#1a5ccc] transition-colors">
              File formal complaint →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
