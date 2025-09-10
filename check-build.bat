@echo off
echo "Build baslatiliyor..."
cd /d "C:\Users\ahmetyasin\Desktop\randevu-platform"
npm run build
if %errorlevel%==0 (
    echo "Build basarili!"
) else (
    echo "Build hatasi olustu!"
)
pause
