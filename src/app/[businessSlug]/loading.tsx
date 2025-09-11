export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-6 max-w-md mx-auto px-4">
        {/* Main spinner */}
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-200"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-600 border-t-transparent absolute top-0 left-0"></div>
        </div>
        
        {/* Loading text */}
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-gray-900">Sayfa Yükleniyor</h2>
          <p className="text-gray-600">İşletme bilgileri getiriliyor...</p>
        </div>
        
        {/* Progress indicators */}
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        
        {/* Loading skeleton preview */}
        <div className="w-full max-w-sm space-y-3 mt-8">
          <div className="h-4 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded-lg animate-pulse w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded-lg animate-pulse w-1/2"></div>
        </div>
      </div>
    </div>
  )
}
