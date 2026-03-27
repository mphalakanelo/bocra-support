'use client'
import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'

type ToastType = 'success' | 'error' | 'info'
interface Toast { id: string; message: string; type: ToastType }

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])

  useEffect(() => { (window as any).__bocraToast = addToast }, [addToast])

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map(t => (
        <div key={t.id} className={cn(
          'px-4 py-3 rounded-xl text-sm font-medium shadow-lg border animate-slide-up',
          t.type === 'success' && 'bg-green-50 text-green-800 border-green-200',
          t.type === 'error'   && 'bg-red-50 text-red-800 border-red-200',
          t.type === 'info'    && 'bg-blue-50 text-blue-800 border-blue-200',
        )}>
          {t.type === 'success' && '✓ '}{t.type === 'error' && '✕ '}{t.message}
        </div>
      ))}
    </div>
  )
}

export function toast(message: string, type: ToastType = 'info') {
  ;(window as any).__bocraToast?.(message, type)
}
