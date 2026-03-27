'use client'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button, Input } from '@/components/ui'
import { toast } from '@/components/ui/Toaster'

export function AuthModal({ onClose, defaultMode = 'signin' }: { onClose: () => void; defaultMode?: 'signin' | 'signup' }) {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>(defaultMode)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', fullName: '' })
  const [generalError, setGeneralError] = useState('')

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setGeneralError('')
    if (mode === 'signup') {
      const { error } = await signUpWithEmail(form.email, form.password, form.fullName)
      if (error) { setGeneralError(error); setLoading(false); return }
      toast('Account created! Check your email to verify.', 'success')
      onClose()
    } else {
      const { error } = await signInWithEmail(form.email, form.password)
      if (error) { setGeneralError('Invalid email or password'); setLoading(false); return }
      toast('Welcome back!', 'success')
      onClose()
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-7" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-[#0a3d8f]" style={{fontFamily:'Syne,sans-serif'}}>
              {mode === 'signin' ? 'Sign in' : 'Create account'}
            </h2>
            <p className="text-xs text-[#8895b0] mt-0.5">BOCRA Support Centre</p>
          </div>
          <button onClick={onClose} className="text-[#8895b0] hover:text-[#1a2540] text-xl">×</button>
        </div>

        <button onClick={signInWithGoogle} className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-[#dde3f0] rounded-xl text-sm font-medium text-[#1a2540] hover:bg-[#f0f4ff] transition-colors mb-4">
          <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-[#dde3f0]" /><span className="text-xs text-[#8895b0]">or</span><div className="flex-1 h-px bg-[#dde3f0]" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {mode === 'signup' && <Input label="Full Name" placeholder="Kagiso Molebatsi" value={form.fullName} onChange={e => set('fullName', e.target.value)} required />}
          <Input label="Email" type="email" placeholder="your@email.com" value={form.email} onChange={e => set('email', e.target.value)} required />
          <Input label="Password" type="password" placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} required />
          {generalError && <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{generalError}</p>}
          <Button type="submit" loading={loading} className="mt-1 w-full py-2.5">{mode === 'signin' ? 'Sign in' : 'Create account'}</Button>
        </form>

        <p className="text-center text-xs text-[#8895b0] mt-4">
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')} className="text-[#0a3d8f] font-semibold hover:underline">
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
