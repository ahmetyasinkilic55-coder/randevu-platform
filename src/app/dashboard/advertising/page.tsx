'use client'

import { useState, useEffect } from 'react'
import { 
  MegaphoneIcon,
  StarIcon,
  MapPinIcon,
  ShareIcon,
  ChartBarIcon,
  TagIcon,
  ClockIcon,
  CheckIcon,
  TrophyIcon,
  LightBulbIcon,
  EyeIcon,
  HeartIcon,
  FireIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

interface AdvertisingPackage {
  id: string
  name: string
  description: string
  price: number
  duration: string
  features: string[]
  icon: any
  color: string
  bgColor: string
  popular?: boolean
  badge?: string
}

export default function AdvertisingPage() {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activePackages, setActivePackages] = useState<string[]>([])

  const advertisingPackages: AdvertisingPackage[] = [
    {
      id: 'category-boost',
      name: 'Kategori Öne Çıkma',
      description: 'Sektörünüzdeki arama sonuçlarında ilk sıralarda görünün',
      price: 299,
      duration: '30 gün',
      features: [
        'Kategori aramalarında üst sıralarda gösterim',
        'Özel "Öne Çıkan" rozeti',
        '5x daha fazla görüntülenme',
        'Detaylı performans raporu',
        'Öncelikli müşteri desteği'
      ],
      icon: StarIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      popular: true,
      badge: 'En Popüler'
    },
    {
      id: 'city-boost',
      name: 'Şehir Öne Çıkma',
      description: 'Şehrinizdeki tüm aramalarda öne çıkın',
      price: 199,
      duration: '30 gün',
      features: [
        'Şehir bazında öne çıkan gösterim',
        'Harita aramalarında öncelik',
        '3x daha fazla ziyaretçi',
        'Konum bazlı analitik rapor',
        'Mobil uygulamada öncelikli gösterim'
      ],
      icon: MapPinIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'social-media',
      name: 'Sosyal Medya Reklam Desteği',
      description: 'Profesyonel sosyal medya reklamları ile erişiminizi artırın',
      price: 499,
      duration: '30 gün',
      features: [
        'Instagram & Facebook reklam yönetimi',
        'Profesyonel reklam tasarımı',
        'Hedef kitle analizi ve optimizasyon',
        'Günlük performans raporları',
        'Reklam bütçesi danışmanlığı'
      ],
      icon: ShareIcon,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50'
    },
    {
      id: 'premium-listing',
      name: 'Premium Liste',
      description: 'Tüm listelerde en üst sıralarda yer alın',
      price: 699,
      duration: '30 gün',
      features: [
        'Tüm arama sonuçlarında üst sırada',
        'Altın renkli özel profil çerçevesi',
        'Ana sayfada vitrin alanında gösterim',
        'Özel "Premium Üye" rozeti',
        '10x daha fazla randevu talebi'
      ],
      icon: TrophyIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      id: 'flash-promotion',
      name: 'Flaş Kampanya',
      description: 'Kısa süreli yoğun tanıtım kampanyası',
      price: 399,
      duration: '7 gün',
      features: [
        'Anasayfada büyük banner alanı',
        'Push bildirim ile duyuru',
        'Email pazarlamada öne çıkan yer',
        'Sosyal medya paylaşımları',
        'Acil rezervasyon uyarıları'
      ],
      icon: FireIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      badge: 'Hızlı Etki'
    }
    
   
  ]

  const handlePurchase = async (packageId: string) => {
    setIsLoading(true)
    setSelectedPackage(packageId)
    
    try {
      // Burada API çağrısı yapılacak
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simülasyon
      
      setActivePackages(prev => [...prev, packageId])
      toast.success('Reklam paketi başarıyla satın alındı!')
      
    } catch (error) {
      toast.error('Satın alma işlemi başarısız oldu')
    } finally {
      setIsLoading(false)
      setSelectedPackage(null)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center space-x-4 mb-4">
          <div className="bg-white bg-opacity-20 p-3 rounded-xl">
            <MegaphoneIcon className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Reklam Desteği</h1>
            <p className="text-blue-100 text-lg">İşletmenizi öne çıkarın, daha fazla müşteriye ulaşın</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white bg-opacity-10 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <EyeIcon className="w-6 h-6 text-yellow-300" />
              <div>
                <div className="text-2xl font-bold">+500%</div>
                <div className="text-sm text-blue-100">Görüntülenme Artışı</div>
              </div>
            </div>
          </div>
          <div className="bg-white bg-opacity-10 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <ChartBarIcon className="w-6 h-6 text-green-300" />
              <div>
                <div className="text-2xl font-bold">+300%</div>
                <div className="text-sm text-blue-100">Randevu Artışı</div>
              </div>
            </div>
          </div>
          <div className="bg-white bg-opacity-10 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <SparklesIcon className="w-6 h-6 text-purple-300" />
              <div>
                <div className="text-2xl font-bold">48 Saat</div>
                <div className="text-sm text-blue-100">Aktifleşme Süresi</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Packages */}
      {activePackages.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-green-800 mb-4 flex items-center">
            <CheckIcon className="w-6 h-6 mr-2" />
            Aktif Reklam Paketleriniz
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activePackages.map(packageId => {
              const pkg = advertisingPackages.find(p => p.id === packageId)
              if (!pkg) return null
              
              return (
                <div key={packageId} className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${pkg.bgColor}`}>
                      <pkg.icon className={`w-5 h-5 ${pkg.color}`} />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{pkg.name}</div>
                      <div className="text-sm text-green-600">29 gün kaldı</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {advertisingPackages.map((pkg) => {
          const isActive = activePackages.includes(pkg.id)
          const isLoading_ = isLoading && selectedPackage === pkg.id
          
          return (
            <div 
              key={pkg.id} 
              className={`bg-white rounded-2xl border-2 transition-all duration-300 hover:shadow-xl ${
                pkg.popular ? 'border-purple-200 shadow-lg' : 'border-gray-200 hover:border-gray-300'
              } ${isActive ? 'ring-2 ring-green-500 ring-opacity-50' : ''}`}
            >
              {/* Package Header */}
              <div className={`${pkg.bgColor} rounded-t-2xl p-6 relative`}>
                {pkg.badge && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {pkg.badge}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`p-3 bg-white rounded-xl shadow-sm`}>
                    <pkg.icon className={`w-6 h-6 ${pkg.color}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{pkg.name}</h3>
                    <p className="text-gray-600 text-sm">{pkg.description}</p>
                  </div>
                </div>
                
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold text-gray-900">{pkg.price}₺</span>
                  <span className="text-gray-500">/ {pkg.duration}</span>
                </div>
              </div>

              {/* Features */}
              <div className="p-6">
                <ul className="space-y-3 mb-6">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Action Button */}
                <button
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={isActive || isLoading_}
                  className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-green-100 text-green-700 cursor-default'
                      : isLoading_
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transform hover:scale-105'
                  }`}
                >
                  {isActive ? (
                    <span className="flex items-center justify-center space-x-2">
                      <CheckIcon className="w-5 h-5" />
                      <span>Aktif</span>
                    </span>
                  ) : isLoading_ ? (
                    <span className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                      <span>İşleniyor...</span>
                    </span>
                  ) : (
                    'Satın Al'
                  )}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Sıkça Sorulan Sorular</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Reklam paketleri ne zaman aktif olur?</h3>
            <p className="text-gray-600">Satın alma işleminizden sonra 2-48 saat içinde paketiniz aktif hale gelir ve etkisini görmeye başlarsınız.</p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Paket süresi dolduğunda ne olur?</h3>
            <p className="text-gray-600">Paket süreniz dolduğunda otomatik olarak normal listelemede yerinizi alırsınız. İsterseniz paketi yeniden satın alabilirsiniz.</p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Birden fazla paketi aynı anda kullanabilir miyim?</h3>
            <p className="text-gray-600">Evet, farklı paketleri kombine ederek daha etkili sonuçlar elde edebilirsiniz. Örneğin kategori öne çıkma + sosyal medya desteği.</p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Sonuçları nasıl takip edebilirim?</h3>
            <p className="text-gray-600">Dashboard'ınızda detaylı analitik raporlar ile görüntülenme, tıklanma ve randevu artış oranlarınızı takip edebilirsiniz.</p>
          </div>
        </div>
      </div>
    </div>
  )
}