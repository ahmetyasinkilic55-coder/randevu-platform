'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function PublicHeader() {
  const pathname = usePathname()
  
  // Sadece [businessSlug] sayfalarında göster
  const isBusinessPage = pathname && 
    pathname !== '/' && 
    !pathname.startsWith('/dashboard') && 
    !pathname.startsWith('/admin') && 
    !pathname.startsWith('/auth') && 
    !pathname.startsWith('/api')

  if (!isBusinessPage) {
    return null
  }

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        
        {/* Geri Butonu */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Geri</span>
        </button>

        {/* Platform Adı - Ortada */}
        <Link href="/" className="text-lg font-bold text-gray-900">
          RandeVur
        </Link>

        {/* Boş alan - simetri için */}
        <div className="w-16"></div>

      </div>
    </div>
  )
}
