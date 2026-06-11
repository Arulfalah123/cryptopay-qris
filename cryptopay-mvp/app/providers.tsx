'use client'

import { ReactNode } from 'react'

// Providers wrapper sederhana — WalletConnect diinisialisasi langsung di komponen
export function Providers({ children }: { children: ReactNode }) {
  return <>{children}</>
}
