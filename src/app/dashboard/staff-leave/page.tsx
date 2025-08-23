'use client'

import { useState, useEffect } from 'react'
import { 
  CalendarIcon,
  ClockIcon,
  UserIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { useActiveBusiness } from '@/hooks/useActiveBusiness'
import { useStaff } from '@/hooks/useStaff'

interface StaffLeave {
  id: string
  staffId: string
  staffName: string
  startDate: string
  endDate: string
  startTime?: string
  endTime?: string
  type: 'FULL_DAY' | 'PARTIAL' | 'MULTI_DAY'
  reason: string
  status: 'APPROVED' | 'PENDING' | 'REJECTED'
  notes?: string
  createdAt: string
}

interface LeaveFormData {
  staffId: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  type: 'FULL_DAY' | 'PARTIAL' | 'MULTI_DAY'
  reason: string
  notes: string
}

export default function StaffLeavePage() {
  const { business, isLoading: businessLoading } = useActiveBusiness()
  const { staff, isLoading: staffLoading } = useStaff(business?.id || null)
  
  const [leaves, setLeaves] = useState<StaffLeave[]>([])
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingLeave, setEditingLeave] = useState<StaffLeave | null>(null)
  const [deletingLeave, setDeletingLeave] = useState<StaffLeave | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [error, setError] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(false)

  const [formData, setFormData] = useState<LeaveFormData>({
    staffId: '',
    startDate: '',
    endDate: '',
    startTime: '09:00',
    endTime: '18:00',
    type: 'FULL_DAY',
    reason: '',
    notes: ''
  })

  // Load staff leaves
  useEffect(() => {
    if (business?.id) {
      loadStaffLeaves()
    }
  }, [business])

  const loadStaffLeaves = async () => {
    try {
      const response = await fetch(`/api/staff-leave?businessId=${business?.id}`)
      if (response.ok) {
        const data = await response.json()
        setLeaves(data.leaves || [])
      }
    } catch (err) {
      setError('İzinler yüklenirken hata oluştu')
    }
  }

  const showMessage = (message: string, isError: boolean = false) => {
    if (isError) {
      setError(message)
      setTimeout(() => setError(''), 5000)
    } else {
      setSaveMessage(message)
      setTimeout(() => setSaveMessage(''), 3000)
    }
  }

  const resetForm = () => {
    setFormData({
      staffId: '',
      startDate: '',
      endDate: '',
      startTime: '09:00',
      endTime: '18:00',
      type: 'FULL_DAY',
      reason: '',
      notes: ''
    })
  }

  const handleOpenModal = (leave?: StaffLeave) => {
    if (leave) {
      setEditingLeave(leave)
      setFormData({
        staffId: leave.staffId,
        startDate: leave.startDate,
        endDate: leave.endDate,
        startTime: leave.startTime || '09:00',
        endTime: leave.endTime || '18:00',
        type: leave.type,
        reason: leave.reason,
        notes: leave.notes || ''
      })
    } else {
      setEditingLeave(null)
      resetForm()
    }
    setShowLeaveModal(true)
  }

  const handleCloseModal = () => {
    setShowLeaveModal(false)
    setEditingLeave(null)
    resetForm()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!business || !formData.staffId || !formData.startDate) {
      showMessage('Lütfen gerekli alanları doldurun', true)
      return
    }

    setIsSubmitting(true)

    try {
      const url = editingLeave 
        ? `/api/staff-leave/${editingLeave.id}`
        : '/api/staff-leave'
      
      const method = editingLeave ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          businessId: business.id,
          status: 'APPROVED' // Admin tarafından eklenen izinler otomatik onaylı
        })
      })

      if (response.ok) {
        showMessage(editingLeave ? 'İzin güncellendi' : 'İzin eklendi')
        handleCloseModal()
        loadStaffLeaves()
      } else {
        throw new Error('İzin işlemi başarısız')
      }
    } catch (err) {
      showMessage('İzin işlemi sırasında hata oluştu', true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingLeave) return

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/staff-leave/${deletingLeave.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        showMessage('İzin silindi')
        setShowDeleteModal(false)
        setDeletingLeave(null)
        loadStaffLeaves()
      } else {
        throw new Error('İzin silinirken hata oluştu')
      }
    } catch (err) {
      showMessage('İzin silinirken hata oluştu', true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStaffName = (staffId: string) => {
    const staffMember = staff?.find(s => s.id === staffId)
    return staffMember?.name || 'Bilinmeyen Personel'
  }

  const getLeaveTypeText = (type: string) => {
    switch (type) {
      case 'FULL_DAY': return 'Tam Gün'
      case 'PARTIAL': return 'Kısmi'
      case 'MULTI_DAY': return 'Çok Günlük'
      default: return type
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'text-green-700 bg-green-100'
      case 'PENDING': return 'text-yellow-700 bg-yellow-100'
      case 'REJECTED': return 'text-red-700 bg-red-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR')
  }

  if (businessLoading || staffLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-bold transition-colors ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Personel İzin Yönetimi
          </h1>
          <p className={`text-lg mt-2 transition-colors ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Personellerinizin izin durumlarını yönetin
          </p>
        </div>
        
        <button
          onClick={() => handleOpenModal()}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center space-x-2"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Yeni İzin Ekle</span>
        </button>
      </div>

      {/* Messages */}
      {saveMessage && (
        <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-3 rounded-lg">
          <CheckIcon className="w-5 h-5" />
          <span>{saveMessage}</span>
        </div>
      )}
      
      {error && (
        <div className="flex items-center space-x-2 bg-red-100 text-red-800 px-4 py-3 rounded-lg">
          <ExclamationTriangleIcon className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Staff Leaves List */}
      <div className={`rounded-xl shadow-sm border transition-colors ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
      }`}>
        <div className={`p-6 border-b transition-colors ${
          isDarkMode ? 'border-gray-700' : 'border-gray-100'
        }`}>
          <h2 className={`text-xl font-semibold transition-colors ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            İzin Listesi
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`transition-colors ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <tr>
                <th className={`text-left py-4 px-6 font-medium transition-colors ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Personel
                </th>
                <th className={`text-left py-4 px-6 font-medium transition-colors ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  İzin Tipi
                </th>
                <th className={`text-left py-4 px-6 font-medium transition-colors ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Tarih Aralığı
                </th>
                <th className={`text-left py-4 px-6 font-medium transition-colors ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Saat Aralığı
                </th>
                <th className={`text-left py-4 px-6 font-medium transition-colors ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Sebep
                </th>
                <th className={`text-left py-4 px-6 font-medium transition-colors ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Durum
                </th>
                <th className={`text-left py-4 px-6 font-medium transition-colors ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y transition-colors ${
              isDarkMode ? 'divide-gray-700' : 'divide-gray-100'
            }`}>
              {leaves.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <UserIcon className={`w-12 h-12 mx-auto mb-4 transition-colors ${
                      isDarkMode ? 'text-gray-600' : 'text-gray-400'
                    }`} />
                    <p className={`text-lg transition-colors ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Henüz izin kaydı bulunmuyor
                    </p>
                    <button
                      onClick={() => handleOpenModal()}
                      className="mt-4 text-purple-600 hover:text-purple-700 font-medium"
                    >
                      İlk izni ekleyin
                    </button>
                  </td>
                </tr>
              ) : (
                leaves.map((leave) => (
                  <tr key={leave.id} className={`hover:bg-gray-50 transition-colors ${
                    isDarkMode ? 'hover:bg-gray-700' : ''
                  }`}>
                    <td className={`py-4 px-6 transition-colors ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <UserIcon className="w-4 h-4 text-purple-600" />
                        </div>
                        <span className="font-medium">{leave.staffName}</span>
                      </div>
                    </td>
                    <td className={`py-4 px-6 transition-colors ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {getLeaveTypeText(leave.type)}
                    </td>
                    <td className={`py-4 px-6 transition-colors ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {leave.startDate === leave.endDate 
                        ? formatDate(leave.startDate)
                        : `${formatDate(leave.startDate)} - ${formatDate(leave.endDate)}`
                      }
                    </td>
                    <td className={`py-4 px-6 transition-colors ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {leave.type === 'PARTIAL' 
                        ? `${leave.startTime} - ${leave.endTime}`
                        : '-'
                      }
                    </td>
                    <td className={`py-4 px-6 transition-colors ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      <div className="max-w-xs">
                        <p className="truncate" title={leave.reason}>
                          {leave.reason}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(leave.status)}`}>
                        {leave.status === 'APPROVED' ? 'Onaylandı' : 
                         leave.status === 'PENDING' ? 'Beklemede' : 'Reddedildi'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleOpenModal(leave)}
                          className="text-purple-600 hover:text-purple-700 p-1"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeletingLeave(leave)
                            setShowDeleteModal(true)
                          }}
                          className="text-red-600 hover:text-red-700 p-1"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leave Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={handleCloseModal}></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-gray-900">
                      {editingLeave ? 'İzni Düzenle' : 'Yeni İzin Ekle'}
                    </h3>
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Staff Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Personel Seçin
                      </label>
                      <select
                        value={formData.staffId}
                        onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900"
                      >
                        <option value="">Personel seçin...</option>
                        {staff?.map((staffMember) => (
                          <option key={staffMember.id} value={staffMember.id}>
                            {staffMember.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Leave Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        İzin Tipi
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900"
                      >
                        <option value="FULL_DAY">Tam Gün</option>
                        <option value="PARTIAL">Kısmi (Saat bazlı)</option>
                        <option value="MULTI_DAY">Çok Günlük</option>
                      </select>
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Başlangıç Tarihi
                        </label>
                        <input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bitiş Tarihi
                        </label>
                        <input
                          type="date"
                          value={formData.endDate || formData.startDate}
                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                          min={formData.startDate}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900"
                        />
                      </div>
                    </div>

                    {/* Time Range - Only for PARTIAL type */}
                    {formData.type === 'PARTIAL' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Başlangıç Saati
                          </label>
                          <input
                            type="time"
                            value={formData.startTime}
                            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Bitiş Saati
                          </label>
                          <input
                            type="time"
                            value={formData.endTime}
                            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900"
                          />
                        </div>
                      </div>
                    )}

                    {/* Reason */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        İzin Sebebi
                      </label>
                      <input
                        type="text"
                        value={formData.reason}
                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                        placeholder="Hastalık, kişisel işler, vb."
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900"
                      />
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notlar (İsteğe bağlı)
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={3}
                        placeholder="Ek açıklamalar..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none bg-white text-gray-900"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    {isSubmitting ? 'Kaydediliyor...' : (editingLeave ? 'Güncelle' : 'Kaydet')}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    İptal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setShowDeleteModal(false)}></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      İzni Sil
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        {deletingLeave?.staffName} personelinin bu izin kaydını silmek istediğinizden emin misiniz? 
                        Bu işlem geri alınamaz.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Siliniyor...' : 'Sil'}
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
