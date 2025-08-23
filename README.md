# RandeVur - Randevu Yönetim Platformu

RandeVur, tüm sektörler için entegre randevu ve web sitesi çözümü sunan kapsamlı bir dijital platformdur.

## Özellikler

### İşletmeler İçin
- **3-in-1 Çözüm:** Website + Randevu + Raporlama
- **Sürükle-bırak Website Builder**
- **Otomatik Randevu Yönetimi**
- **Personel ve Hizmet Yönetimi**
- **Detaylı Analitik ve Raporlar**
- **Müşteri İletişim Araçları**

### Müşteriler İçin
- **Tek Platform:** Tüm işletmelere tek yerden erişim
- **7/24 Online Randevu**
- **Şeffaf Fiyatlandırma**
- **Değerlendirme ve Yorum Sistemi**
- **Konum Bazlı Arama**

## Teknoloji Stack

- **Frontend:** Next.js 15, React 19, TypeScript
- **Backend:** Next.js API Routes
- **Database:** SQLite + Prisma ORM
- **Authentication:** NextAuth.js
- **Styling:** Tailwind CSS
- **UI Components:** Headless UI, Heroicons
- **Animations:** Framer Motion

## Kurulum

```bash
# Gerekli paketleri yükle
npm install

# Veritabanını başlat
npm run db:generate
npm run db:push

# Development server'ı başlat
npm run dev
```

## API Endpoints

### Public API
- `GET /api/public/businesses` - İşletme listesi
- `GET /api/categories` - Kategori listesi
- `GET /api/locations/provinces` - İl listesi
- `GET /api/locations/districts` - İlçe listesi

### Auth API
- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/[...nextauth]` - Authentication

### Business API
- `GET /api/businesses` - İşletme bilgileri
- `POST /api/businesses` - İşletme oluşturma
- `PUT /api/businesses` - İşletme güncelleme

### Dashboard API
- `GET /api/dashboard/stats` - İstatistikler
- `GET /api/inquiries/all` - Talepler

## Folder Structure

```
src/
├── app/                 # Next.js App Router
├── components/          # Reusable components
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
├── types/              # TypeScript type definitions
└── styles/             # Global styles
```

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## İletişim

RandeVur ekibi ile iletişime geçmek için: [İletişim Bilgileri]
