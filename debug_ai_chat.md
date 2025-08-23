# AI Chat Widget Debug

## Sorun
AI Chat Widget'da tüm günler kapalı görünüyor, tüm personeller için aynı şekilde.

## Analiz
1. **BusinessData formatı**: `formattedWorkingHours` kullanılıyor
2. **WorkingHours formatı**: `{ dayOfWeek: "Pazartesi", openTime: "09:00", closeTime: "18:00", isClosed: false }`
3. **IsDateAvailable fonksiyonu**: String gün isimleri ile karşılaştırma yapıyor

## Düzeltme
1. ✅ BusinessSiteClient'da workingHours transform'u doğru
2. ✅ AIChatWidget'da gün isimleri string karşılaştırması yapılıyor
3. 🔍 Debug console.log'ları eklendi

## Test Adımları
1. Browser console'u açın
2. AI Chat Widget'ı açın
3. Personel seçin
4. Takvim açın
5. Console'da debug çıktılarını kontrol edin

## Beklenen Console Çıktıları
```
🔍 [AIChatWidget] BusinessData structure: { workingHours: [...], ... }
🔍 [AIChatWidget] Simple date check: { date: "25.08.2025", dayName: "Pazartesi", workingHours: [...] }
📅 Working day result: { dayName: "Pazartesi", isOpen: true, workingHour: {...} }
```
