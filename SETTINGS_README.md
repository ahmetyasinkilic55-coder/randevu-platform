# Settings Sayfası Kurulumu

## Veritabanı Güncellemesi

Settings sayfasının çalışması için veritabanınızı güncellemeniz gerekiyor:

```bash
# 1. Prisma client'ı generate edin
npx prisma generate

# 2. Veritabanı şemasını güncelleyin
npx prisma db push

# 3. (Opsiyonel) Prisma Studio ile kontrol edin
npx prisma studio
```

## Yeni Özellikler

### ✅ İşletme Bilgileri
- İşletme adı, kategori, adres, telefon, email
- Web sitesi URL'si (mocksite.com/işletmeAdı)
- Site durumu (Yayında/Devre dışı)

### ✅ Profil Yönetimi  
- Kullanıcı adı, telefon, pozisyon
- Avatar fotoğrafı (ileride eklenecek)
- E-posta değiştirilemez (güvenlik)

### ✅ Çalışma Saatleri
- Haftalık 7 gün için ayrı ayarlar
- Açık/kapalı gün seçimi
- Başlangıç ve bitiş saatleri

### ✅ Bildirim Ayarları
- Yeni randevu bildirimleri
- Randevu iptali bildirimleri  
- Günlük/haftalık/aylık raporlar
- Pazarlama ipuçları
- Email/SMS/Push bildirim tercihleri

### ✅ Güvenlik
- Şifre değiştirme
- Mevcut şifre doğrulama
- Güvenli şifre politikası (min 6 karakter)

### 🔄 Ödeme Ayarları
- Plan bilgileri (şimdilik statik)
- Kredi kartı bilgileri (şimdilik mock)

## API Endpoints

- `GET/PUT /api/settings/business` - İşletme bilgileri
- `GET/PUT /api/settings/profile` - Kullanıcı profili  
- `GET/PUT /api/settings/working-hours` - Çalışma saatleri
- `GET/PUT /api/settings/notifications` - Bildirim ayarları
- `PUT /api/settings/password` - Şifre değiştirme

## Veritabanı Modelleri

### Yeni Eklenen:
- `BusinessSettings` - İşletme ayarları
- `User.avatar` - Kullanıcı avatarı
- `User.position` - Kullanıcı pozisyonu
- `Business.category` - İşletme kategorisi (string)
- `Business.website` - Web sitesi URL'si
- `Business.logo` - Logo URL'si  
- `Business.coverImage` - Kapak resmi URL'si
- `WorkingHour.dayOfWeek` - Int olarak (0=Pazar, 1=Pazartesi...)
- `WorkingHour.isOpen` - Boolean

## Kullanım

Settings sayfasına `/dashboard/settings` adresinden erişebilirsiniz. Tüm değişiklikler gerçek zamanlı olarak veritabanına kaydedilir.

### Önemli Notlar:
- Şifre değiştirme için mevcut şifre gerekli
- E-posta adresi güvenlik nedeniyle değiştirilemez
- Çalışma saatleri varsayılan olarak 09:00-18:00 (Pazar kapalı)
- Bildirimler varsayılan olarak açık
