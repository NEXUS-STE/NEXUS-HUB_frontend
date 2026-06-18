'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Webhook, Plus, Trash2, RefreshCw, ChevronDown, ChevronRight, Eye, EyeOff } from 'lucide-react'
import {
  Card,
  Button,
  Input,
  Modal,
  Skeleton,
  DeliveryStatusBadge,
  EmptyState,
  PageHeader,
  Table,
  Th,
  Td,
  Divider,
} from '@/components/ui'
import { registerWebhookSchema, type RegisterWebhookInput } from '@/lib/schemas'
import {
  useWebhooks,
  useRegisterWebhook,
  useDeleteWebhook,
  useRotateWebhookSecret,
  useWebhookDeliveries,
} from '@/hooks/use-nexus-queries'
import { fromNow, truncateHash } from '@/lib/utils'
import type { WebhookEvent, Webhook as WebhookType } from '@/types'

const ALL_EVENTS: { value: WebhookEvent; label: string }[] = [
  { value: 'escrow.created', label: 'Escrow Created' },
  { value: 'escrow.released', label: 'Escrow Released' },
  { value: 'escrow.disputed', label: 'Escrow Disputed' },
  { value: 'escrow.cancelled', label: 'Escrow Cancelled' },
  { value: 'dispute.opened', label: 'Dispute Opened' },
  { value: 'dispute.resolved', label: 'Dispute Resolved' },
  { value: 'topup.completed', label: 'Top-up Completed' },
  { value: 'withdrawal.completed', label: 'Withdrawal Completed' },
]

