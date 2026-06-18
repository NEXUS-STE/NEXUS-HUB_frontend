'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Wallet,
  Lock,
  AlertTriangle,
  Webhook,
  Settings,
  LogOut,
  Zap,
  Menu,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth.store'
import { authApi } from '@/services/api'
import { toast } from 'react-hot-toast'

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/wallet', label: 'Wallet', icon: Wallet },
  { href: '/dashboard/escrow', label: 'Escrow', icon: Lock },
  { href: '/dashboard/disputes', label: 'Disputes', icon: AlertTriangle },
  { href: '/dashboard/webhooks', label: 'Webhooks', icon: Webhook },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

function NavContent({
  onNavClick,
}: {
  onNavClick?: () => void
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, clearAuth } = useAuthStore()

  const handleSignOut = async () => {
    try {
      await authApi.logout()
    } catch {
      // ignore
    } finally {
      clearAuth()
      router.push('/auth/login')
      toast.success('Signed out')
    }
  }

  return (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-[--color-border]">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[--color-accent]">
          <Zap size={16} className="text-[--color-shell]" />
        </div>
        <span className="text-base font-bold text-[--color-text-primary] tracking-tight">
          NEXUS-HUB
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavClick}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-[rgba(0,212,255,0.1)] text-[--color-accent] border border-[rgba(0,212,255,0.2)]'
                  : 'text-[--color-text-secondary] hover:text-[--color-text-primary] hover:bg-[--color-surface-2]'
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User + sign out */}
      <div className="px-3 py-4 border-t border-[--color-border] space-y-1">
        <div className="px-3 py-2">
          <p className="text-xs font-medium text-[--color-text-primary] truncate">
            {user?.name ?? '—'}
          </p>
          <p className="text-xs text-[--color-text-muted] truncate">{user?.email ?? '—'}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-[--color-text-secondary] hover:text-[--color-error] hover:bg-[rgba(239,68,68,0.08)] transition-all duration-150"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </>
  )
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex h-screen w-60 flex-col border-r border-[--color-border] bg-[--color-surface] shrink-0">
        <NavContent />
      </aside>

      {/* Mobile topbar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 border-b border-[--color-border] bg-[--color-surface]">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[--color-accent]">
            <Zap size={14} className="text-[--color-shell]" />
          </div>
          <span className="text-sm font-bold text-[--color-text-primary] tracking-tight">
            NEXUS-HUB
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg text-[--color-text-secondary] hover:text-[--color-text-primary] hover:bg-[--color-surface-2] transition-colors"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative flex flex-col w-72 h-full border-r border-[--color-border] bg-[--color-surface] shadow-2xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-[--color-text-muted] hover:text-[--color-text-primary] hover:bg-[--color-surface-2] transition-colors"
            >
              <X size={16} />
            </button>
            <NavContent onNavClick={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}
    </>
  )
}
