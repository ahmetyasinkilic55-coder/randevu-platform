'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  popular?: boolean;
}

const pricingPlans: PricingPlan[] = [
  {
    id: 'basic',
    name: 'Temel Paket',
    price: 199,
    features: [
      'Website otomatik oluşturma',
      'Sınırsız müşteri iletişimi',
      'Galeri ve portföy yönetimi',
      'Temel analitik',
      '7/24 destek'
    ]
  },
  {
    id: 'premium',
    name: 'Premium Paket',
    price: 349,
    popular: true,
    features: [
      'Temel paket tüm özellikleri',
      'Arama sonuçlarında üstte çıkma',
      'Ana sayfada öne çıkarılma',
      'Detaylı analitik ve raporlar',
      'Özel rozet ("Onaylı Uzman")',
      'WhatsApp entegrasyonu'
    ]
  },
  {
    id: 'pro',
    name: 'Kurumsal Paket',
    price: 599,
    features: [
      'Premium paket tüm özellikleri',
      'Şube yönetimi',
      'Merkezi raporlama',
      'API entegrasyonu',
      'Özel tasarım desteği',
      'Öncelikli destek'
    ]
  }
];

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(
    searchParams.get('plan') || 'basic'
  );

  const handlePayment = async (planId: string) => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          businessId: searchParams.get('businessId'),
        }),
      });

      const data = await response.json();
      
      if (data.success && data.paymentUrl) {
        // Papara ödeme sayfasına yönlendir
        window.location.href = data.paymentUrl;
      } else {
        throw new Error(data.error || 'Ödeme başlatılamadı');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Ödeme işleminde hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const selectedPlanData = pricingPlans.find(plan => plan.id === selectedPlan);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Abonelik Planınızı Seçin
          </h1>
          <p className="text-xl text-gray-600">
            İlk 3 ay tamamen ücretsiz! İptal etmek istediğinizde bildirim yapmaniz yeterli.
          </p>
          <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg inline-block">
            <strong>🎉 Özel Fırsat:</strong> İlk 90 gün bedava deneme + Setup ücretsiz!
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {pricingPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-lg p-8 ${
                plan.popular 
                  ? 'border-2 border-blue-500 transform scale-105' 
                  : 'border border-gray-200'
              } ${
                selectedPlan === plan.id ? 'ring-4 ring-blue-300' : ''
              } cursor-pointer transition-all`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                    En Popüler
                  </span>
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className="text-5xl font-bold text-gray-900">
                    ₺{plan.price}
                  </span>
                  <span className="text-gray-600">/ay</span>
                </div>
                <div className="text-sm text-gray-500">
                  <span className="line-through">İlk 3 ay: ₺{plan.price * 3}</span>
                  <span className="block text-green-600 font-semibold">
                    İlk 3 ay: ₺0 (Bedava)
                  </span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePayment(plan.id)}
                disabled={loading}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                  plan.popular
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-800 hover:bg-gray-900 text-white'
                } disabled:opacity-50`}
              >
                {loading ? 'Yönlendiriliyor...' : 'Ücretsiz Deneyin'}
              </button>
            </div>
          ))}
        </div>

        {/* Selected Plan Summary */}
        {selectedPlanData && (
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Ödeme Özeti
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b">
                <span className="font-medium">{selectedPlanData.name}</span>
                <span className="font-semibold">₺{selectedPlanData.price}/ay</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b">
                <span>İlk 3 Ay (Ücretsiz Deneme)</span>
                <span className="text-green-600 font-semibold">₺0</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b">
                <span>Setup ve Kurulum</span>
                <span className="text-green-600 font-semibold">₺0</span>
              </div>
              
              <div className="flex justify-between items-center py-3 text-xl font-bold">
                <span>Şimdi Ödenecek Tutar</span>
                <span>₺0</span>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Not:</strong> 4. aydan itibaren aylık ₺{selectedPlanData.price} 
                  ücretlendirme başlar. İstediğiniz zaman iptal edebilirsiniz.
                </p>
              </div>
            </div>

            <button
              onClick={() => handlePayment(selectedPlanData.id)}
              disabled={loading}
              className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-lg font-semibold text-lg transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Ödeme Başlatılıyor...
                </div>
              ) : (
                '🎉 Ücretsiz Denemeyi Başlat'
              )}
            </button>

            <p className="text-center text-sm text-gray-500 mt-4">
              Güvenli ödeme: SSL şifreli • 3D Secure korumalı
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Loading component
function PaymentLoading() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/2 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto"></div>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-lg p-8 animate-pulse">
              <div className="h-6 bg-gray-300 rounded mb-4"></div>
              <div className="h-12 bg-gray-200 rounded mb-6"></div>
              <div className="space-y-3">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<PaymentLoading />}>
      <PaymentContent />
    </Suspense>
  );
}
