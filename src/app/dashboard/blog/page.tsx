'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useBusiness } from '@/contexts/BusinessContext'
import { 
  PencilSquareIcon,
  EyeIcon,
  EyeSlashIcon,
  PlusIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  UserIcon,
  ClockIcon,
  XMarkIcon,
  CheckIcon,
  PhotoIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import { Link as TiptapLink } from '@tiptap/extension-link'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableHeader from '@tiptap/extension-table-header'
import TableCell from '@tiptap/extension-table-cell'
import TextAlign from '@tiptap/extension-text-align'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Underline from '@tiptap/extension-underline'

interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  publishDate?: string | null
  author: string
  readTime: string
  category: string
  tags: string[]
  featuredImage?: string
  isPublished: boolean
  views: number
  createdAt: string
  updatedAt: string
  // Prisma relations
  authorUser?: {
    name: string | null
    email: string
  } | null
  business?: {
    name: string
    slug: string
  } | null
}

const categories = [
  'Blog'
]

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[çÇ]/g, 'c')
    .replace(/[ğĞ]/g, 'g')
    .replace(/[ıİ]/g, 'i')
    .replace(/[öÖ]/g, 'o')
    .replace(/[şŞ]/g, 's')
    .replace(/[üÜ]/g, 'u')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

const calculateReadTime = (content: string): string => {
  const wordsPerMinute = 200
  const textContent = content.replace(/<[^>]*>/g, '') // HTML etiketlerini temizle
  const wordCount = textContent.split(/\s+/).filter(word => word.length > 0).length
  const readTime = Math.ceil(wordCount / wordsPerMinute)
  return `${readTime} dk`
}

// Toolbar Button Component
const ToolbarButton = ({ 
  onClick, 
  isActive = false, 
  children, 
  title 
}: { 
  onClick: () => void
  isActive?: boolean
  children: React.ReactNode
  title: string
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`p-2 rounded transition-colors ${
      isActive 
        ? 'bg-purple-100 text-purple-700' 
        : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
    }`}
  >
    {children}
  </button>
)

