-- Migration script to convert dayOfWeek from enum to integer
-- Bu dosyayı manuel olarak çalıştırabilirsiniz

-- 1. Önce yedek tablo oluştur
CREATE TABLE working_hours_backup AS SELECT * FROM working_hours;

-- 2. Mevcut tabloyu sil
DROP TABLE working_hours;

-- 3. Yeni tablo yapısını oluştur
CREATE TABLE working_hours (
    id TEXT PRIMARY KEY,
    dayOfWeek INTEGER NOT NULL,
    isOpen BOOLEAN DEFAULT 1,
    openTime TEXT NOT NULL,
    closeTime TEXT NOT NULL,
    lunchStartTime TEXT,
    lunchEndTime TEXT,
    businessId TEXT NOT NULL,
    FOREIGN KEY (businessId) REFERENCES businesses(id) ON DELETE CASCADE
);

-- 4. Verileri enum'dan integer'a çevirerek geri yükle
INSERT INTO working_hours (id, dayOfWeek, isOpen, openTime, closeTime, lunchStartTime, lunchEndTime, businessId)
SELECT 
    id,
    CASE 
        WHEN dayOfWeek = 'SUNDAY' THEN 0
        WHEN dayOfWeek = 'MONDAY' THEN 1
        WHEN dayOfWeek = 'TUESDAY' THEN 2
        WHEN dayOfWeek = 'WEDNESDAY' THEN 3
        WHEN dayOfWeek = 'THURSDAY' THEN 4
        WHEN dayOfWeek = 'FRIDAY' THEN 5
        WHEN dayOfWeek = 'SATURDAY' THEN 6
        ELSE 1
    END,
    NOT isClosed,
    openTime,
    closeTime,
    lunchStartTime,
    lunchEndTime,
    businessId
FROM working_hours_backup;

-- 5. Yedek tabloyu sil
DROP TABLE working_hours_backup;
