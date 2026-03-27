'use client'
import { useState } from 'react'
import { AuthProvider, useAuth } from '@/hooks/useAuth'
import { AuthModal } from '@/components/AuthModal'
import { AIChatPanel } from '@/components/chat/AIChatPanel'
import { KnowledgeBasePanel } from '@/components/kb/KnowledgeBasePanel'
import { LiveChatPanel } from '@/components/live/LiveChatPanel'
import { ComplaintFormPanel } from '@/components/complaint/ComplaintFormPanel'

type Tab = 'ai' | 'kb' | 'live' | 'complaint'

function SupportCentreInner() {
  const [activeTab, setActiveTab] = useState<Tab>('ai')
  const [showAuth, setShowAuth] = useState(false)
  const { user, profile, signOut } = useAuth()

  const tabs: { id: Tab; label: string; icon: string; badge?: string }[] = [
    { id: 'ai',        icon: '🤖', label: 'AI Assistant' },
    { id: 'kb',        icon: '📚', label: 'Knowledge Base' },
    { id: 'live',      icon: '💬', label: 'Live Chat' },
    { id: 'complaint', icon: '📋', label: 'File Complaint' },
  ]

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#f4f6fa]">
      {/* Top bar */}
      <header className="h-14 bg-[#0a3d8f] flex items-center gap-4 px-6 flex-shrink-0 shadow-lg shadow-[#0a3d8f]/20">
        <div className="flex items-center gap-2.5 text-white font-bold text-base" style={{ fontFamily: 'Syne, sans-serif' }}>
          <span>🇧🇼</span>
          <span>BOCRA Support Centre</span>
          <span className="bg-[#00b4d8] text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest">Beta</span>
        </div>

        {/* Nav tabs */}
        <nav className="ml-auto flex gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white/20 text-white'
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Auth */}
        <div className="ml-4 flex items-center gap-2">
          {user ? (
            <>
              <span className="text-white/70 text-xs">{profile?.full_name || user.email}</span>
              <button onClick={signOut} className="text-white/50 hover:text-white text-xs px-2 py-1 rounded-lg hover:bg-white/10 transition-colors">Sign out</button>
              {profile?.role === 'admin' && (
                <a href="/admin" className="text-white/70 hover:text-white text-xs px-2 py-1 rounded-lg hover:bg-white/10 transition-colors">Admin ↗</a>
              )}
            </>
          ) : (
            <button onClick={() => setShowAuth(true)} className="text-xs text-white/70 hover:text-white border border-white/20 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors">
              Sign in
            </button>
          )}
        </div>
      </header>

      {/* Panels */}
      <main className="flex-1 overflow-hidden">
        <div className={activeTab === 'ai' ? 'flex h-full' : 'hidden'}><AIChatPanel onNavigate={setActiveTab} /></div>
        <div className={activeTab === 'kb' ? 'flex h-full' : 'hidden'}><KnowledgeBasePanel /></div>
        <div className={activeTab === 'live' ? 'flex h-full' : 'hidden'}><LiveChatPanel /></div>
        <div className={activeTab === 'complaint' ? 'flex h-full' : 'hidden'}><ComplaintFormPanel onNavigate={setActiveTab} /></div>
      </main>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  )
}

export function SupportCentre() {
  return (
    <AuthProvider>
      <SupportCentreInner />
    </AuthProvider>
  )
}