export default function BlogManagementPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const { businessSlug, businessData } = useBusiness()

  const [formData, setFormData] = useState<{
    title: string
    content: string
    category: string
    tags: string
    featuredImage: string
    isPublished: boolean
  }>({
    title: '',
    content: '',
    category: 'Blog',
    tags: '',
    featuredImage: '',
    isPublished: false
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Tiptap editor configuration
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color.configure({ types: [TextStyle.name] }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TiptapLink.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-purple-600 underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: formData.content,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base lg:prose-lg xl:prose-xl mx-auto focus:outline-none min-h-[300px] p-4',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      setFormData(prev => ({ ...prev, content: html }))
    },
  })

  // Görsel yükleme fonksiyonu - önce tanımla
  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Cloudinary upload success:', data)
        return data.url // Cloudinary'den gelen secure_url
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Görsel yüklenemedi')
      }
    } catch (error) {
      console.error('Görsel yükleme hatası:', error)
      throw error // Hatanın yukarıya taşınması için
    }
  }

  // Toolbar functions
  const addImage = useCallback(async () => {
    // Dosya seçimi için input oluştur
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.style.display = 'none'
    
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement)?.files?.[0]
      if (file && editor) {
        toast.loading('Görsel Cloudinary\'ye yükleniyor...', { id: 'editor-image-upload' })
        try {
          const imageUrl = await handleImageUpload(file)
          if (imageUrl) {
            editor.chain().focus().setImage({ src: imageUrl }).run()
            toast.success('Görsel başarıyla eklendi!', { id: 'editor-image-upload' })
          }
        } catch (error) {
          toast.error('Görsel yüklenirken hata oluştu', { id: 'editor-image-upload' })
        }
      }
      document.body.removeChild(input)
    }
    
    document.body.appendChild(input)
    input.click()
  }, [editor, handleImageUpload])

  const addLink = useCallback(() => {
    const previousUrl = editor?.getAttributes('link').href
    const url = window.prompt('Link URL\'si girin:', previousUrl)
    
    if (url === null) {
      return
    }
    
    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    
    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  const addTable = useCallback(() => {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }, [editor])

  // Blog yazılarını yükle
  useEffect(() => {
    fetchPosts()
  }, [])

  // Filtreleme ve arama
  useEffect(() => {
    let filtered = posts

    if (searchTerm) {
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    setFilteredPosts(filtered)
  }, [posts, searchTerm])

  // Editor content'i güncelle
  useEffect(() => {
    if (editor && formData.content !== editor.getHTML()) {
      editor.commands.setContent(formData.content)
    }
  }, [editor, formData.content])

  // API fonksiyonları
  const fetchPosts = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/blog/posts')
      if (response.ok) {
        const data = await response.json()
        setPosts(data)
      } else {
        // API henüz hazır değilse boş array döndür
        setPosts([])
      }
    } catch (error) {
      console.error('Blog yazıları yüklenirken hata:', error)
      setPosts([])
    } finally {
      setIsLoading(false)
    }
  }

  const createPost = async (postData: Omit<BlogPost, 'id' | 'views' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/blog/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData)
      })
      
      if (response.ok) {
        const newPost = await response.json()
        setPosts(prev => [newPost, ...prev])
        toast.success('Blog yazısı başarıyla oluşturuldu!')
        return newPost
      } else {
        throw new Error('Blog yazısı oluşturulamadı')
      }
    } catch (error) {
      console.error('Blog yazısı oluşturulurken hata:', error)
      toast.error('Blog yazısı oluşturulurken bir hata oluştu')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const updatePost = async (id: string, updates: Partial<BlogPost>) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/blog/posts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      })
      
      if (response.ok) {
        const updatedPost = await response.json()
        setPosts(prev => prev.map(post => post.id === id ? updatedPost : post))
        toast.success('Blog yazısı başarıyla güncellendi!')
      } else {
        throw new Error('Blog yazısı güncellenemedi')
      }
    } catch (error) {
      console.error('Blog yazısı güncellenirken hata:', error)
      toast.error('Blog yazısı güncellenirken bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const deletePost = async (id: string) => {
    if (!confirm('Bu blog yazısını silmek istediğinizden emin misiniz?')) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/blog/posts/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setPosts(prev => prev.filter(post => post.id !== id))
        toast.success('Blog yazısı başarıyla silindi!')
      } else {
        throw new Error('Blog yazısı silinemedi')
      }
    } catch (error) {
      console.error('Blog yazısı silinirken hata:', error)
      toast.error('Blog yazısı silinirken bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const togglePublishStatus = async (id: string, isPublished: boolean) => {
    await updatePost(id, { isPublished })
    toast.success(isPublished ? 'Blog yazısı yayınlandı!' : 'Blog yazısı taslağa alındı!')
  }

  const handleFeaturedImageSelect = async () => {
    const file = fileInputRef.current?.files?.[0]
    if (file) {
      setIsUploading(true)
      toast.loading('Görsel Cloudinary\'ye yükleniyor...', { id: 'image-upload' })
      
      try {
        const imageUrl = await handleImageUpload(file)
        if (imageUrl) {
          setFormData(prev => ({ ...prev, featuredImage: imageUrl }))
          toast.success('Öne çıkan görsel başarıyla eklendi!', { id: 'image-upload' })
        }
      } catch (error) {
        toast.error('Görsel yüklenirken hata oluştu', { id: 'image-upload' })
      } finally {
        setIsUploading(false)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    const slug = generateSlug(formData.title)
    const content = editor?.getHTML() || formData.content
    
    // İçerikten otomatik özet oluştur (ilk 150 karakter)
    const textContent = content.replace(/<[^>]*>/g, '') // HTML etiketlerini temizle
    const excerpt = textContent.substring(0, 150) + (textContent.length > 150 ? '...' : '')
    
    const postData = {
      title: formData.title,
      slug,
      content,
      excerpt,
      category: 'Blog',
      tags: tagsArray,
      featuredImage: formData.featuredImage,
      isPublished: formData.isPublished,
      author: businessData?.name || 'Admin', // Business name'i kullan
      readTime: calculateReadTime(content),
      publishDate: formData.isPublished ? new Date().toISOString() : null
    }

    if (editingPost) {
      await updatePost(editingPost.id, {
        ...postData,
        updatedAt: new Date().toISOString()
      })
    } else {
      await createPost({
        ...postData,
        views: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as Omit<BlogPost, 'id' | 'views' | 'createdAt' | 'updatedAt'>)
    }

    setShowAddModal(false)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      category: 'Blog',
      tags: '',
      featuredImage: '',
      isPublished: false
    })
    editor?.commands.setContent('')
    setEditingPost(null)
  }

  const openEditModal = (post: BlogPost) => {
    setFormData({
      title: post.title,
      content: post.content,
      category: post.category,
      tags: post.tags.join(', '),
      featuredImage: post.featuredImage || '',
      isPublished: post.isPublished
    })
    setEditingPost(post)
    setShowAddModal(true)
  }

  if (!editor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-xl">
              <DocumentTextIcon className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Blog Yönetimi</h1>
              <p className="text-purple-100">Tiptap ile modern editör deneyimi</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30 transition-all flex items-center space-x-2"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Yeni Yazı</span>
          </button>
        </div>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-3 rounded-lg">
              <DocumentTextIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{posts.length}</div>
              <div className="text-sm text-gray-500">Toplam Yazı</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <EyeIcon className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {posts.filter(p => p.isPublished).length}
              </div>
              <div className="text-sm text-gray-500">Yayında</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-100 p-3 rounded-lg">
              <EyeSlashIcon className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {posts.filter(p => !p.isPublished).length}
              </div>
              <div className="text-sm text-gray-500">Taslak</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <UserIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {posts.reduce((sum, post) => sum + post.views, 0)}
              </div>
              <div className="text-sm text-gray-500">Toplam Görüntülenme</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtreler */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="max-w-md">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Başlık, içerik veya etiket ara..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Blog Yazıları Listesi */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Blog yazıları yükleniyor...</p>
        </div>
      ) : filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filteredPosts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow overflow-hidden">
              {/* Featured Image */}
              {post.featuredImage && (
                <div className="aspect-[16/9] bg-gray-100 overflow-hidden">
                  <img 
                    src={post.featuredImage} 
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="p-3">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        post.isPublished 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {post.isPublished ? 'Yayında' : 'Taslak'}
                      </span>
                    </div>
                    <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 text-sm leading-tight">
                      {post.title}
                    </h3>
                    <p className="text-xs text-gray-600 line-clamp-2 mb-2 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
                    <button
                      onClick={() => togglePublishStatus(post.id, !post.isPublished)}
                      className={`p-1 rounded text-xs ${
                        post.isPublished 
                          ? 'text-green-600 hover:bg-green-50' 
                          : 'text-orange-600 hover:bg-orange-50'
                      }`}
                      title={post.isPublished ? 'Yayından kaldır' : 'Yayınla'}
                    >
                      {post.isPublished ? <EyeIcon className="w-3 h-3" /> : <EyeSlashIcon className="w-3 h-3" />}
                    </button>
                    <button
                      onClick={() => openEditModal(post)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <PencilSquareIcon className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => deletePost(post.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <TrashIcon className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Etiketler */}
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {post.tags.slice(0, 2).map((tag, index) => (
                      <span key={index} className="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                        #{tag}
                      </span>
                    ))}
                    {post.tags.length > 2 && (
                      <span className="inline-block text-gray-400 px-1 text-xs">
                        +{post.tags.length - 2}
                      </span>
                    )}
                  </div>
                )}

                {/* Meta Bilgiler */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      <CalendarDaysIcon className="w-3 h-3 mr-1" />
                      <span>{post.publishDate ? new Date(post.publishDate).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' }) : new Date(post.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="w-3 h-3 mr-1" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                  {post.isPublished && (
                    <Link
                      href={`/${businessSlug}/${post.slug}`}
                      target="_blank"
                      className="text-purple-600 hover:text-purple-800 underline text-xs"
                    >
                      Görüntüle
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Boş State */
        <div className="text-center py-12">
          <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm 
              ? 'Arama kriterlerinize uygun yazı bulunamadı' 
              : 'Henüz blog yazısı bulunmuyor'
            }
          </h3>
          <p className="text-gray-600 mb-4">
            {!searchTerm 
              ? 'İlk blog yazınızı oluşturmak için "Yeni Yazı" butonuna tıklayın.'
              : 'Lütfen farklı arama kriterleri deneyin.'
            }
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              İlk Yazıyı Oluştur
            </button>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">
                  {editingPost ? 'Blog Yazısını Düzenle' : 'Yeni Blog Yazısı'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    resetForm()
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Başlık */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Başlık *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 text-sm"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Blog yazısının başlığını girin"
                />
                {formData.title && (
                  <div className="mt-1 text-xs text-gray-500">
                    URL: /{businessSlug}/{generateSlug(formData.title)}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Öne Çıkan Görsel */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Öne Çıkan Görsel
                  </label>
                  <div className="space-y-2">
                    {formData.featuredImage ? (
                      <div className="relative">
                        <img 
                          src={formData.featuredImage} 
                          alt="Önizleme"
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, featuredImage: '' }))}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                        >
                          <XMarkIcon className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <PhotoIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 mb-2 text-sm">Görsel seçin</p>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                          className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 disabled:opacity-50 flex items-center space-x-1"
                        >
                          {isUploading ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                              <span>Yükleniyor...</span>
                            </>
                          ) : (
                            <>
                              <PhotoIcon className="w-3 h-3" />
                              <span>Seç</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFeaturedImageSelect}
                    />
                  </div>
                </div>

                {/* Yayın Durumu ve Etiketler */}
                <div className="space-y-4">
                  {/* Yayın Durumu */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isPublished"
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      checked={formData.isPublished}
                      onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
                    />
                    <label htmlFor="isPublished" className="text-sm font-medium text-gray-700">
                      Hemen yayınla
                    </label>
                  </div>

                  {/* Etiketler */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Etiketler
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 text-sm"
                      value={formData.tags}
                      onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="etiket1, etiket2"
                    />
                    <div className="mt-1 text-xs text-gray-500">
                      Virgül ile ayırın
                    </div>
                  </div>
                </div>
              </div>

              {/* Tiptap Editor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  İçerik * (Modern Editör)
                </label>
                
                {/* Compact Toolbar */}
                <div className="border border-gray-300 rounded-t-lg bg-gray-50 p-2 flex flex-wrap gap-1">
                  <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive('bold')}
                    title="Kalın"
                  >
                    <strong className="text-sm">B</strong>
                  </ToolbarButton>
                  
                  <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive('italic')}
                    title="İtalik"
                  >
                    <em className="text-sm">I</em>
                  </ToolbarButton>
                  
                  <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    isActive={editor.isActive('heading', { level: 2 })}
                    title="Başlık"
                  >
                    <span className="text-sm font-bold">H2</span>
                  </ToolbarButton>
                  
                  <div className="w-px h-6 bg-gray-300 mx-1"></div>
                  
                  <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    isActive={editor.isActive('bulletList')}
                    title="Liste"
                  >
                    <span className="text-sm">•</span>
                  </ToolbarButton>
                  
                  <ToolbarButton
                    onClick={addLink}
                    isActive={editor.isActive('link')}
                    title="Link"
                  >
                    <span className="text-sm">🔗</span>
                  </ToolbarButton>
                  
                  <ToolbarButton
                    onClick={addImage}
                    isActive={false}
                    title="Görsel"
                  >
                    <span className="text-sm">📷</span>
                  </ToolbarButton>
                </div>
                
                {/* Editor Content - Küçültülmüş */}
                <div className="border border-gray-300 border-t-0 rounded-b-lg min-h-[250px] max-h-[300px] overflow-y-auto">
                  <EditorContent 
                    editor={editor} 
                    className="prose prose-sm max-w-none focus:outline-none p-3"
                  />
                </div>
                
                <div className="mt-1 text-xs text-gray-500">
                  Modern Tiptap editörü ile zengin içerik oluşturun
                </div>
              </div>

              {/* Butonlar */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    resetForm()
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !formData.title}
                  className="px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 text-sm"
                >
                  {isLoading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  <CheckIcon className="w-4 h-4" />
                  <span>{editingPost ? 'Güncelle' : 'Oluştur'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
