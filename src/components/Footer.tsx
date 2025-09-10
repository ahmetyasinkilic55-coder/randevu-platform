import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Desktop Layout */}
        <div className="hidden md:grid md:grid-cols-4 gap-8">
          {/* Logo ve Açıklama */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center space-x-3 group mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">RandeVur</span>
                <span className="text-xs text-slate-400">Dijital Randevu Sistemi</span>
              </div>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              Tüm randevu ihtiyaçlarınız için modern, güvenilir ve kullanıcı dostu dijital platform.
            </p>
          </div>

          {/* Hızlı Linkler */}
          <div>
            <h3 className="font-semibold text-white mb-4">Hızlı Linkler</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">
                  Ana Sayfa
                </Link>
              </li>
              <li>
                <Link href="/business" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">
                  İşletme Kaydı
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">
                  İletişim
                </Link>
              </li>
            </ul>
          </div>

          {/* İşletmeler İçin */}
          <div>
            <h3 className="font-semibold text-white mb-4">İşletmeler İçin</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/business/features" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">
                  Özellikler
                </Link>
              </li>
              <li>
                <Link href="/business/pricing" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">
                  Fiyatlandırma
                </Link>
              </li>
              <li>
                <Link href="/business/support" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">
                  Destek
                </Link>
              </li>
              <li>
                <Link href="/business/tutorials" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">
                  Eğitim Videoları
                </Link>
              </li>
            </ul>
          </div>

          {/* Yasal */}
          <div>
            <h3 className="font-semibold text-white mb-4">Yasal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">
                  Gizlilik Politikası
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">
                  Kullanım Şartları
                </Link>
              </li>
              <li>
                <Link href="/kvkk" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">
                  KVKK
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">
                  Çerez Politikası
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Mobile Layout - Çok daha kompakt */}
        <div className="md:hidden">
          {/* Logo */}
          <div className="text-center mb-6">
            <Link href="/" className="inline-flex items-center space-x-3 group">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-white">RandeVur</span>
                <span className="text-xs text-slate-400">Dijital Randevu Sistemi</span>
              </div>
            </Link>
          </div>

          {/* Kompakt Linkler - 2 sütun */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <Link href="/" className="block text-slate-400 hover:text-emerald-400 transition-colors text-sm">
                Ana Sayfa
              </Link>
              <Link href="/business" className="block text-slate-400 hover:text-emerald-400 transition-colors text-sm">
                İşletme Kaydı
              </Link>
              <Link href="/about" className="block text-slate-400 hover:text-emerald-400 transition-colors text-sm">
                Hakkımızda
              </Link>
              <Link href="/contact" className="block text-slate-400 hover:text-emerald-400 transition-colors text-sm">
                İletişim
              </Link>
            </div>
            <div className="space-y-2">
              <Link href="/business/features" className="block text-slate-400 hover:text-emerald-400 transition-colors text-sm">
                Özellikler
              </Link>
              <Link href="/business/pricing" className="block text-slate-400 hover:text-emerald-400 transition-colors text-sm">
                Fiyatlandırma
              </Link>
              <Link href="/privacy" className="block text-slate-400 hover:text-emerald-400 transition-colors text-sm">
                Gizlilik
              </Link>
              <Link href="/terms" className="block text-slate-400 hover:text-emerald-400 transition-colors text-sm">
                Kullanım Şartları
              </Link>
            </div>
          </div>

          {/* Sosyal Medya - Mobil için daha küçük */}
          <div className="flex justify-center space-x-4 mb-4">
            <a
              href="mailto:info@randevur.com"
              className="text-slate-400 hover:text-emerald-400 transition-colors"
              title="E-posta"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </a>
            <a
              href="tel:+905xxxxxxxxx"
              className="text-slate-400 hover:text-emerald-400 transition-colors"
              title="Telefon"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
            </a>
            <a
              href="https://www.linkedin.com/company/randevur"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-emerald-400 transition-colors"
              title="LinkedIn"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>

        {/* Alt Bölüm - Her iki layout için ortak */}
        <div className="border-t border-slate-700 pt-4 sm:pt-6">
          {/* Desktop Alt Bölüm */}
          <div className="hidden sm:flex sm:justify-between sm:items-center">
            <div className="text-slate-400 text-sm">
              © {currentYear} RandeVur. Tüm hakları saklıdır.
            </div>
            <div className="flex space-x-6">
              <a
                href="mailto:info@randevur.com"
                className="text-slate-400 hover:text-emerald-400 transition-colors"
                title="E-posta"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </a>
              <a
                href="tel:+905xxxxxxxxx"
                className="text-slate-400 hover:text-emerald-400 transition-colors"
                title="Telefon"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/company/randevur"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-emerald-400 transition-colors"
                title="LinkedIn"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                </svg>
              </a>
              <a
                href="https://twitter.com/randevur"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-emerald-400 transition-colors"
                title="Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
          </div>
          
          {/* Mobile Alt Bölüm */}
          <div className="sm:hidden text-center">
            <div className="text-slate-400 text-xs mb-3">
              © {currentYear} RandeVur. Tüm hakları saklıdır.
            </div>
          </div>
        </div>

        {/* 2025 Ücretsiz Kampanya Uyarısı - Mobilde daha küçük */}
        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 rounded-xl border border-emerald-500/30">
          <div className="flex items-center justify-center space-x-2 text-emerald-300">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span className="text-xs sm:text-sm font-medium text-center">
              🎉 2025 yılı boyunca tüm işletmeler için TAMAMEN ÜCRETSİZ!
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
