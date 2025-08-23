'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface BusinessData {
  id: string
  name: string
  slug: string
  category: string
  phone: string
  email?: string
  address: string
  description?: string
  logo?: string
  profilePhotoUrl?: string
  coverImage?: string
  isActive: boolean
  workingHours: {
    dayOfWeek: number
    isOpen: boolean
    openTime: string
    closeTime: string
  }[]
  todayStats: {
    revenue: number
    appointments: number
  }
  isCurrentlyOpen: boolean
  currentOpenHours: string
}

export function useBusinessData() {
  const { data: session } = useSession()
  const [businessData, setBusinessData] = useState<BusinessData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!session?.user?.id) {
      setLoading(false)
      setBusinessData(null)
      return
    }

    fetchBusinessData()
  }, [session?.user?.id]) // Sadece user id'si değiştiğinde çalış

  const fetchBusinessData = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('Fetching business data for user:', session?.user?.id)

      const response = await fetch('/api/businesses', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      console.log('API Response status:', response.status)

      if (!response.ok) {
        throw new Error('İşletme bilgileri alınamadı')
      }

      const data = await response.json()
      console.log('API Response data:', data)
      
      if (data.businesses && data.businesses.length > 0) {
        const business = data.businesses[0] // İlk işletmeyi al
        console.log('Selected business:', business)
        console.log('Business profilePhotoUrl from DB:', business.profilePhotoUrl)
        
        // Bugünkü istatistikleri al
        const todayStats = await fetchTodayStats(business.id)
        
        // Açık/kapalı durumunu ve saatleri hesapla
        const { isCurrentlyOpen, currentOpenHours } = calculateOpenStatus(business.workingHours || [])
        
        setBusinessData({
          ...business,
          todayStats,
          isCurrentlyOpen,
          currentOpenHours
        })
      } else {
        setError('İşletme bulunamadı')
      }
    } catch (err) {
      console.error('Business data fetch error:', err)
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const fetchTodayStats = async (businessId: string) => {
    try {
      // Bugünkü tarihi al
      const today = new Date().toISOString().split('T')[0]
      
      const response = await fetch(`/api/dashboard/stats?businessId=${businessId}&date=${today}`)
      
      if (response.ok) {
        const stats = await response.json()
        return {
          revenue: stats.revenue || 0,
          appointments: stats.appointments || 0
        }
      }
    } catch (error) {
      console.error('Stats fetch error:', error)
    }
    
    // Fallback değerler
    return {
      revenue: 0,
      appointments: 0
    }
  }

  const calculateOpenStatus = (workingHours: any[]) => {
    // Working hours kontrolü
    if (!workingHours || !Array.isArray(workingHours) || workingHours.length === 0) {
      return {
        isCurrentlyOpen: false,
        currentOpenHours: 'Çalışma saatleri belirtilmemiş'
      }
    }
    
    const now = new Date()
    const currentDay = now.getDay() // 0 = Pazar, 1 = Pazartesi...
    const currentTime = now.toTimeString().slice(0, 5) // HH:MM format
    
    const todayHours = workingHours.find(wh => wh.dayOfWeek === currentDay)
    
    if (!todayHours || !todayHours.isOpen) {
      // Bugün kapalı, bir sonraki açık günü bul
      const nextOpenDay = findNextOpenDay(workingHours, currentDay)
      return {
        isCurrentlyOpen: false,
        currentOpenHours: nextOpenDay ? `Yarın ${nextOpenDay.openTime}` : 'Kapalı'
      }
    }
    
    // Bugün açık, saat kontrolü yap
    const openTime = todayHours.openTime
    const closeTime = todayHours.closeTime
    
    if (currentTime >= openTime && currentTime <= closeTime) {
      return {
        isCurrentlyOpen: true,
        currentOpenHours: `${openTime} - ${closeTime}`
      }
    } else {
      return {
        isCurrentlyOpen: false,
        currentOpenHours: `${openTime} - ${closeTime}`
      }
    }
  }

  const findNextOpenDay = (workingHours: any[], currentDay: number) => {
    if (!workingHours || !Array.isArray(workingHours)) {
      return null
    }
    
    for (let i = 1; i <= 7; i++) {
      const nextDay = (currentDay + i) % 7
      const dayHours = workingHours.find(wh => wh.dayOfWeek === nextDay)
      if (dayHours && dayHours.isOpen) {
        return dayHours
      }
    }
    return null
  }

  return {
    businessData,
    loading,
    error,
    refetch: fetchBusinessData
  }
}
