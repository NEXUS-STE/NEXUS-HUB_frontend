import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const topupSchema = z.object({
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, 'Amount must be a positive number'),
  reference: z.string().optional(),
})

export const withdrawalSchema = z.object({
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, 'Amount must be a positive number'),
  accountNumber: z.string().min(10, 'Enter a valid account number'),
  bankCode: z.string().min(3, 'Enter a valid bank code'),
})

export const createEscrowSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, 'Amount must be a positive number'),
  currency: z.string().default('USD'),
  sellerEmail: z.string().email('Enter a valid seller email'),
  conditions: z.string().min(10, 'Conditions must be at least 10 characters'),
  expiresAt: z.string().min(1, 'Expiry date is required'),
})

export const openDisputeSchema = z.object({
  escrowId: z.string().min(1, 'Escrow is required'),
  reason: z.string().min(5, 'Reason must be at least 5 characters'),
  description: z.string().min(20, 'Please provide a detailed description (min 20 characters)'),
})

export const resolveDisputeSchema = z.object({
  disputeId: z.string().min(1, 'Dispute ID is required'),
  resolution: z.enum(['buyer', 'seller', 'split']),
  notes: z.string().optional(),
})

export const registerWebhookSchema = z.object({
  url: z.string().url('Enter a valid URL'),
  events: z.array(z.string()).min(1, 'Select at least one event'),
})

export const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
})

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type TopupInput = z.infer<typeof topupSchema>
export type WithdrawalInput = z.infer<typeof withdrawalSchema>
export type CreateEscrowInput = z.infer<typeof createEscrowSchema>
export type OpenDisputeInput = z.infer<typeof openDisputeSchema>
export type ResolveDisputeInput = z.infer<typeof resolveDisputeSchema>
export type RegisterWebhookInput = z.infer<typeof registerWebhookSchema>
export type ProfileInput = z.infer<typeof profileSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
