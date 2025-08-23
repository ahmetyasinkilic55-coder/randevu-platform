'use client'

import React, { useState, useEffect } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users,
  Building2,
  Calendar,
  DollarSign,
  ArrowLeft,
  Download,
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { analyticsApi, type AnalyticsData } from '@/lib/admin-api'

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('6M')

  useEffect(() => {
    fetchAnalyticsData()
  }, [selectedPeriod])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await analyticsApi.getAnalytics(selectedPeriod)
      setAnalyticsData(data)
      
    } catch (error) {
      console.error('Analytics data fetch error:', error)
      setError(error instanceof Error ? error.message : 'Analitik veriler yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ 
    title, 
    value, 
    icon, 
    growth, 
    prefix = '', 
    suffix = '' 
  }: {
    title: string
    value: number
    icon: React.ReactNode
    growth: number
    prefix?: string
    suffix?: string
  }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </p>
          <div className={`flex items-center mt-2 ${
            growth >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {growth >= 0 ? 
              <TrendingUp className="w-4 h-4 mr-1" /> : 
              <TrendingDown className="w-4 h-4 mr-1" />
            }
            <span className="text-sm font-medium">
              {growth >= 0 ? '+' : ''}{growth}%
            </span>
          </div>
        </div>
        <div className="p-3 rounded-lg bg-blue-50">
          <div className="text-blue-600">
            {icon}
          </div>
        </div>
      </div>
    </div>
  )

  const formatCurrency = (amount: number) => {
    return `₺${amount.toLocaleString()}`
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Hata Oluştu</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchAnalyticsData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    )
  }

  if (loading || !analyticsData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Analitik veriler yükleniyor...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="text-gray-400 hover:text-gray-600">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Analitik & Raporlar</h1>
                  <p className="text-sm text-gray-500">Platform performans metrikleri</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="1M">Son 1 Ay</option>
                <option value="3M">Son 3 Ay</option>
                <option value="6M">Son 6 Ay</option>
                <option value="1Y">Son 1 Yıl</option>
              </select>
              
              <button 
                onClick={fetchAnalyticsData}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Yenile</span>
              </button>
              
              <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Download className="w-4 h-4" />
                <span>Rapor İndir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Toplam Gelir"
            value={analyticsData.overview.totalRevenue}
            icon={<DollarSign className="w-6 h-6" />}
            growth={analyticsData.overview.revenueGrowth}
            prefix="₺"
          />
          <StatCard
            title="Toplam Randevu"
            value={analyticsData.overview.totalAppointments}
            icon={<Calendar className="w-6 h-6" />}
            growth={analyticsData.overview.appointmentsGrowth}
          />
          <StatCard
            title="Aktif İşletme"
            value={analyticsData.overview.activeBusinesses}
            icon={<Building2 className="w-6 h-6" />}
            growth={analyticsData.overview.businessGrowth}
          />
          <StatCard
            title="Aktif Kullanıcı"
            value={analyticsData.overview.activeUsers}
            icon={<Users className="w-6 h-6" />}
            growth={analyticsData.overview.userGrowth}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Monthly Performance Chart */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Aylık Performans</h3>
              
              {/* Simple Chart Visualization */}
              <div className="space-y-4">
                {analyticsData.monthlyData.map((month, index) => (
                  <div key={month.month} className="flex items-center space-x-4">
                    <div className="w-16 text-sm font-medium text-gray-600">
                      {month.month}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">Gelir</span>
                        <span className="text-sm font-medium">{formatCurrency(month.revenue)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${Math.min((month.revenue / 40000) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-20 text-right">
                      <div className="text-sm font-medium text-gray-900">{month.appointments}</div>
                      <div className="text-xs text-gray-500">randevu</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Businesses */}
          <div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">En İyi İşletmeler</h3>
              
              <div className="space-y-4">
                {analyticsData.topBusinesses.map((business, index) => (
                  <div key={business.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{business.name}</div>
                        <div className="text-xs text-gray-500">{business.appointments} randevu</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(business.revenue)}
                      </div>
                      <div className={`text-xs flex items-center ${
                        business.growth >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {business.growth >= 0 ? 
                          <TrendingUp className="w-3 h-3 mr-1" /> : 
                          <TrendingDown className="w-3 h-3 mr-1" />
                        }
                        {business.growth >= 0 ? '+' : ''}{business.growth}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sector Distribution */}
        <div className="mt-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Sektör Dağılımı</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analyticsData.sectorDistribution.map((sector) => (
                <div key={sector.sector} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{sector.sector}</span>
                    <span className="text-sm text-gray-600">{sector.count} işletme</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${sector.percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{sector.percentage}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Key Insights */}
        <div className="mt-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Önemli Bulgular</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Güçlü Büyüme Trendi</p>
                    <p className="text-sm text-gray-600">
                      Son dönemde %{analyticsData.overview.userGrowth} kullanıcı artışı kaydedildi.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Sektör Çeşitliliği</p>
                    <p className="text-sm text-gray-600">
                      Platform {analyticsData.sectorDistribution.length} farklı sektörde hizmet veriyor.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Gelir Artışı</p>
                    <p className="text-sm text-gray-600">
                      Toplam gelir %{analyticsData.overview.revenueGrowth} artışla ₺{analyticsData.overview.totalRevenue.toLocaleString()}'ye ulaştı.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Randevu Yoğunluğu</p>
                    <p className="text-sm text-gray-600">
                      Toplam {analyticsData.overview.totalAppointments.toLocaleString()} randevu işlemi gerçekleştirildi.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}