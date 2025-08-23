'use client';

import { useEffect, useState } from 'react';
import { useMobile } from '@/hooks/useMobile';

interface ApiWrapperProps {
  children: React.ReactNode;
}

export default function ApiWrapper({ children }: ApiWrapperProps) {
  const { isCapacitor } = useMobile();
  const [apiBaseUrl, setApiBaseUrl] = useState('');

  useEffect(() => {
    if (isCapacitor) {
      // Mobil uygulamada API base URL'ini production server'a yönlendir
      setApiBaseUrl(process.env.NEXT_PUBLIC_API_URL || 'https://your-production-domain.com');
    } else {
      // Web'de local development
      setApiBaseUrl('');
    }
  }, [isCapacitor]);

  // Global API base URL'ini window objesine ekle
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).API_BASE_URL = apiBaseUrl;
    }
  }, [apiBaseUrl]);

  return <>{children}</>;
}