import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/layout/providers'

export const metadata: Metadata = {
  title: 'NEXUS-HUB',
  description: 'Secure escrow and payment infrastructure',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
