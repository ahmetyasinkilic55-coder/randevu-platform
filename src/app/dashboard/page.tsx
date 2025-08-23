'use client'

import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { checkClientSideAccess } from '@/lib/auth-utils'
import { 
  CalendarDaysIcon,
  BanknotesIcon,
  UserGroupIcon,
  TrophyIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  PlusIcon,
  Cog6ToothIcon,
  PencilIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline'

// Animated Counter Hook - Componentin dışında tanımlandı
const useAnimatedCounter = (target: number, duration: number = 1000) => {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    if (typeof target !== 'number' || target < 0) {
      setCount(0)
      return
    }
    
    let startTime = Date.now()
    let animationFrame: number
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const currentCount = Math.floor(target * progress)
      
      setCount(currentCount)
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      } else {
        setCount(target) // Son değeri garantile
      }
    }
    
    animationFrame = requestAnimationFrame(animate)
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [target, duration])
  
  return count
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isCheckingAccess, setIsCheckingAccess] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [dashboardData, setDashboardData] = useState<{
    todayAppointments: number
    dailyRevenue: number
    todayCustomers: number
    completionRate: number
    dailyTarget: number
    revenueTarget: number
    appointments: any[]
    trends: {
      appointments: string
      revenue: string
      customers: string
      completion: string
    }
  }>({
    todayAppointments: 0,
    dailyRevenue: 0,
    todayCustomers: 0,
    completionRate: 0,
    dailyTarget: 20,
    revenueTarget: 5000,
    appointments: [],
    trends: {
      appointments: '+0%',
      revenue: '+0%',
      customers: '+0%',
      completion: '+0%'
    }
  })
  const [isLoading, setIsLoading] = useState(true)
  
  // Animated counters
  const animatedAppointments = useAnimatedCounter(dashboardData.todayAppointments)
  const animatedRevenue = useAnimatedCounter(dashboardData.dailyRevenue)
  const animatedCustomers = useAnimatedCounter(dashboardData.todayCustomers)
  
  // Dashboard verilerini API'den çek
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        
        // User'ın business'ını al
        const userBusinessRes = await fetch('/api/debug')
        const userBusinessData = await userBusinessRes.json()
        
        if (!userBusinessData.businesses || userBusinessData.businesses.length === 0) {
          console.log('No business found for user')
          setIsLoading(false)
          return
        }
        
        // İlk business'ı kullan
        const businessId = userBusinessData.businesses[0].id
        console.log('Dashboard - Using Business ID:', businessId)
        
        const today = new Date().toISOString().split('T')[0]
        
        // API istekleri
        const [statsRes, appointmentsRes, trendsRes] = await Promise.all([
          fetch(`/api/dashboard/stats?businessId=${businessId}&date=${today}`).catch(err => {
            console.error('Stats API error:', err)
            return { ok: false, error: 'Stats API failed' }
          }),
          fetch(`/api/dashboard/appointments/today?businessId=${businessId}`).catch(err => {
            console.error('Appointments API error:', err)
            return { ok: false, error: 'Appointments API failed' }
          }),
          fetch(`/api/dashboard/trends?businessId=${businessId}`).catch(err => {
            console.error('Trends API error:', err)
            return { ok: false, error: 'Trends API failed' }
          })
        ])
        
        console.log('API Responses:', {
          stats: { ok: statsRes.ok, status: 'status' in statsRes ? statsRes.status : 'unknown' },
          appointments: { ok: appointmentsRes.ok, status: 'status' in appointmentsRes ? appointmentsRes.status : 'unknown' },
          trends: { ok: trendsRes.ok, status: 'status' in trendsRes ? trendsRes.status : 'unknown' }
        })
        
        if (!statsRes.ok) {
          console.error('Stats API failed:', 'status' in statsRes ? statsRes.status : 'unknown')
        }
        if (!appointmentsRes.ok) {
          console.error('Appointments API failed:', 'status' in appointmentsRes ? appointmentsRes.status : 'unknown')
        }
        if (!trendsRes.ok) {
          console.error('Trends API failed:', 'status' in trendsRes ? trendsRes.status : 'unknown')
        }
        
        const [stats, appointmentsData, trends] = await Promise.all([
          statsRes.ok && 'json' in statsRes ? statsRes.json().catch(() => ({})) : {},
          appointmentsRes.ok && 'json' in appointmentsRes ? appointmentsRes.json().catch(() => ({ data: [] })) : { data: [] },
          trendsRes.ok && 'json' in trendsRes ? trendsRes.json().catch(() => ({})) : {}
        ])
        
        console.log('Parsed Data:', { stats, appointmentsData, trends })
        
        // İstatistikleri işle
        const todayCustomers = appointmentsData.data ? 
        [...new Set(appointmentsData.data.map((apt: any) => apt.clientEmail).filter(Boolean))].length : 0

        const completionRate = (stats as any)?.totalAppointments > 0 ? 
        Math.round(((stats as any)?.completedAppointments / (stats as any)?.totalAppointments) * 100) : 0
        
        setDashboardData({
          todayAppointments: (stats as any)?.totalAppointments || 0,
          dailyRevenue: (stats as any)?.revenue || 0,
          todayCustomers: todayCustomers,
          completionRate: completionRate,
          dailyTarget: 20,
          revenueTarget: 5000,
          appointments: appointmentsData.data || [],
          trends: {
            appointments: (trends as any)?.appointments || '+0%',
            revenue: (trends as any)?.revenue || '+0%',
            customers: (trends as any)?.customers || '+0%',
            completion: (trends as any)?.completion || '+0%'
          }
        })
      } catch (error) {
        console.error('Dashboard data fetch error:', error)
        // Hata durumunda varsayılan değerler kullanılır
      } finally {
        setIsLoading(false)
      }
    }
    
    if (session?.user?.id) {
      fetchDashboardData()
    }
  }, [session])
  
  // Erişim kontrolü
  useEffect(() => {
    if (status === 'loading') return
    
    try {
      const accessCheck = checkClientSideAccess(session)
      
      if (!accessCheck.hasAccess) {
        router.push(accessCheck.redirectTo || '/login')
        return
      }
      
      setIsCheckingAccess(false)
    } catch (error) {
      console.error('Access check error:', error)
      router.push('/auth/signin')
    }
  }, [session, status, router])
  
  // Loading state
  if (status === 'loading' || isCheckingAccess || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Dashboard yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-8">
      {/* Welcome Section */}
      <div className={`rounded-2xl p-4 sm:p-8 ${
        isDarkMode ? 'bg-gray-800' : 'bg-gradient-to-r from-purple-500 to-pink-500'
      } text-white`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-xl sm:text-3xl font-bold mb-2 sm:mb-3">
              Hoş geldiniz, İşletme Sahibi! 👋
            </h2>
            <p className="text-sm sm:text-lg opacity-90">
              Bugün {animatedAppointments} randevunuz var. Hedefin %{Math.round((dashboardData.todayAppointments / dashboardData.dailyTarget) * 100)} tamamlandı.
            </p>
          </div>
          <div className="text-center sm:text-right">
            <div className="text-2xl sm:text-4xl font-bold">{Math.round((dashboardData.todayAppointments / dashboardData.dailyTarget) * 100)}%</div>
            <div className="text-sm sm:text-lg opacity-75">Günlük Hedef ({dashboardData.dailyTarget})</div>
          </div>
        </div>
        <div className="mt-4 sm:mt-6 bg-white bg-opacity-20 rounded-full h-2 sm:h-3">
          <div 
            className="bg-white rounded-full h-2 sm:h-3 transition-all duration-1000 ease-out"
            style={{ width: `${Math.min((dashboardData.todayAppointments / dashboardData.dailyTarget) * 100, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          {
            title: 'Bugünkü Randevular',
            value: animatedAppointments,
            subtitle: 'randevu',
            icon: CalendarDaysIcon,
            color: 'blue',
            trend: dashboardData.trends.appointments,
            trendUp: dashboardData.trends.appointments.includes('+')
          },
          {
            title: 'Günlük Gelir',
            value: `₺${animatedRevenue.toLocaleString('tr-TR')}`,
            subtitle: `hedef: ₺${dashboardData.revenueTarget.toLocaleString('tr-TR')}`,
            icon: BanknotesIcon,
            color: 'green',
            trend: dashboardData.trends.revenue,
            trendUp: dashboardData.trends.revenue.includes('+')
          },
          {
            title: 'Müşteriler',
            value: animatedCustomers,
            subtitle: 'bugün',
            icon: UserGroupIcon,
            color: 'purple',
            trend: dashboardData.trends.customers,
            trendUp: dashboardData.trends.customers.includes('+')
          },
          {
            title: 'Tamamlanma Oranı',
            value: `%${dashboardData.completionRate}`,
            subtitle: 'başarı oranı',
            icon: TrophyIcon,
            color: 'orange',
            trend: dashboardData.trends.completion,
            trendUp: dashboardData.trends.completion.includes('+')
          }
        ].map((stat, index) => (
          <div key={index} className={`rounded-xl p-4 sm:p-6 shadow-sm border transition-all duration-300 hover:scale-105 ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className={`p-2 sm:p-3 rounded-lg ${
                stat.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                stat.color === 'green' ? 'bg-green-100 text-green-600' :
                stat.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                'bg-orange-100 text-orange-600'
              }`}>
                <stat.icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className={`flex items-center space-x-1 text-xs sm:text-sm ${
                stat.trendUp ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.trendUp ? 
                  <ArrowTrendingUpIcon className="w-3 h-3 sm:w-4 sm:h-4" /> : 
                  <ArrowTrendingDownIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                }
                <span>{stat.trend}</span>
              </div>
            </div>
            <div>
              <div className={`text-xl sm:text-2xl font-bold mb-1 transition-colors ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {stat.value}
              </div>
              <div className={`text-xs sm:text-sm transition-colors ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {stat.subtitle}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className={`rounded-xl p-4 sm:p-8 shadow-sm border transition-colors ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
      }`}>
        <h3 className={`text-lg sm:text-xl font-semibold mb-4 sm:mb-6 transition-colors ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Hızlı İşlemler
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-6">
          {[
            { icon: PlusIcon, label: 'Yeni Randevu', action: () => router.push('/dashboard/appointments') },
            { icon: UserGroupIcon, label: 'Personel Yönet', action: () => router.push('/dashboard/staff') },
            { icon: ClockIcon, label: 'İzin Yönetimi', action: () => router.push('/dashboard/staff-leave') },
            { icon: Cog6ToothIcon, label: 'Hizmet Ekle', action: () => router.push('/dashboard/services') },
            { icon: PencilIcon, label: 'Site Düzenle', action: () => router.push('/dashboard/website') }
          ].map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className={`p-3 sm:p-6 rounded-lg border-2 border-dashed transition-all hover:scale-105 hover:shadow-lg group ${
                isDarkMode 
                  ? 'border-gray-600 hover:border-purple-500 hover:bg-gray-700/50' 
                  : 'border-gray-300 hover:border-purple-500 hover:bg-purple-50'
              }`}
            >
              <action.icon className={`w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 sm:mb-3 transition-colors group-hover:text-purple-600 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`} />
              <div className={`text-xs sm:text-sm font-medium transition-colors group-hover:text-purple-600 text-center ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {action.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Appointments */}
      <div className={`rounded-xl shadow-sm border transition-colors ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
      }`}>
        <div className={`p-4 sm:p-6 border-b transition-colors ${
          isDarkMode ? 'border-gray-700' : 'border-gray-100'
        }`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-lg sm:text-xl font-semibold transition-colors ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Bugünkü Randevular
            </h2>
            <button
              onClick={() => router.push('/dashboard/appointments')}
              className="text-purple-600 hover:text-purple-700 text-xs sm:text-sm font-medium transition-colors"
            >
              Tümünü Gör
            </button>
          </div>
        </div>
        <div className={`divide-y transition-colors ${
          isDarkMode ? 'divide-gray-700' : 'divide-gray-100'
        }`}>
          {dashboardData.appointments.length > 0 ? (
            dashboardData.appointments.slice(0, 5).map((appointment: any, index) => (
              <div key={index} className="p-4 sm:p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    appointment.status === 'confirmed' ? 'bg-green-100 text-green-600' :
                    appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className={`font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {appointment.clientName}
                    </div>
                    <div className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {appointment.serviceName}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {appointment.time}
                  </div>
                  <div className={`text-sm capitalize ${
                    appointment.status === 'confirmed' ? 'text-green-600' :
                    appointment.status === 'pending' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {appointment.status === 'confirmed' ? 'Onaylandı' :
                     appointment.status === 'pending' ? 'Bekliyor' : 'İptal'}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 sm:p-8 text-center">
              <p className={`text-sm sm:text-base ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Bugün için randevu bulunmuyor.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
