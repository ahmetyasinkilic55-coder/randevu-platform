'use client'

import React, { useState, useEffect } from 'react'
import { 
  Calendar, 
  Search, 
  Filter, 
  Eye,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Download,
  User,
  Building2,
  CalendarDays
} from 'lucide-react'
import Link from 'next/link'
import { appointmentsApi, type Appointment } from '@/lib/admin-api'

const STATUS_CONFIG = {
  PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle, text: 'Beklemede' },
  CONFIRMED: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, text: 'Onaylandı' },
  COMPLETED: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Tamamlandı' },
  CANCELLED: { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'İptal Edildi' },
  NO_SHOW: { color: 'bg-gray-100 text-gray-800', icon: XCircle, text: 'Gelmedi' }
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [dateFilter, setDateFilter] = useState('ALL')
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    totalCount: 0,
    totalPages: 0
  })

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await appointmentsApi.getAppointments({
        search: searchTerm,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        dateFilter: dateFilter === 'ALL' ? undefined : dateFilter,
        page: pagination.page,
        limit: pagination.limit
      })
      
      setAppointments(data.appointments)
      setPagination(data.pagination)
      
    } catch (error) {
      console.error('Error fetching appointments:', error)
      setError(error instanceof Error ? error.message : 'Randevular alınırken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'ALL' || appointment.status === statusFilter
    
    let matchesDate = true
    if (dateFilter === 'TODAY') {
      const today = new Date().toISOString().split('T')[0]
      matchesDate = appointment.appointmentDate === today
    } else if (dateFilter === 'WEEK') {
      const weekFromNow = new Date()
      weekFromNow.setDate(weekFromNow.getDate() + 7)
      const appointmentDate = new Date(appointment.appointmentDate)
      matchesDate = appointmentDate <= weekFromNow && appointmentDate >= new Date()
    }
    
    return matchesSearch && matchesStatus && matchesDate
  })

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      setActionLoading(true)
      
      await appointmentsApi.updateAppointmentStatus(appointmentId, newStatus)
      
      setAppointments(prev => prev.map(appointment => 
        appointment.id === appointmentId 
          ? { ...appointment, status: newStatus as Appointment['status'] }
          : appointment
      ))
    } catch (error) {
      console.error('Error updating appointment status:', error)
      setError('Randevu durumu güncellenirken hata oluştu')
    } finally {
      setActionLoading(false)
    }
  }

  const StatusBadge = ({ status }: { status: Appointment['status'] }) => {
    const config = STATUS_CONFIG[status]
    const { color, icon: Icon, text } = config
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {text}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR')
  }

  const formatTime = (timeString: string) => {
    return timeString
  }

  const getStats = () => {
    const totalAppointments = pagination.totalCount
    const todayAppointments = appointments.filter(a => {
      const today = new Date().toISOString().split('T')[0]
      return a.appointmentDate === today
    }).length
    const pendingAppointments = appointments.filter(a => a.status === 'PENDING').length
    const completedAppointments = appointments.filter(a => a.status === 'COMPLETED').length
    
    return { totalAppointments, todayAppointments, pendingAppointments, completedAppointments }
  }

  const stats = getStats()

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Hata Oluştu</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchAppointments}
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
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Randevu Yönetimi</h1>
                  <p className="text-sm text-gray-500">{pagination.totalCount} randevu</p>
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Randevu</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalAppointments}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bugünkü Randevular</p>
                <p className="text-3xl font-bold text-gray-900">{stats.todayAppointments}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-50">
                <CalendarDays className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bekleyen Onay</p>
                <p className="text-3xl font-bold text-gray-900">{stats.pendingAppointments}</p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-50">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tamamlanan</p>
                <p className="text-3xl font-bold text-gray-900">{stats.completedAppointments}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-50">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Randevu ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">Tüm Durumlar</option>
              <option value="PENDING">Beklemede</option>
              <option value="CONFIRMED">Onaylandı</option>
              <option value="COMPLETED">Tamamlandı</option>
              <option value="CANCELLED">İptal Edildi</option>
              <option value="NO_SHOW">Gelmedi</option>
            </select>

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">Tüm Tarihler</option>
              <option value="TODAY">Bugün</option>
              <option value="WEEK">Bu Hafta</option>
            </select>

            {/* Reset Filters */}
            <button
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('ALL')
                setDateFilter('ALL')
                fetchAppointments()
              }}
              className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Filtreleri Temizle</span>
            </button>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Randevular yükleniyor...</span>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Randevu bulunamadı</h3>
              <p className="text-gray-500">Arama kriterlerinize uygun randevu bulunmuyor.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Müşteri
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşletme & Hizmet
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarih & Saat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Personel
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fiyat
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
                  {filteredAppointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{appointment.customerName}</div>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Mail className="w-3 h-3 mr-1" />
                            {appointment.customerEmail}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Phone className="w-3 h-3 mr-1" />
                            {appointment.customerPhone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="flex items-center text-sm font-medium text-gray-900">
                            <Building2 className="w-4 h-4 mr-2 text-blue-500" />
                            {appointment.businessName}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">{appointment.serviceName}</div>
                          <div className="flex items-center text-xs text-gray-400 mt-1">
                            <Clock className="w-3 h-3 mr-1" />
                            {appointment.duration} dakika
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {formatDate(appointment.appointmentDate)}
                          </div>
                          <div className="text-sm text-gray-500">{formatTime(appointment.appointmentTime)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="text-sm text-gray-900">{appointment.staffName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-green-600">
                          ₺{appointment.price}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={appointment.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => {
                              setSelectedAppointment(appointment)
                              setShowDetailModal(true)
                            }}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          {/* Status Change Dropdown */}
                          <div className="relative">
                            <select
                              value={appointment.status}
                              onChange={(e) => handleStatusChange(appointment.id, e.target.value)}
                              className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              disabled={actionLoading}
                            >
                              <option value="PENDING">Beklemede</option>
                              <option value="CONFIRMED">Onaylandı</option>
                              <option value="COMPLETED">Tamamlandı</option>
                              <option value="CANCELLED">İptal Edildi</option>
                              <option value="NO_SHOW">Gelmedi</option>
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
      </div>

      {/* Appointment Detail Modal */}
      {showDetailModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Randevu Detayları</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Customer Info */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Müşteri Bilgileri</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-3 text-gray-400" />
                    <span className="font-medium">{selectedAppointment.customerName}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-3 text-gray-400" />
                    <span>{selectedAppointment.customerEmail}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-3 text-gray-400" />
                    <span>{selectedAppointment.customerPhone}</span>
                  </div>
                </div>
              </div>

              {/* Business Info */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">İşletme Bilgileri</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center">
                    <Building2 className="w-4 h-4 mr-3 text-gray-400" />
                    <span className="font-medium">{selectedAppointment.businessName}</span>
                  </div>
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-3 text-gray-400" />
                    <span>Personel: {selectedAppointment.staffName}</span>
                  </div>
                </div>
              </div>

              {/* Appointment Info */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Randevu Bilgileri</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Hizmet:</span>
                    <span className="font-medium">{selectedAppointment.serviceName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Tarih:</span>
                    <span className="font-medium">{formatDate(selectedAppointment.appointmentDate)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Saat:</span>
                    <span className="font-medium">{selectedAppointment.appointmentTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Süre:</span>
                    <span className="font-medium">{selectedAppointment.duration} dakika</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Fiyat:</span>
                    <span className="font-medium text-green-600">₺{selectedAppointment.price}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Durum:</span>
                    <StatusBadge status={selectedAppointment.status} />
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedAppointment.notes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Notlar</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700">{selectedAppointment.notes}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
