import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider } from '../context/ThemeContext'
import { TaskProvider } from '../context/TaskContext'
import { NotificationProvider } from '../context/NotificationContext'
import "../styles/globals.css"
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Quantum Todo',
  description: 'A modern todo application with advanced features',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <TaskProvider>
              <NotificationProvider>
                <Header />

                {children}
                <Footer/>
              </NotificationProvider>
            </TaskProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
