'use client'

import * as React from 'react'
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn, escrowStatusConfig, disputeStatusConfig, txStatusConfig, deliveryStatusConfig } from '@/lib/utils'
import type { EscrowStatus, DisputeStatus, TransactionStatus, WebhookDeliveryStatus } from '@/types'

// ─── Button ───────────────────────────────────────────────────────────────────

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[--color-shell] disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary:
      'bg-[--color-accent] text-[--color-shell] hover:bg-cyan-300 focus:ring-[--color-accent]',
    secondary:
      'bg-[--color-surface-2] text-[--color-text-primary] border border-[--color-border] hover:bg-[--color-border] focus:ring-[--color-border]',
    ghost:
      'text-[--color-text-secondary] hover:text-[--color-text-primary] hover:bg-[--color-surface-2] focus:ring-[--color-border]',
    danger:
      'bg-[--color-error] text-white hover:bg-red-400 focus:ring-[--color-error]',
    outline:
      'border border-[--color-accent] text-[--color-accent] hover:bg-[--color-accent] hover:text-[--color-shell] focus:ring-[--color-accent]',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : icon}
      {children}
    </button>
  )
}

// ─── Input ────────────────────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[--color-text-secondary]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[--color-text-muted]">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full rounded-lg border bg-[--color-surface-2] px-3 py-2.5 text-sm text-[--color-text-primary] placeholder:text-[--color-text-muted] transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-[--color-accent] focus:border-transparent',
              error
                ? 'border-[--color-error] focus:ring-[--color-error]'
                : 'border-[--color-border] hover:border-[--color-text-muted]',
              leftIcon && 'pl-9',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-[--color-error]">{error}</p>}
        {hint && !error && <p className="text-xs text-[--color-text-muted]">{hint}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

// ─── Textarea ─────────────────────────────────────────────────────────────────

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[--color-text-secondary]">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-lg border bg-[--color-surface-2] px-3 py-2.5 text-sm text-[--color-text-primary] placeholder:text-[--color-text-muted] transition-colors resize-none',
            'focus:outline-none focus:ring-2 focus:ring-[--color-accent] focus:border-transparent',
            error
              ? 'border-[--color-error] focus:ring-[--color-error]'
              : 'border-[--color-border] hover:border-[--color-text-muted]',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-[--color-error]">{error}</p>}
        {hint && !error && <p className="text-xs text-[--color-text-muted]">{hint}</p>}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'

// ─── Select ───────────────────────────────────────────────────────────────────

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
  options: { value: string; label: string }[]
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[--color-text-secondary]">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-lg border bg-[--color-surface-2] px-3 py-2.5 text-sm text-[--color-text-primary] transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-[--color-accent] focus:border-transparent',
            error
              ? 'border-[--color-error] focus:ring-[--color-error]'
              : 'border-[--color-border] hover:border-[--color-text-muted]',
            className
          )}
          {...props}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value} className="bg-[--color-surface]">
              {o.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-[--color-error]">{error}</p>}
        {hint && !error && <p className="text-xs text-[--color-text-muted]">{hint}</p>}
      </div>
    )
  }
)
Select.displayName = 'Select'

// ─── Card ─────────────────────────────────────────────────────────────────────

interface CardProps {
  className?: string
  children: React.ReactNode
  onClick?: () => void
}

export function Card({ className, children, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-xl border border-[--color-border] bg-[--color-surface] p-5',
        onClick && 'cursor-pointer hover:border-[--color-text-muted] transition-colors',
        className
      )}
    >
      {children}
    </div>
  )
}

// ─── Table ────────────────────────────────────────────────────────────────────

export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-[--color-border]">
      <table className={cn('w-full text-sm', className)}>{children}</table>
    </div>
  )
}

export function Th({
  children,
  className,
}: {
  children?: React.ReactNode
  className?: string
}) {
  return (
    <th
      className={cn(
        'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[--color-text-muted] bg-[--color-surface-2] border-b border-[--color-border]',
        className
      )}
    >
      {children}
    </th>
  )
}

export function Td({
  children,
  className,
  onClick,
}: {
  children?: React.ReactNode
  className?: string
  onClick?: (e: React.MouseEvent<HTMLTableCellElement>) => void
}) {
  return (
    <td
      onClick={onClick}
      className={cn(
        'px-4 py-3 text-[--color-text-primary] border-b border-[--color-border] last:border-b-0',
        className
      )}
    >
      {children}
    </td>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-[--color-surface-2]',
        className
      )}
    />
  )
}

// ─── Badge ────────────────────────────────────────────────────────────────────

export function EscrowStatusBadge({ status }: { status: EscrowStatus }) {
  const config = escrowStatusConfig[status]
  return <span className={config.className}>{config.label}</span>
}

export function DisputeStatusBadge({ status }: { status: DisputeStatus }) {
  const config = disputeStatusConfig[status]
  return <span className={config.className}>{config.label}</span>
}

