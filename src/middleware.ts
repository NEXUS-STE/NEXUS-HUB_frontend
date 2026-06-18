import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/auth/login', '/auth/register']
const DASHBOARD_PREFIX = '/dashboard'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Read auth state from the persisted Zustand store in localStorage.
  // Because middleware runs on the edge (no localStorage), we use the cookie
  // that we manually set on login as a lightweight signal. If the cookie is
  // absent, treat the user as unauthenticated.
  const isAuthed = request.cookies.has('nexus-authed')

  const isPublicPath = PUBLIC_PATHS.some((p) => pathname.startsWith(p))
  const isDashboardPath = pathname.startsWith(DASHBOARD_PREFIX)

  // Unauthenticated user trying to reach a protected route
  if (isDashboardPath && !isAuthed) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }

  // Authenticated user trying to reach login/register
  if (isPublicPath && isAuthed) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*'],
}
