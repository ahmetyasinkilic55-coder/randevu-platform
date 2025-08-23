import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface Business {
  id: string
  name: string
  slug: string
  sector: string
  phone: string
  email: string
  address: string
  description?: string
  websiteUrl?: string
  instagramUrl?: string
  facebookUrl?: string
  createdAt: string
  updatedAt: string
  _count?: {
    appointments: number
    services: number
    staff: number
  }
}

export function useActiveBusiness() {
  const { data: session } = useSession()
  const [business, setBusiness] = useState<Business | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBusiness = async () => {
      if (!session?.user) {
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch('/api/businesses')
        
        if (!response.ok) {
          throw new Error('İşletmeler alınamadı')
        }

        const data = await response.json()
        
        // İlk işletmeyi aktif işletme olarak ayarla (şimdilik)
        if (data.businesses && data.businesses.length > 0) {
          setBusiness(data.businesses[0])
        } else {
          setError('Henüz kayıtlı işletmeniz bulunmuyor')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bir hata oluştu')
      } finally {
        setIsLoading(false)
      }
    }

    fetchBusiness()
  }, [session])

  return { business, isLoading, error, refetch: () => {
    setIsLoading(true)
    setError(null)
    // useEffect tekrar çalışacak
  }}
}
