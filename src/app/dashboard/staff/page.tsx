'use client'

import { useState } from 'react'
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  StarIcon,
  XMarkIcon,
  CameraIcon,
  ExclamationTriangleIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { useActiveBusiness } from '@/hooks/useActiveBusiness'
import { useStaff } from '@/hooks/useStaff'

interface StaffFormData {
  name: string
  phone: string
  email: string
  specialty: string
  experience: number
  bio: string
  photoUrl: string
  isActive: boolean
}

export default function StaffPage() {
  const { business, isLoading: businessLoading } = useActiveBusiness()
  const { staff, isLoading: staffLoading, createStaff, updateStaff, deleteStaff } = useStaff(business?.id || null)
  
  const [showStaffModal, setShowStaffModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingStaff, setEditingStaff] = useState<any>(null)
  const [deletingStaff, setDeletingStaff] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState<StaffFormData>({
    name: '',
    phone: '',
    email: '',
    specialty: '',
    experience: 0,
    bio: '',
    photoUrl: '',
    isActive: true
  })

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      specialty: '',
      experience: 0,
      bio: '',
      photoUrl: '',
      isActive: true
    })
  }

  const handleOpenModal = (staffMember?: any) => {
    if (staffMember) {
      setEditingStaff(staffMember)
      setFormData({
        name: staffMember.name,
        phone: staffMember.phone || '',
        email: staffMember.email || '',
        specialty: staffMember.specialty || '',
        experience: staffMember.experience || 0,
        bio: staffMember.bio || '',
        photoUrl: staffMember.photoUrl || '',
        isActive: staffMember.isActive
      })
    } else {
      setEditingStaff(null)
      resetForm()
    }
    setShowStaffModal(true)
  }

  const handleCloseModal = () => {
    setShowStaffModal(false)
    setEditingStaff(null)
    resetForm()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!business) {
      return
    }

    setIsSubmitting(true)

    try {
      let success = false

      const staffData = {
        ...formData,
        // Boş stringleri undefined'a çevir
        phone: formData.phone.trim() || undefined,
        email: formData.email.trim() || undefined,
        specialty: formData.specialty.trim() || undefined,
        bio: formData.bio.trim() || undefined,
        photoUrl: formData.photoUrl.trim() || undefined,
      }

      if (editingStaff) {
        // Güncelleme
        success = await updateStaff(editingStaff.id, staffData)
      } else {
        // Yeni oluşturma
        success = await createStaff({
          ...staffData,
          businessId: business.id
        })
      }

      if (success) {
        handleCloseModal()
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingStaff) return

    const success = await deleteStaff(deletingStaff.id)
    if (success) {
      setShowDeleteModal(false)
      setDeletingStaff(null)
    }
  }

  if (businessLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!business) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">İşletme Bulunamadı</h2>
        <p className="text-gray-600">Önce bir işletme oluşturmanız gerekiyor.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Personel</h1>
          <p className="text-lg mt-2 text-gray-600">
            {business.name} için ekibinizi yönetin ve performanslarını takip edin
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center space-x-2 shadow-lg hover:shadow-xl"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Yeni Personel</span>
        </button>
      </div>

      {/* Loading State */}
      {staffLoading && (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      )}

      {/* Staff Grid */}
      {!staffLoading && (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {staff.map((member) => (
            <div key={member.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-lg hover:scale-105">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    {member.photoUrl ? (
                      <img
                        src={member.photoUrl}
                        alt={member.name}
                        className="w-20 h-20 rounded-full object-cover shadow-md"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                        <UserIcon className="w-10 h-10 text-gray-400" />
                      </div>
                    )}
                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white ${
                      member.isActive ? 'bg-green-500' : 'bg-gray-400'
                    }`}></div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {member.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {member.specialty || 'Personel'}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(member.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-gray-600">
                        {member.rating?.toFixed(1) || '0.0'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button 
                    onClick={() => handleOpenModal(member)}
                    className="p-2 rounded transition-colors text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => {
                      setDeletingStaff(member)
                      setShowDeleteModal(true)
                    }}
                    className="p-2 rounded transition-colors text-gray-400 hover:text-red-600 hover:bg-gray-100"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Performance Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {member._count?.appointments || 0}
                  </div>
                  <div className="text-xs text-gray-500">
                    Bugünkü Randevu
                  </div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {member.experience || 0}
                  </div>
                  <div className="text-xs text-gray-500">
                    Yıl Deneyim
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3">
                {member.phone && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Telefon</span>
                    <span className="font-medium text-gray-700">{member.phone}</span>
                  </div>
                )}
                {member.email && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">E-posta</span>
                    <span className="font-medium text-gray-700">{member.email}</span>
                  </div>
                )}
              </div>

              {/* Bio */}
              {member.bio && (
                <div className="mt-4">
                  <div className="text-sm font-medium mb-2 text-gray-700">Hakkında</div>
                  <p className="text-sm text-gray-600">{member.bio}</p>
                </div>
              )}

              {/* Status */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                  member.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    member.isActive ? 'bg-green-500' : 'bg-gray-500'
                  }`}></div>
                  {member.isActive ? 'Aktif' : 'Pasif'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!staffLoading && staff.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserIcon className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Henüz personel eklenmemiş</h3>
          <p className="text-gray-600 mb-6">İlk personelini ekleyerek başlayın</p>
          <button
            onClick={() => handleOpenModal()}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            İlk Personeli Ekle
          </button>
        </div>
      )}

      {/* Staff Modal */}
      {showStaffModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingStaff ? 'Personeli Düzenle' : 'Yeni Personel Ekle'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                type="button"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  {formData.photoUrl ? (
                    <img
                      src={formData.photoUrl}
                      alt="Personel fotoğrafı"
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <CameraIcon className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <input
                  type="url"
                  placeholder="Fotoğraf URL'si (opsiyonel)"
                  value={formData.photoUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, photoUrl: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ad Soyad</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Örn: Ali Veli"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Uzmanlık</label>
                  <input
                    type="text"
                    value={formData.specialty}
                    onChange={(e) => setFormData(prev => ({ ...prev, specialty: e.target.value }))}
                    placeholder="Örn: Usta Berber"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+90 532 123 45 67"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Deneyim (Yıl)</label>
                  <input
                    type="number"
                    value={formData.experience}
                    onChange={(e) => setFormData(prev => ({ ...prev, experience: parseInt(e.target.value) || 0 }))}
                    placeholder="5"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">E-posta</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="ali@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hakkında</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  rows={3}
                  placeholder="Personel hakkında kısa açıklama..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-500"
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Personeli aktif olarak göster
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                    isSubmitting
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {isSubmitting 
                    ? 'Kaydediliyor...' 
                    : editingStaff 
                      ? 'Güncelle' 
                      : 'Kaydet'
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Personeli Sil</h3>
                <p className="text-sm text-gray-600">Bu işlem geri alınamaz</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              <strong>{deletingStaff.name}</strong> personelini silmek istediğinizden emin misiniz?
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeletingStaff(null)
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
