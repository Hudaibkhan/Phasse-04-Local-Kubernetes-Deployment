'use client'
import { ChatWidget } from '@/components/chat/ChatWidget'
import { ChatErrorBoundary } from '@/components/chat/ChatErrorBoundary'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <>
      {/* Dashboard pages content */}
      {children}

      {/* Floating chat widget with error boundary - available on all dashboard pages */}
      <ChatErrorBoundary>
        <ChatWidget />
      </ChatErrorBoundary>
    </>
  )
}
