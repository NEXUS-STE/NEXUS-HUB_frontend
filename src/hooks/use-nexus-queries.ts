import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { authApi, balancesApi, escrowApi, disputesApi, webhooksApi } from '@/services/api'
import { useAuthStore } from '@/stores/auth.store'
import type {
  PaginationParams,
  CreateEscrowPayload,
  OpenDisputePayload,
  ResolveDisputePayload,
  RegisterWebhookPayload,
  TopupPayload,
  WithdrawalPayload,
} from '@/types'

// ─── Query keys ───────────────────────────────────────────────────────────────

export const qk = {
  balance: ['balance'] as const,
  transactions: (params?: object) => ['transactions', params] as const,
  escrows: (params?: object) => ['escrows', params] as const,
  escrow: (id: string) => ['escrow', id] as const,
  disputes: (params?: object) => ['disputes', params] as const,
  dispute: (id: string) => ['dispute', id] as const,
  webhooks: ['webhooks'] as const,
  deliveries: (id: string, params?: object) => ['deliveries', id, params] as const,
}

// ─── Balance ──────────────────────────────────────────────────────────────────

export function useBalance() {
  return useQuery({
    queryKey: qk.balance,
    queryFn: () => balancesApi.get().then((r) => r.data.data),
    refetchInterval: 30_000,
  })
}

export function useTransactions(params?: PaginationParams & { type?: string; status?: string }) {
  return useQuery({
    queryKey: qk.transactions(params),
    queryFn: () => balancesApi.transactions(params).then((r) => r.data.data),
  })
}

export function useTopup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: TopupPayload) => balancesApi.topup(payload).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.balance })
      qc.invalidateQueries({ queryKey: ['transactions'] })
      toast.success('Top-up successful')
    },
    onError: () => toast.error('Top-up failed. Please try again.'),
  })
}

export function useWithdrawal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: WithdrawalPayload) => balancesApi.withdraw(payload).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.balance })
      qc.invalidateQueries({ queryKey: ['transactions'] })
      toast.success('Withdrawal initiated')
    },
    onError: () => toast.error('Withdrawal failed. Please try again.'),
  })
}

// ─── Escrow ───────────────────────────────────────────────────────────────────

export function useEscrows(params?: PaginationParams & { status?: string }) {
  return useQuery({
    queryKey: qk.escrows(params),
    queryFn: () => escrowApi.list(params).then((r) => r.data.data),
  })
}

export function useEscrow(id: string) {
  return useQuery({
    queryKey: qk.escrow(id),
    queryFn: () => escrowApi.get(id).then((r) => r.data.data),
    enabled: Boolean(id),
  })
}

export function useCreateEscrow() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateEscrowPayload) =>
      escrowApi.create(payload).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['escrows'] })
      qc.invalidateQueries({ queryKey: qk.balance })
      toast.success('Escrow created successfully')
    },
    onError: () => toast.error('Failed to create escrow'),
  })
}

export function useReleaseEscrow() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => escrowApi.release(id).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['escrows'] })
      qc.invalidateQueries({ queryKey: qk.balance })
      toast.success('Escrow released successfully')
    },
    onError: () => toast.error('Failed to release escrow'),
  })
}

// ─── Disputes ─────────────────────────────────────────────────────────────────

export function useDisputes(params?: PaginationParams & { status?: string }) {
  return useQuery({
    queryKey: qk.disputes(params),
    queryFn: () => disputesApi.list(params).then((r) => r.data.data),
  })
}

export function useDispute(id: string) {
  return useQuery({
    queryKey: qk.dispute(id),
    queryFn: () => disputesApi.get(id).then((r) => r.data.data),
    enabled: Boolean(id),
  })
}

export function useOpenDispute() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: OpenDisputePayload) =>
      disputesApi.open(payload).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['disputes'] })
      qc.invalidateQueries({ queryKey: ['escrows'] })
      toast.success('Dispute opened')
    },
    onError: () => toast.error('Failed to open dispute'),
  })
}

export function useResolveDispute() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: ResolveDisputePayload) =>
      disputesApi.resolve(payload).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['disputes'] })
      toast.success('Dispute resolved')
    },
    onError: () => toast.error('Failed to resolve dispute'),
  })
}

// ─── Webhooks ─────────────────────────────────────────────────────────────────

export function useWebhooks() {
  return useQuery({
    queryKey: qk.webhooks,
    queryFn: () => webhooksApi.list().then((r) => r.data.data),
  })
}

export function useRegisterWebhook() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: RegisterWebhookPayload) =>
      webhooksApi.register(payload).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.webhooks })
      toast.success('Webhook registered')
    },
    onError: () => toast.error('Failed to register webhook'),
  })
}

export function useDeleteWebhook() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => webhooksApi.delete(id).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.webhooks })
      toast.success('Webhook deleted')
    },
    onError: () => toast.error('Failed to delete webhook'),
  })
}

export function useRotateWebhookSecret() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => webhooksApi.rotateSecret(id).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.webhooks })
      toast.success('Webhook secret rotated')
    },
    onError: () => toast.error('Failed to rotate secret'),
  })
}

export function useWebhookDeliveries(id: string, params?: PaginationParams) {
  return useQuery({
    queryKey: qk.deliveries(id, params),
    queryFn: () => webhooksApi.deliveries(id, params).then((r) => r.data.data),
    enabled: Boolean(id),
  })
}

// ─── Auth mutations ───────────────────────────────────────────────────────────

export function useUpdateProfile() {
  return useMutation({
    mutationFn: (data: { name: string; email: string }) =>
      authApi.updateProfile(data).then((r) => r.data.data),
    onSuccess: (user) => {
      useAuthStore.getState().setUser(user)
      toast.success('Profile updated')
    },
    onError: () => toast.error('Failed to update profile'),
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      authApi.changePassword(currentPassword, newPassword).then((r) => r.data),
    onSuccess: () => toast.success('Password changed successfully'),
    onError: () => toast.error('Failed to change password'),
  })
}
