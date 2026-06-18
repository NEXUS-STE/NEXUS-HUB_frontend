'use client'

import { useEffect } from 'react'

export default function ErrorPage({
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[--color-shell] text-center px-4">
      <p className="amount text-7xl font-bold text-[--color-error] mb-4">500</p>
      <h1 className="text-xl font-semibold text-[--color-text-primary] mb-2">
        Something went wrong
      </h1>
      <p className="text-sm text-[--color-text-secondary] mb-8 max-w-sm">
        An unexpected error occurred. Try refreshing the page.
      </p>
      <button
        onClick={reset}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[--color-surface-2] border border-[--color-border] text-[--color-text-primary] text-sm font-medium hover:border-[--color-text-muted] transition-colors"
      >
        Try again
      </button>
    </div>
  )
}
