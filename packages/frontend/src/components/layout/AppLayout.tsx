import { ReactNode } from 'react'
import { Navbar } from './Navbar'
import { BottomNav } from './BottomNav'
import { AssistantPanel } from '../assistant/AssistantPanel'
import { ToastContainer } from '../ui/ToastContainer'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-bone">
      <Navbar />
      <main className="max-w-screen-2xl mx-auto px-3 sm:px-2 py-8 pb-28 sm:pb-10">
        {children}
      </main>
      <BottomNav />
      <AssistantPanel />
      <ToastContainer />
    </div>
  )
}
