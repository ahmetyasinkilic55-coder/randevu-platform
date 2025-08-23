'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Shield, ArrowLeft, LogOut, User } from 'lucide-react'

export default function UnauthorizedPage() {
  const { data: session } = useSession()
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-red-100">
          {/* Icon */}
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-red-600" />
          </div>

          {/* Content */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Erişim Reddedildi
            </h1>
            <p className="text-gray-600 mb-4">
              Bu sayfaya erişim yetkiniz bulunmamaktadır. Dashboard sadece işletme sahipleri tarafından kullanılabilir.
            </p>
            
            {session?.user && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-3 text-sm">
                  <User className="w-4 h-4 text-gray-500" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{session.user.name}</p>
                    <p className="text-gray-500">{session.user.email}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Rol: {session.user.role === 'CUSTOMER' ? 'Müşteri' : session.user.role}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => router.push('/')}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Ana Sayfaya Dön
            </button>

            {session && (
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Çıkış Yap
              </button>
            )}
          </div>

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>İşletme sahibi misiniz?</strong><br />
              İşletme hesabı oluşturmak için ana sayfadan kayıt olun ve işletme bilgilerinizi tamamlayın.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}