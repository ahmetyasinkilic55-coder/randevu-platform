import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Servis Talepleri | Dashboard',
  description: 'Gelen servis taleplerini görüntüleyin ve tekliflerinizi gönderin'
}

export default function ServiceRequestsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Servis Talepleri</h1>
        <p className="text-gray-600 mt-1">Size uygun talepleri görüntüleyin ve teklif gönderin</p>
      </div>
      {children}
    </div>
  )
}
