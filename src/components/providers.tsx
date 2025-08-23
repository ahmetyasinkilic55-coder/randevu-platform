'use client'

import { SessionProvider } from 'next-auth/react'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider 
      refetchInterval={5 * 60} // 5 dakikada bir session'u yenile
      refetchOnWindowFocus={false} // Pencere focus'unda otomatik yenileme yapma
    >
      {children}
    </SessionProvider>
  )
}
