import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from "@/app/components/theme-provider"
import { Header } from "@/app/components/Header"
import { Toaster } from "@/app/components/Toaster"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NL to SQL Query',
  description: 'Convert natural language to SQL queries',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main className="mx-auto py-6 px-4 lg:px-4">
            {children}
          </main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
