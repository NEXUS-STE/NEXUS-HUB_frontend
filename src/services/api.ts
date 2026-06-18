import { apiClient } from '@/lib/api-client'
import type {
  ApiResponse,
  LoginResponse,
  RegisterResponse,
  Balance,
  Transaction,
  PaginatedResponse,
  PaginationParams,
  Escrow,
  CreateEscrowPayload,
  Dispute,
  OpenDisputePayload,
  ResolveDisputePayload,
  Webhook,
  WebhookDelivery,
  RegisterWebhookPayload,
  TopupPayload,
  WithdrawalPayload,
  User,
} from '@/types'

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<ApiResponse<LoginResponse>>('/auth/login', { email, password }),

  register: (name: string, email: string, password: string) =>
    apiClient.post<ApiResponse<RegisterResponse>>('/auth/register', { name, email, password }),

  logout: () => apiClient.post<ApiResponse<null>>('/auth/logout'),

  refresh: (refreshToken: string) =>
    apiClient.post<ApiResponse<{ accessToken: string; refreshToken: string }>>('/auth/refresh', {
      refreshToken,
    }),

  me: () => apiClient.get<ApiResponse<User>>('/auth/me'),

  updateProfile: (data: { name: string; email: string }) =>
    apiClient.patch<ApiResponse<User>>('/auth/me', data),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiClient.patch<ApiResponse<null>>('/auth/me/password', { currentPassword, newPassword }),
}

// ─── Balance ──────────────────────────────────────────────────────────────────

export const balancesApi = {
  get: () => apiClient.get<ApiResponse<Balance>>('/wallet/balance'),

  topup: (payload: TopupPayload) =>
    apiClient.post<ApiResponse<Transaction>>('/wallet/topup', payload),

  withdraw: (payload: WithdrawalPayload) =>
    apiClient.post<ApiResponse<Transaction>>('/wallet/withdraw', payload),

  transactions: (params?: PaginationParams & { type?: string; status?: string }) =>
    apiClient.get<ApiResponse<PaginatedResponse<Transaction>>>('/wallet/transactions', { params }),
}

// ─── Escrow ───────────────────────────────────────────────────────────────────

export const escrowApi = {
  list: (params?: PaginationParams & { status?: string }) =>
    apiClient.get<ApiResponse<PaginatedResponse<Escrow>>>('/escrows', { params }),

  get: (id: string) => apiClient.get<ApiResponse<Escrow>>(`/escrows/${id}`),

  create: (payload: CreateEscrowPayload) =>
    apiClient.post<ApiResponse<Escrow>>('/escrows', payload),

  release: (id: string) => apiClient.post<ApiResponse<Escrow>>(`/escrows/${id}/release`),

  cancel: (id: string) => apiClient.post<ApiResponse<Escrow>>(`/escrows/${id}/cancel`),
}

// ─── Disputes ─────────────────────────────────────────────────────────────────

export const disputesApi = {
  list: (params?: PaginationParams & { status?: string }) =>
    apiClient.get<ApiResponse<PaginatedResponse<Dispute>>>('/disputes', { params }),

  get: (id: string) => apiClient.get<ApiResponse<Dispute>>(`/disputes/${id}`),

  open: (payload: OpenDisputePayload) =>
    apiClient.post<ApiResponse<Dispute>>('/disputes', payload),

  resolve: (payload: ResolveDisputePayload) =>
    apiClient.post<ApiResponse<Dispute>>(`/disputes/${payload.disputeId}/resolve`, {
      resolution: payload.resolution,
      notes: payload.notes,
    }),
}

// ─── Webhooks ─────────────────────────────────────────────────────────────────

export const webhooksApi = {
  list: () => apiClient.get<ApiResponse<Webhook[]>>('/webhooks'),

  register: (payload: RegisterWebhookPayload) =>
    apiClient.post<ApiResponse<Webhook>>('/webhooks', payload),

  delete: (id: string) => apiClient.delete<ApiResponse<null>>(`/webhooks/${id}`),

  rotateSecret: (id: string) =>
    apiClient.post<ApiResponse<{ secret: string }>>(`/webhooks/${id}/rotate-secret`),

  deliveries: (id: string, params?: PaginationParams) =>
    apiClient.get<ApiResponse<PaginatedResponse<WebhookDelivery>>>(`/webhooks/${id}/deliveries`, {
      params,
    }),
}
