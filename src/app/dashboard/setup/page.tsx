'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Building2, ArrowRight, CheckCircle } from 'lucide-react'

export default function BusinessSetupPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateBusiness = () => {
    setIsCreating(true)
    // Yönlendirme - işletme ayarları sayfası olacak
    router.push('/dashboard/settings?setup=true')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Icon */}
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-10 h-10 text-blue-600" />
          </div>

          {/* Content */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Hoş Geldiniz! 🎉
            </h1>
            <p className="text-gray-600 mb-6">
              Dashboard'u kullanmaya başlamadan önce işletme bilgilerinizi tamamlamanız gerekiyor.
            </p>

            {session?.user && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600">
                  Merhaba <strong>{session.user.name}</strong>! 👋
                </p>
              </div>
            )}
          </div>

          {/* Steps */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-800">Hesap oluşturuldu</span>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">2</span>
              </div>
              <span className="text-sm text-blue-800 font-medium">İşletme bilgileri</span>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">3</span>
              </div>
              <span className="text-sm text-gray-600">Dashboard erişimi</span>
            </div>
          </div>

          {/* Action */}
          <button
            onClick={handleCreateBusiness}
            disabled={isCreating}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <Building2 className="w-5 h-5" />
                İşletme Bilgilerini Tamamla
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          {/* Info */}
          <div className="mt-6 p-4 bg-amber-50 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Sadece 2-3 dakika!</strong><br />
              İşletme adı, sektör, iletişim bilgileri gibi temel bilgileri ekleyeceğiz.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}