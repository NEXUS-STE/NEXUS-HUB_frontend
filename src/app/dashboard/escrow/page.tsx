'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Lock, Plus, CheckCircle2, XCircle } from 'lucide-react'
import {
  Button,
  Input,
  Textarea,
  Modal,
  Skeleton,
  EscrowStatusBadge,
  EmptyState,
  PageHeader,
  Table,
  Th,
  Td,
  Tabs,
  Pagination,
  ConfirmDialog,
} from '@/components/ui'
import { createEscrowSchema, type CreateEscrowInput } from '@/lib/schemas'
import { useEscrows, useCreateEscrow, useReleaseEscrow } from '@/hooks/use-nexus-queries'
import { formatAmount, formatDate, fromNow, truncateHash } from '@/lib/utils'
import { escrowApi } from '@/services/api'
import { toast } from 'react-hot-toast'
import type { Escrow, EscrowStatus } from '@/types'

const STATUS_TABS: { value: EscrowStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'released', label: 'Released' },
  { value: 'disputed', label: 'Disputed' },
  { value: 'cancelled', label: 'Cancelled' },
]

const LIMIT = 10

export default function EscrowPage() {
  const [showCreate, setShowCreate] = useState(false)
  const [selectedEscrow, setSelectedEscrow] = useState<Escrow | null>(null)
  const [confirmRelease, setConfirmRelease] = useState<string | null>(null)
  const [confirmCancel, setConfirmCancel] = useState<string | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)
  const [statusFilter, setStatusFilter] = useState<EscrowStatus | 'all'>('all')
  const [page, setPage] = useState(1)

  const { data: escrowPage, isLoading, refetch } = useEscrows({
    page,
    limit: LIMIT,
    status: statusFilter === 'all' ? undefined : statusFilter,
  })
  const createEscrow = useCreateEscrow()
  const releaseEscrow = useReleaseEscrow()

  const form = useForm<CreateEscrowInput>({
    resolver: zodResolver(createEscrowSchema),
    defaultValues: { currency: 'USD' },
  })

  const onSubmit = async (data: CreateEscrowInput) => {
    await createEscrow.mutateAsync({
      title: data.title,
      description: data.description,
      amount: data.amount,
      currency: data.currency,
      sellerEmail: data.sellerEmail,
      conditions: data.conditions,
      expiresAt: data.expiresAt,
    })
    form.reset()
    setShowCreate(false)
  }

  const handleRelease = async () => {
    if (!confirmRelease) return
    await releaseEscrow.mutateAsync(confirmRelease)
    setConfirmRelease(null)
    if (selectedEscrow?.id === confirmRelease) setSelectedEscrow(null)
  }

  const handleCancel = async () => {
    if (!confirmCancel) return
    setIsCancelling(true)
    try {
      await escrowApi.cancel(confirmCancel)
      toast.success('Escrow cancelled')
      refetch()
      if (selectedEscrow?.id === confirmCancel) setSelectedEscrow(null)
    } catch {
      toast.error('Failed to cancel escrow')
    } finally {
      setIsCancelling(false)
      setConfirmCancel(null)
    }
  }

  const handleTabChange = (tab: EscrowStatus | 'all') => {
    setStatusFilter(tab)
    setPage(1)
  }

  const escrows = escrowPage?.data ?? []
  const total = escrowPage?.total ?? 0

  return (
    <div className="space-y-8">
      <PageHeader
        title="Escrow"
        description="Create and manage secure payment escrows."
        action={
          <Button variant="primary" icon={<Plus size={15} />} onClick={() => setShowCreate(true)}>
            New Escrow
          </Button>
        }
      />

      <Tabs
        tabs={STATUS_TABS}
        active={statusFilter}
        onChange={handleTabChange}
        className="mb-4"
      />

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : escrows.length === 0 ? (
        <EmptyState
          icon={<Lock size={20} />}
          title="No escrows found"
          description={
            statusFilter === 'all'
              ? 'Create your first escrow to lock funds until conditions are met.'
              : `No ${statusFilter} escrows.`
          }
          action={
            statusFilter === 'all' ? (
              <Button variant="primary" onClick={() => setShowCreate(true)}>
                Create Escrow
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <Table>
            <thead>
              <tr>
                <Th>Title</Th>
                <Th>Amount</Th>
                <Th>Counterparty</Th>
                <Th>Status</Th>
                <Th>Expires</Th>
                <Th>Created</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {escrows.map((esc) => (
                <tr
                  key={esc.id}
                  className="hover:bg-[--color-surface-2] transition-colors cursor-pointer"
                  onClick={() => setSelectedEscrow(esc)}
                >
                  <Td>
                    <span className="font-medium text-[--color-text-primary]">{esc.title}</span>
                  </Td>
                  <Td>
                    <span className="amount font-semibold text-[--color-accent]">
                      {formatAmount(esc.amount, esc.currency)}
                    </span>
                  </Td>
                  <Td>
                    <span className="text-sm text-[--color-text-secondary]">{esc.sellerEmail}</span>
                  </Td>
                  <Td>
                    <EscrowStatusBadge status={esc.status} />
                  </Td>
                  <Td>
                    <span className="text-xs text-[--color-text-muted]">
                      {formatDate(esc.expiresAt)}
                    </span>
                  </Td>
                  <Td>
                    <span className="text-xs text-[--color-text-muted]">
                      {fromNow(esc.createdAt)}
                    </span>
                  </Td>
                  <Td onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1.5">
                      {esc.status === 'active' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            icon={<CheckCircle2 size={13} />}
                            onClick={() => setConfirmRelease(esc.id)}
                          >
                            Release
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<XCircle size={13} />}
                            className="hover:text-[--color-error]"
                            onClick={() => setConfirmCancel(esc.id)}
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination page={page} total={total} limit={LIMIT} onPageChange={setPage} />
        </>
      )}

      {/* Escrow detail modal */}
      {selectedEscrow && (
        <Modal
          open={Boolean(selectedEscrow)}
          onClose={() => setSelectedEscrow(null)}
          title="Escrow Details"
          className="max-w-xl"
        >
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <EscrowStatusBadge status={selectedEscrow.status} />
              <span className="amount font-bold text-[--color-accent] text-lg">
                {formatAmount(selectedEscrow.amount, selectedEscrow.currency)}
              </span>
            </div>

            <div className="space-y-3 border-t border-[--color-border] pt-4">
              <Row label="Title" value={selectedEscrow.title} />
              <Row label="Description" value={selectedEscrow.description} />
              <Row label="Seller" value={selectedEscrow.sellerEmail} />
              <Row label="Conditions" value={selectedEscrow.conditions} />
              <Row label="Expires" value={formatDate(selectedEscrow.expiresAt)} />
              <Row label="Created" value={fromNow(selectedEscrow.createdAt)} />
              <div className="flex justify-between gap-3">
                <span className="text-[--color-text-muted]">ID</span>
                <span className="hash text-xs break-all">
                  {truncateHash(selectedEscrow.id, 12, 8)}
                </span>
              </div>
            </div>

            {selectedEscrow.status === 'active' && (
              <div className="flex gap-2 pt-2">
                <Button
                  variant="ghost"
                  className="flex-1 hover:text-[--color-error]"
                  icon={<XCircle size={14} />}
                  onClick={() => {
                    setConfirmCancel(selectedEscrow.id)
                    setSelectedEscrow(null)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  icon={<CheckCircle2 size={14} />}
                  onClick={() => {
                    setConfirmRelease(selectedEscrow.id)
                    setSelectedEscrow(null)
                  }}
                >
                  Release Funds
                </Button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Create escrow modal */}
      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create Escrow"
        className="max-w-xl"
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Title"
            placeholder="Website design project"
            error={form.formState.errors.title?.message}
            {...form.register('title')}
          />
          <Textarea
            label="Description"
            placeholder="Describe what this escrow is for..."
            rows={3}
            error={form.formState.errors.description?.message}
            {...form.register('description')}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Amount"
              type="number"
              placeholder="500.00"
              step="0.01"
              min="1"
              error={form.formState.errors.amount?.message}
              {...form.register('amount')}
            />
            <Input
              label="Currency"
              placeholder="USD"
              error={form.formState.errors.currency?.message}
              {...form.register('currency')}
            />
          </div>
          <Input
            label="Seller Email"
            type="email"
            placeholder="seller@example.com"
            error={form.formState.errors.sellerEmail?.message}
            {...form.register('sellerEmail')}
          />
          <Textarea
            label="Release Conditions"
            placeholder="Funds will be released when..."
            rows={3}
            error={form.formState.errors.conditions?.message}
            {...form.register('conditions')}
          />
          <Input
            label="Expiry Date"
            type="date"
            error={form.formState.errors.expiresAt?.message}
            {...form.register('expiresAt')}
          />
          <div className="flex gap-2 mt-1">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setShowCreate(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              loading={createEscrow.isPending}
            >
              Create Escrow
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm release */}
      <ConfirmDialog
        open={Boolean(confirmRelease)}
        onClose={() => setConfirmRelease(null)}
        onConfirm={handleRelease}
        title="Release Escrow"
        description="This will release the locked funds to the seller immediately. This action cannot be undone."
        confirmLabel="Release Funds"
        variant="primary"
        loading={releaseEscrow.isPending}
      />

      {/* Confirm cancel */}
      <ConfirmDialog
        open={Boolean(confirmCancel)}
        onClose={() => setConfirmCancel(null)}
        onConfirm={handleCancel}
        title="Cancel Escrow"
        description="This will cancel the escrow and return the locked funds to your available balance."
        confirmLabel="Cancel Escrow"
        variant="danger"
        loading={isCancelling}
      />
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-[--color-text-muted] shrink-0">{label}</span>
      <span className="text-[--color-text-secondary] text-right">{value}</span>
    </div>
  )
}
