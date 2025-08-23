-- Kategori sistemi için veritabanı şeması
-- Bu SQL komutlarını çalıştırarak tabloları oluşturun

-- Ana kategoriler tablosu
CREATE TABLE categories (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT, -- Emoji veya icon class
  color TEXT, -- Hex renk kodu
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Alt kategoriler tablosu
CREATE TABLE subcategories (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  category_id TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Benzersiz slug için index
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_subcategories_slug ON subcategories(slug);
CREATE INDEX idx_subcategories_category ON subcategories(category_id);

-- Business tablosunu güncelle (eğer gerekirse)
-- ALTER TABLE businesses ADD COLUMN category_id TEXT;
-- ALTER TABLE businesses ADD COLUMN subcategory_id TEXT;

-- Başlangıç kategori verileri
INSERT INTO categories (name, slug, description, icon, color, order_index) VALUES
('Sağlık & Tıp', 'saglik-tip', 'Sağlık hizmetleri ve tıbbi bakım', '🏥', '#ef4444', 1),
('Güzellik & Bakım', 'guzellik-bakim', 'Güzellik salonu ve kişisel bakım hizmetleri', '💅', '#ec4899', 2),
('Otomotiv', 'otomotiv', 'Araç bakım ve tamiri hizmetleri', '🚗', '#3b82f6', 3),
('Eğitim & Kurs', 'egitim-kurs', 'Eğitim ve öğretim hizmetleri', '📚', '#8b5cf6', 4),
('Spor & Fitness', 'spor-fitness', 'Spor salonu ve fitness hizmetleri', '💪', '#10b981', 5),
('Pet & Veteriner', 'pet-veteriner', 'Evcil hayvan bakım hizmetleri', '🐕', '#f97316', 6),
('Ev & Yaşam', 'ev-yasam', 'Ev bakım ve yaşam hizmetleri', '🏠', '#6366f1', 7),
('Teknoloji', 'teknoloji', 'Teknoloji ve bilişim hizmetleri', '💻', '#06b6d4', 8);

-- Alt kategori verileri
INSERT INTO subcategories (category_id, name, slug, description, icon, order_index) VALUES
-- Sağlık & Tıp alt kategorileri
((SELECT id FROM categories WHERE slug = 'saglik-tip'), 'Diş Kliniği', 'dis-klinigi', 'Diş hekimi ve ağız-diş sağlığı', '🦷', 1),
((SELECT id FROM categories WHERE slug = 'saglik-tip'), 'Göz Kliniği', 'goz-klinigi', 'Göz muayene ve tedavisi', '👁️', 2),
((SELECT id FROM categories WHERE slug = 'saglik-tip'), 'Fizik Tedavi', 'fizik-tedavi', 'Fizyoterapi ve rehabilitasyon', '🏥', 3),
((SELECT id FROM categories WHERE slug = 'saglik-tip'), 'Psikoloji', 'psikologi', 'Psikolojik danışmanlık', '🧠', 4),
((SELECT id FROM categories WHERE slug = 'saglik-tip'), 'Beslenme & Diyet', 'beslenme-diyet', 'Diyetisyen ve beslenme danışmanlığı', '🥗', 5),

-- Güzellik & Bakım alt kategorileri
((SELECT id FROM categories WHERE slug = 'guzellik-bakim'), 'Kuaför (Kadın)', 'kuafor-kadin', 'Kadın kuaförlük hizmetleri', '💇‍♀️', 1),
((SELECT id FROM categories WHERE slug = 'guzellik-bakim'), 'Berber (Erkek)', 'berber-erkek', 'Erkek kuaförlük hizmetleri', '💇‍♂️', 2),
((SELECT id FROM categories WHERE slug = 'guzellik-bakim'), 'Güzellik Salonu', 'guzellik-salonu', 'Güzellik bakım hizmetleri', '✨', 3),
((SELECT id FROM categories WHERE slug = 'guzellik-bakim'), 'Nail Art', 'nail-art', 'Tırnak bakım ve tasarımı', '💅', 4),
((SELECT id FROM categories WHERE slug = 'guzellik-bakim'), 'Masaj & SPA', 'masaj-spa', 'Masaj ve spa hizmetleri', '🧖‍♀️', 5),
((SELECT id FROM categories WHERE slug = 'guzellik-bakim'), 'Estetik Merkezi', 'estetik-merkezi', 'Estetik işlemler', '💉', 6),

-- Otomotiv alt kategorileri
((SELECT id FROM categories WHERE slug = 'otomotiv'), 'Oto Yıkama', 'oto-yikama', 'Araç yıkama ve temizlik', '🚿', 1),
((SELECT id FROM categories WHERE slug = 'otomotiv'), 'Oto Tamiri', 'oto-tamiri', 'Araç tamiri ve bakımı', '🔧', 2),
((SELECT id FROM categories WHERE slug = 'otomotiv'), 'Lastik & Jant', 'lastik-jant', 'Lastik ve jant hizmetleri', '🛞', 3),
((SELECT id FROM categories WHERE slug = 'otomotiv'), 'Araç Ekspertizi', 'arac-ekspertizi', 'Araç ekspertiz hizmetleri', '📋', 4),

-- Eğitim & Kurs alt kategorileri
((SELECT id FROM categories WHERE slug = 'egitim-kurs'), 'Dil Kursu', 'dil-kursu', 'Yabancı dil eğitimi', '🗣️', 1),
((SELECT id FROM categories WHERE slug = 'egitim-kurs'), 'Müzik Kursu', 'muzik-kursu', 'Müzik eğitimi', '🎵', 2),
((SELECT id FROM categories WHERE slug = 'egitim-kurs'), 'Sürücü Kursu', 'surucu-kursu', 'Sürücü belgesi eğitimi', '🚗', 3),
((SELECT id FROM categories WHERE slug = 'egitim-kurs'), 'Özel Ders', 'ozel-ders', 'Birebir özel dersler', '👨‍🏫', 4),

-- Spor & Fitness alt kategorileri
((SELECT id FROM categories WHERE slug = 'spor-fitness'), 'Fitness Salonu', 'fitness-salonu', 'Fitness ve vücut geliştirme', '🏋️', 1),
((SELECT id FROM categories WHERE slug = 'spor-fitness'), 'Yoga & Pilates', 'yoga-pilates', 'Yoga ve pilates dersleri', '🧘‍♀️', 2),
((SELECT id FROM categories WHERE slug = 'spor-fitness'), 'Yüzme Havuzu', 'yuzme-havuzu', 'Yüzme eğitimi', '🏊', 3),
((SELECT id FROM categories WHERE slug = 'spor-fitness'), 'Dövüş Sanatları', 'dovus-sanatlari', 'Karate, tekvando vb.', '🥋', 4),

-- Pet & Veteriner alt kategorileri
((SELECT id FROM categories WHERE slug = 'pet-veteriner'), 'Veteriner Kliniği', 'veteriner-klinigi', 'Veteriner hekimlik', '🐾', 1),
((SELECT id FROM categories WHERE slug = 'pet-veteriner'), 'Pet Kuaförü', 'pet-kuaforu', 'Evcil hayvan bakımı', '🐕‍🦺', 2),
((SELECT id FROM categories WHERE slug = 'pet-veteriner'), 'Pet Shop', 'pet-shop', 'Evcil hayvan ürünleri', '🛍️', 3),

-- Ev & Yaşam alt kategorileri
((SELECT id FROM categories WHERE slug = 'ev-yasam'), 'Temizlik Hizmeti', 'temizlik-hizmeti', 'Ev ve ofis temizliği', '🧽', 1),
((SELECT id FROM categories WHERE slug = 'ev-yasam'), 'Elektrikçi', 'elektrikci', 'Elektrik işleri', '⚡', 2),
((SELECT id FROM categories WHERE slug = 'ev-yasam'), 'Tesisatçı', 'tesisatci', 'Su ve doğalgaz tesisatı', '🔧', 3),
((SELECT id FROM categories WHERE slug = 'ev-yasam'), 'Boyacı', 'boyaci', 'Ev boyama hizmetleri', '🎨', 4),

-- Teknoloji alt kategorileri
((SELECT id FROM categories WHERE slug = 'teknoloji'), 'Bilgisayar Tamiri', 'bilgisayar-tamiri', 'PC ve laptop tamiri', '💻', 1),
((SELECT id FROM categories WHERE slug = 'teknoloji'), 'Telefon Tamiri', 'telefon-tamiri', 'Cep telefonu tamiri', '📱', 2),
((SELECT id FROM categories WHERE slug = 'teknoloji'), 'Web Tasarım', 'web-tasarim', 'Web sitesi tasarımı', '🌐', 3),
((SELECT id FROM categories WHERE slug = 'teknoloji'), 'IT Danışmanlık', 'it-danismanlik', 'Bilişim danışmanlığı', '👨‍💻', 4);
