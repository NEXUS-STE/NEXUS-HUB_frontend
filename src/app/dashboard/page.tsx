'use client'

import Link from 'next/link'
import {
  ArrowUpRight,
  ArrowDownLeft,
  Lock,
  AlertTriangle,
  Wallet,
  TrendingUp,
  Clock,
  CheckCircle2,
} from 'lucide-react'
import {
  Card,
  Skeleton,
  TxStatusBadge,
  EmptyState,
  Table,
  Th,
  Td,
  StatCard,
  Divider,
} from '@/components/ui'
import { useBalance, useTransactions, useEscrows, useDisputes } from '@/hooks/use-nexus-queries'
import { useAuthStore } from '@/stores/auth.store'
import { formatAmount, formatDate, fromNow } from '@/lib/utils'

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-base font-semibold text-[--color-text-primary]">{title}</h2>
      <Link
        href={href}
        className="text-sm text-[--color-accent] hover:underline flex items-center gap-1"
      >
        View all <ArrowUpRight size={13} />
      </Link>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { data: balance, isLoading: balanceLoading } = useBalance()
  const { data: txPage, isLoading: txLoading } = useTransactions({ limit: 5 })
  const { data: escrowPage } = useEscrows({ limit: 50 })
  const { data: disputePage } = useDisputes({ limit: 50 })

  const recentTx = txPage?.data ?? []
  const allEscrows = escrowPage?.data ?? []
  const allDisputes = disputePage?.data ?? []

  const activeEscrows = allEscrows.filter((e) => e.status === 'active')
  const releasedEscrows = allEscrows.filter((e) => e.status === 'released')
  const openDisputes = allDisputes.filter((d) => d.status === 'open')
  const resolvedDisputes = allDisputes.filter((d) => d.status === 'resolved')

  const totalEscrowValue = activeEscrows
    .reduce((acc, e) => acc + parseFloat(e.amount), 0)
    .toString()

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-[--color-text-primary]">
          Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
        </h1>
        <p className="text-sm text-[--color-text-secondary] mt-1">
          Here&apos;s a snapshot of your account activity.
        </p>
      </div>

      {/* Balance row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Available Balance"
          value={
            balanceLoading ? (
              <Skeleton className="h-9 w-40 mt-1" />
            ) : (
              formatAmount(balance?.available ?? '0', balance?.currency)
            )
          }
          sub="Instantly withdrawable"
          icon={<Wallet size={14} />}
          accent
        />
        <StatCard
          label="Reserved in Escrow"
          value={
            balanceLoading ? (
              <Skeleton className="h-9 w-32 mt-1" />
            ) : (
              <span className="text-[--color-warning]">
                {formatAmount(balance?.reserved ?? '0', balance?.currency)}
              </span>
            )
          }
          sub="Held until escrows complete"
          icon={<Lock size={14} />}
        />
        <StatCard
          label="Total Locked Value"
          value={
            balanceLoading ? (
              <Skeleton className="h-9 w-36 mt-1" />
            ) : (
              <span className="text-[--color-text-primary]">
                {formatAmount(totalEscrowValue)}
              </span>
            )
          }
          sub={`Across ${activeEscrows.length} active escrow${activeEscrows.length !== 1 ? 's' : ''}`}
          icon={<TrendingUp size={14} />}
        />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: 'Active escrows',
            value: activeEscrows.length,
            color: 'text-[--color-accent]',
            href: '/dashboard/escrow',
          },
          {
            label: 'Released',
            value: releasedEscrows.length,
            color: 'text-[--color-success]',
            href: '/dashboard/escrow',
          },
          {
            label: 'Open disputes',
            value: openDisputes.length,
            color: 'text-[--color-error]',
            href: '/dashboard/disputes',
          },
          {
            label: 'Resolved disputes',
            value: resolvedDisputes.length,
            color: 'text-[--color-success]',
            href: '/dashboard/disputes',
          },
        ].map(({ label, value, color, href }) => (
          <Link key={label} href={href}>
            <Card className="text-center hover:border-[--color-text-muted] transition-colors">
              <p className={`text-2xl font-bold ${color} amount`}>{value}</p>
              <p className="text-xs text-[--color-text-muted] mt-1">{label}</p>
            </Card>
          </Link>
        ))}
      </div>

      <Divider />

      {/* Recent transactions */}
      <div>
        <SectionHeader title="Recent Transactions" href="/dashboard/wallet" />

        {txLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : recentTx.length === 0 ? (
          <EmptyState
            icon={<Clock size={18} />}
            title="No transactions yet"
            description="Your recent activity will appear here."
          />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Type</Th>
                <Th>Amount</Th>
                <Th>Reference</Th>
                <Th>Status</Th>
                <Th>Date</Th>
              </tr>
            </thead>
            <tbody>
              {recentTx.map((tx) => {
                const isInbound = ['topup', 'escrow_release', 'dispute_refund'].includes(tx.type)
                return (
                  <tr key={tx.id} className="hover:bg-[--color-surface-2] transition-colors">
                    <Td>
                      <div className="flex items-center gap-2">
                        {isInbound ? (
                          <ArrowDownLeft size={14} className="text-[--color-success]" />
                        ) : (
                          <ArrowUpRight size={14} className="text-[--color-error]" />
                        )}
                        <span className="capitalize text-[--color-text-secondary] text-xs">
                          {tx.type.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </Td>
                    <Td>
                      <span
                        className={`amount font-medium ${isInbound ? 'text-[--color-success]' : 'text-[--color-error]'}`}
                      >
                        {isInbound ? '+' : '-'}
                        {formatAmount(tx.amount, tx.currency)}
                      </span>
                    </Td>
                    <Td>
                      <span className="hash text-xs">{tx.reference}</span>
                    </Td>
                    <Td>
                      <TxStatusBadge status={tx.status} />
                    </Td>
                    <Td>
                      <span className="text-[--color-text-muted] text-xs">
                        {fromNow(tx.createdAt)}
                      </span>
                    </Td>
                  </tr>
                )
              })}
            </tbody>
          </Table>
        )}
      </div>

      {/* Active escrows preview */}
      {activeEscrows.length > 0 && (
        <div>
          <SectionHeader title="Active Escrows" href="/dashboard/escrow" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeEscrows.slice(0, 4).map((esc) => (
              <Card key={esc.id} className="flex items-center gap-4">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-[rgba(0,212,255,0.1)] flex items-center justify-center">
                  <Lock size={15} className="text-[--color-accent]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[--color-text-primary] truncate">
                    {esc.title}
                  </p>
                  <p className="text-xs text-[--color-text-muted]">
                    Expires {formatDate(esc.expiresAt)} · {esc.sellerEmail}
                  </p>
                </div>
                <span className="amount text-sm font-semibold text-[--color-accent] shrink-0">
                  {formatAmount(esc.amount, esc.currency)}
                </span>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Recently released escrows */}
      {releasedEscrows.length > 0 && (
        <div>
          <SectionHeader title="Recently Released" href="/dashboard/escrow" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {releasedEscrows.slice(0, 2).map((esc) => (
              <Card key={esc.id} className="flex items-center gap-4 opacity-75">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-[rgba(16,185,129,0.1)] flex items-center justify-center">
                  <CheckCircle2 size={15} className="text-[--color-success]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[--color-text-primary] truncate">
                    {esc.title}
                  </p>
                  <p className="text-xs text-[--color-text-muted]">{fromNow(esc.updatedAt)}</p>
                </div>
                <span className="amount text-sm font-semibold text-[--color-success] shrink-0">
                  {formatAmount(esc.amount, esc.currency)}
                </span>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Open disputes alert */}
      {openDisputes.length > 0 && (
        <Card className="border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.05)]">
          <div className="flex items-center gap-3">
            <AlertTriangle size={16} className="text-[--color-error] shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-[--color-text-primary]">
                {openDisputes.length} open dispute{openDisputes.length > 1 ? 's' : ''} require
                attention
              </p>
              <p className="text-xs text-[--color-text-secondary] mt-0.5">
                {openDisputes.map((d) => d.escrowTitle).join(', ')}
              </p>
            </div>
            <Link
              href="/dashboard/disputes"
              className="text-sm text-[--color-error] hover:underline font-medium shrink-0"
            >
              View disputes
            </Link>
          </div>
        </Card>
      )}
    </div>
  )
}
