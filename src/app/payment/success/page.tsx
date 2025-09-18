'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState, Suspense } from 'react';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  useEffect(() => {
    // Ödeme detaylarını al
    const fetchPaymentDetails = async () => {
      if (orderId) {
        try {
          const response = await fetch(`/api/payment/verify?orderId=${orderId}`);
          const data = await response.json();
          setPaymentDetails(data);
        } catch (error) {
          console.error('Error fetching payment details:', error);
        }
      }
      setLoading(false);
    };

    fetchPaymentDetails();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Success Icon */}
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Success Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          🎉 Başarılı!
        </h1>
        
        <p className="text-lg text-gray-600 mb-6">
          Ücretsiz deneme paketiniz başarıyla aktifleştirildi!
        </p>

        {/* Order Details */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">İşlem Detayları</h3>
          {orderId && (
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-medium">İşlem No:</span> {orderId}
            </p>
          )}
          <p className="text-sm text-gray-600 mb-2">
            <span className="font-medium">Paket:</span> 3 Ay Ücretsiz Deneme
          </p>
          <p className="text-sm text-gray-600 mb-2">
            <span className="font-medium">Ödenen Tutar:</span> ₺0
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">4. Aydan İtibaren:</span> Aylık ücretlendirme başlar
          </p>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">Sonraki Adımlar</h3>
          <ul className="text-sm text-blue-800 text-left space-y-1">
            <li>✅ Hesabınız aktifleştirildi</li>
            <li>📧 Email'inize kurulum bilgileri gönderildi</li>
            <li>📱 WhatsApp'tan size ulaşacağız (1 saat içinde)</li>
            <li>🎯 Web siteniz otomatik oluşturulacak</li>
            <li>📞 Ücretsiz kurulum desteği alacaksınız</li>
          </ul>
        </div>

        {/* Important Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-yellow-900 mb-2">Önemli Bilgilendirme</h3>
          <p className="text-sm text-yellow-800">
            İlk 90 gün boyunca tüm özellikleri ücretsiz kullanabilirsiniz. 
            İptal etmek istediğinizde sadece bize bildirmeniz yeterlidir.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link 
            href="/dashboard"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold inline-block transition-colors"
          >
            Dashboard'a Git
          </Link>
          
          <Link 
            href="/"
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-6 rounded-lg font-semibold inline-block transition-colors"
          >
            Ana Sayfaya Dön
          </Link>
        </div>

        {/* Support Contact */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-2">
            Herhangi bir sorunuz mu var?
          </p>
          <div className="flex justify-center space-x-4 text-sm">
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

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
