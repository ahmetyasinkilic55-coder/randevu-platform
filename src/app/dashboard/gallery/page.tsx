'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, Trash2, Eye, X, Loader2, Image as ImageIcon,
  Plus, AlertCircle, Check, Camera, Grid3x3, List, Search
} from 'lucide-react'
import { CloudinaryUpload, CloudinaryImage } from '@/components/cloudinary'
import { useCloudinary } from '@/hooks/useCloudinary'
import toast from 'react-hot-toast'

// Types
interface GalleryPhoto {
  id: string
  publicId: string  // Cloudinary public_id
  imageUrl: string
  title?: string
  description?: string
  order: number
  isActive: boolean
  createdAt: string
}

interface BusinessData {
  id: string
  name: string
  gallery: GalleryPhoto[]
}

export default function GalleryManagement() {
  const { data: session, status } = useSession()
  const { uploadImage, deleteImage, uploading: cloudinaryUploading } = useCloudinary()
  const [businessData, setBusinessData] = useState<BusinessData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all')

  // Load business data on mount
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      loadBusinessData()
    } else if (status === 'unauthenticated') {
      window.location.href = '/auth/signin'
    }
  }, [session, status])

  const loadBusinessData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // First get user's businesses
      const businessResponse = await fetch(`/api/businesses?userId=${session?.user?.id}`)
      if (!businessResponse.ok) {
        const errorData = await businessResponse.json()
        throw new Error(errorData.error || 'İşletmeler yüklenemedi')
      }
      
      const businessData = await businessResponse.json()
      if (!businessData.businesses || businessData.businesses.length === 0) {
        throw new Error('Henüz bir işletme oluşturmamışsınız')
      }
      
      const business = businessData.businesses[0]
      
      // Get gallery data
      const galleryResponse = await fetch(`/api/websites?businessId=${business.id}`)
      if (galleryResponse.ok) {
        const galleryData = await galleryResponse.json()
        setBusinessData({
          id: business.id,
          name: business.name,
          gallery: galleryData.business.gallery || []
        })
      } else {
        setBusinessData({
          id: business.id,
          name: business.name,
          gallery: []
        })
      }
    } catch (error: any) {
      console.error('Error loading business data:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Cloudinary upload handler
  const handleCloudinaryUpload = async (result: any) => {
    if (!businessData?.id) {
      toast.error('İşletme bulunamadı')
      return
    }

    try {
      // Show loading state
      const loadingToast = toast.loading('Fotoğraf kaydediliyor...')
      
      // Save to database with Cloudinary data
      const response = await fetch('/api/gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId: businessData.id,
          imageUrl: result.secure_url,
          title: '',
          description: '',
          order: (businessData.gallery.length || 0) + 1,
          isActive: true
        })
      })

      if (response.ok) {
        toast.dismiss(loadingToast)
        toast.success('Fotoğraf başarıyla eklendi!')
        await loadBusinessData() // Reload gallery
      } else {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        throw new Error(errorData.error || 'Kaydetme başarısız')
      }
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error('Fotoğraf kaydedilirken hata oluştu: ' + error.message)
      
      // If database save fails, try to delete from Cloudinary to avoid orphaned files
      try {
        await deleteImage(result.public_id)
      } catch (cleanupError) {
        console.warn('Cloudinary cleanup hatası:', cleanupError)
      }
    }
  }

  const handlePhotoDelete = async (photoId: string, publicId: string) => {
    if (!businessData?.id) return
    
    if (!confirm('Bu fotoğrafı silmek istediğinizden emin misiniz?')) return
    
    try {
      // Show loading state
      const loadingToast = toast.loading('Fotoğraf siliniyor...')
      
      // Delete from database first (safer approach)
      const response = await fetch(`/api/gallery/${photoId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        // Then delete from Cloudinary (optional, can fail silently)
        try {
          await deleteImage(publicId)
        } catch (cloudinaryError) {
          console.warn('Cloudinary silme hatası:', cloudinaryError)
          // Don't fail the whole operation if Cloudinary delete fails
        }
        
        toast.dismiss(loadingToast)
        toast.success('Fotoğraf başarıyla silindi!')
        await loadBusinessData()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Veritabanından silme başarısız')
      }
    } catch (error: any) {
      console.error('Photo delete error:', error)
      toast.error('Fotoğraf silinirken hata oluştu: ' + error.message)
    }
  }

  // Filter and search logic
  const filteredPhotos = businessData?.gallery.filter(photo => {
    const matchesSearch = photo.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         photo.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterActive === 'all' || 
                         (filterActive === 'active' && photo.isActive) ||
                         (filterActive === 'inactive' && !photo.isActive)
    
    return matchesSearch && matchesFilter
  }) || []

  // Loading screen
  if (loading || status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-900">Galeri yükleniyor...</p>
        </div>
      </div>
    )
  }

  // Error screen
  if (error && status === 'authenticated') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Bir Hata Oluştu</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => {
              setError(null)
              loadBusinessData()
            }}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Yeniden Dene
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Galeri Yönetimi</h1>
            <p className="text-sm lg:text-base text-gray-900">
              {businessData?.name} işletmeniz için galeri fotoğraflarını yönetin
            </p>
          </div>
          
          {/* Upload Button - Cloudinary */}
          <div className="w-full lg:w-auto">
            <CloudinaryUpload
              onUpload={handleCloudinaryUpload}
              folder="business-gallery"
              tags={`business_${businessData?.id || 'unknown'},gallery`}
              maxFiles={10}
              className="w-full cursor-pointer bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 lg:px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              {cloudinaryUploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Yükleniyor...</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  <span>Fotoğraf Yükle</span>
                </>
              )}
            </CloudinaryUpload>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
          <div className="flex items-center">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <ImageIcon className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
            </div>
            <div className="ml-3 lg:ml-4 min-w-0 flex-1">
              <p className="text-xl lg:text-2xl font-bold text-gray-900">{businessData?.gallery.length || 0}</p>
              <p className="text-xs lg:text-sm text-gray-900 truncate">Toplam Fotoğraf</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
          <div className="flex items-center">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Check className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
            </div>
            <div className="ml-3 lg:ml-4 min-w-0 flex-1">
              <p className="text-xl lg:text-2xl font-bold text-gray-900">
                {businessData?.gallery.filter(p => p.isActive).length || 0}
              </p>
              <p className="text-xs lg:text-sm text-gray-900 truncate">Aktif Fotoğraf</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
          <div className="flex items-center">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <X className="w-5 h-5 lg:w-6 lg:h-6 text-orange-600" />
            </div>
            <div className="ml-3 lg:ml-4 min-w-0 flex-1">
              <p className="text-xl lg:text-2xl font-bold text-gray-900">
                {businessData?.gallery.filter(p => !p.isActive).length || 0}
              </p>
              <p className="text-xs lg:text-sm text-gray-900 truncate">Gizli Fotoğraf</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
          <div className="flex items-center">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Camera className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600" />
            </div>
            <div className="ml-3 lg:ml-4 min-w-0 flex-1">
              <p className="text-xl lg:text-2xl font-bold text-gray-900">
                {Math.round((businessData?.gallery.filter(p => p.isActive).length || 0) / Math.max(businessData?.gallery.length || 1, 1) * 100)}%
              </p>
              <p className="text-xs lg:text-sm text-gray-900 truncate">Görünürlük</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
            <div className="relative flex-1 lg:max-w-xs">
              <Search className="w-4 h-4 lg:w-5 lg:h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Fotoğraf ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full text-sm lg:text-base text-gray-900 placeholder-gray-500"
              />
            </div>
            
            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value as 'all' | 'active' | 'inactive')}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full lg:w-auto text-sm lg:text-base text-gray-900"
            >
              <option value="all">Tüm Fotoğraflar</option>
              <option value="active">Aktif Olanlar</option>
              <option value="inactive">Gizli Olanlar</option>
            </select>
          </div>
          
          <div className="flex justify-end">
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 lg:p-3 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                <Grid3x3 className="w-4 h-4 lg:w-5 lg:h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 lg:p-3 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                <List className="w-4 h-4 lg:w-5 lg:h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
        {/* Drag & Drop Upload Zone - Show when no photos or as header */}
        <div className="mb-6">
          <CloudinaryUpload
            onUpload={handleCloudinaryUpload}
            folder="business-gallery"
            tags={`business_${businessData?.id || 'unknown'},gallery`}
            maxFiles={10}
            className="w-full"
          />
        </div>
        
        {filteredPhotos.length === 0 ? (
          <div className="text-center py-8 lg:py-12">
            <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="w-10 h-10 lg:w-12 lg:h-12 text-gray-400" />
            </div>
            <h3 className="text-lg lg:text-xl font-medium text-gray-900 mb-2">
              {businessData?.gallery.length === 0 ? 'Henüz fotoğraf yok' : 'Arama sonucu bulunamadı'}
            </h3>
            <p className="text-sm lg:text-base text-gray-900 mb-6">
              {businessData?.gallery.length === 0 
                ? 'Galerinize ilk fotoğrafları ekleyerek başlayın'
                : 'Farklı arama terimleri veya filtreler deneyin'
              }
            </p>
            {businessData?.gallery.length === 0 && (
              <CloudinaryUpload
                onUpload={handleCloudinaryUpload}
                folder="business-gallery"
                tags={`business_${businessData?.id || 'unknown'},gallery`}
                maxFiles={10}
                className="cursor-pointer bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center gap-2 text-sm lg:text-base"
              >
                <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
                <span>İlk Fotoğrafı Ekle</span>
              </CloudinaryUpload>
            )}
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-6' : 'space-y-4'}>
            {filteredPhotos.map((photo) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={viewMode === 'grid' ? 'group' : 'flex items-center space-x-3 lg:space-x-4 p-3 lg:p-4 border border-gray-200 rounded-lg'}
              >
                {viewMode === 'grid' ? (
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <CloudinaryImage
                      publicId={photo.publicId || photo.imageUrl}
                      alt={photo.title || 'Galeri fotoğrafı'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      transformation={{
                        width: 500,
                        height: 500,
                        crop: 'fill',
                        gravity: 'auto',
                        quality: 'auto',
                        format: 'auto'
                      }}
                    />
                    
                    {!photo.isActive && (
                      <div className="absolute top-2 left-2">
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">Gizli</span>
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                      <button
                        onClick={() => window.open(photo.imageUrl, '_blank')}
                        className="bg-white/20 backdrop-blur-sm text-white p-2 lg:p-3 rounded-lg hover:bg-white/30 transition-colors"
                        title="Görüntüle"
                      >
                        <Eye className="w-4 h-4 lg:w-5 lg:h-5" />
                      </button>
                      <button
                        onClick={() => handlePhotoDelete(photo.id, photo.publicId || photo.imageUrl)}
                        className="bg-red-500/80 backdrop-blur-sm text-white p-2 lg:p-3 rounded-lg hover:bg-red-600/80 transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4 lg:w-5 lg:h-5" />
                      </button>
                    </div>
                    
                    {photo.title && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 lg:p-3">
                        <p className="text-white text-xs lg:text-sm font-medium truncate">{photo.title}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <CloudinaryImage
                        publicId={photo.publicId || photo.imageUrl}
                        alt={photo.title || 'Galeri fotoğrafı'}
                        className="w-full h-full object-cover"
                        transformation={{
                          width: 150,
                          height: 150,
                          crop: 'fill',
                          gravity: 'auto',
                          quality: 'auto',
                          format: 'auto'
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate text-sm lg:text-base">{photo.title || 'Başlıksız'}</h3>
                      <p className="text-xs lg:text-sm text-gray-900 truncate">{photo.description || 'Açıklama yok'}</p>
                      <p className="text-xs text-gray-900 mt-1">
                        {new Date(photo.createdAt).toLocaleDateString('tr-TR')}
                        {photo.isActive ? (
                          <span className="ml-2 text-green-600">Aktif</span>
                        ) : (
                          <span className="ml-2 text-red-600">Gizli</span>
                        )}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handlePhotoDelete(photo.id, photo.publicId || photo.imageUrl)}
                        className="p-2 text-red-400 hover:text-red-600 transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4 lg:w-5 lg:h-5" />
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg max-w-md z-50"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Hata</p>
                <p className="text-sm opacity-90">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="p-1 hover:bg-red-600 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}