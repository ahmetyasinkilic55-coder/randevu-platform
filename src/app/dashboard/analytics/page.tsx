'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { 
  CalendarDaysIcon,
  BanknotesIcon,
  UserGroupIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
  EyeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

// Types
interface Appointment {
  id: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  date: Date
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  notes?: string
  service: {
    id: string
    name: string
    price: number
    duration: number
  }
  staff?: {
    id: string
    name: string
  }
  businessId: string
}

interface AnalyticsData {
  overview: {
    totalRevenue: number
    totalAppointments: number
    totalCustomers: number
    avgAppointmentValue: number
    revenueChange: string
    appointmentsChange: string
    customersChange: string
    avgValueChange: string
  }
  dailyStats: {
    day: string
    revenue: number
    appointments: number
  }[]
  topServices: {
    name: string
    bookings: number
    revenue: number
    percentage: number
  }[]
  customerStats: {
    newCustomers: number
    returningCustomers: number
    customerRetention: number
    avgVisitFrequency: number
  }
  busyHours: {
    hour: string
    bookings: number
  }[]
}

export default function AnalyticsPage() {
  const { data: session, status } = useSession()
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [userBusiness, setUserBusiness] = useState<any>(null)

  // Load initial data when session is ready
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      loadUserBusinesses(session.user.id)
    } else if (status === 'unauthenticated') {
      window.location.href = '/auth/signin'
    }
  }, [session, status])

  // Reload analytics when period changes
  useEffect(() => {
    if (userBusiness?.id) {
      loadAnalyticsData(userBusiness.id, selectedPeriod)
    }
  }, [selectedPeriod, userBusiness])

  // Load user businesses from API
  const loadUserBusinesses = async (userId: string) => {
    try {
      const response = await fetch(`/api/businesses?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.businesses && data.businesses.length > 0) {
          const business = data.businesses[0]
          setUserBusiness(business)
          loadAnalyticsData(business.id, selectedPeriod)
        } else {
          setError('Henüz bir işletme oluşturmamışsınız')
          setLoading(false)
        }
      } else {
        setError('İşletmeler yüklenemedi')
        setLoading(false)
      }
    } catch (error) {
      console.error('Error loading businesses:', error)
      setError('Veri yükleme hatası')
      setLoading(false)
    }
  }

  const loadAnalyticsData = async (businessId: string, period: string) => {
    setLoading(true)
    setError(null)
    
    try {
      // Load appointments data
      const appointmentsResponse = await fetch(`/api/appointments?businessId=${businessId}`)
      if (!appointmentsResponse.ok) {
        throw new Error('Randevu verileri yüklenemedi')
      }
      
      const appointmentsData = await appointmentsResponse.json()
      const appointments: Appointment[] = appointmentsData.appointments || []
      
      // Load services data for top services calculation
      const servicesResponse = await fetch(`/api/services?businessId=${businessId}`)
      const servicesData = servicesResponse.ok ? await servicesResponse.json() : { services: [] }
      const services = servicesData.services || []

      // Calculate date range based on period
      const now = new Date()
      let startDate: Date
      let previousStartDate: Date

      switch (period) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          previousStartDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
          break
        case 'quarter':
          startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
          previousStartDate = new Date(startDate.getTime() - 3 * 30 * 24 * 60 * 60 * 1000)
          break
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1)
          previousStartDate = new Date(now.getFullYear() - 1, 0, 1)
          break
        default: // month
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      }

      // Filter appointments for current period
      const currentPeriodAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.date)
        return aptDate >= startDate && aptDate <= now
      })

      // Filter appointments for previous period (for comparison)
      const previousPeriodAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.date)
        return aptDate >= previousStartDate && aptDate < startDate
      })

      // Calculate overview stats
      const totalRevenue = currentPeriodAppointments
        .filter(apt => apt.status === 'COMPLETED')
        .reduce((sum, apt) => sum + apt.service.price, 0)

      const previousRevenue = previousPeriodAppointments
        .filter(apt => apt.status === 'COMPLETED')
        .reduce((sum, apt) => sum + apt.service.price, 0)

      const totalAppointments = currentPeriodAppointments.length
      const previousAppointments = previousPeriodAppointments.length

      // Get unique customers
      const uniqueCustomers = new Set(currentPeriodAppointments.map(apt => apt.customerPhone))
      const previousUniqueCustomers = new Set(previousPeriodAppointments.map(apt => apt.customerPhone))
      
      const totalCustomers = uniqueCustomers.size
      const previousCustomers = previousUniqueCustomers.size

      const avgAppointmentValue = totalAppointments > 0 ? totalRevenue / totalAppointments : 0
      const previousAvgValue = previousAppointments > 0 ? previousRevenue / previousAppointments : 0

      // Calculate percentage changes
      const revenueChange = previousRevenue > 0 
        ? ((totalRevenue - previousRevenue) / previousRevenue * 100).toFixed(1)
        : totalRevenue > 0 ? '100.0' : '0.0'
      
      const appointmentsChange = previousAppointments > 0 
        ? ((totalAppointments - previousAppointments) / previousAppointments * 100).toFixed(1)
        : totalAppointments > 0 ? '100.0' : '0.0'
      
      const customersChange = previousCustomers > 0 
        ? ((totalCustomers - previousCustomers) / previousCustomers * 100).toFixed(1)
        : totalCustomers > 0 ? '100.0' : '0.0'

      const avgValueChange = previousAvgValue > 0 
        ? ((avgAppointmentValue - previousAvgValue) / previousAvgValue * 100).toFixed(1)
        : avgAppointmentValue > 0 ? '100.0' : '0.0'

      // Generate daily stats for the period
      const dailyStats: { day: string, revenue: number, appointments: number }[] = []
      const dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt']
      
      if (period === 'week') {
        // Last 7 days
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
          const dayAppointments = currentPeriodAppointments.filter(apt => {
            const aptDate = new Date(apt.date)
            return aptDate.toDateString() === date.toDateString()
          })
          
          dailyStats.push({
            day: dayNames[date.getDay()],
            revenue: dayAppointments
              .filter(apt => apt.status === 'COMPLETED')
              .reduce((sum, apt) => sum + apt.service.price, 0),
            appointments: dayAppointments.length
          })
        }
      } else {
        // For month/quarter/year, show last 7 days
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
          const dayAppointments = appointments.filter(apt => {
            const aptDate = new Date(apt.date)
            return aptDate.toDateString() === date.toDateString()
          })
          
          dailyStats.push({
            day: dayNames[date.getDay()],
            revenue: dayAppointments
              .filter(apt => apt.status === 'COMPLETED')
              .reduce((sum, apt) => sum + apt.service.price, 0),
            appointments: dayAppointments.length
          })
        }
      }

      // Calculate top services
      const serviceStats = new Map<string, { bookings: number, revenue: number }>()
      
      currentPeriodAppointments.forEach(apt => {
        const serviceName = apt.service.name
        const current = serviceStats.get(serviceName) || { bookings: 0, revenue: 0 }
        serviceStats.set(serviceName, {
          bookings: current.bookings + 1,
          revenue: current.revenue + (apt.status === 'COMPLETED' ? apt.service.price : 0)
        })
      })

      const topServices = Array.from(serviceStats.entries())
        .map(([name, stats]) => ({
          name,
          bookings: stats.bookings,
          revenue: stats.revenue,
          percentage: totalAppointments > 0 ? Math.round((stats.bookings / totalAppointments) * 100) : 0
        }))
        .sort((a, b) => b.bookings - a.bookings)
        .slice(0, 4)

      // Calculate customer stats
      const allCustomerPhones = new Set(appointments.map(apt => apt.customerPhone))
      const previousCustomerPhones = new Set(previousPeriodAppointments.map(apt => apt.customerPhone))
      const newCustomersInPeriod = Array.from(uniqueCustomers).filter(phone => !previousCustomerPhones.has(phone))
      const returningCustomersInPeriod = Array.from(uniqueCustomers).filter(phone => previousCustomerPhones.has(phone))

      // Calculate busy hours
      const hourlyStats = new Map<number, number>()
      for (let hour = 9; hour <= 18; hour++) {
        hourlyStats.set(hour, 0)
      }

      currentPeriodAppointments.forEach(apt => {
        const hour = new Date(apt.date).getHours()
        if (hour >= 9 && hour <= 18) {
          hourlyStats.set(hour, (hourlyStats.get(hour) || 0) + 1)
        }
      })

      const busyHours = Array.from(hourlyStats.entries()).map(([hour, bookings]) => ({
        hour: `${hour.toString().padStart(2, '0')}:00`,
        bookings
      }))

      const analytics: AnalyticsData = {
        overview: {
          totalRevenue,
          totalAppointments,
          totalCustomers,
          avgAppointmentValue,
          revenueChange: `${parseFloat(revenueChange) >= 0 ? '+' : ''}${revenueChange}%`,
          appointmentsChange: `${parseFloat(appointmentsChange) >= 0 ? '+' : ''}${appointmentsChange}%`,
          customersChange: `${parseFloat(customersChange) >= 0 ? '+' : ''}${customersChange}%`,
          avgValueChange: `${parseFloat(avgValueChange) >= 0 ? '+' : ''}${avgValueChange}%`
        },
        dailyStats,
        topServices,
        customerStats: {
          newCustomers: newCustomersInPeriod.length,
          returningCustomers: returningCustomersInPeriod.length,
          customerRetention: totalCustomers > 0 ? Math.round((returningCustomersInPeriod.length / totalCustomers) * 100) : 0,
          avgVisitFrequency: totalCustomers > 0 ? Math.round((totalAppointments / totalCustomers) * 10) / 10 : 0
        },
        busyHours
      }

      setAnalyticsData(analytics)
    } catch (error: any) {
      console.error('Error loading analytics:', error)
      setError(error.message || 'Analitik verileri yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const refreshData = () => {
    if (userBusiness?.id) {
      loadAnalyticsData(userBusiness.id, selectedPeriod)
    }
  }

  // Loading screen
  if (loading || status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Analitik verileri yükleniyor...</p>
        </div>
      </div>
    )
  }

  // Error screen
  if (error && !analyticsData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Bir Hata Oluştu</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={refreshData}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Yeniden Dene
          </button>
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Veri yükleniyor...</p>
        </div>
      </div>
    )
  }

  const maxBookings = Math.max(...analyticsData.busyHours.map(h => h.bookings))

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-bold transition-colors ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Analitik
          </h1>
          <p className={`text-lg mt-2 transition-colors ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {userBusiness?.name} - İşletme Performansı
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={refreshData}
            disabled={loading}
            className={`p-2 rounded-lg border transition-colors ${
              isDarkMode 
                ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Yenile"
          >
            <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className={`px-4 py-2 border rounded-lg transition-colors ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="week">Bu Hafta</option>
            <option value="month">Bu Ay</option>
            <option value="quarter">Bu Çeyrek</option>
            <option value="year">Bu Yıl</option>
          </select>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Toplam Gelir',
            value: `₺${analyticsData.overview.totalRevenue.toLocaleString()}`,
            change: analyticsData.overview.revenueChange,
            icon: BanknotesIcon,
            color: 'green',
            isPositive: parseFloat(analyticsData.overview.revenueChange) >= 0
          },
          {
            title: 'Toplam Randevu',
            value: analyticsData.overview.totalAppointments,
            change: analyticsData.overview.appointmentsChange,
            icon: CalendarDaysIcon,
            color: 'blue',
            isPositive: parseFloat(analyticsData.overview.appointmentsChange) >= 0
          },
          {
            title: 'Toplam Müşteri',
            value: analyticsData.overview.totalCustomers,
            change: analyticsData.overview.customersChange,
            icon: UserGroupIcon,
            color: 'purple',
            isPositive: parseFloat(analyticsData.overview.customersChange) >= 0
          },
          {
            title: 'Ort. Randevu Değeri',
            value: `₺${Math.round(analyticsData.overview.avgAppointmentValue)}`,
            change: analyticsData.overview.avgValueChange,
            icon: ClockIcon,
            color: 'orange',
            isPositive: parseFloat(analyticsData.overview.avgValueChange) >= 0
          }
        ].map((stat, index) => (
          <div key={index} className={`rounded-xl p-6 shadow-sm border transition-all duration-300 hover:shadow-lg ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${
                stat.color === 'green' ? 'bg-green-100 text-green-600' :
                stat.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                stat.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                'bg-orange-100 text-orange-600'
              }`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className={`flex items-center space-x-1 text-sm ${
                stat.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.isPositive ? 
                  <ArrowTrendingUpIcon className="w-4 h-4" /> : 
                  <ArrowTrendingDownIcon className="w-4 h-4" />
                }
                <span>{stat.change}</span>
              </div>
            </div>
            <div>
              <div className={`text-2xl font-bold mb-1 transition-colors ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {stat.value}
              </div>
              <div className={`text-sm transition-colors ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {stat.title}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Daily Revenue Chart */}
        <div className={`rounded-xl p-6 shadow-sm border transition-colors ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-semibold transition-colors ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Son 7 Gün Trendi
            </h3>
            <ChartBarIcon className={`w-5 h-5 transition-colors ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`} />
          </div>
          <div className="space-y-4">
            {analyticsData.dailyStats.map((day, index) => {
              const maxRevenue = Math.max(...analyticsData.dailyStats.map(d => d.revenue))
              const percentage = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0
              
              return (
                <div key={index} className="flex items-center space-x-4">
                  <div className={`w-12 text-sm font-medium transition-colors ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {day.day}
                  </div>
                  <div className="flex-1">
                    <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 relative`}>
                      <div 
                        className="bg-purple-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                      <div className={`absolute right-2 top-0.5 text-xs font-medium transition-colors ${
                        isDarkMode ? 'text-white' : 'text-gray-700'
                      }`}>
                        ₺{day.revenue.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className={`text-sm transition-colors ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {day.appointments} randevu
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top Services */}
        <div className={`rounded-xl p-6 shadow-sm border transition-colors ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-semibold transition-colors ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              En Çok Tercih Edilen Hizmetler
            </h3>
            <EyeIcon className={`w-5 h-5 transition-colors ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`} />
          </div>
          <div className="space-y-4">
            {analyticsData.topServices.length > 0 ? (
              analyticsData.topServices.map((service, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-medium transition-colors ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {service.name}
                      </span>
                      <span className={`text-sm transition-colors ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {service.bookings} rezervasyon
                      </span>
                    </div>
                    <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2`}>
                      <div 
                        className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${service.percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-xs transition-colors ${
                        isDarkMode ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        %{service.percentage}
                      </span>
                      <span className={`text-sm font-semibold text-green-600`}>
                        ₺{service.revenue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className={`text-sm transition-colors ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Henüz hizmet verisi bulunmuyor
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Customer Analytics */}
        <div className={`rounded-xl p-6 shadow-sm border transition-colors ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
        }`}>
          <h3 className={`text-lg font-semibold mb-6 transition-colors ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Müşteri Analizi
          </h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-2xl font-bold transition-colors ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {analyticsData.customerStats.newCustomers}
                </div>
                <div className={`text-sm transition-colors ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Yeni Müşteri
                </div>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold transition-colors ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {analyticsData.customerStats.returningCustomers}
                </div>
                <div className={`text-sm transition-colors ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Geri Dönen
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium transition-colors ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Müşteri Sadakati
                </span>
                <span className={`text-sm font-bold text-green-600`}>
                  %{analyticsData.customerStats.customerRetention}
                </span>
              </div>
              <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2`}>
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${analyticsData.customerStats.customerRetention}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className={`text-lg font-bold transition-colors ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {analyticsData.customerStats.avgVisitFrequency}
              </div>
              <div className={`text-sm transition-colors ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Ortalama Ziyaret Sıklığı
              </div>
            </div>
          </div>
        </div>

        {/* Busy Hours */}
        <div className={`lg:col-span-2 rounded-xl p-6 shadow-sm border transition-colors ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
        }`}>
          <h3 className={`text-lg font-semibold mb-6 transition-colors ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Yoğun Saatler
          </h3>
          <div className="flex items-end space-x-2 h-40">
            {analyticsData.busyHours.map((hour, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-purple-600 rounded-t transition-all duration-500 hover:bg-purple-700"
                  style={{ 
                    height: maxBookings > 0 ? `${(hour.bookings / maxBookings) * 100}%` : '4px',
                    minHeight: '4px'
                  }}
                ></div>
                <div className={`text-xs mt-2 transition-colors ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {hour.hour.slice(0, 2)}
                </div>
                <div className={`text-xs font-medium transition-colors ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {hour.bookings}
                </div>
              </div>
            ))}
          </div>
          <div className={`text-center mt-4 text-sm transition-colors ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {maxBookings > 0 ? (
              <>En yoğun saat: {analyticsData.busyHours.find(h => h.bookings === maxBookings)?.hour} ({maxBookings} randevu)</>
            ) : (
              'Henüz randevu verisi bulunmuyor'
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
