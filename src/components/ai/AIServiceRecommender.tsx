'use client';

import { useState, useEffect } from 'react';
import { SparklesIcon, MicrophoneIcon, MagnifyingGlassIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface AIServiceResult {
  id: string;
  businessName: string;
  rating: number;
  reviewCount: number;
  price: string;
  distance: string;
  isOpen: boolean;
  services: string[];
  badge?: 'popular' | 'closest' | 'budget';
  image?: string;
}

interface AIAnalysis {
  intent: string;
  serviceType: string;
  urgency: 'low' | 'medium' | 'high';
  keywords: string[];
  confidence: number;
}

export default function AIServiceRecommender({ selectedLocation }: { selectedLocation: string }) {
  const [userInput, setUserInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [recommendations, setRecommendations] = useState<AIServiceResult[]>([]);
  const [isListening, setIsListening] = useState(false);

  // Örnek AI analiz fonksiyonu
  const analyzeUserInput = async (input: string): Promise<AIAnalysis> => {
    // Bu gerçek projede OpenAI/Claude API ile çalışacak
    // Şimdilik mock analiz yapıyoruz
    
    const keywords = input.toLowerCase().split(' ');
    let serviceType = 'genel';
    let intent = 'hizmet arama';
    let urgency: 'low' | 'medium' | 'high' = 'medium';

    // Basit keyword matching (gerçek AI burada olacak)
    if (keywords.some(k => ['saç', 'berber', 'kuaför', 'kestir', 'uzadı'].includes(k))) {
      serviceType = 'Berber & Kuaför';
      intent = 'Saç kesimi/bakımı';
    } else if (keywords.some(k => ['temizlik', 'temizle', 'dağınık', 'pis', 'misafir'].includes(k))) {
      serviceType = 'Ev Temizliği';
      intent = 'Ev temizliği';
      if (keywords.some(k => ['acil', 'hemen', 'bugün', 'misafir'].includes(k))) urgency = 'high';
    } else if (keywords.some(k => ['bozuldu', 'tamir', 'çalışmıyor', 'elektrik', 'su'].includes(k))) {
      serviceType = 'Tamir & Bakım';
      intent = 'Teknik tamir';
      urgency = 'high';
    } else if (keywords.some(k => ['düğün', 'özel', 'güzel', 'hazırlan', 'makyaj'].includes(k))) {
      serviceType = 'Güzellik & Bakım';
      intent = 'Özel etkinlik hazırlığı';
    }

    return {
      intent,
      serviceType,
      urgency,
      keywords: keywords.filter(k => k.length > 2),
      confidence: 0.85
    };
  };

  // Mock hizmet sonuçları
  const generateMockResults = (analysis: AIAnalysis): AIServiceResult[] => {
    const mockResults: Record<string, AIServiceResult[]> = {
      'Berber & Kuaför': [
        {
          id: '1',
          businessName: 'AYK Hair Design',
          rating: 4.9,
          reviewCount: 127,
          price: '45₺',
          distance: '0.5km',
          isOpen: true,
          services: ['Saç Kesimi', 'Sakal Şekillendirme', 'Keratin Bakım'],
          badge: 'popular',
          image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=80&h=80&fit=crop'
        },
        {
          id: '2', 
          businessName: 'Berber Mehmet',
          rating: 4.7,
          reviewCount: 89,
          price: '35₺',
          distance: '0.2km',
          isOpen: true,
          services: ['Saç Kesimi', 'Sakal Tıraşı'],
          badge: 'closest'
        },
        {
          id: '3',
          businessName: 'Keçiören Berberi',
          rating: 4.5,
          reviewCount: 156,
          price: '25₺',
          distance: '0.8km',
          isOpen: true,
          services: ['Saç Kesimi', 'Öğrenci İndirimi'],
          badge: 'budget'
        }
      ],
      'Ev Temizliği': [
        {
          id: '4',
          businessName: 'Çankaya Temizlik',
          rating: 4.8,
          reviewCount: 234,
          price: '250₺',
          distance: '1.2km',
          isOpen: true,
          services: ['Genel Temizlik', 'Cam Silme', 'Acil Hizmet'],
          badge: 'popular'
        },
        {
          id: '5',
          businessName: 'Hızlı Temizlik',
          rating: 4.6,
          reviewCount: 145,
          price: '180₺',
          distance: '0.9km',
          isOpen: true,
          services: ['Ev Temizliği', 'Halı Yıkama'],
          badge: 'budget'
        }
      ]
    };

    return mockResults[analysis.serviceType] || [];
  };

  const handleAnalyze = async () => {
    if (!userInput.trim()) {
      toast.error('Lütfen ihtiyacınızı yazın');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const analysis = await analyzeUserInput(userInput);
      const results = generateMockResults(analysis);
      
      setAiAnalysis(analysis);
      setRecommendations(results);
      setShowResults(true);
      
      toast.success(`${results.length} hizmet bulundu!`);
    } catch (error) {
      toast.error('AI analizi yapılırken hata oluştu');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.lang = 'tr-TR';
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setUserInput(transcript);
      };
      recognition.start();
    } else {
      toast.error('Tarayıcınız ses tanımayı desteklemiyor');
    }
  };

  const getBadgeColor = (badge?: string) => {
    switch (badge) {
      case 'popular': return 'bg-red-100 text-red-800';
      case 'closest': return 'bg-blue-100 text-blue-800';
      case 'budget': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBadgeText = (badge?: string) => {
    switch (badge) {
      case 'popular': return '🥇 En Popüler';
      case 'closest': return '🏆 En Yakın';
      case 'budget': return '💰 En Uygun';
      default: return '';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* AI Input Section */}
      <div className="bg-white rounded-2xl shadow-xl border-2 border-blue-100 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <SparklesIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">🤖 AI Hizmet Asistanı</h2>
            <p className="text-sm text-gray-600">{selectedLocation} konumunda size en uygun hizmetleri buluyorum</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Hangi hizmete ihtiyacınız var? Örn: 'Saçım çok uzadı, kestirmek istiyorum' veya 'Evde musluk bozuldu, tamirci lazım'"
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 resize-none"
              rows={3}
              disabled={isAnalyzing}
            />
            
            <button
              onClick={handleVoiceInput}
              disabled={isListening || isAnalyzing}
              className={`absolute bottom-3 right-3 p-2 rounded-lg transition-all ${
                isListening 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              <MicrophoneIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Örnek öneriler */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-500">💡 Örnek:</span>
            {[
              "Saçım çok uzadı",
              "Evde musluk bozuldu", 
              "Düğün için hazırlanmalı",
              "Ev temizliği lazım"
            ].map((example) => (
              <button
                key={example}
                onClick={() => setUserInput(example)}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                disabled={isAnalyzing}
              >
                "{example}"
              </button>
            ))}
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !userInput.trim()}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>AI Analiz Ediyor...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <MagnifyingGlassIcon className="h-5 w-5" />
                <span>🔍 AI ile Hizmet Bul</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* AI Analysis Results */}
      {showResults && aiAnalysis && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 mb-6 border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <SparklesIcon className="h-5 w-5 text-green-600" />
            <span className="font-semibold text-green-800">AI Analiz Sonucu</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">İhtiyaç:</span>
              <p className="font-medium text-gray-900">{aiAnalysis.intent}</p>
            </div>
            <div>
              <span className="text-gray-600">Kategori:</span>
              <p className="font-medium text-gray-900">{aiAnalysis.serviceType}</p>
            </div>
            <div>
              <span className="text-gray-600">Güven Skoru:</span>
              <p className="font-medium text-gray-900">%{Math.round(aiAnalysis.confidence * 100)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Service Recommendations */}
      {showResults && recommendations.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">
              🎯 Size Özel {recommendations.length} Öneri
            </h3>
            <span className="text-sm text-gray-500">
              <MapPinIcon className="h-4 w-4 inline mr-1" />
              {selectedLocation}
            </span>
          </div>

          <div className="grid gap-4">
            {recommendations.map((business) => (
              <div key={business.id} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    {business.image && (
                      <img 
                        src={business.image} 
                        alt={business.businessName}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-lg font-bold text-gray-900">{business.businessName}</h4>
                        {business.badge && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor(business.badge)}`}>
                            {getBadgeText(business.badge)}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 mb-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          ⭐ {business.rating} ({business.reviewCount} yorum)
                        </span>
                        <span>💰 {business.price}</span>
                        <span>📍 {business.distance}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          business.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {business.isOpen ? '🟢 Açık' : '🔴 Kapalı'}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-3">
                        {business.services.map((service, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs">
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                      📅 Randevu Al
                    </button>
                    <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                      📞 Ara
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Actions */}
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-gray-600 mb-3">Aradığınızı bulamadınız mı?</p>
            <div className="flex flex-wrap justify-center gap-2">
              <button 
                onClick={() => setUserInput('')}
                className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm border transition-colors"
              >
                🔄 Yeni Arama
              </button>
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                📞 Destek Al
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
