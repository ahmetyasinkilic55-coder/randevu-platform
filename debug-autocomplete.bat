@echo off
echo.
echo 🐛 AUTOCOMPLETE DEBUG
echo Console'u aç ve "saç" yaz
echo.

cd /d "C:\Users\ahmetyasin\Desktop\randevu-platform"

echo 🚀 Server başlatılıyor...
echo 📍 URL: http://localhost:3000
echo.
echo 🔍 Debug adımları:
echo   1. F12 bas - Console'u aç
echo   2. Ana sayfada search kutusuna "saç" yaz
echo   3. Console'da debug mesajlarını kontrol et
echo.

call npm run dev
