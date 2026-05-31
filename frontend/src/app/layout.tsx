import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'Chronos Engine — Causal Intelligence Platform',
  description: 'Computational Laboratory for Causality, Paradoxes, and Alternate Timelines',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-chronos-bg text-white font-['Inter'] antialiased overflow-hidden">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#0a0f1e',
              color: '#e2e8f0',
              border: '1px solid #1a2744',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '13px',
            },
            success: { iconTheme: { primary: '#00ff88', secondary: '#050810' } },
            error: { iconTheme: { primary: '#ff4466', secondary: '#050810' } },
          }}
        />
      </body>
    </html>
  )
}
