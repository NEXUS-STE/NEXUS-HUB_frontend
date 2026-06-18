# NEXUS-HUB Frontend

A modern, full-featured escrow and payments dashboard built with Next.js 15. NEXUS-HUB provides secure escrow creation, dispute resolution, wallet management, and webhook delivery infrastructure — all behind a polished deep-navy + electric-cyan UI.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Pages & Routes](#pages--routes)
- [Design System](#design-system)
- [API Integration](#api-integration)
- [Auth Flow](#auth-flow)

---

## Overview

NEXUS-HUB is an escrow infrastructure platform. The frontend is a single-page dashboard application that connects to a REST API backend. It handles:

- **Wallet** — top-up, withdraw, and track transaction history
- **Escrow** — create escrows, release funds, cancel, and filter by status
- **Disputes** — open disputes against escrows, track resolution status
- **Webhooks** — register endpoints, rotate signing secrets, inspect delivery history
- **Settings** — profile management and password changes

All server state is managed via TanStack Query with automatic background refetching. Auth tokens are persisted in `localStorage` via Zustand and attached to every API request automatically.

---

## Tech Stack

| Layer | Library / Tool |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI Library | React 19 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Forms | React Hook Form + Zod |
| Server State | TanStack Query v5 |
| Client State | Zustand 5 |
| HTTP Client | Axios |
| Notifications | react-hot-toast |
| Icons | lucide-react |
| Auth | Cookie-based middleware guard |

---

## Features

- **Auth guard middleware** — unauthenticated users are redirected to `/auth/login`; logged-in users are bounced away from auth pages
- **Auto token refresh** — Axios interceptor silently refreshes expired access tokens on 401 and replays the original request
- **Paginated tables** — all list views support page-based navigation
- **Status filter tabs** — escrows, disputes, and transactions are filterable by status
- **Confirmation dialogs** — destructive actions (withdraw, release, cancel escrow) require explicit confirmation
- **Mobile sidebar** — full-screen drawer on small screens, fixed sidebar on desktop
- **Empty states** — every zero-data view has a contextual icon, message, and CTA
- **Error boundaries** — scoped error boundaries on all dashboard sections with retry
- **Custom 404 & 500 pages**

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx                  Root layout (Providers, Toaster)
│   ├── page.tsx                    Redirects → /dashboard
│   ├── not-found.tsx               Custom 404 page
│   ├── error.tsx                   Global error boundary
│   ├── auth/
│   │   ├── login/page.tsx          Sign-in page
│   │   └── register/page.tsx       Registration page
│   └── dashboard/
│       ├── layout.tsx              Sidebar + main wrapper
│       ├── page.tsx                Overview: balance cards + activity
│       ├── error.tsx               Dashboard-scoped error boundary
│       ├── wallet/page.tsx         Top-up, withdraw, transaction history
│       ├── escrow/page.tsx         Escrow list, create, release, cancel
│       ├── disputes/page.tsx       Dispute list + open dispute form
│       ├── webhooks/page.tsx       Endpoint management + delivery history
│       └── settings/page.tsx       Profile + password settings
│
├── components/
│   ├── ui/index.tsx                All shared primitives
│   └── layout/
│       ├── sidebar.tsx             Nav sidebar (desktop + mobile drawer)
│       └── providers.tsx           QueryClientProvider + Toaster
│
├── services/api.ts                 All Axios API calls
├── hooks/use-nexus-queries.ts      All TanStack Query hooks and mutations
├── stores/auth.store.ts            Zustand auth store (persisted)
├── middleware.ts                   Edge auth guard
├── lib/
│   ├── api-client.ts               Axios instance with interceptors
│   ├── utils.ts                    cn(), formatAmount(), formatDate() etc.
│   └── schemas.ts                  Zod validation schemas
└── types/index.ts                  TypeScript types for all API shapes
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- A running NEXUS-HUB backend API (see [API Integration](#api-integration))

### Installation

```bash
# Clone the repository
git clone https://github.com/NEXUS-STE/NEXUS-HUB_frontend.git
cd NEXUS-HUB_frontend

# Install dependencies
npm install
```

### Run in development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the NEXUS-HUB REST API | `http://localhost:4000/api` |

---

## Available Scripts

```bash
npm run dev      # Start development server (hot reload)
npm run build    # Build for production
npm run start    # Start production server
```

---

## Pages & Routes

| Route | Description | Auth required |
|---|---|---|
| `/` | Redirects to `/dashboard` | — |
| `/auth/login` | Sign-in form | No |
| `/auth/register` | Registration form | No |
| `/dashboard` | Overview: balances, recent transactions, active escrows | Yes |
| `/dashboard/wallet` | Balance cards, top-up/withdraw modals, transaction history | Yes |
| `/dashboard/escrow` | Escrow list with status filters, create/release/cancel | Yes |
| `/dashboard/disputes` | Dispute list with status filters, open dispute form | Yes |
| `/dashboard/webhooks` | Webhook endpoints, delivery logs, secret rotation | Yes |
| `/dashboard/settings` | Profile edit, password change, danger zone | Yes |

---

## Design System

NEXUS-HUB's brand is **deep navy + electric cyan**. All color tokens are defined as CSS custom properties in `src/app/globals.css`.

### Color Tokens

| Token | Hex | Usage |
|---|---|---|
| `--color-shell` | `#0A0F1E` | Page / body background |
| `--color-surface` | `#111827` | Cards |
| `--color-surface-2` | `#1A2335` | Hover states, nested surfaces |
| `--color-border` | `#1E2D45` | Card borders |
| `--color-accent` | `#00D4FF` | Primary CTA, active nav, balance amount |
| `--color-success` | `#10B981` | Released, completed |
| `--color-warning` | `#F59E0B` | Disputed, reserved |
| `--color-error` | `#EF4444` | Failed, cancelled, danger |
| `--color-text-primary` | `#F0F6FF` | Headings, values |
| `--color-text-secondary` | `#94A3B8` | Labels, metadata |
| `--color-text-muted` | `#475569` | Timestamps, secondary info |

### Typography

- **UI font** — Inter (system fallback)
- **Mono font** — JetBrains Mono for amounts, hashes, and IDs
- Use the `.amount` CSS class for monetary values (mono font + tabular nums)
- Use the `.hash` CSS class for transaction hashes and contract IDs

### Signature Element

The available balance card carries a `balance-pulse` CSS animation — a slow cyan glow pulse. This is the most visually distinctive element of the UI and should never be removed.

### UI Primitives

All shared components are exported from `@/components/ui`:

```tsx
import {
  Button, Input, Textarea, Select, Card,
  Table, Th, Td, Skeleton, EmptyState,
  Modal, ConfirmDialog, Divider, PageHeader,
  Tabs, Pagination, StatCard,
  EscrowStatusBadge, DisputeStatusBadge,
  TxStatusBadge, DeliveryStatusBadge,
} from '@/components/ui'
```

---

## API Integration

All API calls live in `src/services/api.ts`, grouped by domain:

| Export | Endpoints covered |
|---|---|
| `authApi` | login, register, logout, refresh, me, updateProfile, changePassword |
| `balancesApi` | get balance, topup, withdraw, transactions |
| `escrowApi` | list, get, create, release, cancel |
| `disputesApi` | list, get, open, resolve |
| `webhooksApi` | list, register, delete, rotateSecret, deliveries |

The Axios instance in `src/lib/api-client.ts` automatically:
- Attaches the `Authorization: Bearer <token>` header on every request
- Intercepts 401 responses, refreshes the token, and retries the original request
- Queues concurrent requests during a token refresh to avoid race conditions

### Expected API base

```
http://localhost:4000/api
```

All responses are expected to follow this envelope:

```ts
{
  success: boolean
  message: string
  data: T
}
```

---

## Auth Flow

1. User logs in → `POST /auth/login` → tokens stored in Zustand + `localStorage`
2. A `nexus-authed` cookie is written client-side so the Next.js edge middleware can gate dashboard routes without reading `localStorage`
3. Every API request has the access token injected by the Axios request interceptor
4. On a 401, the interceptor calls `POST /auth/refresh`, stores the new tokens, and replays the failed request
5. On logout (or refresh failure), `clearAuth()` wipes the store, the cookie, and redirects to `/auth/login`
