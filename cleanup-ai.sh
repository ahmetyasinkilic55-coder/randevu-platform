#!/bin/bash
echo "🔄 AI özelliklerini geri alıyorum..."
echo "📂 Git restore ile orijinal hale döndürülüyor..."

cd "C:/Users/ahmetyasin/Desktop/randevu-platform"

# AI değişikliklerini geri al
git checkout HEAD -- src/app/page.tsx

echo "✅ Ana sayfa orijinal haline döndürüldü"
echo "🗑️ Gereksiz dosyalar temizleniyor..."

# AI dosyalarını sil
rm -f AI_FEATURE_README.md
rm -f quick-start-ai.bat 
rm -f test-ai-feature.bat
rm -f src/components/AIServiceSuggester.tsx.backup
rm -f src/types/events.d.ts.backup

echo "✅ Temizlik tamamlandı"
echo "🚀 Şimdi normal development server başlatılacak..."

npm run dev
