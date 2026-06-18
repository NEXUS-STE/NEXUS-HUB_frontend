import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { EscrowStatus, DisputeStatus, TransactionStatus, WebhookDeliveryStatus } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAmount(amount: string | number, currency = 'USD'): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(num)) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(dateStr))
}

export function formatDateTime(dateStr: string): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  const date = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d)
  const time = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(d)
  return `${date} · ${time}`
}

export function fromNow(dateStr: string): string {
  if (!dateStr) return '—'
  const diff = Date.now() - new Date(dateStr).getTime()
  const abs = Math.abs(diff)
  const isFuture = diff < 0

  const seconds = Math.floor(abs / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  let result: string
  if (seconds < 60) result = 'just now'
  else if (minutes < 60) result = `${minutes}m ago`
  else if (hours < 24) result = `${hours}h ago`
  else if (days < 30) result = `${days}d ago`
  else result = formatDate(dateStr)

  return isFuture ? result.replace(' ago', '') + ' from now' : result
}

export function truncateHash(hash: string, start = 6, end = 4): string {
  if (!hash || hash.length <= start + end + 3) return hash
  return `${hash.slice(0, start)}…${hash.slice(-end)}`
}

// ─── Badge config maps ────────────────────────────────────────────────────────

export const escrowStatusConfig: Record<EscrowStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'badge badge-warning' },
  active: { label: 'Active', className: 'badge badge-info' },
  released: { label: 'Released', className: 'badge badge-success' },
  disputed: { label: 'Disputed', className: 'badge badge-error' },
  cancelled: { label: 'Cancelled', className: 'badge badge-muted' },
  expired: { label: 'Expired', className: 'badge badge-muted' },
}

export const disputeStatusConfig: Record<DisputeStatus, { label: string; className: string }> = {
  open: { label: 'Open', className: 'badge badge-error' },
  under_review: { label: 'Under Review', className: 'badge badge-warning' },
  resolved: { label: 'Resolved', className: 'badge badge-success' },
  closed: { label: 'Closed', className: 'badge badge-muted' },
}

export const txStatusConfig: Record<TransactionStatus, { label: string; className: string }> = {
  completed: { label: 'Completed', className: 'badge badge-success' },
  pending: { label: 'Pending', className: 'badge badge-warning' },
  failed: { label: 'Failed', className: 'badge badge-error' },
}

export const deliveryStatusConfig: Record<WebhookDeliveryStatus, { label: string; className: string }> = {
  success: { label: 'Success', className: 'badge badge-success' },
  failed: { label: 'Failed', className: 'badge badge-error' },
  pending: { label: 'Pending', className: 'badge badge-warning' },
}
