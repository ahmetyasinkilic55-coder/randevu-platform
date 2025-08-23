# 🔧 Mobil Uygulamaya Dönüşüm İçin Gerekli Değişiklikler

Bu dosya, mevcut NextJS projenizin mobil uygulamaya dönüştürülürken dikkat edilmesi gereken noktaları ve gerekli değişiklikleri içerir.

## ⚠️ Kritik Problemler ve Çözümleri

### 1. API Routes Sorunu
**Problem:** NextJS API routes (`/api/*`) mobil uygulamada çalışmaz.
**Çözüm:** 
- API'leri external bir backend'e taşıyın (Vercel, Railway, DigitalOcean vb.)
- Environment variable ile API URL'sini yönetin:
```bash
# .env.local
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

### 2. Database Bağlantısı
**Problem:** Prisma client-side'da çalışmaz.
**Çözüm:** 
- Tüm database işlemlerini API endpoint'leri üzerinden yapın
- Mobile app sadece HTTP istekleri göndermeli

### 3. File Upload
**Problem:** Mevcut file upload sistemi mobilde çalışmayabilir.
**Çözüm:** 
- Capacitor Camera plugin'ini kullanın
- Cloud storage servisi entegre edin (AWS S3, Cloudinary)

### 4. Authentication
**Problem:** NextAuth.js server-side işlemler gerektirir.
**Çözüm:**
- JWT token based auth sistemine geçin
- Token'ları secure storage'da saklayın

## 📝 Gerekli Kod Değişiklikleri

### 1. API İsteklerini Güncelleme
Mevcut API isteklerinizi şu şekilde güncelleyin:

```typescript
// Önceki hali
const response = await fetch('/api/businesses');

// Yeni hali
const API_BASE = (window as any).API_BASE_URL || '';
const response = await fetch(`${API_BASE}/api/businesses`);
```

### 2. Image Handling
```typescript
// next/image yerine standart img tag kullanın
import Image from 'next/image'; // ❌ Kullanmayın
<img src="/path/to/image.jpg" alt="..." /> // ✅ Kullanın
```

### 3. Dynamic Imports
Server-side kütüphaneleri kontrol edin:
```typescript
// Sadece client-side'da yükle
if (typeof window !== 'undefined') {
  const dynamicModule = await import('client-only-module');
}
```

## 🔄 Mirasyon Planı

### Faz 1: Temel Mobil Uyumluluk
- [x] Capacitor kurulumu
- [x] Static export konfigürasyonu
- [x] Mobil responsive tasarım
- [ ] API base URL yönetimi

### Faz 2: Backend Ayrıştırma
- [ ] API routes'ları external backend'e taşı
- [ ] Database bağlantılarını API'ye yönlendir
- [ ] Authentication sistemini güncelle

### Faz 3: Mobil Özellikler
- [ ] Push notifications
- [ ] Camera/Gallery integration
- [ ] Offline support
- [ ] Biometric authentication

### Faz 4: Optimizasyon
- [ ] Bundle size optimization
- [ ] Performance improvements
- [ ] Store deployment

## 📱 Test Stratejisi

### Development Test
```bash
# Web browser'da test
npm run dev

# Mobil simulatörde test
npm run cap:run:ios
npm run cap:run:android
```

### Production Test
```bash
# Production build test
npm run build
npm run cap:build

# Store build test
# Android: Generate signed bundle
# iOS: Archive and upload
```

## 🚀 Deployment Pipeline

### 1. Backend Deployment
- API'leri production server'a deploy edin
- Environment variables'ları ayarlayın
- SSL certificate kurulumu yapın

### 2. Mobile App Build
- Icon'ları ve splash screen'leri hazırlayın
- Store listing'lerini hazırlayın
- Beta test grubu oluşturun

### 3. Store Submission
- Google Play Console setup
- App Store Connect setup
- Review guidelines'ları kontrol edin

## 📞 Destek ve Yardım

Mobil dönüşüm sürecinde karşılaştığınız sorunlarda:
1. Console log'larını kontrol edin
2. Capacitor documentation'a bakın
3. Platform-specific issue'ları ayrı ayrı test edin
4. Community forums'dan yardım alın

Bu dosyayı projenizin root dizininde saklayın ve gerektiğinde başvurun.
