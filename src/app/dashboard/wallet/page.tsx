'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowDownLeft, ArrowUpRight, Wallet } from 'lucide-react'
import {
  Button,
  Input,
  Modal,
  Skeleton,
  TxStatusBadge,
  EmptyState,
  PageHeader,
  Table,
  Th,
  Td,
  Tabs,
  Pagination,
  StatCard,
  ConfirmDialog,
} from '@/components/ui'
import { topupSchema, withdrawalSchema, type TopupInput, type WithdrawalInput } from '@/lib/schemas'
import { useBalance, useTransactions, useTopup, useWithdrawal } from '@/hooks/use-nexus-queries'
import { formatAmount, formatDateTime, fromNow } from '@/lib/utils'
import type { TransactionStatus } from '@/types'

const STATUS_TABS: { value: TransactionStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'completed', label: 'Completed' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
]

const LIMIT = 10

export default function WalletPage() {
  const [showTopup, setShowTopup] = useState(false)
  const [showWithdraw, setShowWithdraw] = useState(false)
  const [confirmWithdraw, setConfirmWithdraw] = useState<WithdrawalInput | null>(null)
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | 'all'>('all')
  const [page, setPage] = useState(1)

  const { data: balance, isLoading: balanceLoading } = useBalance()
  const { data: txPage, isLoading: txLoading } = useTransactions({
    page,
    limit: LIMIT,
    status: statusFilter === 'all' ? undefined : statusFilter,
  })
  const topup = useTopup()
  const withdraw = useWithdrawal()

  const topupForm = useForm<TopupInput>({ resolver: zodResolver(topupSchema) })
  const withdrawForm = useForm<WithdrawalInput>({ resolver: zodResolver(withdrawalSchema) })

  const handleTopup = async (data: TopupInput) => {
    await topup.mutateAsync({ amount: data.amount, reference: data.reference })
    topupForm.reset()
    setShowTopup(false)
  }

  const handleWithdrawSubmit = (data: WithdrawalInput) => {
    setConfirmWithdraw(data)
    setShowWithdraw(false)
  }

  const handleWithdrawConfirm = async () => {
    if (!confirmWithdraw) return
    await withdraw.mutateAsync({
      amount: confirmWithdraw.amount,
      accountNumber: confirmWithdraw.accountNumber,
      bankCode: confirmWithdraw.bankCode,
    })
    withdrawForm.reset()
    setConfirmWithdraw(null)
  }

  const transactions = txPage?.data ?? []
  const total = txPage?.total ?? 0

  const handleTabChange = (tab: TransactionStatus | 'all') => {
    setStatusFilter(tab)
    setPage(1)
  }

  const inboundTypes = new Set(['topup', 'escrow_release', 'dispute_refund'])

  return (
    <div className="space-y-8">
      <PageHeader
        title="Wallet"
        description="Manage your balance, top up funds, and withdraw."
        action={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              icon={<ArrowUpRight size={15} />}
              onClick={() => setShowWithdraw(true)}
            >
              Withdraw
            </Button>
            <Button
              variant="primary"
              icon={<ArrowDownLeft size={15} />}
              onClick={() => setShowTopup(true)}
            >
              Top up
            </Button>
          </div>
        }
      />

      {/* Balance cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          label="Available Balance"
          value={
            balanceLoading ? (
              <Skeleton className="h-9 w-44 mt-1" />
            ) : (
              formatAmount(balance?.available ?? '0', balance?.currency)
            )
          }
          sub="Ready to withdraw or lock in escrow"
          accent
        />
        <StatCard
          label="Reserved (in escrow)"
          value={
            balanceLoading ? (
              <Skeleton className="h-9 w-36 mt-1" />
            ) : (
              <span className="text-[--color-warning]">
                {formatAmount(balance?.reserved ?? '0', balance?.currency)}
              </span>
            )
          }
          sub="Released when escrows complete"
        />
      </div>

      {/* Transaction history */}
      <div>
        <h2 className="text-base font-semibold text-[--color-text-primary] mb-4">
          Transaction History
        </h2>

        <Tabs
          tabs={STATUS_TABS}
          active={statusFilter}
          onChange={handleTabChange}
          className="mb-4"
        />

        {txLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <EmptyState
            icon={<Wallet size={20} />}
            title="No transactions found"
            description={
              statusFilter === 'all'
                ? 'Your transaction history will appear here after your first top-up.'
                : `No ${statusFilter} transactions.`
            }
            action={
              statusFilter === 'all' ? (
                <Button variant="primary" onClick={() => setShowTopup(true)}>
                  Top up now
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <Table>
              <thead>
                <tr>
                  <Th>Type</Th>
                  <Th>Amount</Th>
                  <Th>Description</Th>
                  <Th>Reference</Th>
                  <Th>Status</Th>
                  <Th>Date</Th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => {
                  const isInbound = inboundTypes.has(tx.type)
                  return (
                    <tr key={tx.id} className="hover:bg-[--color-surface-2] transition-colors">
                      <Td>
                        <div className="flex items-center gap-2">
                          {isInbound ? (
                            <ArrowDownLeft size={14} className="text-[--color-success]" />
                          ) : (
                            <ArrowUpRight size={14} className="text-[--color-error]" />
                          )}
                          <span className="capitalize text-xs text-[--color-text-secondary]">
                            {tx.type.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </Td>
                      <Td>
                        <span
                          className={`amount font-semibold ${
                            isInbound ? 'text-[--color-success]' : 'text-[--color-error]'
                          }`}
                        >
                          {isInbound ? '+' : '-'}
                          {formatAmount(tx.amount, tx.currency)}
                        </span>
                      </Td>
                      <Td>
                        <span className="text-sm text-[--color-text-secondary]">
                          {tx.description}
                        </span>
                      </Td>
                      <Td>
                        <span className="hash text-xs">{tx.reference}</span>
                      </Td>
                      <Td>
                        <TxStatusBadge status={tx.status} />
                      </Td>
                      <Td>
                        <span
                          className="text-xs text-[--color-text-muted]"
                          title={formatDateTime(tx.createdAt)}
                        >
                          {fromNow(tx.createdAt)}
                        </span>
                      </Td>
                    </tr>
                  )
                })}
              </tbody>
            </Table>
            <Pagination page={page} total={total} limit={LIMIT} onPageChange={setPage} />
          </>
        )}
      </div>

      {/* Top up modal */}
      <Modal open={showTopup} onClose={() => setShowTopup(false)} title="Top Up Balance">
        <form onSubmit={topupForm.handleSubmit(handleTopup)} className="flex flex-col gap-4">
          <Input
            label="Amount (USD)"
            type="number"
            placeholder="100.00"
            step="0.01"
            min="1"
            error={topupForm.formState.errors.amount?.message}
            {...topupForm.register('amount')}
          />
          <Input
            label="Reference (optional)"
            placeholder="Payment reference"
            error={topupForm.formState.errors.reference?.message}
            {...topupForm.register('reference')}
          />
          <div className="flex gap-2 mt-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setShowTopup(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              loading={topup.isPending}
            >
              Confirm Top Up
            </Button>
          </div>
        </form>
      </Modal>

      {/* Withdraw modal */}
      <Modal open={showWithdraw} onClose={() => setShowWithdraw(false)} title="Withdraw Funds">
        <form
          onSubmit={withdrawForm.handleSubmit(handleWithdrawSubmit)}
          className="flex flex-col gap-4"
        >
          <Input
            label="Amount (USD)"
            type="number"
            placeholder="100.00"
            step="0.01"
            min="1"
            error={withdrawForm.formState.errors.amount?.message}
            hint={`Available: ${formatAmount(balance?.available ?? '0', balance?.currency)}`}
            {...withdrawForm.register('amount')}
          />
          <Input
            label="Account Number"
            placeholder="0123456789"
            error={withdrawForm.formState.errors.accountNumber?.message}
            {...withdrawForm.register('accountNumber')}
          />
          <Input
            label="Bank Code"
            placeholder="044"
            error={withdrawForm.formState.errors.bankCode?.message}
            {...withdrawForm.register('bankCode')}
          />
          <div className="flex gap-2 mt-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setShowWithdraw(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              Review Withdrawal
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm withdrawal dialog */}
      <ConfirmDialog
        open={Boolean(confirmWithdraw)}
        onClose={() => setConfirmWithdraw(null)}
        onConfirm={handleWithdrawConfirm}
        title="Confirm Withdrawal"
        description={`You are about to withdraw ${formatAmount(confirmWithdraw?.amount ?? '0')} to account ${confirmWithdraw?.accountNumber ?? ''}. This action cannot be undone.`}
        confirmLabel="Withdraw"
        variant="primary"
        loading={withdraw.isPending}
      />
    </div>
  )
}
