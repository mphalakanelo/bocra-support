'use client'
import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Input, Select, Textarea, Button } from '@/components/ui'
import { toast } from '@/components/ui/Toaster'
import { OPERATORS, CATEGORIES, DISTRICTS } from '@/lib/utils'
import type { Tab } from '@/types'

interface FormData {
  fname: string; lname: string; national_id: string; phone: string
  email: string; district: string; address: string
  operator: string; category: string; date_started: string
  account_number: string; description: string; prior_contact: string; resolution_sought: string
}

const STEPS = [
  { n: 1, label: 'Personal',  icon: '👤' },
  { n: 2, label: 'Complaint', icon: '📋' },
  { n: 3, label: 'Evidence',  icon: '📎' },
  { n: 4, label: 'Review',    icon: '✅' },
]

export function ComplaintFormPanel({ onNavigate }: { onNavigate: (tab: Tab) => void }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>({
    fname: '', lname: '', national_id: '', phone: '', email: '', district: '', address: '',
    operator: '', category: '', date_started: '', account_number: '',
    description: '', prior_contact: 'Yes — no satisfactory resolution', resolution_sought: 'Refund / Credit',
  })
  const [files, setFiles] = useState<File[]>([])
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [refNumber, setRefNumber] = useState('')

  const set = (k: keyof FormData, v: string) => setForm(f => ({ ...f, [k]: v }))

  const onDrop = useCallback((accepted: File[]) => {
    const filtered = accepted.filter(f => f.size <= 5 * 1024 * 1024)
    if (filtered.length < accepted.length) toast('Some files exceed 5MB and were skipped.', 'error')
    setFiles(prev => {
      const existing = new Set(prev.map(f => f.name))
      return [...prev, ...filtered.filter(f => !existing.has(f.name))]
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/pdf': [], 'image/jpeg': [], 'image/png': [], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [] },
    maxSize: 5 * 1024 * 1024,
  })

  function validate(s: number) {
    const e: Partial<FormData> = {}
    if (s === 1) {
      if (!form.fname.trim())    e.fname    = 'Required'
      if (!form.lname.trim())    e.lname    = 'Required'
      if (!form.phone.trim())    e.phone    = 'Required'
      if (!form.district)        e.district = 'Required'
    }
    if (s === 2) {
      if (!form.operator)        e.operator    = 'Required'
      if (!form.category)        e.category    = 'Required'
      if (!form.date_started)    e.date_started = 'Required'
      if (form.description.trim().length < 20) e.description = 'Please provide at least 20 characters'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function next() { if (validate(step)) setStep(s => s + 1) }
  function prev() { setStep(s => s - 1) }

  async function submit() {
    setSubmitting(true)
    try {
      const res = await fetch('/api/complaints', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          complainant_name: `${form.fname} ${form.lname}`,
          phone: form.phone, email: form.email || undefined,
          national_id: form.national_id || undefined,
          district: form.district, address: form.address || undefined,
          operator: form.operator, category: form.category,
          description: form.description, date_started: form.date_started,
          account_number: form.account_number || undefined,
          prior_contact: form.prior_contact,
          resolution_sought: form.resolution_sought,
        }),
      })
      const data = await res.json()
      if (!res.ok) { toast(data.error ?? 'Submission failed', 'error'); return }

      // Upload files if any
      if (files.length && data.complaint_id) {
        const fd = new FormData()
        fd.append('complaint_id', data.complaint_id)
        files.forEach(f => fd.append('files', f))
        await fetch('/api/complaints/attachments', { method: 'POST', body: fd })
      }

      setRefNumber(data.reference_number)
      setSubmitted(true)
      toast('Complaint submitted successfully!', 'success')
    } catch {
      toast('Submission failed. Please try again.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  function resetForm() {
    setStep(1); setSubmitted(false); setRefNumber(''); setFiles([])
    setForm({ fname: '', lname: '', national_id: '', phone: '', email: '', district: '', address: '', operator: '', category: '', date_started: '', account_number: '', description: '', prior_contact: 'Yes — no satisfactory resolution', resolution_sought: 'Refund / Credit' })
  }

  if (submitted) return <SuccessScreen refNumber={refNumber} onTrack={() => onNavigate('ai')} onNew={resetForm} />

  return (
    <div className="flex-1 overflow-y-auto bg-[#f4f6fa]">
      <div className="max-w-2xl mx-auto p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-[#0a3d8f]" style={{ fontFamily: 'Syne, sans-serif' }}>📋 File a Formal Complaint</h2>
          <p className="text-sm text-[#8895b0] mt-1">Submit a structured complaint — you'll receive a reference number and case updates.</p>
        </div>

        {/* Step tracker */}
        <div className="flex items-center mb-7">
          {STEPS.map((s, i) => (
            <div key={s.n} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  s.n < step ? 'bg-green-500 text-white' : s.n === step ? 'bg-[#0a3d8f] text-white' : 'bg-white border border-[#dde3f0] text-[#8895b0]'
                }`}>{s.n < step ? '✓' : s.n}</div>
                <span className={`text-[10px] mt-1 font-medium ${s.n === step ? 'text-[#0a3d8f]' : s.n < step ? 'text-green-600' : 'text-[#8895b0]'}`}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 mb-4 ${s.n < step ? 'bg-green-400' : 'bg-[#dde3f0]'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Personal */}
        {step === 1 && (
          <div>
            <FormCard title="Personal Information">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <Input label="First Name *" placeholder="Kagiso" value={form.fname} onChange={e => set('fname', e.target.value)} error={errors.fname} />
                <Input label="Last Name *" placeholder="Molebatsi" value={form.lname} onChange={e => set('lname', e.target.value)} error={errors.lname} />
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <Input label="Omang / National ID" placeholder="123456789" value={form.national_id} onChange={e => set('national_id', e.target.value)} />
                <Input label="Phone Number *" type="tel" placeholder="+267 72 123 456" value={form.phone} onChange={e => set('phone', e.target.value)} error={errors.phone} />
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <Input label="Email Address" type="email" placeholder="your@email.com" value={form.email} onChange={e => set('email', e.target.value)} hint="For case updates" />
                <Select label="District / Town *" value={form.district} onChange={e => set('district', e.target.value)} error={errors.district}>
                  <option value="">Select district…</option>
                  {DISTRICTS.map(d => <option key={d}>{d}</option>)}
                </Select>
              </div>
              <Input label="Physical Address" placeholder="Plot / Street, Town" value={form.address} onChange={e => set('address', e.target.value)} />
            </FormCard>
            <div className="flex justify-end mt-4"><Button onClick={next}>Continue →</Button></div>
          </div>
        )}

        {/* Step 2: Complaint */}
        {step === 2 && (
          <div>
            <FormCard title="Complaint Details">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <Select label="Service Operator *" value={form.operator} onChange={e => set('operator', e.target.value)} error={errors.operator}>
                  <option value="">Select operator…</option>
                  {OPERATORS.map(o => <option key={o}>{o}</option>)}
                </Select>
                <Select label="Complaint Category *" value={form.category} onChange={e => set('category', e.target.value)} error={errors.category}>
                  <option value="">Select category…</option>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <Input label="Date Issue Started *" type="date" value={form.date_started} onChange={e => set('date_started', e.target.value)} error={errors.date_started} />
                <Input label="Account / Contract Number" placeholder="Optional" value={form.account_number} onChange={e => set('account_number', e.target.value)} />
              </div>
              <Textarea label="Detailed Description *" rows={4} placeholder="Describe the issue clearly — what happened, when, how it affected you, and what the operator said…" value={form.description} onChange={e => set('description', e.target.value)} error={errors.description} className="mb-3" />
              <div className="grid grid-cols-2 gap-3">
                <Select label="Did you contact the operator first?" value={form.prior_contact} onChange={e => set('prior_contact', e.target.value)}>
                  <option>Yes — no satisfactory resolution</option>
                  <option>Yes — no response received</option>
                  <option>No — not yet</option>
                </Select>
                <Select label="Expected Resolution" value={form.resolution_sought} onChange={e => set('resolution_sought', e.target.value)}>
                  <option>Refund / Credit</option>
                  <option>Service Fix / Restoration</option>
                  <option>Formal Apology</option>
                  <option>Regulatory Action Against Operator</option>
                  <option>Investigation Only</option>
                </Select>
              </div>
            </FormCard>
            <div className="flex justify-between mt-4">
              <Button variant="secondary" onClick={prev}>← Back</Button>
              <Button onClick={next}>Continue →</Button>
            </div>
          </div>
        )}

        {/* Step 3: Evidence */}
        {step === 3 && (
          <div>
            <FormCard title="Supporting Evidence">
              <p className="text-xs text-[#8895b0] mb-3">Upload screenshots, bills, receipts, or any documents supporting your complaint. Evidence is optional but strongly recommended.</p>
              <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${isDragActive ? 'border-[#1a5ccc] bg-[#f0f7ff]' : 'border-[#c8d2e8] bg-[#f0f4ff] hover:border-[#1a5ccc]'}`}>
                <input {...getInputProps()} />
                <div className="text-3xl mb-2">📎</div>
                <p className="text-sm text-[#8895b0]"><strong className="text-[#0a3d8f]">Click to upload</strong> or drag &amp; drop</p>
                <p className="text-xs text-[#8895b0] mt-1">PDF, JPG, PNG, DOCX · Max 5MB per file</p>
              </div>
              {files.length > 0 && (
                <div className="mt-3 space-y-2">
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 bg-white border border-[#dde3f0] rounded-lg px-3 py-2">
                      <span className="text-base">{f.type.includes('pdf') ? '📄' : f.type.includes('image') ? '🖼️' : '📝'}</span>
                      <span className="flex-1 text-xs text-[#1a2540] truncate">{f.name}</span>
                      <span className="text-xs text-[#8895b0]">{(f.size / 1024).toFixed(0)}KB</span>
                      <button onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))} className="text-[#8895b0] hover:text-red-500 text-sm transition-colors">×</button>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-3 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs text-green-700">
                ✅ Complaints with supporting documents are resolved 40% faster.
              </div>
            </FormCard>
            <div className="flex justify-between mt-4">
              <Button variant="secondary" onClick={prev}>← Back</Button>
              <Button onClick={next}>Review →</Button>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div>
            <FormCard title="Review Your Submission">
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  ['Full Name', `${form.fname} ${form.lname}`], ['National ID', form.national_id || '—'],
                  ['Phone', form.phone], ['Email', form.email || '—'],
                  ['District', form.district], ['Operator', form.operator],
                  ['Category', form.category], ['Issue Date', form.date_started],
                  ['Prior Contact', form.prior_contact], ['Resolution', form.resolution_sought],
                ].map(([l, v]) => (
                  <div key={l} className="bg-[#f0f4ff] border border-[#dde3f0] rounded-lg p-2.5">
                    <p className="text-[10px] text-[#8895b0] uppercase tracking-wider mb-0.5">{l}</p>
                    <p className="text-xs text-[#1a2540] font-medium">{v}</p>
                  </div>
                ))}
                <div className="col-span-2 bg-[#f0f4ff] border border-[#dde3f0] rounded-lg p-2.5">
                  <p className="text-[10px] text-[#8895b0] uppercase tracking-wider mb-0.5">Description</p>
                  <p className="text-xs text-[#1a2540]">{form.description}</p>
                </div>
                <div className="col-span-2 bg-[#f0f4ff] border border-[#dde3f0] rounded-lg p-2.5">
                  <p className="text-[10px] text-[#8895b0] uppercase tracking-wider mb-0.5">Files Attached</p>
                  <p className="text-xs text-[#1a2540]">{files.length ? files.map(f => f.name).join(', ') : 'None'}</p>
                </div>
              </div>
            </FormCard>
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800 mb-4">
              ⚠️ By submitting, you confirm the information provided is accurate and complete.
            </div>
            <div className="flex justify-between">
              <Button variant="secondary" onClick={prev}>← Edit</Button>
              <Button onClick={submit} loading={submitting} className="bg-green-600 hover:bg-green-700 min-w-36">✅ Submit Complaint</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function FormCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#dde3f0] rounded-xl p-5 mb-0">
      <p className="text-[10px] font-bold text-[#0a3d8f] uppercase tracking-widest mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>{title}</p>
      {children}
    </div>
  )
}

function SuccessScreen({ refNumber, onTrack, onNew }: { refNumber: string; onTrack: () => void; onNew: () => void }) {
  return (
    <div className="flex-1 overflow-y-auto bg-[#f4f6fa] flex items-center justify-center p-6">
      <div className="bg-white border border-[#dde3f0] rounded-2xl p-10 text-center max-w-md w-full shadow-sm">
        <div className="text-5xl mb-4">✅</div>
        <h3 className="text-xl font-bold text-green-600 mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>Complaint Submitted!</h3>
        <p className="text-sm text-[#3d5080] mb-4">BOCRA has received your complaint. We will investigate and respond within <strong>14 working days</strong>.</p>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 inline-block mb-4">
          <p className="text-[10px] text-[#8895b0] uppercase tracking-wider mb-1">Reference Number</p>
          <p className="font-mono text-lg font-medium text-green-700">{refNumber}</p>
        </div>
        <p className="text-xs text-[#8895b0] mb-6">Save this reference to track your case. Confirmation will be sent to your email if provided.</p>
        <div className="flex gap-3 justify-center">
          <Button onClick={onTrack}>💬 Track with AI</Button>
          <Button variant="secondary" onClick={onNew}>📋 New Complaint</Button>
        </div>
      </div>
    </div>
  )
}
