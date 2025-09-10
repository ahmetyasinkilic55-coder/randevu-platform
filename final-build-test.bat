@echo off
echo "Build testi baslatiliyor..."
cd /d "C:\Users\ahmetyasin\Desktop\randevu-platform"
npm run build
echo ""
if %errorlevel%==0 (
    echo "SUCCESS: Build basariyla tamamlandi!"
) else (
    echo "ERROR: Build sirasinda hata olustu!"
)
echo ""
echo "Sonuc: %errorlevel%"
pause
