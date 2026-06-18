import { Sidebar } from '@/components/layout/sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[--color-shell]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {/* pt-16 on mobile to clear the fixed topbar; removed on lg where sidebar is inline */}
        <div className="max-w-6xl mx-auto px-4 lg:px-6 py-6 pt-20 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  )
}