export function TxStatusBadge({ status }: { status: TransactionStatus }) {
  const config = txStatusConfig[status]
  return <span className={config.className}>{config.label}</span>
}

export function DeliveryStatusBadge({ status }: { status: WebhookDeliveryStatus }) {
  const config = deliveryStatusConfig[status]
  return <span className={config.className}>{config.label}</span>
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      {icon && (
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[--color-surface-2] border border-[--color-border] text-[--color-text-muted]">
          {icon}
        </div>
      )}
      <div className="flex flex-col gap-1">
        <p className="text-[--color-text-primary] font-medium">{title}</p>
        {description && <p className="text-sm text-[--color-text-secondary]">{description}</p>}
      </div>
      {action}
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  className?: string
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative z-10 w-full max-w-lg rounded-xl border border-[--color-border] bg-[--color-surface] p-6 shadow-2xl',
          className
        )}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-[--color-text-primary]">{title}</h2>
          <button
            onClick={onClose}
            className="text-[--color-text-muted] hover:text-[--color-text-primary] transition-colors"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ─── Divider ──────────────────────────────────────────────────────────────────

export function Divider({ className }: { className?: string }) {
  return <hr className={cn('border-[--color-border]', className)} />
}

// ─── PageHeader ───────────────────────────────────────────────────────────────

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-xl font-semibold text-[--color-text-primary]">{title}</h1>
        {description && (
          <p className="text-sm text-[--color-text-secondary] mt-0.5">{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

interface TabsProps<T extends string> {
  tabs: { value: T; label: string; count?: number }[]
  active: T
  onChange: (value: T) => void
  className?: string
}

export function Tabs<T extends string>({ tabs, active, onChange, className }: TabsProps<T>) {
  return (
    <div className={cn('flex items-center gap-1 border-b border-[--color-border]', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
            active === tab.value
              ? 'border-[--color-accent] text-[--color-accent]'
              : 'border-transparent text-[--color-text-secondary] hover:text-[--color-text-primary]'
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={cn(
                'px-1.5 py-0.5 rounded text-[10px] font-semibold',
                active === tab.value
                  ? 'bg-[rgba(0,212,255,0.15)] text-[--color-accent]'
                  : 'bg-[--color-surface-2] text-[--color-text-muted]'
              )}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

// ─── Pagination ───────────────────────────────────────────────────────────────

interface PaginationProps {
  page: number
  total: number
  limit: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, total, limit, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit))
  const from = Math.min((page - 1) * limit + 1, total)
  const to = Math.min(page * limit, total)

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between px-1 mt-4">
      <p className="text-xs text-[--color-text-muted]">
        {from}–{to} of {total}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="flex items-center justify-center w-8 h-8 rounded-lg border border-[--color-border] text-[--color-text-secondary] hover:border-[--color-text-muted] hover:text-[--color-text-primary] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={14} />
        </button>

        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let p = i + 1
          if (totalPages > 5) {
            if (page <= 3) p = i + 1
            else if (page >= totalPages - 2) p = totalPages - 4 + i
            else p = page - 2 + i
          }
          return (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={cn(
                'flex items-center justify-center w-8 h-8 rounded-lg text-xs font-medium transition-colors',
                p === page
                  ? 'bg-[--color-accent] text-[--color-shell]'
                  : 'border border-[--color-border] text-[--color-text-secondary] hover:border-[--color-text-muted] hover:text-[--color-text-primary]'
              )}
            >
              {p}
            </button>
          )
        })}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="flex items-center justify-center w-8 h-8 rounded-lg border border-[--color-border] text-[--color-text-secondary] hover:border-[--color-text-muted] hover:text-[--color-text-primary] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}

// ─── ConfirmDialog ────────────────────────────────────────────────────────────

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmLabel?: string
  variant?: 'danger' | 'primary'
  loading?: boolean
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  variant = 'danger',
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} className="max-w-sm">
      <p className="text-sm text-[--color-text-secondary] mb-6">{description}</p>
      <div className="flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant={variant} className="flex-1" onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

export function StatCard({
  label,
  value,
  sub,
  icon,
  accent,
}: {
  label: string
  value: React.ReactNode
  sub?: string
  icon?: React.ReactNode
  accent?: boolean
}) {
  return (
    <Card
      className={cn(
        accent && 'balance-pulse border-[rgba(0,212,255,0.25)] relative overflow-hidden'
      )}
    >
      {accent && (
        <div className="absolute inset-0 bg-gradient-to-br from-[rgba(0,212,255,0.05)] to-transparent pointer-events-none" />
      )}
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium uppercase tracking-wider text-[--color-text-muted]">
          {label}
        </p>
        {icon && (
          <span className="text-[--color-text-muted]">{icon}</span>
        )}
      </div>
      <div className={cn('text-3xl font-bold amount', accent ? 'text-[--color-accent]' : 'text-[--color-text-primary]')}>
        {value}
      </div>
      {sub && <p className="text-xs text-[--color-text-muted] mt-2">{sub}</p>}
    </Card>
  )
}
