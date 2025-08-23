'use client'

import { useState } from 'react'
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { useActiveBusiness } from '@/hooks/useActiveBusiness'
import { useServices } from '@/hooks/useServices'

interface ServiceFormData {
  name: string
  price: number
  duration: number
  description: string
  category: string
  active: boolean
}

const SERVICE_CATEGORIES = [
  'Temel Hizmetler',
  'Popüler Paketler', 
  'Premium Hizmetler',
  'Ek Hizmetler'
]

export default function ServicesPage() {
  const { business, isLoading: businessLoading } = useActiveBusiness()
  const { services, isLoading: servicesLoading, createService, updateService, deleteService } = useServices(business?.id || null)
  
  const [serviceFilter, setServiceFilter] = useState('all')
  const [showServiceModal, setShowServiceModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingService, setEditingService] = useState<any>(null)
  const [deletingService, setDeletingService] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState<ServiceFormData>({
    name: '',
    price: 0,
    duration: 30,
    description: '',
    category: 'Temel Hizmetler',
    active: true
  })

  const filteredServices = services.filter(service => 
    serviceFilter === 'all' || service.category === serviceFilter
  )

  const resetForm = () => {
    setFormData({
      name: '',
      price: 0,
      duration: 30,
      description: '',
      category: 'Temel Hizmetler',
      active: true
    })
  }

  const handleOpenModal = (service?: any) => {
    if (service) {
      setEditingService(service)
      setFormData({
        name: service.name,
        price: service.price,
        duration: service.duration,
        description: service.description || '',
        category: service.category,
        active: service.isActive
      })
    } else {
      setEditingService(null)
      resetForm()
    }
    setShowServiceModal(true)
  }

  const handleCloseModal = () => {
    setShowServiceModal(false)
    setEditingService(null)
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

      if (editingService) {
        // Güncelleme
        success = await updateService(editingService.id, formData)
      } else {
        // Yeni oluşturma
        success = await createService({
          ...formData,
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
    if (!deletingService) return

    const success = await deleteService(deletingService.id)
    if (success) {
      setShowDeleteModal(false)
      setDeletingService(null)
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
          <h1 className="text-3xl font-bold text-gray-900">Hizmetler</h1>
          <p className="text-lg mt-2 text-gray-600">
            {business.name} için sunduğunuz hizmetleri yönetin
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center space-x-2 shadow-lg hover:shadow-xl"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Yeni Hizmet</span>
        </button>
      </div>

      {/* Service Categories Filter */}
      <div className="flex flex-wrap gap-2">
        {['Tümü', ...SERVICE_CATEGORIES].map((category) => (
          <button
            key={category}
            onClick={() => setServiceFilter(category === 'Tümü' ? 'all' : category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              (serviceFilter === 'all' && category === 'Tümü') || serviceFilter === category
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {servicesLoading && (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      )}

      {/* Services Grid */}
      {!servicesLoading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((service) => (
            <div key={service.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-lg hover:scale-105">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full transition-colors ${
                    service.isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
                  }`}></div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    service.category === 'Temel Hizmetler' ? 'bg-blue-100 text-blue-800' :
                    service.category === 'Popüler Paketler' ? 'bg-purple-100 text-purple-800' :
                    service.category === 'Premium Hizmetler' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {service.category}
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button 
                    onClick={() => handleOpenModal(service)}
                    className="p-1 rounded transition-colors text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => {
                      setDeletingService(service)
                      setShowDeleteModal(true)
                    }}
                    className="p-1 rounded transition-colors text-gray-400 hover:text-red-600 hover:bg-gray-100"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2 text-gray-900">
                  {service.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {service.description || 'Açıklama eklenmemiş'}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-gray-900">
                    ₺{service.price}
                  </span>
                  <span className="text-sm ml-1 text-gray-500">
                    / {service.duration}dk
                  </span>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium inline-flex items-center px-2 py-1 rounded-full ${
                    service.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {service.isActive ? 'Aktif' : 'Pasif'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!servicesLoading && filteredServices.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <PlusIcon className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {serviceFilter === 'all' ? 'Henüz hizmet eklenmemiş' : 'Bu kategoride hizmet bulunamadı'}
          </h3>
          <p className="text-gray-600 mb-6">
            {serviceFilter === 'all' 
              ? 'İlk hizmetinizi ekleyerek başlayın'
              : 'Farklı bir kategori seçin veya yeni hizmet ekleyin'
            }
          </p>
          <button
            onClick={() => handleOpenModal()}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            İlk Hizmeti Ekle
          </button>
        </div>
      )}

      {/* Service Modal */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingService ? 'Hizmeti Düzenle' : 'Yeni Hizmet Ekle'}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hizmet Adı</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Örn: Saç Kesimi"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fiyat (₺)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                    placeholder="80"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Süre (dakika)</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 5 }))}
                    placeholder="30"
                    min="5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                  required
                >
                  {SERVICE_CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Açıklama</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  placeholder="Hizmet hakkında kısa açıklama..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-500"
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="active" className="text-sm font-medium text-gray-700">
                  Hizmeti aktif olarak göster
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
                    : editingService 
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
      {showDeleteModal && deletingService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Hizmeti Sil</h3>
                <p className="text-sm text-gray-600">Bu işlem geri alınamaz</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              <strong>{deletingService.name}</strong> hizmetini silmek istediğinizden emin misiniz?
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeletingService(null)
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
