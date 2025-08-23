'use client'

import { useState, useEffect } from 'react'
import { 
  DocumentTextIcon,
  HeartIcon,
  TruckIcon,
  ScaleIcon,
  UserIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  ClockIcon,
  EyeIcon,
  BuildingStorefrontIcon,
  PhoneIcon
} from '@heroicons/react/24/outline'

interface CustomerNote {
  id: string
  businessName: string
  businessLogo?: string
  businessPhone: string
  appointmentDate: string
  serviceType: string
  noteType: 'diet' | 'exercise' | 'maintenance' | 'general' | 'beauty' | 'health'
  title: string
  content: string
  createdAt: string
  isNew: boolean
}

const noteTypes = [
  { id: 'diet', name: 'Diyet Planı', icon: ScaleIcon, color: 'bg-green-100 text-green-700', bgColor: 'bg-green-50' },
  { id: 'exercise', name: 'Egzersiz Planı', icon: HeartIcon, color: 'bg-red-100 text-red-700', bgColor: 'bg-red-50' },
  { id: 'maintenance', name: 'Bakım Bilgileri', icon: TruckIcon, color: 'bg-blue-100 text-blue-700', bgColor: 'bg-blue-50' },
  { id: 'beauty', name: 'Güzellik Notları', icon: UserIcon, color: 'bg-pink-100 text-pink-700', bgColor: 'bg-pink-50' },
  { id: 'health', name: 'Sağlık Önerileri', icon: HeartIcon, color: 'bg-purple-100 text-purple-700', bgColor: 'bg-purple-50' },
  { id: 'general', name: 'Genel Notlar', icon: ClipboardDocumentListIcon, color: 'bg-gray-100 text-gray-700', bgColor: 'bg-gray-50' }
]

