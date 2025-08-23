'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { 
  UserIcon,
  BuildingStorefrontIcon,
  ClockIcon,
  BellIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  TrashIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'
import { Camera, Loader2 } from 'lucide-react'
import {
  BusinessData,
  UserData,
  NotificationSettings,
  WorkingHour,
  PasswordChangeData,
  DAY_NAMES,
  BUSINESS_CATEGORIES
} from '@/types/settings'

export default function SettingsPage() {
  const { data: session } = useSession()
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [activeTab, setActiveTab] = useState('business')
  const [loading, setLoading] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [error, setError] = useState('')

  const [uploadingProfile, setUploadingProfile] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [businessData, setBusinessData] = useState<BusinessData | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([])
  const [notifications, setNotifications] = useState<NotificationSettings>({
    newAppointment: true,
    appointmentCancellation: true,
    dailySummary: true,
    weeklyReport: false,
    monthlyAnalysis: true,
    marketingTips: false,
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true
  })

  const BusinessSettings = () => (
    <div className="space-y-8">
      {businessData && (
        <>
          <div>
            <h3 className={`text-lg font-semibold mb-4 transition-colors ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              İşletme Bilgileri
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  İşletme Adı
                </label>
                <input
                  type="text"
                  value={businessData.name || ''}
                  onChange={(e) => setBusinessData({...businessData, name: e.target.value})}
                  className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:ring-purple-500 focus:border-purple-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-500 focus:border-purple-500'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  İşletme Türü
                </label>
                <select 
                  value={businessData.category || ''}
                  onChange={(e) => setBusinessData({...businessData, category: e.target.value})}
                  className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:ring-purple-500 focus:border-purple-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-500 focus:border-purple-500'
                  }`}
                >
                  {BUSINESS_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === 'BARBER' ? 'Berber/Kuaför' :
                       cat === 'BEAUTY_SALON' ? 'Güzellik Salonu' :
                       cat === 'DENTIST' ? 'Diş Hekimi' :
                       cat === 'VETERINARIAN' ? 'Veteriner' :
                       cat === 'CAR_WASH' ? 'Oto Yıkama' :
                       cat === 'GYM' ? 'Spor Salonu' :
                       'Diğer'}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-2 transition-colors ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Adres
                </label>
                <textarea
                  rows={3}
                  value={businessData.address || ''}
                  onChange={(e) => setBusinessData({...businessData, address: e.target.value})}
                  className={`w-full px-4 py-3 border rounded-lg resize-none transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:ring-purple-500 focus:border-purple-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-500 focus:border-purple-500'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Telefon
                </label>
                <input
                  type="tel"
                  value={businessData.phone || ''}
                  onChange={(e) => setBusinessData({...businessData, phone: e.target.value})}
                  className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:ring-purple-500 focus:border-purple-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-500 focus:border-purple-500'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  E-posta
                </label>
                <input
                  type="email"
                  value={businessData.email || ''}
                  onChange={(e) => setBusinessData({...businessData, email: e.target.value})}
                  className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:ring-purple-500 focus:border-purple-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-500 focus:border-purple-500'
                  }`}
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className={`text-lg font-semibold mb-4 transition-colors ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Web Sitesi Ayarları
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Site URL'si
                </label>
                <div className="flex">
                  <span className={`inline-flex items-center px-3 rounded-l-lg border border-r-0 text-sm transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-300'
                      : 'bg-gray-50 border-gray-300 text-gray-500'
                  }`}>
                    mocksite.com/
                  </span>
                  <input
                    type="text"
                    value={businessData.website?.replace('mocksite.com/', '') || ''}
                    onChange={(e) => setBusinessData({...businessData, website: `mocksite.com/${e.target.value}`})}
                    className={`flex-1 px-3 py-3 border rounded-r-lg transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white focus:ring-purple-500 focus:border-purple-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-500 focus:border-purple-500'
                    }`}
                  />
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Site Durumu
                </label>
                <select 
                  value={businessData.isActive ? 'active' : 'inactive'}
                  onChange={(e) => setBusinessData({...businessData, isActive: e.target.value === 'active'})}
                  className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:ring-purple-500 focus:border-purple-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-500 focus:border-purple-500'
                  }`}
                >
                  <option value="active">Yayında</option>
                  <option value="inactive">Devre Dışı</option>
                </select>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )

  const ServiceTypeSettings = () => (
    <div className="space-y-8">
      <div>
        <h3 className={`text-lg font-semibold mb-4 transition-colors ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Hizmet Tipi Ayarları
        </h3>
        
        <div className="space-y-6">
          <div>
            <label className={`block text-sm font-medium mb-3 transition-colors ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              İşletmeniz nasıl hizmet veriyor?
            </label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  type: 'APPOINTMENT',
                  title: 'Randevulu Hizmet',
                  description: 'Belirli saatlerde randevu alarak hizmet veriyorum',
                  icon: '📅'
                },
                {
                  type: 'PROJECT',
                  title: 'Proje Bazlı Hizmet',
                  description: 'Büyük projeler için keşif yapıp teklif veriyorum',
                  icon: '🔨'
                },
                {
                  type: 'CONSULTATION',
                  title: 'Danışmanlık Hizmeti',
                  description: 'Bilgi ve uzmanlık paylaşımı yapıyorum',
                  icon: '💡'
                },
                {
                  type: 'HYBRID',
                  title: 'Karma Hizmet',
                  description: 'Hem randevu hem proje bazlı hizmet veriyorum',
                  icon: '🔄'
                }
              ].map((option) => (
                <div
                  key={option.type}
                  onClick={() => setServiceType(option.type)}
                  className={`cursor-pointer p-4 border-2 rounded-xl transition-all hover:shadow-lg ${
                    serviceType === option.type
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : isDarkMode
                        ? 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">{option.icon}</div>
                    <div className="flex-1">
                      <h4 className={`font-semibold transition-colors ${
                        serviceType === option.type
                          ? 'text-purple-700 dark:text-purple-400'
                          : isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {option.title}
                      </h4>
                      <p className={`text-sm mt-1 transition-colors ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {option.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hizmet Tipine Göre Ek Ayarlar */}
          {(serviceType === 'PROJECT' || serviceType === 'HYBRID') && (
            <div className={`p-6 border rounded-lg transition-colors ${
              isDarkMode ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-gray-50'
            }`}>
              <h4 className={`font-semibold mb-4 transition-colors ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Proje Bazlı Hizmet Ayarları
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Minimum Proje Tutarı (₺)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={serviceSettings.minimumProjectAmount}
                    onChange={(e) => setServiceSettings({...serviceSettings, minimumProjectAmount: parseFloat(e.target.value) || 0})}
                    className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white focus:ring-purple-500 focus:border-purple-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-500 focus:border-purple-500'
                    }`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Çalışma Bölgesi
                  </label>
                  <input
                    type="text"
                    value={serviceSettings.workingRadius}
                    onChange={(e) => setServiceSettings({...serviceSettings, workingRadius: e.target.value})}
                    placeholder="örn: Tüm Ankara, Çankaya, Kemal Paşa"
                    className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white focus:ring-purple-500 focus:border-purple-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-500 focus:border-purple-500'
                    }`}
                  />
                </div>
              </div>
            </div>
          )}

          {(serviceType === 'CONSULTATION' || serviceType === 'HYBRID') && (
            <div className={`p-6 border rounded-lg transition-colors ${
              isDarkMode ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-gray-50'
            }`}>
              <h4 className={`font-semibold mb-4 transition-colors ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Danışmanlık Hizmeti Ayarları
              </h4>
              
              <div className="space-y-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={serviceSettings.isConsultationFree}
                    onChange={(e) => setServiceSettings({...serviceSettings, isConsultationFree: e.target.checked})}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 mr-3"
                  />
                  <span className={`transition-colors ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    İlk görüşme ücretsiz
                  </span>
                </label>
                
                {!serviceSettings.isConsultationFree && (
                  <div>
                    <label className={`block text-sm font-medium mb-2 transition-colors ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Danışmanlık Ücreti (₺)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={serviceSettings.consultationFee}
                      onChange={(e) => setServiceSettings({...serviceSettings, consultationFee: parseFloat(e.target.value) || 0})}
                      className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white focus:ring-purple-500 focus:border-purple-500'
                          : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-500 focus:border-purple-500'
                      }`}
                    />
                  </div>
                )}
                
                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Desteklenen Görüşme Türleri
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'face_to_face', label: 'Yüz yüze görüşme' },
                      { value: 'online', label: 'Online görüşme' },
                      { value: 'phone', label: 'Telefon görüşmesi' }
                    ].map(meetingType => (
                      <label key={meetingType.value} className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={serviceSettings.supportedMeetingTypes.includes(meetingType.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setServiceSettings({
                                ...serviceSettings,
                                supportedMeetingTypes: [...serviceSettings.supportedMeetingTypes, meetingType.value]
                              })
                            } else {
                              setServiceSettings({
                                ...serviceSettings,
                                supportedMeetingTypes: serviceSettings.supportedMeetingTypes.filter(type => type !== meetingType.value)
                              })
                            }
                          }}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 mr-3"
                        />
                        <span className={`transition-colors ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {meetingType.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Müşteri Görünümü Önizlemesi */}
          <div className={`p-6 border-2 rounded-xl transition-colors ${
            isDarkMode 
              ? 'border-blue-600 bg-blue-900/20' : 'border-blue-200 bg-blue-50'
          }`}>
            <h4 className={`font-medium mb-2 transition-colors ${
              isDarkMode ? 'text-blue-400' : 'text-blue-700'
            }`}>
              👀 Müşteri Görünümü Önizlemesi
            </h4>
            <p className={`text-sm mb-3 transition-colors ${
              isDarkMode ? 'text-blue-300' : 'text-blue-600'
            }`}>
              Müşterileriniz profilinizde bu butonu görecek:
            </p>
            
            <div className="inline-flex items-center justify-center px-6 py-3 bg-purple-600 text-white rounded-lg font-medium">
              {serviceType === 'APPOINTMENT' && '📅 Randevu Al'}
              {serviceType === 'PROJECT' && '🔨 Keşif Talep Et'}
              {serviceType === 'CONSULTATION' && '💡 Ön Görüşme Al'}
              {serviceType === 'HYBRID' && '🔄 İletişime Geç'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const ProfileSettings = () => {
    console.log('ProfileSettings rendered with businessData:', businessData)
    console.log('Profile Photo URL:', businessData?.profilePhotoUrl)
    console.log('Cover Photo URL:', businessData?.coverPhotoUrl)
    
    if (!businessData) {
      return (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">İşletme bilgileri yükleniyor...</p>
        </div>
      )
    }
    
    return (
      <div className="space-y-8">
        <h3 className={`text-lg font-semibold mb-6 transition-colors ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Fotoğraf Yönetimi
        </h3>
        
        {/* Kapak Fotoğrafı */}
        <div>
          <h4 className={`text-md font-medium mb-4 transition-colors ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Kapak Fotoğrafı
          </h4>
          
          <div className="relative">
            <div className="h-48 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl overflow-hidden relative">
              {businessData.coverPhotoUrl ? (
                <>
                  <img 
                    src={businessData.coverPhotoUrl} 
                    alt="Kapak Fotoğrafı" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20"></div>
                </>  
              ) : (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm opacity-75">Kapak fotoğrafı yükleyin</p>
                  </div>
                </div>
              )}
              
              {/* Upload/Delete Buttons */}
              <div className="absolute top-4 right-4">
                <div className="flex gap-2">
                  <label className={`cursor-pointer p-3 rounded-lg transition-colors ${
                    uploadingCover ? 'opacity-50 cursor-not-allowed' : 'bg-black/50 hover:bg-black/70'
                  } backdrop-blur-sm text-white`}>
                    {uploadingCover ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Camera className="w-5 h-5" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingCover}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleCoverPhotoUpload(e.target.files[0])
                        }
                      }}
                    />
                  </label>
                  
                  {businessData.coverPhotoUrl && (
                    <button
                      onClick={handleCoverPhotoDelete}
                      className="p-3 bg-red-500/80 hover:bg-red-600/80 backdrop-blur-sm text-white rounded-lg transition-colors"
                      title="Kapak fotoğrafını sil"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            <p className={`text-sm mt-2 transition-colors ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Önerilen boyut: 1200x400 px. Maksimum dosya boyutu: 5MB
            </p>
          </div>
        </div>
        
        {/* Profil Fotoğrafı */}
        <div>
          <h4 className={`text-md font-medium mb-4 transition-colors ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Profil Fotoğrafı
          </h4>
          
          <div className="flex items-start space-x-6">
            {/* Profil Fotoğrafı Container */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-gray-200 overflow-hidden bg-gray-100">
                {businessData.profilePhotoUrl ? (
                  <img 
                    src={businessData.profilePhotoUrl} 
                    alt={businessData.name} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full bg-purple-100 flex items-center justify-center">
                    <UserIcon className="w-16 h-16 text-purple-600" />
                  </div>
                )}
              </div>
              
              {/* Upload Button */}
              <div className="absolute -bottom-2 -right-2">
                <label className={`cursor-pointer w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg ${
                  uploadingProfile ? 'opacity-50 cursor-not-allowed bg-gray-400' : 'bg-purple-600 hover:bg-purple-700 hover:shadow-xl'
                } text-white`}>
                  {uploadingProfile ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Camera className="w-5 h-5" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingProfile}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleProfilePhotoUpload(e.target.files[0])
                      }
                    }}
                  />
                </label>
              </div>
            </div>
            
            {/* Profil Bilgileri ve Silme Butonu */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h5 className={`text-lg font-semibold transition-colors ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {businessData.name || 'İşletme Adı'}
                </h5>
                
                {businessData.profilePhotoUrl && (
                  <button
                    onClick={handleProfilePhotoDelete}
                    className="flex items-center space-x-2 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors text-sm font-medium"
                    title="Profil fotoğrafını sil"
                  >
                    <TrashIcon className="w-4 h-4" />
                    <span>Kaldır</span>
                  </button>
                )}
              </div>
              
              <p className={`text-sm transition-colors ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {businessData.category === 'BARBER' ? 'Berber/Kuaför' :
                 businessData.category === 'BEAUTY_SALON' ? 'Güzellik Salonu' :
                 businessData.category === 'DENTIST' ? 'Diş Hekimi' :
                 businessData.category === 'VETERINARIAN' ? 'Veteriner' :
                 businessData.category === 'CAR_WASH' ? 'Oto Yıkama' :
                 businessData.category === 'GYM' ? 'Spor Salonu' :
                 'İşletme'}
              </p>
              
              <p className={`text-xs mt-3 transition-colors ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Önerilen boyut: 400x400 px (kare). Maksimum dosya boyutu: 5MB
              </p>
            </div>
          </div>
        </div>
        
        {/* Yükleme İpuçları */}
        <div className={`p-4 rounded-lg transition-colors ${
          isDarkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50 border border-gray-200'
        }`}>
          <h5 className={`font-medium mb-2 transition-colors ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            💡 Fotoğraf Yükleme İpuçları
          </h5>
          <ul className={`text-sm space-y-1 transition-colors ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            <li>• Desteklenen formatlar: JPG, PNG, WebP</li>
            <li>• Yüksek çözünürlüklü fotoğraflar kullanın</li>
            <li>• Kapak fotoğrafı işletmenizin genel görünümünü yansıtmalı</li>
            <li>• Profil fotoğrafı logo veya işletme vitrinini gösterebilir</li>
          </ul>
        </div>
      </div>
    )
  }

  // Password change state
  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Service type settings
  const [serviceType, setServiceType] = useState('APPOINTMENT')
  const [serviceSettings, setServiceSettings] = useState({
    minimumProjectAmount: 0,
    consultationFee: 0,
    isConsultationFree: true,
    workingRadius: 'Tüm Ankara',
    supportedMeetingTypes: ['face_to_face', 'online']
  })

  const tabs = [
    { id: 'business', name: 'İşletme Bilgileri', icon: BuildingStorefrontIcon },
    { id: 'service-type', name: 'Hizmet Tipi', icon: Cog6ToothIcon },
    { id: 'profile', name: 'Profil', icon: UserIcon },
    { id: 'hours', name: 'Çalışma Saatleri', icon: ClockIcon },
    { id: 'notifications', name: 'Bildirimler', icon: BellIcon },
    { id: 'payments', name: 'Ödeme', icon: CreditCardIcon },
    { id: 'security', name: 'Güvenlik', icon: ShieldCheckIcon }
  ]

  const dayNames = DAY_NAMES

  // Load data on component mount
  useEffect(() => {
    if (session?.user) {
      loadData()
    }
  }, [session, activeTab])

  const loadData = async () => {
    setLoading(true)
    try {
      switch (activeTab) {
        case 'business':
          await loadBusinessData()
          break
        case 'service-type':
          await loadServiceTypeData()
          break
        case 'profile':
          await loadUserData()
          await loadBusinessData() // Business data da yükle
          break
        case 'hours':
          await loadWorkingHours()
          break
        case 'notifications':
          await loadNotifications()
          break
      }
    } catch (err) {
      setError('Veri yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const loadBusinessData = async () => {
    try {
      const response = await fetch('/api/settings/business')
      if (response.ok) {
        const data = await response.json()
        console.log('Business data loaded:', data.business)
        console.log('Raw profilePhotoUrl from API:', data.business.profilePhotoUrl)
        console.log('Raw coverPhotoUrl from API:', data.business.coverPhotoUrl)
        setBusinessData({
          id: data.business.id,
          name: data.business.name,
          category: data.business.category,
          address: data.business.address,
          phone: data.business.phone,
          email: data.business.email,
          description: data.business.description,
          website: data.business.website,
          profilePhotoUrl: data.business.profilePhotoUrl,
          coverPhotoUrl: data.business.coverPhotoUrl,
          isActive: data.business.isActive
        })
      } else {
        console.error('Failed to load business data:', response.status)
        throw new Error('İşletme bilgileri yüklenemedi')
      }
    } catch (err) {
      console.error('Load business data error:', err)
      setError('İşletme bilgileri yüklenirken hata oluştu')
    }
  }

  const loadServiceTypeData = async () => {
    const response = await fetch('/api/settings/business-settings')
    if (response.ok) {
      const data = await response.json()
      setServiceType(data.settings?.serviceType || 'APPOINTMENT')
      setServiceSettings({
        minimumProjectAmount: data.settings?.minimumProjectAmount || 0,
        consultationFee: data.settings?.consultationFee || 0,
        isConsultationFree: data.settings?.isConsultationFree !== undefined ? data.settings.isConsultationFree : true,
        workingRadius: data.settings?.workingRadius ? JSON.parse(data.settings.workingRadius) : 'Tüm Ankara',
        supportedMeetingTypes: data.settings?.supportedMeetingTypes ? JSON.parse(data.settings.supportedMeetingTypes) : ['face_to_face', 'online']
      })
    }
  }

  const loadUserData = async () => {
    try {
      const response = await fetch('/api/settings/profile')
      if (response.ok) {
        const data = await response.json()
        console.log('User data loaded:', data.user)
        setUserData(data.user)
      } else {
        console.error('Failed to load user data:', response.status)
        // Set default user data from session if API fails
        if (session?.user) {
          console.log('Setting default user data from session:', session.user)
          setUserData({
            id: session.user.id || '',
            email: session.user.email || '',
            name: session.user.name || '',
            phone: '',
            position: 'İşletme Sahibi'
          })
        }
      }
    } catch (err) {
      console.error('Load user data error:', err)
      // Set default user data from session if API fails
      if (session?.user) {
        console.log('Setting default user data from session (catch):', session.user)
        setUserData({
          id: session.user.id || '',
          email: session.user.email || '',
          name: session.user.name || '',
          phone: '',
          position: 'İşletme Sahibi'
        })
      }
      setError('Kullanıcı bilgileri yüklenirken hata oluştu')
    }
  }

  // Appointment settings state
  const [appointmentSettings, setAppointmentSettings] = useState({
    slotDuration: 60, // dakika
    bufferTime: 15, // randevular arası tampon süre
    maxAdvanceBooking: 30, // kaç gün öncesinden randevu alınabilir
    minAdvanceBooking: 2, // kaç saat öncesine kadar randevu alınabilir
    allowSameDayBooking: true,
    maxDailyAppointments: 0, // 0 = sınırsız
    autoConfirmation: true
  })

  const loadWorkingHours = async () => {
    const response = await fetch('/api/settings/working-hours')
    if (response.ok) {
      const data = await response.json()
      if (data.workingHours && data.workingHours.length > 0) {
        setWorkingHours(data.workingHours)
      } else {
        // Default working hours
        setWorkingHours([
          { dayOfWeek: 1, isOpen: true, openTime: '09:00', closeTime: '18:00' },
          { dayOfWeek: 2, isOpen: true, openTime: '09:00', closeTime: '18:00' },
          { dayOfWeek: 3, isOpen: true, openTime: '09:00', closeTime: '18:00' },
          { dayOfWeek: 4, isOpen: true, openTime: '09:00', closeTime: '18:00' },
          { dayOfWeek: 5, isOpen: true, openTime: '09:00', closeTime: '18:00' },
          { dayOfWeek: 6, isOpen: true, openTime: '10:00', closeTime: '17:00' },
          { dayOfWeek: 0, isOpen: false, openTime: '09:00', closeTime: '18:00' }
        ])
      }
      
      // Load appointment settings
      if (data.appointmentSettings) {
        setAppointmentSettings(data.appointmentSettings)
      }
    }
  }

  const loadNotifications = async () => {
    const response = await fetch('/api/settings/notifications')
    if (response.ok) {
      const data = await response.json()
      setNotifications(data.notifications)
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

  // Photo upload and delete functions
  const handleProfilePhotoUpload = async (file: File) => {
    if (!businessData?.id) {
      showMessage('İşletme bulunamadı', true)
      return
    }
    
    // File size check (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showMessage('Dosya boyutu 5MB\'dan büyük olamaz', true)
      return
    }
    
    // File type check
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      showMessage('Sadece JPG, PNG ve WebP formatları desteklenir', true)
      return
    }
    
    try {
      setUploadingProfile(true)
      setError('')
      
      const formData = new FormData()
      formData.append('file', file)
      formData.append('businessId', businessData.id)
      formData.append('type', 'profile')
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        const result = await response.json()
        setBusinessData(prev => prev ? { ...prev, profilePhotoUrl: result.url } : null)
        showMessage('Profil fotoğrafı başarıyla yüklendi!')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Yükleme başarısız')
      }
    } catch (error: any) {
      console.error('Profile photo upload error:', error)
      showMessage('Profil fotoğrafı yüklenirken bir hata oluştu: ' + error.message, true)
    } finally {
      setUploadingProfile(false)
    }
  }
  
  const handleCoverPhotoUpload = async (file: File) => {
    if (!businessData?.id) {
      showMessage('İşletme bulunamadı', true)
      return
    }
    
    // File size check (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showMessage('Dosya boyutu 5MB\'dan büyük olamaz', true)
      return
    }
    
    // File type check
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      showMessage('Sadece JPG, PNG ve WebP formatları desteklenir', true)
      return
    }
    
    try {
      setUploadingCover(true)
      setError('')
      
      const formData = new FormData()
      formData.append('file', file)
      formData.append('businessId', businessData.id)
      formData.append('type', 'cover')
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        const result = await response.json()
        setBusinessData(prev => prev ? { ...prev, coverPhotoUrl: result.url } : null)
        showMessage('Kapak fotoğrafı başarıyla yüklendi!')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Yükleme başarısız')
      }
    } catch (error: any) {
      console.error('Cover photo upload error:', error)
      showMessage('Kapak fotoğrafı yüklenirken bir hata oluştu: ' + error.message, true)
    } finally {
      setUploadingCover(false)
    }
  }
  
  const handleProfilePhotoDelete = async () => {
    if (!businessData?.id) return
    
    if (!confirm('Profil fotoğrafını silmek istediğinizden emin misiniz?')) return
    
    try {
      const params = new URLSearchParams({
        businessId: businessData.id,
        type: 'profile'
      })
      
      const response = await fetch(`/api/upload?${params}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setBusinessData(prev => prev ? { ...prev, profilePhotoUrl: undefined } : null)
        showMessage('Profil fotoğrafı başarıyla silindi!')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Silme başarısız')
      }
    } catch (error: any) {
      console.error('Profile photo delete error:', error)
      showMessage('Profil fotoğrafı silinirken bir hata oluştu: ' + error.message, true)
    }
  }
  
  const handleCoverPhotoDelete = async () => {
    if (!businessData?.id) return
    
    if (!confirm('Kapak fotoğrafını silmek istediğinizden emin misiniz?')) return
    
    try {
      const params = new URLSearchParams({
        businessId: businessData.id,
        type: 'cover'
      })
      
      const response = await fetch(`/api/upload?${params}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setBusinessData(prev => prev ? { ...prev, coverPhotoUrl: undefined } : null)
        showMessage('Kapak fotoğrafı başarıyla silindi!')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Silme başarısız')
      }
    } catch (error: any) {
      console.error('Cover photo delete error:', error)
      showMessage('Kapak fotoğrafı silinirken bir hata oluştu: ' + error.message, true)
    }
  }



  const WorkingHoursSettings = () => (
    <div className="space-y-8">
      <h3 className={`text-lg font-semibold transition-colors ${
        isDarkMode ? 'text-white' : 'text-gray-900'
      }`}>
        Çalışma Saatleri ve Randevu Ayarları
      </h3>
      
      <div className="space-y-6">
        <h4 className={`text-md font-medium transition-colors ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Haftalık Çalışma Programı
        </h4>
      
        {workingHours.map((daySchedule, index) => (
          <div key={index} className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
            isDarkMode ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-gray-50'
          }`}>
            <div className="flex items-center space-x-4">
              <input
                type="checkbox"
                checked={daySchedule.isOpen}
                onChange={(e) => {
                  const newWorkingHours = [...workingHours]
                  newWorkingHours[index].isOpen = e.target.checked
                  setWorkingHours(newWorkingHours)
                }}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className={`font-medium w-24 transition-colors ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {dayNames[daySchedule.dayOfWeek]}
              </span>
            </div>
            
            {daySchedule.isOpen ? (
              <div className="flex items-center space-x-2">
                <input
                  type="time"
                  value={daySchedule.openTime}
                  onChange={(e) => {
                    const newWorkingHours = [...workingHours]
                    newWorkingHours[index].openTime = e.target.value
                    setWorkingHours(newWorkingHours)
                  }}
                  className={`px-3 py-2 border rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
                <span className={`transition-colors ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  -
                </span>
                <input
                  type="time"
                  value={daySchedule.closeTime}
                  onChange={(e) => {
                    const newWorkingHours = [...workingHours]
                    newWorkingHours[index].closeTime = e.target.value
                    setWorkingHours(newWorkingHours)
                  }}
                  className={`px-3 py-2 border rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            ) : (
              <span className={`transition-colors ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Kapalı
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Randevu Ayarları */}
      <div>
        <h4 className={`text-md font-medium mb-4 transition-colors ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Randevu Sistem Ayarları
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={`block text-sm font-medium mb-2 transition-colors ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Randevu Süresi (dakika)
            </label>
            <select 
              value={appointmentSettings.slotDuration}
              onChange={(e) => setAppointmentSettings({...appointmentSettings, slotDuration: parseInt(e.target.value)})}
              className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:ring-purple-500 focus:border-purple-500'
                  : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-500 focus:border-purple-500'
              }`}
            >
              <option value={30}>30 dakika</option>
              <option value={45}>45 dakika</option>
              <option value={60}>60 dakika</option>
              <option value={90}>90 dakika</option>
              <option value={120}>120 dakika</option>
            </select>
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-2 transition-colors ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Randevular Arası Tampon Süre (dakika)
            </label>
            <select 
              value={appointmentSettings.bufferTime}
              onChange={(e) => setAppointmentSettings({...appointmentSettings, bufferTime: parseInt(e.target.value)})}
              className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:ring-purple-500 focus:border-purple-500'
                  : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-500 focus:border-purple-500'
              }`}
            >
              <option value={0}>Yok</option>
              <option value={5}>5 dakika</option>
              <option value={10}>10 dakika</option>
              <option value={15}>15 dakika</option>
              <option value={30}>30 dakika</option>
            </select>
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-2 transition-colors ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Maksimum Kaç Gün Önceden Randevu Alınabilir
            </label>
            <select 
              value={appointmentSettings.maxAdvanceBooking}
              onChange={(e) => setAppointmentSettings({...appointmentSettings, maxAdvanceBooking: parseInt(e.target.value)})}
              className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:ring-purple-500 focus:border-purple-500'
                  : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-500 focus:border-purple-500'
              }`}
            >
              <option value={7}>7 gün</option>
              <option value={14}>14 gün</option>
              <option value={30}>30 gün</option>
              <option value={60}>60 gün</option>
              <option value={90}>90 gün</option>
            </select>
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-2 transition-colors ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Minimum Kaç Saat Öncesine Kadar Randevu Alınabilir
            </label>
            <select 
              value={appointmentSettings.minAdvanceBooking}
              onChange={(e) => setAppointmentSettings({...appointmentSettings, minAdvanceBooking: parseInt(e.target.value)})}
              className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:ring-purple-500 focus:border-purple-500'
                  : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-500 focus:border-purple-500'
              }`}
            >
              <option value={0.5}>30 dakika</option>
              <option value={1}>1 saat</option>
              <option value={2}>2 saat</option>
              <option value={4}>4 saat</option>
              <option value={12}>12 saat</option>
              <option value={24}>24 saat</option>
            </select>
          </div>
          
          <div className="md:col-span-2">
            <div className="flex items-center space-x-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={appointmentSettings.allowSameDayBooking}
                  onChange={(e) => setAppointmentSettings({...appointmentSettings, allowSameDayBooking: e.target.checked})}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 mr-2"
                />
                <span className={`transition-colors ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Aynı gün randevu alınmasına izin ver
                </span>
              </label>
              
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={appointmentSettings.autoConfirmation}
                  onChange={(e) => setAppointmentSettings({...appointmentSettings, autoConfirmation: e.target.checked})}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 mr-2"
                />
                <span className={`transition-colors ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Randevuları otomatik onayla
                </span>
              </label>
            </div>
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-2 transition-colors ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Günlük Maksimum Randevu Sayısı (0 = Sınırsız)
            </label>
            <input
              type="number"
              min="0"
              value={appointmentSettings.maxDailyAppointments}
              onChange={(e) => setAppointmentSettings({...appointmentSettings, maxDailyAppointments: parseInt(e.target.value) || 0})}
              className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:ring-purple-500 focus:border-purple-500'
                  : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-500 focus:border-purple-500'
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  )

  const NotificationSettings = () => (
    <div className="space-y-6">
      <h3 className={`text-lg font-semibold transition-colors ${
        isDarkMode ? 'text-white' : 'text-gray-900'
      }`}>
        Bildirim Ayarları
      </h3>

      {[
        { key: 'newAppointment', title: 'Yeni Randevu', description: 'Yeni randevu alındığında bildirim gönder' },
        { key: 'appointmentCancellation', title: 'Randevu İptali', description: 'Randevu iptal edildiğinde bildirim gönder' },
        { key: 'dailySummary', title: 'Günlük Özet', description: 'Günlük randevu özeti gönder' },
        { key: 'weeklyReport', title: 'Haftalık Rapor', description: 'Haftalık performans raporu gönder' },
        { key: 'monthlyAnalysis', title: 'Aylık Analiz', description: 'Aylık detaylı analiz raporu gönder' },
        { key: 'marketingTips', title: 'Pazarlama İpuçları', description: 'İşletmenizi büyütmek için ipuçları' }
      ].map((setting) => (
        <div key={setting.key} className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
          isDarkMode ? 'border-gray-600' : 'border-gray-200'
        }`}>
          <div>
            <h4 className={`font-medium transition-colors ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {setting.title}
            </h4>
            <p className={`text-sm transition-colors ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {setting.description}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notifications[setting.key as keyof NotificationSettings]}
              onChange={(e) => setNotifications({
                ...notifications,
                [setting.key]: e.target.checked
              })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
          </label>
        </div>
      ))}
    </div>
  )

  const PaymentSettings = () => (
    <div className="space-y-6">
      <h3 className={`text-lg font-semibold transition-colors ${
        isDarkMode ? 'text-white' : 'text-gray-900'
      }`}>
        Ödeme ve Faturalama
      </h3>

      <div className={`p-6 border rounded-lg transition-colors ${
        isDarkMode ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-gray-50'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className={`font-semibold transition-colors ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Aktif Plan: Temel
            </h4>
            <p className={`text-sm transition-colors ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Aylık ₺299 - Tek şube
            </p>
          </div>
          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
            Planı Yükselt
          </button>
        </div>
        <div className={`text-sm transition-colors ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          Sonraki fatura: 15 Şubat 2025
        </div>
      </div>

      <div>
        <h4 className={`font-medium mb-4 transition-colors ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Ödeme Yöntemi
        </h4>
        <div className={`p-4 border rounded-lg flex items-center justify-between transition-colors ${
          isDarkMode ? 'border-gray-600' : 'border-gray-200'
        }`}>
          <div className="flex items-center space-x-3">
            <CreditCardIcon className="w-8 h-8 text-blue-600" />
            <div>
              <div className={`font-medium transition-colors ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                **** **** **** 1234
              </div>
              <div className={`text-sm transition-colors ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Son kullanma: 12/26
              </div>
            </div>
          </div>
          <button className={`text-purple-600 hover:text-purple-700 text-sm font-medium`}>
            Değiştir
          </button>
        </div>
      </div>
    </div>
  )

  const SecuritySettings = () => (
    <div className="space-y-6">
      <h3 className={`text-lg font-semibold transition-colors ${
        isDarkMode ? 'text-white' : 'text-gray-900'
      }`}>
        Güvenlik Ayarları
      </h3>

      <div>
        <h4 className={`font-medium mb-4 transition-colors ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Şifre Değiştir
        </h4>
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 transition-colors ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Mevcut Şifre
            </label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
              className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:ring-purple-500 focus:border-purple-500'
                  : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-500 focus:border-purple-500'
              }`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 transition-colors ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Yeni Şifre
            </label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
              className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:ring-purple-500 focus:border-purple-500'
                  : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-500 focus:border-purple-500'
              }`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 transition-colors ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Yeni Şifre (Tekrar)
            </label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
              className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:ring-purple-500 focus:border-purple-500'
                  : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-500 focus:border-purple-500'
              }`}
            />
          </div>
          <button
            onClick={() => {}}
            disabled={loading}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
          </button>
        </div>
      </div>

      <div className={`p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-800`}>
        <h4 className="font-medium text-red-800 dark:text-red-400 mb-2">
          Tehlikeli Alan
        </h4>
        <p className="text-sm text-red-600 dark:text-red-300 mb-4">
          Bu işlemler geri alınamaz. Lütfen dikkatli olun.
        </p>
        <button className="flex items-center space-x-2 text-red-600 hover:text-red-700 text-sm font-medium">
          <TrashIcon className="w-4 h-4" />
          <span>Hesabı kalıcı olarak sil</span>
        </button>
      </div>
    </div>
  )

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'business':
        return <BusinessSettings />
      case 'service-type':
        return <ServiceTypeSettings />
      case 'profile':
        return <ProfileSettings />
      case 'hours':
        return <WorkingHoursSettings />
      case 'notifications':
        return <NotificationSettings />
      case 'payments':
        return <PaymentSettings />
      case 'security':
        return <SecuritySettings />
      default:
        return <BusinessSettings />
    }
  }

  const handleSave = async () => {
    switch (activeTab) {
      case 'business':
        await saveBusiness()
        break
      case 'service-type':
        await saveServiceType()
        break
      case 'profile':
        await saveProfile()
        break
      case 'hours':
        await saveWorkingHours()
        break
      case 'notifications':
        await saveNotifications()
        break
      case 'security':
        // Password change is handled by its own button
        break
    }
  }

  const saveBusiness = async () => {
    if (!businessData) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/settings/business', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(businessData)
      })

      if (response.ok) {
        showMessage('İşletme bilgileri güncellendi!')
      } else {
        throw new Error('Güncelleme başarısız')
      }
    } catch (err) {
      showMessage('Güncelleme sırasında hata oluştu', true)
    } finally {
      setLoading(false)
    }
  }

  const saveServiceType = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/settings/business-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          serviceType,
          ...serviceSettings
        })
      })

      if (response.ok) {
        showMessage('Hizmet tipi ayarları güncellendi!')
      } else {
        throw new Error('Güncelleme başarısız')
      }
    } catch (err) {
      showMessage('Güncelleme sırasında hata oluştu', true)
    } finally {
      setLoading(false)
    }
  }

  const saveProfile = async () => {
    if (!userData) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/settings/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      })

      if (response.ok) {
        showMessage('Profil bilgileri güncellendi!')
      } else {
        throw new Error('Güncelleme başarısız')
      }
    } catch (err) {
      showMessage('Güncelleme sırasında hata oluştu', true)
    } finally {
      setLoading(false)
    }
  }

  const saveWorkingHours = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/settings/working-hours', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          workingHours,
          appointmentSettings 
        })
      })

      if (response.ok) {
        showMessage('Çalışma saatleri güncellendi!')
      } else {
        throw new Error('Güncelleme başarısız')
      }
    } catch (err) {
      showMessage('Güncelleme sırasında hata oluştu', true)
    } finally {
      setLoading(false)
    }
  }

  const saveNotifications = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/settings/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notifications })
      })

      if (response.ok) {
        showMessage('Bildirim ayarları güncellendi!')
      } else {
        throw new Error('Güncelleme başarısız')
      }
    } catch (err) {
      showMessage('Güncelleme sırasında hata oluştu', true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-bold transition-colors ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Ayarlar
          </h1>
          <p className={`text-lg mt-2 transition-colors ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            İşletmenizi ve hesabınızı yönetin
          </p>
        </div>
        
        {/* Messages */}
        {saveMessage && (
          <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-lg">
            <CheckIcon className="w-5 h-5" />
            <span>{saveMessage}</span>
          </div>
        )}
        
        {error && (
          <div className="flex items-center space-x-2 bg-red-100 text-red-800 px-4 py-2 rounded-lg">
            <ExclamationTriangleIcon className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className={`lg:col-span-1 space-y-2`}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400'
                  : isDarkMode
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="font-medium">{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className={`rounded-xl p-8 shadow-sm border transition-colors ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : (
              <>
                {renderTabContent()}
                
                {/* Save Button - Don't show for security tab as it has its own buttons */}
                {activeTab !== 'security' && activeTab !== 'payments' && (
                  <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="bg-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
