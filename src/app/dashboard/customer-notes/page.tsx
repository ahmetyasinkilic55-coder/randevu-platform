'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  DocumentTextIcon,
  UserIcon,
  CalendarDaysIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  HeartIcon,
  TruckIcon,
  ScaleIcon,
  ClipboardDocumentListIcon,
  XMarkIcon,
  CheckIcon,
  BoldIcon,
  ItalicIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

interface CustomerNote {
  id: string
  customerId: string
  customerName: string
  customerPhone: string
  appointmentId: string
  appointmentDate: string
  serviceType: string
  noteType: 'diet' | 'exercise' | 'maintenance' | 'general' | 'beauty' | 'health'
  title: string
  content: string
  attachments?: string[]
  isVisible: boolean
  createdAt: string
  updatedAt: string
}

const noteTypes = [
  { id: 'diet', name: 'Diyet Planı', icon: ScaleIcon, color: 'bg-green-100 text-green-700', textColor: 'text-green-700' },
  { id: 'exercise', name: 'Egzersiz Planı', icon: HeartIcon, color: 'bg-red-100 text-red-700', textColor: 'text-red-700' },
  { id: 'maintenance', name: 'Bakım Bilgileri', icon: TruckIcon, color: 'bg-blue-100 text-blue-700', textColor: 'text-blue-700' },
  { id: 'beauty', name: 'Güzellik Notları', icon: UserIcon, color: 'bg-pink-100 text-pink-700', textColor: 'text-pink-700' },
  { id: 'health', name: 'Sağlık Önerileri', icon: HeartIcon, color: 'bg-purple-100 text-purple-700', textColor: 'text-purple-700' },
  { id: 'general', name: 'Genel Notlar', icon: ClipboardDocumentListIcon, color: 'bg-gray-100 text-gray-700', textColor: 'text-gray-700' }
]

