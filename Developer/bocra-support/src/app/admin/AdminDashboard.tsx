'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui'
import { STATUS_CONFIG, formatRelativeTime, formatDateTime } from '@/lib/utils'

interface Complaint {
  id: string
  reference_number: string
  complainant_name: string
  phone: string
  email: string | null
  national_id: string | null
  district: string | null
  operator: string
  category: string
  description: string
  date_started: string
  prior_contact: string | null
  resolution_sought: string | null
  status: string
  priority: string
  assigned_to: string | null
  internal_notes: string | null
  resolution_notes: string | null
  created_at: string
  resolved_at: string | null
}

const AGENTS = [
  { id: 'agent-km', name: 'Kagiso Molebatsi', role: 'Telecom Specialist' },
  { id: 'agent-ns', name: 'Naledi Seretse',   role: 'Billing & Disputes' },
  { id: 'agent-tk', name: 'Thabo Kgosi',      role: 'Consumer Rights' },
  { id: 'agent-md', name: 'Mpho Dithebe',     role: 'Network Coverage' },
]

const STATUSES = ['submitted','acknowledged','investigating','resolved','closed']
const PRIORITIES = ['low','normal','high','urgent']

export function AdminDashboard() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [stats, setStats] = useState({ total: 0, open: 0, resolved: 0 })
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [unauthorized, setUnauthorized] = useState(false)
  const [selected, setSelected] = useState<Complaint | null>(null)
  const [saving, setSaving] = useState(false)
  const [editStatus, setEditStatus] = useState('')
  const [editPriority, setEditPriority] = useState('')
  const [editAssigned, setEditAssigned] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [editResolution, setEditResolution] = useState('')
  const [saveMsg, setSaveMsg] = useState('')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setUnauthorized(true); setLoading(false); return }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (!profile || !['admin','agent'].includes(profile.role)) {
      setUnauthorized(true); setLoading(false); return
    }
    const { data } = await supabase
      .from('complaints')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)
    const all = data ?? []
    setComplaints(all)
    setStats({
      total: all.length,
      open: all.filter(c => ['submitted','acknowledged','investigating'].includes(c.status)).length,
      resolved: all.filter(c => c.status === 'resolved').length,
    })
    setLoading(false)
  }

  function openComplaint(c: Complaint) {
    setSelected(c)
    setEditStatus(c.status)
    setEditPriority(c.priority)
    setEditAssigned(c.assigned_to ?? '')
    setEditNotes(c.internal_notes ?? '')
    setEditResolution(c.resolution_notes ?? '')
    setSaveMsg('')
  }

  async function saveChanges() {
    if (!selected) return
    setSaving(true)
    setSaveMsg('')
    const supabase = createClient()
    const updates: any = {
      status: editStatus,
      priority: editPriority,
      assigned_to: editAssigned || null,
      internal_notes: editNotes || null,
      resolution_notes: editResolution || null,
    }
    if (editStatus === 'resolved' && selected.status !== 'resolved') {
      updates.resolved_at = new Date().toISOString()
    }
    const { error } = await supabase.from('complaints').update(updates).eq('id', selected.id)
    if (error) { setSaveMsg('Error saving: ' + error.message); setSaving(false); return }

    // Update local state
    setComplaints(prev => prev.map(c => c.id === selected.id ? { ...c, ...updates } : c))
    setSelected(prev => prev ? { ...prev, ...updates } : null)
    setSaveMsg('Saved successfully!')
    setSaving(false)
    setTimeout(() => setSaveMsg(''), 3000)

    // Refresh stats
    const all = complaints.map(c => c.id === selected.id ? { ...c, ...updates } : c)
    setStats({
      total: all.length,
      open: all.filter(c => ['submitted','acknowledged','investigating'].includes(c.status)).length,
      resolved: all.filter(c => c.status === 'resolved').length,
    })
  }

  if (loading) return (
    <div className="min-h-screen bg-[#f4f6fa] flex items-center justify-center">
      <p className="text-[#8895b0] text-sm">Loading dashboard…</p>
    </div>
  )

  if (unauthorized) return (
    <div className="min-h-screen bg-[#f4f6fa] flex items-center justify-center flex-col gap-3">
      <p className="text-base font-semibold text-[#1a2540]">Access denied</p>
      <p className="text-sm text-[#8895b0]">You need to be signed in as an admin or agent.</p>
      <a href="/" className="text-sm text-[#0a3d8f] hover:underline">← Back to Support Centre</a>
    </div>
  )

  const filtered = complaints.filter(c => {
    const matchStatus = filter === 'all' || c.status === filter
    const matchSearch = !search || [c.reference_number, c.complainant_name, c.operator, c.category]
      .some(f => f?.toLowerCase().includes(search.toLowerCase()))
    return matchStatus && matchSearch
  })

  return (
    <div className="min-h-screen bg-[#f4f6fa] flex flex-col">
      {/* Header */}
      <header className="bg-[#0a3d8f] px-6 py-3.5 flex-shrink-0">
        <div className="flex items-center gap-3 max-w-screen-2xl mx-auto">
          <a href="/" className="text-white/60 hover:text-white text-xs transition-colors">← Support Centre</a>
          <span className="text-white/30">/</span>
          <h1 className="text-white font-bold text-sm" style={{fontFamily:'Syne,sans-serif'}}>Admin Dashboard</h1>
          <div className="ml-auto flex gap-2">
            <button onClick={loadData} className="text-white/60 hover:text-white text-xs border border-white/20 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors">
              ↻ Refresh
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden max-w-screen-2xl mx-auto w-full">
        {/* Left — complaints list */}
        <div className={`flex flex-col overflow-hidden transition-all ${selected ? 'w-[55%]' : 'w-full'}`}>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 p-4">
            {[
              { label: 'Total', value: stats.total, color: 'text-[#0a3d8f]' },
              { label: 'Open', value: stats.open,   color: 'text-amber-600' },
              { label: 'Resolved', value: stats.resolved, color: 'text-green-600' },
            ].map(s => (
              <div key={s.label} className="bg-white border border-[#dde3f0] rounded-xl p-4">
                <p className="text-xs text-[#8895b0]">{s.label}</p>
                <p className={`text-2xl font-bold mt-0.5 ${s.color}`} style={{fontFamily:'Syne,sans-serif'}}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="px-4 pb-3 flex items-center gap-2 flex-wrap">
            <input type="text" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)}
              className="flex-1 min-w-36 px-3 py-1.5 text-sm border border-[#dde3f0] rounded-lg bg-white outline-none focus:border-[#1a5ccc]" />
            <div className="flex gap-1 flex-wrap">
              {['all',...STATUSES].map(s => (
                <button key={s} onClick={() => setFilter(s)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors capitalize ${filter===s?'bg-[#0a3d8f] text-white':'border border-[#dde3f0] text-[#3d5080] hover:bg-white'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <div className="bg-white border border-[#dde3f0] rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#dde3f0] bg-[#f8f9fd]">
                    {['Reference','Complainant','Operator','Status','Priority','Filed'].map(h => (
                      <th key={h} className="px-3 py-2.5 text-left text-[10px] font-semibold text-[#8895b0] uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-[#8895b0]">
                      {complaints.length === 0 ? 'No complaints yet' : 'No matches'}
                    </td></tr>
                  )}
                  {filtered.map(c => {
                    const sc = STATUS_CONFIG[c.status as keyof typeof STATUS_CONFIG]
                    const isSelected = selected?.id === c.id
                    return (
                      <tr key={c.id} onClick={() => openComplaint(c)}
                        className={`border-b border-[#f0f4ff] cursor-pointer transition-colors ${isSelected ? 'bg-blue-50' : 'hover:bg-[#f8f9fd]'}`}>
                        <td className="px-3 py-2.5 font-mono text-xs font-medium text-[#0a3d8f]">{c.reference_number}</td>
                        <td className="px-3 py-2.5 text-[#1a2540] text-xs font-medium">{c.complainant_name}</td>
                        <td className="px-3 py-2.5 text-[#3d5080] text-xs">{c.operator?.split(' ')[0]}</td>
                        <td className="px-3 py-2.5">
                          <Badge className={sc?.cls ?? 'bg-gray-50 text-gray-600 border border-gray-200'}>
                            {sc?.label ?? c.status}
                          </Badge>
                        </td>
                        <td className="px-3 py-2.5">
                          <Badge className={`capitalize text-[10px] ${c.priority==='urgent'?'bg-red-50 text-red-700 border border-red-200':c.priority==='high'?'bg-amber-50 text-amber-700 border border-amber-200':'bg-gray-50 text-gray-500 border border-gray-200'}`}>
                            {c.priority}
                          </Badge>
                        </td>
                        <td className="px-3 py-2.5 text-[10px] text-[#8895b0]">{formatRelativeTime(c.created_at)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right — complaint detail panel */}
        {selected && (
          <div className="w-[45%] border-l border-[#dde3f0] bg-white flex flex-col overflow-hidden">
            {/* Detail header */}
            <div className="px-5 py-3.5 border-b border-[#dde3f0] flex items-center justify-between flex-shrink-0">
              <div>
                <p className="font-mono text-xs font-semibold text-[#0a3d8f]">{selected.reference_number}</p>
                <p className="text-sm font-semibold text-[#1a2540] mt-0.5">{selected.complainant_name}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-[#8895b0] hover:text-[#1a2540] text-lg leading-none transition-colors">×</button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
              {/* Complainant info */}
              <Section title="Complainant">
                <Row label="Phone" value={selected.phone} />
                <Row label="Email" value={selected.email ?? '—'} />
                <Row label="ID" value={selected.national_id ?? '—'} />
                <Row label="District" value={selected.district ?? '—'} />
                <Row label="Filed" value={formatDateTime(selected.created_at)} />
              </Section>

              {/* Complaint info */}
              <Section title="Complaint">
                <Row label="Operator" value={selected.operator} />
                <Row label="Category" value={selected.category} />
                <Row label="Date Started" value={selected.date_started} />
                <Row label="Prior Contact" value={selected.prior_contact ?? '—'} />
                <Row label="Resolution Sought" value={selected.resolution_sought ?? '—'} />
                <div className="mt-2">
                  <p className="text-[10px] text-[#8895b0] uppercase tracking-wider mb-1">Description</p>
                  <p className="text-xs text-[#1a2540] leading-relaxed bg-[#f4f6fa] rounded-lg p-3">{selected.description}</p>
                </div>
              </Section>

              {/* Case management */}
              <Section title="Case Management">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-[10px] text-[#8895b0] uppercase tracking-wider block mb-1">Status</label>
                    <select value={editStatus} onChange={e => setEditStatus(e.target.value)}
                      className="w-full text-xs border border-[#dde3f0] rounded-lg px-2.5 py-1.5 bg-[#f4f6fa] outline-none focus:border-[#1a5ccc]">
                      {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-[#8895b0] uppercase tracking-wider block mb-1">Priority</label>
                    <select value={editPriority} onChange={e => setEditPriority(e.target.value)}
                      className="w-full text-xs border border-[#dde3f0] rounded-lg px-2.5 py-1.5 bg-[#f4f6fa] outline-none focus:border-[#1a5ccc]">
                      {PRIORITIES.map(p => <option key={p} value={p} className="capitalize">{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
                    </select>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="text-[10px] text-[#8895b0] uppercase tracking-wider block mb-1">Assign to Agent</label>
                  <select value={editAssigned} onChange={e => setEditAssigned(e.target.value)}
                    className="w-full text-xs border border-[#dde3f0] rounded-lg px-2.5 py-1.5 bg-[#f4f6fa] outline-none focus:border-[#1a5ccc]">
                    <option value="">Unassigned</option>
                    {AGENTS.map(a => <option key={a.id} value={a.id}>{a.name} — {a.role}</option>)}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="text-[10px] text-[#8895b0] uppercase tracking-wider block mb-1">Internal Notes</label>
                  <textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} rows={3}
                    placeholder="Notes visible only to agents and admins…"
                    className="w-full text-xs border border-[#dde3f0] rounded-lg px-2.5 py-2 bg-[#f4f6fa] outline-none focus:border-[#1a5ccc] resize-none leading-relaxed" />
                </div>
                <div className="mb-4">
                  <label className="text-[10px] text-[#8895b0] uppercase tracking-wider block mb-1">Resolution Notes</label>
                  <textarea value={editResolution} onChange={e => setEditResolution(e.target.value)} rows={3}
                    placeholder="Outcome and resolution details for the complainant…"
                    className="w-full text-xs border border-[#dde3f0] rounded-lg px-2.5 py-2 bg-[#f4f6fa] outline-none focus:border-[#1a5ccc] resize-none leading-relaxed" />
                </div>

                <div className="flex items-center gap-3">
                  <button onClick={saveChanges} disabled={saving}
                    className="flex-1 bg-[#0a3d8f] hover:bg-[#1a5ccc] disabled:opacity-50 text-white text-xs font-semibold py-2 rounded-lg transition-colors">
                    {saving ? 'Saving…' : '✓ Save Changes'}
                  </button>
                  {editStatus === 'resolved' && (
                    <button onClick={() => { setEditStatus('closed'); saveChanges() }}
                      className="text-xs border border-[#dde3f0] text-[#3d5080] px-3 py-2 rounded-lg hover:bg-[#f4f6fa] transition-colors">
                      Mark Closed
                    </button>
                  )}
                </div>
                {saveMsg && (
                  <p className={`text-xs mt-2 text-center font-medium ${saveMsg.includes('Error') ? 'text-red-500' : 'text-green-600'}`}>
                    {saveMsg}
                  </p>
                )}
              </Section>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#f8f9fd] border border-[#dde3f0] rounded-xl p-4">
      <p className="text-[10px] font-bold text-[#0a3d8f] uppercase tracking-widest mb-3" style={{fontFamily:'Syne,sans-serif'}}>{title}</p>
      {children}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1 border-b border-[#eef0f5] last:border-0 gap-3">
      <span className="text-[10.5px] text-[#8895b0] flex-shrink-0">{label}</span>
      <span className="text-[10.5px] text-[#1a2540] text-right font-medium">{value}</span>
    </div>
  )
}
