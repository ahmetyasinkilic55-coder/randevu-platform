'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState, Suspense } from 'react';

function PaymentFailedContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const errorCode = searchParams.get('error');
  const [retryLoading, setRetryLoading] = useState(false);

  const handleRetryPayment = async () => {
    setRetryLoading(true);
    // Ödemeyi tekrar dene
    window.location.href = '/payment';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Error Icon */}
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        {/* Error Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          😔 Ödeme Başarısız
        </h1>
        
        <p className="text-lg text-gray-600 mb-6">
          Üzgünüz, ödeme işlemi tamamlanamadı.
        </p>

        {/* Error Details */}
        <div className="bg-red-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-red-900 mb-2">Olası Nedenler</h3>
          <ul className="text-sm text-red-800 text-left space-y-1">
            <li>• Kart bilgilerinde hata</li>
            <li>• Yetersiz bakiye</li>
            <li>• 3D Secure doğrulaması iptal edildi</li>
            <li>• Banka tarafından bloklandı</li>
            <li>• İnternet bağlantısı sorunu</li>
          </ul>
        </div>

        {/* Retry Options */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">Ne Yapabilirsiniz?</h3>
          <ul className="text-sm text-blue-800 text-left space-y-1">
            <li>✅ Kart bilgilerinizi kontrol edin</li>
            <li>✅ Farklı bir kart deneyin</li>
            <li>✅ Bankanızla iletişime geçin</li>
            <li>✅ Daha sonra tekrar deneyin</li>
          </ul>
        </div>

        {/* Order Details */}
        {orderId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">İşlem Detayları</h3>
            <p className="text-sm text-gray-600">
              <span className="font-medium">İşlem No:</span> {orderId}
            </p>
            {errorCode && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Hata Kodu:</span> {errorCode}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleRetryPayment}
            disabled={retryLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            {retryLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Yönlendiriliyor...
              </div>
            ) : (
              '🔄 Tekrar Dene'
            )}
          </button>
          
          <Link 
            href="/"
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-6 rounded-lg font-semibold inline-block transition-colors"
          >
            Ana Sayfaya Dön
          </Link>
        </div>

        {/* Alternative Contact */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-4">
            Sorun devam ediyorsa bizimle iletişime geçin:
          </p>
          
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">💡 Alternatif Çözüm</h3>
            <p className="text-sm text-green-800 mb-2">
              Ödeme yapmadan da sistemimizi deneyebilirsiniz!
            </p>
            <Link 
              href="/auth/register"
              className="text-green-600 hover:text-green-800 font-semibold text-sm"
            >
              ➤ Ücretsiz deneme hesabı oluşturun
            </Link>
          </div>

          <div className="flex justify-center space-x-4 text-sm mt-4">
            <a href="tel:+905XXXXXXXXX" className="text-blue-600 hover:text-blue-800">
              📞 Bizi Arayın
            </a>
            <a href="https://wa.me/905XXXXXXXXX" className="text-green-600 hover:text-green-800" target="_blank" rel="noopener noreferrer">
              💬 WhatsApp
            </a>
            <a href="mailto:destek@randevur.com" className="text-purple-600 hover:text-purple-800">
              ✉️ Email
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    }>
      <PaymentFailedContent />
    </Suspense>
  );
}