export default function CustomerNotesPage() {
  const [notes, setNotes] = useState<CustomerNote[]>([])
  const [selectedNoteType, setSelectedNoteType] = useState<string>('all')
  const [selectedNote, setSelectedNote] = useState<CustomerNote | null>(null)

  // Mock customer data - gerçek projede session/token'dan gelecek
  const customerInfo = {
    name: 'Ahmet Yılmaz',
    email: 'ahmet.yilmaz@example.com',
    phone: '0532 123 4567'
  }

  // Mock data - gerçek projede API'den müşteri ID'sine göre gelecek
  useEffect(() => {
    const mockNotes: CustomerNote[] = [
      {
        id: '1',
        businessName: 'Healthy Life Beslenme Danışmanlığı',
        businessLogo: '/business-logos/healthy-life.jpg',
        businessPhone: '0212 555 0101',
        appointmentDate: '2025-01-15 14:00',
        serviceType: 'Kilo Verme Danışmanlığı',
        noteType: 'diet',
        title: '2 Haftalık Diyet Programı',
        content: `HAFTA 1-2 DİYET PLANI:

KAHVALTI (08:00):
- 2 adet tam tahıl ekmeği
- 1 adet haşlanmış yumurta
- 1 su bardağı süt
- Salatalık, domates

ARA ÖĞÜN (10:30):
- 1 adet orta boy elma
- 10 adet çiğ badem

ÖĞLE YEMEĞİ (12:30):
- 4 yemek kaşığı bulgur pilavı
- 150gr ızgara tavuk
- Yeşil salata
- 1 su bardağı ayran

ARA ÖĞÜN (15:30):
- 1 kase yoğurt
- 1 tatlı kaşığı bal

AKŞAM YEMEĞİ (19:00):
- Izgara balık (150gr)
- Buharda sebze
- Yeşil salata

ÖNEMLI NOTLAR:
- Günde en az 2.5 litre su için
- Yemekler arasında 3 saat ara verin
- Akşam 20:00'den sonra yemek yemeyin
- Haftalık 2 kez kontrol

Sorularınız için bize ulaşabilirsiniz.
İyi günler dileriz! 🌱`,
        createdAt: '2025-01-15 15:30',
        isNew: true
      },
      {
        id: '2',
        businessName: 'FitZone Spor Merkezi',
        businessLogo: '/business-logos/fitzone.jpg',
        businessPhone: '0216 444 0202',
        appointmentDate: '2025-01-14 16:00',
        serviceType: 'Kişisel Antrenman',
        noteType: 'exercise',
        title: 'Başlangıç Egzersiz Programı',
        content: `4 HAFTALIK EGZERSİZ PROGRAMI:

PAZARTESİ - ÜST VÜCUT:
- Şınav: 3 set x 10 tekrar
- Plank: 3 set x 30 saniye
- Dumbbell press: 3 set x 12 tekrar
- Tricep dips: 3 set x 8 tekrar

ÇARŞAMBA - ALT VÜCUT:
- Squat: 3 set x 15 tekrar
- Lunges: 3 set x 10 tekrar (her bacak)
- Glute bridge: 3 set x 12 tekrar
- Calf raises: 3 set x 15 tekrar

CUMA - KARDIYO:
- Yürüyüş: 30 dakika
- Jumping jacks: 3 set x 20 tekrar
- Mountain climbers: 3 set x 15 tekrar
- Burpees: 3 set x 5 tekrar

NOTLAR:
- Setler arası 1 dakika dinlenin
- Haftada 3 gün yapın
- Ağrı hissederseniz durdurun
- Su içmeyi unutmayın

Antrenman videolarımıza mobil uygulamamızdan erişebilirsiniz.
Başarılar! 💪`,
        createdAt: '2025-01-14 17:15',
        isNew: false
      },
      {
        id: '3',
        businessName: 'AutoCare Araç Bakım',
        businessLogo: '/business-logos/autocare.jpg',
        businessPhone: '0532 777 0303',
        appointmentDate: '2025-01-13 10:00',
        serviceType: 'Periyodik Bakım',
        noteType: 'maintenance',
        title: 'Araç Bakım Raporu ve Öneriler',
        content: `ARAÇ BAKIM RAPORU:
Marka: BMW 3.20i
Plaka: 34 ABC 123
Km: 75.000

YAPILAN İŞLEMLER:
✅ Motor yağı değişimi (5W-30)
✅ Fren balata kontrolü
✅ Lastik basınç kontrolü
✅ Akü kontrolü
✅ Far ayarı

ÖNERİLER:
🔧 5.000 km sonra yağ değişimi
🔧 Fren diski 10.000 km'de kontrol
🔧 Timing kayışı 80.000 km'de değişim
🔧 Klima gazı kontrolü yaz öncesi

SONRAKI BAKIM:
📅 Tarih: 2025-06-15
📅 Km: 80.000
📅 İşlemler: Büyük bakım

UYARILAR:
⚠️ Fren sıvısı seviyesini kontrol edin
⚠️ Lastik derinliği 3mm altına düşmesin
⚠️ Motor sesi anormalse hemen gelin

Garanti süresi: 6 ay / 10.000 km
Teşekkürler! 🚗`,
        createdAt: '2025-01-13 11:30',
        isNew: false
      }
    ]
    setNotes(mockNotes)

    // Yeni notları 3 saniye sonra "okundu" olarak işaretle
    setTimeout(() => {
      setNotes(prev => prev.map(note => ({ ...note, isNew: false })))
    }, 3000)
  }, [])

  const filteredNotes = selectedNoteType === 'all' 
    ? notes 
    : notes.filter(note => note.noteType === selectedNoteType)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <img src="/logo.png" alt="Logo" className="w-8 h-8" />
              <h1 className="text-xl font-semibold text-gray-900">Benim Notlarım</h1>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Hoş geldin, {customerInfo.name}</span>
              <button className="text-indigo-600 hover:text-indigo-800">Çıkış</button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Sol Sidebar - Not Listesi */}
          <div className="lg:col-span-1 space-y-6">
            {/* Filtreler */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Not Türleri</h2>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedNoteType('all')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedNoteType === 'all' 
                      ? 'bg-indigo-100 text-indigo-800' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Tüm Notlar ({notes.length})
                </button>
                {noteTypes.map(type => {
                  const count = notes.filter(n => n.noteType === type.id).length
                  return (
                    <button
                      key={type.id}
                      onClick={() => setSelectedNoteType(type.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                      selectedNoteType === type.id 
                      ? type.color 
                      : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <type.icon className="w-4 h-4" />
                      <span>{type.name} ({count})</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* İstatistikler */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Özet</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Toplam Not</span>
                  <span className="font-semibold text-gray-900">{notes.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Yeni Not</span>
                  <span className="font-semibold text-red-600">{notes.filter(n => n.isNew).length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Bu Ay</span>
                  <span className="font-semibold text-gray-900">
                    {notes.filter(n => {
                      const noteDate = new Date(n.createdAt)
                      const now = new Date()
                      return noteDate.getMonth() === now.getMonth() && 
                             noteDate.getFullYear() === now.getFullYear()
                    }).length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sağ Ana Alan */}
          <div className="lg:col-span-2">
            {selectedNote ? (
              /* Seçili Not Detayı */
              <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      {selectedNote.businessLogo ? (
                        <img 
                          src={selectedNote.businessLogo} 
                          alt={selectedNote.businessName}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <BuildingStorefrontIcon className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <h1 className="text-xl font-bold text-gray-900">{selectedNote.title}</h1>
                        <p className="text-gray-600">{selectedNote.businessName}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                          <span className="flex items-center space-x-1">
                            <CalendarDaysIcon className="w-4 h-4" />
                            <span>{formatDate(selectedNote.appointmentDate)}</span>
                          </span>
                          <span>{selectedNote.serviceType}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedNote(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="prose max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed">
                      {selectedNote.content}
                    </pre>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Oluşturulma: {formatDate(selectedNote.createdAt)}</span>
                      <a 
                        href={`tel:${selectedNote.businessPhone}`}
                        className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-800"
                      >
                        <PhoneIcon className="w-4 h-4" />
                        <span>{selectedNote.businessPhone}</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Not Kartları */
              <div className="space-y-4">
                {filteredNotes.length === 0 ? (
                  <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
                    <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Henüz not bulunmuyor</h3>
                    <p className="text-gray-600">
                      Randevu aldığınız işletmelerden size özel notlar burada görünecek.
                    </p>
                  </div>
                ) : (
                  filteredNotes.map((note) => {
                    const noteTypeInfo = noteTypes.find(t => t.id === note.noteType)
                    const IconComponent = noteTypeInfo?.icon || DocumentTextIcon
                    
                    return (
                      <div 
                        key={note.id} 
                        onClick={() => setSelectedNote(note)}
                        className={`bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all cursor-pointer relative ${
                          note.isNew ? 'ring-2 ring-red-200' : ''
                        }`}
                      >
                        {note.isNew && (
                          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            Yeni
                          </div>
                        )}
                        
                        <div className="p-6">
                          <div className="flex items-start space-x-4">
                            {note.businessLogo ? (
                              <img 
                                src={note.businessLogo} 
                                alt={note.businessName}
                                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                <BuildingStorefrontIcon className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-gray-900 mb-1">{note.title}</h3>
                                  <p className="text-sm text-gray-600 mb-2">{note.businessName}</p>
                                  
                                  <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${noteTypeInfo?.color}`}>
                                    <IconComponent className="w-3 h-3" />
                                    <span>{noteTypeInfo?.name}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="mt-3 text-sm text-gray-700">
                                <p className="line-clamp-2">
                                  {note.content.length > 120 ? note.content.substring(0, 120) + '...' : note.content}
                                </p>
                              </div>
                              
                              <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
                                <span className="flex items-center space-x-1">
                                  <ClockIcon className="w-3 h-3" />
                                  <span>{formatDate(note.createdAt)}</span>
                                </span>
                                <span className="flex items-center space-x-1 text-indigo-600">
                                  <EyeIcon className="w-3 h-3" />
                                  <span>Detayları Gör</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}