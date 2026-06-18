'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] mb-4">
        <AlertTriangle size={22} className="text-[--color-error]" />
      </div>
      <h2 className="text-base font-semibold text-[--color-text-primary] mb-1">
        Failed to load
      </h2>
      <p className="text-sm text-[--color-text-secondary] mb-6 max-w-xs">
        Something went wrong loading this section.
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 rounded-lg bg-[--color-surface-2] border border-[--color-border] text-sm text-[--color-text-primary] hover:border-[--color-text-muted] transition-colors"
      >
        Try again
      </button>
    </div>
  )
}
