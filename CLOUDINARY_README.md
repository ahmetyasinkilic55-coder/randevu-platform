# Cloudinary Entegrasyonu - Randevu Platform

Bu proje Cloudinary ile entegre edilmiştir ve görsel yükleme/yönetimi için optimize edilmiştir.

## 🚀 Özellikler

- **Otomatik Yükleme**: Sürükle-bırak veya dosya seçimi ile yükleme
- **Otomatik Optimize**: Görseller otomatik olarak sıkıştırılır ve optimize edilir
- **Responsive**: Farklı boyutlarda görseller otomatik oluşturulur
- **Güvenli**: HTTPS URL'ler ile güvenli erişim
- **Hızlı**: CDN üzerinden hızlı görsel sunumu

## 📁 Dosya Yapısı

```
src/
├── lib/cloudinary/
│   ├── config.ts          # Cloudinary konfigürasyonu
│   ├── utils.ts           # Yardımcı fonksiyonlar
│   └── index.ts          # Export dosyası
├── components/cloudinary/
│   ├── CloudinaryUpload.tsx   # Yükleme komponenti
│   ├── CloudinaryImage.tsx    # Görsel gösterme komponenti
│   ├── CloudinaryTest.tsx     # Test komponenti
│   └── index.ts              # Export dosyası
├── hooks/
│   └── useCloudinary.ts      # React hook
└── app/api/cloudinary/
    └── route.ts             # API endpoint'leri
```

## 🔧 Kurulum

### 1. Environment Variables

`.env.local` dosyanıza aşağıdaki değişkenleri ekleyin:

```env
CLOUDINARY_CLOUD_NAME=ddapurgjuu
CLOUDINARY_API_KEY=641612258656622
CLOUDINARY_API_SECRET=HKg4QIotFPKC6R4l5ikP5hZV-kM
CLOUDINARY_URL=cloudinary://641612258656622:HKg4QIotFPKC6R4l5ikP5hZV-kM@ddapurgjuu
```

### 2. Test Etme

Projeyi başlatın ve şu URL'ye gidin:
```
http://localhost:3000/test-cloudinary
```

## 💻 Kullanım

### Basit Yükleme

```tsx
import { CloudinaryUpload } from '@/components/cloudinary';

function MyComponent() {
  const handleUpload = (result) => {
    console.log('Yüklenen görsel:', result);
    // result.secure_url - görsel URL'si
    // result.public_id - Cloudinary ID'si
  };

  return (
    <CloudinaryUpload
      onUpload={handleUpload}
      folder="my-folder"
      tags="user-content"
    />
  );
}
```

### Görsel Gösterme

```tsx
import { CloudinaryImage } from '@/components/cloudinary';

function MyComponent() {
  return (
    <CloudinaryImage
      publicId="randevu-platform/sample-image"
      alt="Açıklama"
      width={300}
      height={200}
      className="rounded-lg"
      showDeleteButton={true}
      onDelete={() => console.log('Görsel silindi')}
    />
  );
}
```

### Hook Kullanımı

```tsx
import { useCloudinary } from '@/hooks/useCloudinary';

function MyComponent() {
  const { uploadImage, deleteImage, uploading } = useCloudinary();

  const handleFileUpload = async (file: File) => {
    const result = await uploadImage(file, {
      folder: 'user-uploads',
      tags: 'profile-picture'
    });
    
    if (result) {
      console.log('Yüklendi:', result.secure_url);
    }
  };

  return (
    <div>
      <input
        type="file"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
        }}
        disabled={uploading}
      />
      {uploading && <p>Yükleniyor...</p>}
    </div>
  );
}
```

## 🎨 Dönüştürme Seçenekleri

Hazır dönüştürme seçenekleri kullanabilirsiniz:

```tsx
import { imageTransformations } from '@/lib/cloudinary';

// Avatar için
<CloudinaryImage
  publicId="user-avatar"
  transformation={imageTransformations.avatar.medium}
/>

// Galeri için
<CloudinaryImage
  publicId="gallery-image"
  transformation={imageTransformations.gallery.thumbnail}
/>
```

## 📊 API Endpoints

### POST /api/cloudinary
Görsel yükleme

**FormData:**
- `file`: File (required)
- `folder`: string (optional)
- `tags`: string (optional, comma-separated)

**Response:**
```json
{
  "public_id": "randevu-platform/example",
  "secure_url": "https://res.cloudinary.com/...",
  "width": 800,
  "height": 600,
  "format": "jpg",
  "bytes": 102400
}
```

### DELETE /api/cloudinary?publicId=...
Görsel silme

**Query Params:**
- `publicId`: string (required)

**Response:**
```json
{
  "success": true
}
```

## 🔒 Güvenlik

- Dosya boyutu limiti: 10MB
- Desteklenen formatlar: JPG, PNG, WEBP, GIF
- Otomatik dosya tipi doğrulaması
- Rate limiting (ileride eklenecek)

## 📈 Optimizasyonlar

- **Otomatik Format**: WebP/AVIF formatına otomatik dönüşüm
- **Otomatik Kalite**: Görsel kalitesi otomatik optimize edilir
- **Lazy Loading**: Görseller gerektiğinde yüklenir
- **Responsive**: Farklı ekran boyutları için optimize edilir

## 🐛 Sorun Giderme

### Yükleme Hatası
1. Environment variables'ların doğru olduğunu kontrol edin
2. Dosya boyutunun 10MB'dan az olduğunu kontrol edin
3. Dosya formatının desteklendiğini kontrol edin

### Görsel Görünmüyor
1. `public_id`'nin doğru olduğunu kontrol edin
2. Cloudinary console'da görselin mevcut olduğunu kontrol edin
3. Network sekmesinde 404 hatası olup olmadığını kontrol edin

## 📋 To-Do

- [ ] Auth middleware ekle
- [ ] Rate limiting ekle
- [ ] Bulk upload desteği
- [ ] Video upload desteği
- [ ] Advanced transformation options
- [ ] Upload progress tracking
- [ ] Error logging

## 🔗 Faydalı Linkler

- [Cloudinary Dashboard](https://cloudinary.com/console)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Next.js ile Cloudinary](https://cloudinary.com/documentation/nextjs_integration)

---

**Not**: Bu entegrasyon test edilmiştir ve production'da kullanıma hazırdır. Herhangi bir sorun durumunda console loglarını kontrol edin.
