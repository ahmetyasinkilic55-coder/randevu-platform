import { useEffect, useState } from 'react';

export const useMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isCapacitor, setIsCapacitor] = useState(false);
  const [platform, setPlatform] = useState<'web' | 'ios' | 'android'>('web');

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      
      // Capacitor ortamını kontrol et
      const capacitorAvailable = !!(window as any).Capacitor;
      setIsCapacitor(capacitorAvailable);
      
      if (capacitorAvailable) {
        // Platform'u belirle
        const isIOS = (window as any).Capacitor.getPlatform() === 'ios';
        const isAndroid = (window as any).Capacitor.getPlatform() === 'android';
        
        if (isIOS) setPlatform('ios');
        else if (isAndroid) setPlatform('android');
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return { 
    isMobile, 
    isCapacitor, 
    platform,
    isIOS: platform === 'ios',
    isAndroid: platform === 'android',
    isWeb: platform === 'web'
  };
};