export default function WebhooksPage() {
  const [showCreate, setShowCreate] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showSecretId, setShowSecretId] = useState<string | null>(null)

  const { data: webhooks, isLoading } = useWebhooks()
  const registerWebhook = useRegisterWebhook()
  const deleteWebhook = useDeleteWebhook()
  const rotateSecret = useRotateWebhookSecret()

  const form = useForm<RegisterWebhookInput>({
    resolver: zodResolver(registerWebhookSchema),
    defaultValues: { events: [] },
  })

  const onSubmit = async (data: RegisterWebhookInput) => {
    await registerWebhook.mutateAsync({
      url: data.url,
      events: data.events as WebhookEvent[],
    })
    form.reset()
    setShowCreate(false)
  }

  const selectedEvents = form.watch('events') as string[]

  const toggleEvent = (value: string) => {
    const current = form.getValues('events') as string[]
    const next = current.includes(value)
      ? current.filter((e) => e !== value)
      : [...current, value]
    form.setValue('events', next, { shouldValidate: true })
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Webhooks"
        description="Receive real-time notifications for events in your account."
        action={
          <Button variant="primary" icon={<Plus size={15} />} onClick={() => setShowCreate(true)}>
            Register Endpoint
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : !webhooks?.length ? (
        <EmptyState
          icon={<Webhook size={20} />}
          title="No endpoints registered"
          description="Register a URL to receive webhook events when things happen in your account."
          action={
            <Button variant="primary" onClick={() => setShowCreate(true)}>
              Register Endpoint
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {webhooks.map((wh) => (
            <WebhookRow
              key={wh.id}
              webhook={wh}
              isExpanded={expandedId === wh.id}
              showSecret={showSecretId === wh.id}
              onToggleExpand={() => setExpandedId(expandedId === wh.id ? null : wh.id)}
              onToggleSecret={() => setShowSecretId(showSecretId === wh.id ? null : wh.id)}
              onDelete={() => deleteWebhook.mutate(wh.id)}
              onRotate={() => rotateSecret.mutate(wh.id)}
              isDeleting={deleteWebhook.isPending}
              isRotating={rotateSecret.isPending}
            />
          ))}
        </div>
      )}

      {/* Register modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Register Webhook Endpoint">
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <Input
            label="Endpoint URL"
            type="url"
            placeholder="https://your-app.com/webhooks/nexus"
            error={form.formState.errors.url?.message}
            {...form.register('url')}
          />

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-[--color-text-secondary]">Events to listen for</p>
            <div className="grid grid-cols-2 gap-2">
              {ALL_EVENTS.map((ev) => (
                <label
                  key={ev.value}
                  className="flex items-center gap-2 cursor-pointer p-2.5 rounded-lg border border-[--color-border] hover:border-[--color-text-muted] transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedEvents.includes(ev.value)}
                    onChange={() => toggleEvent(ev.value)}
                    className="accent-[--color-accent] w-3.5 h-3.5"
                  />
                  <span className="text-xs text-[--color-text-secondary]">{ev.label}</span>
                </label>
              ))}
            </div>
            {form.formState.errors.events && (
              <p className="text-xs text-[--color-error]">
                {form.formState.errors.events.message}
              </p>
            )}
          </div>

          <div className="flex gap-2">
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
              loading={registerWebhook.isPending}
            >
              Register
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

function WebhookRow({
  webhook,
  isExpanded,
  showSecret,
  onToggleExpand,
  onToggleSecret,
  onDelete,
  onRotate,
  isDeleting,
  isRotating,
}: {
  webhook: WebhookType
  isExpanded: boolean
  showSecret: boolean
  onToggleExpand: () => void
  onToggleSecret: () => void
  onDelete: () => void
  onRotate: () => void
  isDeleting: boolean
  isRotating: boolean
}) {
  const { data: deliveryPage } = useWebhookDeliveries(webhook.id, { limit: 10 })
  const deliveries = deliveryPage?.data ?? []

  return (
    <Card className="p-0 overflow-hidden">
      <div className="flex items-center gap-4 p-4">
        <button
          onClick={onToggleExpand}
          className="text-[--color-text-muted] hover:text-[--color-text-primary] transition-colors"
        >
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[--color-text-primary] truncate">{webhook.url}</p>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {webhook.events.map((ev) => (
              <span key={ev} className="badge badge-info text-[10px] px-1.5 py-0.5">
                {ev}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`w-2 h-2 rounded-full ${webhook.isActive ? 'bg-[--color-success]' : 'bg-[--color-text-muted]'}`}
          />
          <span className="text-xs text-[--color-text-muted]">
            {webhook.isActive ? 'Active' : 'Inactive'}
          </span>
          <Button
            variant="ghost"
            size="sm"
            icon={<RefreshCw size={13} />}
            loading={isRotating}
            onClick={onRotate}
            title="Rotate secret"
          />
          <Button
            variant="ghost"
            size="sm"
            icon={<Trash2 size={13} />}
            loading={isDeleting}
            onClick={onDelete}
            className="hover:text-[--color-error]"
            title="Delete webhook"
          />
        </div>
      </div>

      {isExpanded && (
        <>
          <Divider />
          <div className="p-4 space-y-4">
            {/* Secret */}
            <div>
              <p className="text-xs font-medium text-[--color-text-muted] mb-1.5">Signing Secret</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs hash bg-[--color-surface-2] px-3 py-2 rounded-lg border border-[--color-border] truncate">
                  {showSecret ? webhook.secret : '••••••••••••••••••••••••••••••••'}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={showSecret ? <EyeOff size={13} /> : <Eye size={13} />}
                  onClick={onToggleSecret}
                />
              </div>
            </div>

            {/* Deliveries */}
            <div>
              <p className="text-xs font-medium text-[--color-text-muted] mb-2">
                Recent Deliveries
              </p>
              {deliveries.length === 0 ? (
                <p className="text-xs text-[--color-text-muted] py-2">No deliveries yet.</p>
              ) : (
                <Table>
                  <thead>
                    <tr>
                      <Th>Event</Th>
                      <Th>Status</Th>
                      <Th>HTTP</Th>
                      <Th>Sent</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {deliveries.map((d) => (
                      <tr key={d.id} className="hover:bg-[--color-surface-2] transition-colors">
                        <Td>
                          <span className="text-xs text-[--color-text-secondary]">{d.event}</span>
                        </Td>
                        <Td>
                          <DeliveryStatusBadge status={d.status} />
                        </Td>
                        <Td>
                          <span className="amount text-xs text-[--color-text-muted]">
                            {d.statusCode ?? '—'}
                          </span>
                        </Td>
                        <Td>
                          <span className="text-xs text-[--color-text-muted]">
                            {fromNow(d.attemptedAt)}
                          </span>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </div>
          </div>
        </>
      )}
    </Card>
  )
}
