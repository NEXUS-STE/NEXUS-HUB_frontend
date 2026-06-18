'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertTriangle, Plus } from 'lucide-react'
import {
  Button,
  Input,
  Textarea,
  Select,
  Modal,
  Skeleton,
  DisputeStatusBadge,
  EmptyState,
  PageHeader,
  Table,
  Th,
  Td,
  Tabs,
  Pagination,
} from '@/components/ui'
import { openDisputeSchema, type OpenDisputeInput } from '@/lib/schemas'
import { useDisputes, useOpenDispute, useEscrows } from '@/hooks/use-nexus-queries'
import { fromNow, formatDate } from '@/lib/utils'
import type { Dispute, DisputeStatus } from '@/types'

const STATUS_TABS: { value: DisputeStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
]

const LIMIT = 10

export default function DisputesPage() {
  const [showOpen, setShowOpen] = useState(false)
  const [selected, setSelected] = useState<Dispute | null>(null)
  const [statusFilter, setStatusFilter] = useState<DisputeStatus | 'all'>('all')
  const [page, setPage] = useState(1)

  const { data: disputePage, isLoading } = useDisputes({
    page,
    limit: LIMIT,
    status: statusFilter === 'all' ? undefined : statusFilter,
  })
  const { data: escrowPage } = useEscrows({ status: 'active', limit: 100 })
  const openDispute = useOpenDispute()

  const form = useForm<OpenDisputeInput>({ resolver: zodResolver(openDisputeSchema) })

  const onSubmit = async (data: OpenDisputeInput) => {
    await openDispute.mutateAsync({
      escrowId: data.escrowId,
      reason: data.reason,
      description: data.description,
    })
    form.reset()
    setShowOpen(false)
  }

  const disputes = disputePage?.data ?? []
  const total = disputePage?.total ?? 0

  const handleTabChange = (tab: DisputeStatus | 'all') => {
    setStatusFilter(tab)
    setPage(1)
  }

  const escrowOptions = [
    { value: '', label: 'Select an escrow...' },
    ...(escrowPage?.data ?? []).map((e) => ({
      value: e.id,
      label: `${e.title} (${e.id.slice(0, 8)}…)`,
    })),
  ]

  return (
    <div className="space-y-8">
      <PageHeader
        title="Disputes"
        description="Open and track disputes for your escrow transactions."
        action={
          <Button variant="danger" icon={<Plus size={15} />} onClick={() => setShowOpen(true)}>
            Open Dispute
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
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : disputes.length === 0 ? (
        <EmptyState
          icon={<AlertTriangle size={20} />}
          title="No disputes found"
          description={
            statusFilter === 'all'
              ? 'Disputes you open or that are raised against you will appear here.'
              : `No ${statusFilter.replace('_', ' ')} disputes.`
          }
        />
      ) : (
        <>
          <Table>
            <thead>
              <tr>
                <Th>Escrow</Th>
                <Th>Reason</Th>
                <Th>Status</Th>
                <Th>Resolution</Th>
                <Th>Opened</Th>
                <Th>Updated</Th>
              </tr>
            </thead>
            <tbody>
              {disputes.map((d) => (
                <tr
                  key={d.id}
                  className="hover:bg-[--color-surface-2] transition-colors cursor-pointer"
                  onClick={() => setSelected(d)}
                >
                  <Td>
                    <span className="text-sm font-medium text-[--color-text-primary]">
                      {d.escrowTitle}
                    </span>
                  </Td>
                  <Td>
                    <span className="text-sm text-[--color-text-secondary]">{d.reason}</span>
                  </Td>
                  <Td>
                    <DisputeStatusBadge status={d.status} />
                  </Td>
                  <Td>
                    <span className="text-sm text-[--color-text-muted] capitalize">
                      {d.resolution ?? '—'}
                    </span>
                  </Td>
                  <Td>
                    <span className="text-xs text-[--color-text-muted]">
                      {fromNow(d.createdAt)}
                    </span>
                  </Td>
                  <Td>
                    <span className="text-xs text-[--color-text-muted]">
                      {fromNow(d.updatedAt)}
                    </span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination page={page} total={total} limit={LIMIT} onPageChange={setPage} />
        </>
      )}

      {/* Detail modal */}
      {selected && (
        <Modal
          open={Boolean(selected)}
          onClose={() => setSelected(null)}
          title="Dispute Details"
          className="max-w-lg"
        >
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <DisputeStatusBadge status={selected.status} />
              <span className="text-xs text-[--color-text-muted]">
                Opened {formatDate(selected.createdAt)}
              </span>
            </div>
            <div className="space-y-3 border-t border-[--color-border] pt-4">
              <Row label="Escrow" value={selected.escrowTitle} />
              <Row label="Reason" value={selected.reason} />
              <Row label="Description" value={selected.description} />
              <Row label="Resolution" value={selected.resolution ?? 'Pending review'} />
              <Row label="Updated" value={fromNow(selected.updatedAt)} />
            </div>
          </div>
        </Modal>
      )}

      {/* Open dispute modal */}
      <Modal
        open={showOpen}
        onClose={() => setShowOpen(false)}
        title="Open a Dispute"
        className="max-w-lg"
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Select
            label="Escrow"
            options={escrowOptions}
            error={form.formState.errors.escrowId?.message}
            {...form.register('escrowId')}
          />
          <Input
            label="Reason"
            placeholder="e.g. Work not delivered as agreed"
            error={form.formState.errors.reason?.message}
            {...form.register('reason')}
          />
          <Textarea
            label="Description"
            placeholder="Provide a detailed account of the issue..."
            rows={5}
            error={form.formState.errors.description?.message}
            {...form.register('description')}
          />
          <div className="flex gap-2 mt-1">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setShowOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              className="flex-1"
              loading={openDispute.isPending}
            >
              Open Dispute
            </Button>
          </div>
        </form>
      </Modal>
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
