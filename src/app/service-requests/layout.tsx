import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hizmet Talepleri | RandeVur',
  description: 'Aktif hizmet taleplerini görüntüleyin ve tekliflerinizi gönderin'
}

export default function ServiceRequestsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
