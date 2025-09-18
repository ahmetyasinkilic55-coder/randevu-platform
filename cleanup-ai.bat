@echo off
echo.
echo 🔄 AI özelliklerini geri alıyorum...
echo 📂 Git restore ile orijinal hale döndürülüyor...
echo.

cd /d "C:\Users\ahmetyasin\Desktop\randevu-platform"

echo 🎯 Ana sayfa orijinal haline döndürülüyor...
git checkout HEAD -- src/app/page.tsx

echo.
echo ✅ Ana sayfa orijinal haline döndürüldü
echo 🗑️ Gereksiz dosyalar temizleniyor...

del /q AI_FEATURE_README.md 2>nul
del /q quick-start-ai.bat 2>nul
del /q test-ai-feature.bat 2>nul
del /q src\components\AIServiceSuggester.tsx.backup 2>nul
del /q src\types\events.d.ts.backup 2>nul

echo.
echo ✅ Temizlik tamamlandı!
echo 🚀 Ana sayfa artık orijinal hali

echo.
echo 📋 Temizlenen öğeler:
echo   - AI Search Box
echo   - AI fonksiyonları
echo   - Gereksiz state'ler
echo   - AI component dosyaları
echo   - Test scriptleri

echo.
echo 🎉 Platform normale döndü!
pause
