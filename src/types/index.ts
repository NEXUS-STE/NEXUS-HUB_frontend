// ─── Auth ────────────────────────────────────────────────────────────────────

export interface User {
  id: string
  email: string
  name: string
  createdAt: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export interface RegisterResponse {
  user: User
  accessToken: string
  refreshToken: string
}

// ─── Balance ─────────────────────────────────────────────────────────────────

export interface Balance {
  available: string
  reserved: string
  currency: string
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export type TransactionStatus = 'completed' | 'pending' | 'failed'
export type TransactionType = 'topup' | 'withdrawal' | 'escrow_lock' | 'escrow_release' | 'dispute_refund'

export interface Transaction {
  id: string
  type: TransactionType
  status: TransactionStatus
  amount: string
  currency: string
  reference: string
  description: string
  createdAt: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface PaginationParams {
  page?: number
  limit?: number
}

// ─── Escrow ──────────────────────────────────────────────────────────────────

export type EscrowStatus = 'pending' | 'active' | 'released' | 'disputed' | 'cancelled' | 'expired'

export interface Escrow {
  id: string
  title: string
  description: string
  amount: string
  currency: string
  status: EscrowStatus
  buyerId: string
  sellerId: string
  buyerEmail: string
  sellerEmail: string
  conditions: string
  expiresAt: string
  createdAt: string
  updatedAt: string
}

export interface CreateEscrowPayload {
  title: string
  description: string
  amount: string
  currency?: string
  sellerEmail: string
  conditions: string
  expiresAt: string
}

// ─── Disputes ────────────────────────────────────────────────────────────────

export type DisputeStatus = 'open' | 'under_review' | 'resolved' | 'closed'
export type DisputeResolution = 'buyer' | 'seller' | 'split' | null

export interface Dispute {
  id: string
  escrowId: string
  escrowTitle: string
  reason: string
  description: string
  status: DisputeStatus
  resolution: DisputeResolution
  openedById: string
  createdAt: string
  updatedAt: string
}

export interface OpenDisputePayload {
  escrowId: string
  reason: string
  description: string
}

export interface ResolveDisputePayload {
  disputeId: string
  resolution: 'buyer' | 'seller' | 'split'
  notes?: string
}

// ─── Webhooks ─────────────────────────────────────────────────────────────────

export type WebhookEvent =
  | 'escrow.created'
  | 'escrow.released'
  | 'escrow.disputed'
  | 'escrow.cancelled'
  | 'dispute.opened'
  | 'dispute.resolved'
  | 'topup.completed'
  | 'withdrawal.completed'

export type WebhookDeliveryStatus = 'success' | 'failed' | 'pending'

export interface Webhook {
  id: string
  url: string
  events: WebhookEvent[]
  isActive: boolean
  secret: string
  createdAt: string
}

export interface WebhookDelivery {
  id: string
  webhookId: string
  event: WebhookEvent
  status: WebhookDeliveryStatus
  statusCode: number | null
  responseBody: string | null
  attemptedAt: string
}

export interface RegisterWebhookPayload {
  url: string
  events: WebhookEvent[]
}

// ─── Wallet actions ───────────────────────────────────────────────────────────

export interface TopupPayload {
  amount: string
  reference?: string
}

export interface WithdrawalPayload {
  amount: string
  accountNumber: string
  bankCode: string
}

// ─── API wrapper ──────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
}
