'use client'
import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

// ─── Button ───
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1',
        {
          'bg-[#0a3d8f] text-white hover:bg-[#1a5ccc] focus:ring-[#0a3d8f]': variant === 'primary',
          'bg-white text-[#3d5080] border border-[#dde3f0] hover:bg-[#f0f4ff] focus:ring-[#dde3f0]': variant === 'secondary',
          'bg-transparent text-[#3d5080] hover:bg-[#f0f4ff] focus:ring-[#dde3f0]': variant === 'ghost',
          'bg-red-500 text-white hover:bg-red-600 focus:ring-red-400': variant === 'danger',
          'opacity-50 cursor-not-allowed': disabled || loading,
          'text-xs px-3 py-1.5': size === 'sm',
          'text-sm px-4 py-2': size === 'md',
          'text-sm px-5 py-2.5': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {loading && <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />}
      {children}
    </button>
  )
)
Button.displayName = 'Button'

// ─── Input ───
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && <label htmlFor={id} className="text-xs font-semibold text-[#3d5080]">{label}</label>}
      <input
        ref={ref}
        id={id}
        className={cn(
          'w-full px-3 py-2 text-sm rounded-lg border bg-[#f0f4ff] text-[#1a2540] placeholder:text-[#8895b0] outline-none transition-all',
          'focus:border-[#1a5ccc] focus:ring-2 focus:ring-[#0a3d8f]/10',
          error ? 'border-red-400' : 'border-[#dde3f0]',
          className
        )}
        {...props}
      />
      {hint && !error && <span className="text-xs text-[#8895b0]">{hint}</span>}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
)
Input.displayName = 'Input'

// ─── Select ───
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
}
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, children, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && <label htmlFor={id} className="text-xs font-semibold text-[#3d5080]">{label}</label>}
      <select
        ref={ref}
        id={id}
        className={cn(
          'w-full px-3 py-2 text-sm rounded-lg border bg-[#f0f4ff] text-[#1a2540] outline-none transition-all',
          'focus:border-[#1a5ccc] focus:ring-2 focus:ring-[#0a3d8f]/10',
          error ? 'border-red-400' : 'border-[#dde3f0]',
          className
        )}
        {...props}
      >{children}</select>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
)
Select.displayName = 'Select'

// ─── Textarea ───
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && <label htmlFor={id} className="text-xs font-semibold text-[#3d5080]">{label}</label>}
      <textarea
        ref={ref}
        id={id}
        className={cn(
          'w-full px-3 py-2 text-sm rounded-lg border bg-[#f0f4ff] text-[#1a2540] placeholder:text-[#8895b0] outline-none transition-all resize-none',
          'focus:border-[#1a5ccc] focus:ring-2 focus:ring-[#0a3d8f]/10',
          error ? 'border-red-400' : 'border-[#dde3f0]',
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
)
Textarea.displayName = 'Textarea'

// ─── Badge ───
export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold', className)}>
      {children}
    </span>
  )
}

// ─── Card ───
export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('bg-white border border-[#dde3f0] rounded-xl', className)}>
      {children}
    </div>
  )
}

// ─── Spinner ───
export function Spinner({ className }: { className?: string }) {
  return (
    <span className={cn('inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin', className)} />
  )
}

// ─── Typing Bubble ───
export function TypingBubble() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      {[0, 140, 280].map(delay => (
        <span
          key={delay}
          className="w-1.5 h-1.5 rounded-full bg-[#8895b0]"
          style={{ animation: `bounce 1.1s ease-in-out ${delay}ms infinite` }}
        />
      ))}
    </div>
  )
}
