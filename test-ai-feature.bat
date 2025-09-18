@echo off
echo.
echo 🚀 RANDEVUR AI ÖZELLIK TEST BAŞLATILIYOR...
echo 📸 AI Akıllı Hizmet Önerici test ediliyor!
echo 🧠 Ana sayfa güncellemesi aktif!
echo.

cd /d "C:\Users\ahmetyasin\Desktop\randevu-platform"

echo 🔧 Dependencies kontrol ediliyor...
echo   (Skip install - hızlı test için)
echo.
echo 🏗️ TypeScript kontrol başlatılıyor...
call npx tsc --noEmit

echo.
if %ERRORLEVEL% EQU 0 (
    echo ✅ TYPESCRIPT KONTROL BAŞARILI!
    echo.
    echo 🌟 YENİ ÖZELLİKLER:
    echo   💬 AI Akıllı Hizmet Önerici
    echo   🎯 Doğal dil işleme simülasyonu
    echo   📱 Akıllı öneriler
    echo   🔍 Otomatik kategori eşleme
    echo   🎨 Modern floating chat UI
    echo.
    echo 🚀 Şimdi development server başlatılıyor...
    call npm run dev
) else (
    echo ❌ BUILD HATASI! Hata detayları yukarıda.
    echo.
    echo 🔍 Olası çözümler:
    echo   1. TypeScript hatalarını kontrol edin
    echo   2. Import/export syntax'ını kontrol edin  
    echo   3. Component props'larını kontrol edin
    echo.
)

pause
