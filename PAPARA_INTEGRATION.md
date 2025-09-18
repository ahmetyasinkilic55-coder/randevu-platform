# 💳 Papara Business Ödeme Entegrasyonu

## 🎯 OVERVIEW
RandeVur platformu için Papara Business ödeme sistemi entegrasyonu. Şirket kurmadan, sadece TC kimlik ile ödeme alma imkanı.

## 🚀 SETUP ADIMLARI

### 1. Papara Business Hesabı Oluştur
```
1. https://papara.com/business adresine git
2. "Başvuru Yap" butonuna tıkla
3. TC kimlik + telefon + email ile kayıt ol
4. Selfie + kimlik fotoğrafı yükle
5. 24 saat içinde onaylanır
```

### 2. API Anahtarlarını Al
```
1. Papara Business paneline gir
2. "Entegrasyonlar" → "API Anahtarları"
3. Test + Canlı anahtarları oluştur
4. .env dosyasına ekle
```

### 3. Environment Variables
```bash
# .env dosyasına ekle:
PAPARA_API_KEY=your_api_key_here
PAPARA_API_SECRET=your_secret_key_here
PAPARA_MERCHANT_ID=your_merchant_id_here
```

### 4. Package Installation (Gelecekte)
```bash
# Papara resmi SDK çıktığında:
npm install @papara/sdk

# Şu an için HTTP requests kullanıyoruz
```

## 📁 DOSYA YAPISI

```
src/app/
├── payment/
│   ├── page.tsx                 # Ödeme sayfası
│   ├── success/page.tsx         # Başarılı ödeme
│   └── failed/page.tsx          # Başarısız ödeme
│
└── api/payment/
    ├── create/route.ts          # Ödeme başlatma
    ├── verify/route.ts          # Ödeme doğrulama  
    └── webhook/route.ts         # Ödeme bildirimi
```

## 🔄 ÖDEME AKIŞI

### 1. Müşteri Tarafı:
```
1. /payment sayfasında plan seçer
2. "Ücretsiz Deneyin" butonuna basar  
3. Papara ödeme sayfasına yönlendir
4. Kart bilgilerini girer (3D Secure)
5. Başarılıysa /payment/success
6. Başarısızsa /payment/failed
```

### 2. Backend Tarafı:
```
1. POST /api/payment/create → Ödeme oluştur
2. Papara API'sine request at
3. Ödeme URL'i al ve döndür
4. Webhook ile ödeme sonucunu yakala
5. Database'i güncelle
```

## 💰 PRİCİNG MODELİ

### İlk 3 Ay: ÜCRETSİZ DENEME
```
- Ödeme tutarı: ₺0
- Tüm özellikler açık
- İptal etmek isterse bildirsin
- 4. aydan itibaren ücretlendirme
```

### Planlar:
```
- Temel: ₺199/ay
- Premium: ₺349/ay  
- Kurumsal: ₺599/ay
```

## 📊 DATABASE SCHEMA (Gelecekte Eklenecek)

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id VARCHAR(100) UNIQUE NOT NULL,
  business_id UUID REFERENCES businesses(id),
  plan_id VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'TRY',
  status VARCHAR(50) DEFAULT 'pending',
  papara_payment_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id),
  plan_id VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'trial', -- trial, active, cancelled
  trial_ends_at TIMESTAMP,
  next_billing_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🧪 TEST SENARYOLARI

### Test Kartları (Papara Test Ortamı):
```
Başarılı Ödeme: 4242 4242 4242 4242
CVV: 123, Son Kullanma: 12/25

Başarısız Ödeme: 4000 0000 0000 0002  
CVV: 123, Son Kullanma: 12/25
```

### Test URLs:
```
Payment: http://localhost:3000/payment?plan=premium
Success: http://localhost:3000/payment/success?orderId=TEST123
Failed: http://localhost:3000/payment/failed?orderId=TEST123
```

## ⚠️ ÖNEMLİ NOTLAR

1. **İlk 3 Ay Bedava:** Gerçek ödeme ₺0, sadece kayıt alıyoruz
2. **Webhook Security:** Papara'dan gelen bildirimleri doğrula
3. **Error Handling:** Tüm hata durumlarını yakala
4. **Retry Logic:** Başarısız ödemeleri tekrar deneme imkanı
5. **Mobile Friendly:** Tüm sayfalar mobil uyumlu

## 🔧 GELİŞTİRME NOTLARI

### Şu An Mock:
```typescript
// create/route.ts içinde mock response
return {
  success: true,
  paymentId: `PAP-${Date.now()}`,
  paymentUrl: `https://merchant.test.papara.com/pay/${orderId}`
};
```

### Canlıya Geçerken:
```typescript
// Gerçek Papara SDK entegrasyonu
const papara = new Papara({
  apiKey: PAPARA_API_KEY,
  environment: 'live' // 'sandbox' → 'live'
});
```

## 📞 DESTEK

Herhangi bir sorun olursa:
- Papara Business Destek: business@papara.com
- Papara API Dokümantasyon: https://docs.papara.com
- RandeVur Development: Ahmet Yasin KILIÇ

---

**TARİH:** 2025-01-18
**DURUM:** Development Ready
**SONRAKI ADIM:** Papara Business hesabı açmak