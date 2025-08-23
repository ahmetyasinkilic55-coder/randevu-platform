'use client'

import React, { useState, useEffect } from 'react'
import { 
  Building2, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Phone,
  Mail,
  MapPin,
  Clock,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreVertical,
  ArrowLeft,
  Download
} from 'lucide-react'
import Link from 'next/link'
import { businessesApi, type Business } from '@/lib/admin-api'

const SECTORS = [
  { value: 'BARBER', label: 'Berber' },
  { value: 'BEAUTY_SALON', label: 'Kuaför' },
  { value: 'DENTIST', label: 'Diş Hekimi' },
  { value: 'VETERINARIAN', label: 'Veteriner' },
  { value: 'CAR_WASH', label: 'Oto Yıkama' },
  { value: 'GYM', label: 'Fitness' },
  { value: 'OTHER', label: 'Diğer' }
]

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [sectorFilter, setSectorFilter] = useState('ALL')
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    totalCount: 0,
    totalPages: 0
  })

  useEffect(() => {
    fetchBusinesses()
  }, [searchTerm, statusFilter, sectorFilter, pagination.page])

  const fetchBusinesses = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await businessesApi.getBusinesses({
        search: searchTerm || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        category: sectorFilter !== 'ALL' ? sectorFilter : undefined,
        page: pagination.page,
        limit: pagination.limit
      })
      
      setBusinesses(data.businesses)
      setPagination(data.pagination)
      
    } catch (error) {
      console.error('Error fetching businesses:', error)
      setError(error instanceof Error ? error.message : 'İşletmeler yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (businessId: string, newStatus: string) => {
    try {
      setActionLoading(true)
      
      await businessesApi.updateBusinessStatus(businessId, newStatus)
      
      // Yerel state'i güncelle
      setBusinesses(prev => prev.map(business => 
        business.id === businessId 
          ? { ...business, status: newStatus as Business['status'] }
          : business
      ))
      
    } catch (error) {
      console.error('Error updating business status:', error)
      alert('İşletme durumu güncellenirken hata oluştu')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteBusiness = async () => {
    if (!selectedBusiness) return
    
    try {
      setActionLoading(true)
      
      await businessesApi.deleteBusiness(selectedBusiness.id)
      
      // Yerel state'den kaldır
      setBusinesses(prev => prev.filter(business => business.id !== selectedBusiness.id))
      setShowDeleteModal(false)
      setSelectedBusiness(null)
      
    } catch (error) {
      console.error('Error deleting business:', error)
      alert('İşletme silinirken hata oluştu')
    } finally {
      setActionLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleFilterChange = (filter: string, value: string) => {
    if (filter === 'status') {
      setStatusFilter(value)
    } else if (filter === 'sector') {
      setSectorFilter(value)
    }
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const StatusBadge = ({ status }: { status: Business['status'] }) => {
    const config = {
      ACTIVE: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Aktif' },
      PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle, text: 'Beklemede' },
      SUSPENDED: { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Askıda' }
    }
    
    const { color, icon: Icon, text } = config[status]
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {text}
      </span>
    )
  }

  const getSectorLabel = (category: string) => {
    return SECTORS.find(s => s.value === category)?.label || category
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Hata Oluştu</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchBusinesses}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tekrar Dene
          </button>
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
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">İşletme Yönetimi</h1>
                  <p className="text-sm text-gray-500">{pagination.totalCount} işletme</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Download className="w-4 h-4" />
                <span>Dışa Aktar</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="İşletme ara..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">Tüm Durumlar</option>
              <option value="ACTIVE">Aktif</option>
              <option value="PENDING">Beklemede</option>
              <option value="SUSPENDED">Askıda</option>
            </select>

            {/* Sector Filter */}
            <select
              value={sectorFilter}
              onChange={(e) => handleFilterChange('sector', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">Tüm Sektörler</option>
              {SECTORS.map(sector => (
                <option key={sector.value} value={sector.value}>{sector.label}</option>
              ))}
            </select>

            {/* Reset Filters */}
            <button
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('ALL')
                setSectorFilter('ALL')
                setPagination(prev => ({ ...prev, page: 1 }))
              }}
              className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Filtreleri Temizle</span>
            </button>
          </div>
        </div>

        {/* Businesses Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">İşletmeler yükleniyor...</span>
            </div>
          ) : businesses.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">İşletme bulunamadı</h3>
              <p className="text-gray-500">Arama kriterlerinize uygun işletme bulunmuyor.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşletme
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İletişim
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Konum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İstatistikler
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {businesses.map((business) => (
                    <tr key={business.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{business.name}</div>
                          <div className="text-sm text-gray-500">
                            {getSectorLabel(business.category)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="w-4 h-4 mr-2" />
                            {business.email}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="w-4 h-4 mr-2" />
                            {business.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          <div>
                            <div>{business.province || 'Belirtilmemiş'}</div>
                            <div className="text-xs text-gray-400 max-w-xs truncate">{business.address}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <span className="text-gray-900">{business.totalAppointments} randevu</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Star className="w-4 h-4 mr-2 text-yellow-500" />
                            <span className="text-gray-900">{business.rating}</span>
                          </div>
                          <div className="text-sm text-green-600">
                            ₺{business.revenue.toLocaleString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={business.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedBusiness(business)
                              setShowDeleteModal(true)
                            }}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          
                          {/* Status Change Dropdown */}
                          <div className="relative">
                            <select
                              value={business.status}
                              onChange={(e) => handleStatusChange(business.id, e.target.value)}
                              className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              disabled={actionLoading}
                            >
                              <option value="ACTIVE">Aktif</option>
                              <option value="PENDING">Beklemede</option>
                              <option value="SUSPENDED">Askıda</option>
                            </select>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of {pagination.totalCount} sonuç
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Önceki
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Sonraki
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedBusiness && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">İşletmeyi Sil</h3>
            <p className="text-gray-600 mb-6">
              "{selectedBusiness.name}" işletmesini silmek istediğinizden emin misiniz? 
              Bu işlem geri alınamaz.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setSelectedBusiness(null)
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={actionLoading}
              >
                İptal
              </button>
              <button
                onClick={handleDeleteBusiness}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  'Sil'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}