export default function CustomerNotesPage() {
  const [notes, setNotes] = useState<CustomerNote[]>([])
  const [filteredNotes, setFilteredNotes] = useState<CustomerNote[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedNoteType, setSelectedNoteType] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingNote, setEditingNote] = useState<CustomerNote | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Form state'leri
  const [formData, setFormData] = useState<{
    customerName: string
    customerPhone: string
    serviceType: string
    noteType: 'diet' | 'exercise' | 'maintenance' | 'general' | 'beauty' | 'health'
    title: string
    content: string
    isVisible: boolean
  }>({
    customerName: '',
    customerPhone: '',
    serviceType: '',
    noteType: 'general',
    title: '',
    content: '',
    isVisible: true
  })

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Basit text formatting fonksiyonları
  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = formData.content.substring(start, end)
    const newText = formData.content.substring(0, start) + before + selectedText + after + formData.content.substring(end)
    
    setFormData(prev => ({ ...prev, content: newText }))
    
    // Cursor pozisyonunu ayarla
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, end + before.length)
    }, 0)
  }

  const formatBold = () => insertText('**', '**')
  const formatItalic = () => insertText('*', '*')
  const formatHeader = () => insertText('### ')
  const formatList = () => insertText('- ')
  const formatNumberedList = () => insertText('1. ')

  // Mock data - gerçek projede API'den gelecek
  useEffect(() => {
    const mockNotes: CustomerNote[] = [
      {
        id: '1',
        customerId: 'cust1',
        customerName: 'Ahmet Yılmaz',
        customerPhone: '0532 123 4567',
        appointmentId: 'app1',
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
- Haftalık 2 kez kontrol`,
        isVisible: true,
        createdAt: '2025-01-15 15:30',
        updatedAt: '2025-01-15 15:30'
      },
      {
        id: '2',
        customerId: 'cust2',
        customerName: 'Fatma Demir',
        customerPhone: '0543 987 6543',
        appointmentId: 'app2',
        appointmentDate: '2025-01-14 16:00',
        serviceType: 'Fitness Antrenmanı',
        noteType: 'exercise',
        title: 'Başlangıç Egzersiz Programı',
        content: `4 HAFTALLIK EGZERSİZ PROGRAMI:

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
- Su içmeyi unutmayın`,
        isVisible: true,
        createdAt: '2025-01-14 17:15',
        updatedAt: '2025-01-14 17:15'
      },
      {
        id: '3',
        customerId: 'cust3',
        customerName: 'Mehmet Kaya',
        customerPhone: '0555 111 2233',
        appointmentId: 'app3',
        appointmentDate: '2025-01-13 10:00',
        serviceType: 'Araç Periyodik Bakım',
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
⚠️ Motor sesi anormalse hemen gelin`,
        isVisible: true,
        createdAt: '2025-01-13 11:30',
        updatedAt: '2025-01-13 11:30'
      }
    ]
    setNotes(mockNotes)
    setFilteredNotes(mockNotes)
  }, [])

  // Filtreleme ve arama
  useEffect(() => {
    let filtered = notes

    if (searchTerm) {
      filtered = filtered.filter(note => 
        note.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedNoteType !== 'all') {
      filtered = filtered.filter(note => note.noteType === selectedNoteType)
    }

    setFilteredNotes(filtered)
  }, [notes, searchTerm, selectedNoteType])

  const handleAddNote = async (noteData: Partial<CustomerNote>) => {
    setIsLoading(true)
    try {
      // API çağrısı simülasyonu
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newNote: CustomerNote = {
        id: Date.now().toString(),
        customerId: 'current-user',
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        appointmentId: 'app-' + Date.now(),
        appointmentDate: new Date().toISOString(),
        serviceType: formData.serviceType,
        noteType: formData.noteType,
        title: formData.title,
        content: formData.content,
        isVisible: formData.isVisible,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      setNotes(prev => [newNote, ...prev])
      setShowAddModal(false)
      resetForm()
      toast.success('Not başarıyla eklendi!')
      
    } catch (error) {
      toast.error('Not eklenirken bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      customerName: '',
      customerPhone: '',
      serviceType: '',
      noteType: 'general',
      title: '',
      content: '',
      isVisible: true
    })
    setEditingNote(null)
  }

  const openEditModal = (note: CustomerNote) => {
    setFormData({
      customerName: note.customerName,
      customerPhone: note.customerPhone,
      serviceType: note.serviceType,
      noteType: note.noteType,
      title: note.title,
      content: note.content,
      isVisible: note.isVisible
    })
    setEditingNote(note)
    setShowAddModal(true)
  }

  const handleUpdateNote = async (noteId: string, updates: Partial<CustomerNote>) => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setNotes(prev => prev.map(note => 
        note.id === noteId 
          ? { ...note, ...updates, updatedAt: new Date().toISOString() }
          : note
      ))
      
      setEditingNote(null)
      toast.success('Not başarıyla güncellendi!')
      
    } catch (error) {
      toast.error('Not güncellenirken bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Bu notu silmek istediğinizden emin misiniz?')) return
    
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setNotes(prev => prev.filter(note => note.id !== noteId))
      toast.success('Not başarıyla silindi!')
    } catch (error) {
      toast.error('Not silinirken bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleNoteVisibility = async (noteId: string, isVisible: boolean) => {
    try {
      await handleUpdateNote(noteId, { isVisible })
      toast.success(isVisible ? 'Not müşteri için görünür hale getirildi' : 'Not müşteriden gizlendi')
    } catch (error) {
      toast.error('Görünürlük ayarı değiştirilemedi')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-xl">
              <DocumentTextIcon className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Müşteri Notları</h1>
              <p className="text-indigo-100">Randevu sonrası özel bilgiler ve planlar</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30 transition-all flex items-center space-x-2"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Yeni Not</span>
          </button>
        </div>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <DocumentTextIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{notes.length}</div>
              <div className="text-sm text-gray-500">Toplam Not</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <UserIcon className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{notes.filter(n => n.isVisible).length}</div>
              <div className="text-sm text-gray-500">Görünür Not</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-3 rounded-lg">
              <CalendarDaysIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {notes.filter(n => {
                  const noteDate = new Date(n.createdAt)
                  const today = new Date()
                  return noteDate.toDateString() === today.toDateString()
                }).length}
              </div>
              <div className="text-sm text-gray-500">Bugün Eklenen</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-100 p-3 rounded-lg">
              <AdjustmentsHorizontalIcon className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{noteTypes.length}</div>
              <div className="text-sm text-gray-500">Not Türü</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtreler */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Müşteri adı, not başlığı veya içerik ara..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
              value={selectedNoteType}
              onChange={(e) => setSelectedNoteType(e.target.value)}
            >
              <option value="all">Tüm Not Türleri</option>
              {noteTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Not Listesi */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredNotes.map((note) => {
          const noteTypeInfo = noteTypes.find(t => t.id === note.noteType)
          const IconComponent = noteTypeInfo?.icon || DocumentTextIcon
          
          return (
            <div key={note.id} className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${noteTypeInfo?.color || 'bg-gray-100 text-gray-800'}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{note.title}</h3>
                      <p className="text-sm text-gray-600">{noteTypeInfo?.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleNoteVisibility(note.id, !note.isVisible)}
                      className={`p-1 rounded ${note.isVisible ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50'}`}
                      title={note.isVisible ? 'Müşteri görebiliyor' : 'Müşteri göremiyor'}
                    >
                      <span className="text-xs">{note.isVisible ? '👁️' : '🚫'}</span>
                    </button>
                    <button
                      onClick={() => openEditModal(note)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Müşteri Bilgileri */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-medium text-gray-900">{note.customerName}</span>
                      <span className="text-gray-500 ml-2">{note.customerPhone}</span>
                    </div>
                    <div className="text-gray-500">
                      {new Date(note.appointmentDate).toLocaleDateString('tr-TR')}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{note.serviceType}</div>
                </div>

                {/* İçerik Önizleme */}
                <div className="text-sm text-gray-700 mb-4">
                  <div className="max-h-32 overflow-hidden">
                    <div className="whitespace-pre-wrap font-sans text-sm prose prose-sm max-w-none">
                      {/* Basit markdown render */}
                      {note.content.length > 200 
                        ? note.content.substring(0, 200).replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1') + '...'
                        : note.content.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1')
                      }
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                  <span>Oluşturulma: {new Date(note.createdAt).toLocaleDateString('tr-TR')}</span>
                  {note.updatedAt !== note.createdAt && (
                    <span>Güncelleme: {new Date(note.updatedAt).toLocaleDateString('tr-TR')}</span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredNotes.length === 0 && (
        <div className="text-center py-12">
          <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Henüz not bulunmuyor</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedNoteType !== 'all' 
              ? 'Arama kriterlerinize uygun not bulunamadı.' 
              : 'İlk müşteri notunuzu eklemek için "Yeni Not" butonuna tıklayın.'
            }
          </p>
          {!searchTerm && selectedNoteType === 'all' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              İlk Notu Ekle
            </button>
          )}
        </div>
      )}

      {/* Add/Edit Modal burada olacak - uzun olduğu için ayrı component yapılabilir */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingNote ? 'Not Düzenle' : 'Yeni Not Ekle'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    resetForm()
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (editingNote) {
                  handleUpdateNote(editingNote.id, formData)
                } else {
                  handleAddNote(formData)
                }
              }}
              className="p-6 space-y-6"
            >
              {/* Müşteri Bilgileri */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Müşteri Adı *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                    value={formData.customerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                    placeholder="Müşteri adını girin"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon *
                  </label>
                  <input
                    type="tel"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                    placeholder="0532 123 4567"
                  />
                </div>
              </div>

              {/* Hizmet ve Not Türü */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hizmet Türü *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                    value={formData.serviceType}
                    onChange={(e) => setFormData(prev => ({ ...prev, serviceType: e.target.value }))}
                    placeholder="Örn: Diyet Danışmanlığı"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Not Türü *
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                    value={formData.noteType}
                    onChange={(e) => setFormData(prev => ({ ...prev, noteType: e.target.value as any }))}
                  >
                    {noteTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Not Başlığı */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Not Başlığı *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Örn: 2 Haftalık Diyet Programı"
                />
              </div>

              {/* Not İçeriği - Basit Rich Text Editor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Not İçeriği *
                </label>
                
                {/* Formatting Toolbar */}
                <div className="border border-gray-300 rounded-t-lg bg-gray-50 p-2 flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={formatBold}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
                    title="Kalın (Markdown: **metin**)"
                  >
                    <span className="font-bold text-sm">B</span>
                  </button>
                  <button
                    type="button"
                    onClick={formatItalic}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
                    title="İtalik (Markdown: *metin*)"
                  >
                    <span className="italic text-sm">I</span>
                  </button>
                  <button
                    type="button"
                    onClick={formatHeader}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
                    title="Başlık (Markdown: ### Başlık)"
                  >
                    <span className="text-sm font-semibold">H</span>
                  </button>
                  <button
                    type="button"
                    onClick={formatList}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
                    title="Liste (Markdown: - öğe)"
                  >
                    <span className="text-sm">•</span>
                  </button>
                  <button
                    type="button"
                    onClick={formatNumberedList}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
                    title="Numaralı Liste (Markdown: 1. öğe)"
                  >
                    <span className="text-sm">1.</span>
                  </button>
                  <div className="text-xs text-gray-500 ml-4">
                    İpuçları: **kalın**, *italik*, ### başlık, - liste
                  </div>
                </div>
                
                <textarea
                  ref={textareaRef}
                  required
                  className="w-full px-3 py-3 border border-gray-300 border-t-0 rounded-b-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-gray-900"
                  rows={12}
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder={`Müşteriye özel bilgileri buraya yazın...

Örnek:
### HAFTA 1-2 DİYET PLANI

**KAHVALTI (08:00):**
- 2 adet tam tahıl ekmeği
- 1 adet haşlanmış yumurta
- 1 su bardağı süt

**ÖNEMLİ NOTLAR:**
- Günde en az 2.5 litre su için
- *Yemekler arasında 3 saat ara verin*`}
                />
                
                {/* Preview Area */}
                {formData.content && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Önizleme:
                    </label>
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 max-h-40 overflow-y-auto">
                      <div className="prose prose-sm max-w-none">
                        <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700">
                          {formData.content
                            .replace(/\*\*(.*?)\*\*/g, '$1') // Bold preview
                            .replace(/\*(.*?)\*/g, '$1') // Italic preview
                            .replace(/### (.*)/g, '$1') // Header preview
                          }
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Görünürlük Ayarı */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isVisible"
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  checked={formData.isVisible}
                  onChange={(e) => setFormData(prev => ({ ...prev, isVisible: e.target.checked }))}
                />
                <label htmlFor="isVisible" className="text-sm font-medium text-gray-700">
                  Müşteri bu notu görebilsin
                </label>
              </div>

              {/* Butonlar */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    resetForm()
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !formData.customerName || !formData.title || !formData.content}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <CheckIcon className="w-4 h-4" />
                  )}
                  <span>{editingNote ? 'Güncelle' : 'Kaydet'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}